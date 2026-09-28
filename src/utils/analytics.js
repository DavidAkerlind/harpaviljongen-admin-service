import { useEffect, useState } from 'react';
import { api } from '../api';

// The admin shows one number and one line: our own counting and Cloudflare's traffic
// data added together, never apart (the API sends them as `combined`)
const COLOR = '#1a6e45';
const BARS = [{ key: 'total', label: '', color: COLOR }];

export const METRICS = {
	visits: { label: 'Besök', short: 'besök' },
	views: { label: 'Sidvisningar', short: 'sidvisningar' },
};

// Friendlier names for the website's pages, referrers and device types
const PAGE_NAMES = {
	'/': 'Startsidan',
	'/events': 'Evenemang',
	'/chambre': 'Chambre séparée',
	'/gallery': 'Galleri',
	'/menu': 'Meny',
	'/wine-list': 'Vinlista',
};
const DEVICE_NAMES = { mobile: 'Mobil', desktop: 'Dator', tablet: 'Surfplatta' };

// '(other)': the API keeps at most 60 pages and 100 referrers per day, the rest end up here
export const pageName = (path) =>
	path === '(other)' ? 'Övriga sidor' : (PAGE_NAMES[path] ?? path);
export const referrerName = (host) =>
	host === '(direct)' ? 'Direkt eller okänd' : host === '(other)' ? 'Övriga' : host;
export const deviceName = (type) => DEVICE_NAMES[type] ?? type;

// Cloudflare gives countries as codes: 'SE' -> 'Sverige'. XX = unknown, T1 = Tor.
const regionNames = new Intl.DisplayNames(['sv'], { type: 'region', fallback: 'code' });
export const countryName = (code) => {
	if (code === 'XX') return 'Okänt land';
	if (code === 'T1') return 'Tor-nätverket';
	try {
		return regionNames.of(code);
	} catch {
		return code;
	}
};

const numberFormat = new Intl.NumberFormat('sv-SE');
export const formatNumber = (n) => numberFormat.format(Math.round(n ?? 0));

// "+12 %" / "−5 %" vs the period before, null when there is nothing to compare with
export function changePercent(now, before) {
	if (!before) return null;
	return Math.round(((now - before) / before) * 100);
}

const dayFormat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' });
const weekdayFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long' });
const longFormat = new Intl.DateTimeFormat('sv-SE', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});
const asDate = (day) => new Date(`${day}T12:00:00`);
// "25 sep." / "torsdag 25 september"
export const formatShortDay = (day) => dayFormat.format(asDate(day));
export const formatLongDay = (day) => {
	const text = longFormat.format(asDate(day));
	return text.charAt(0).toUpperCase() + text.slice(1);
};
export const formatWeekday = (day) => weekdayFormat.format(asDate(day)).slice(0, 3);

// GET /analytics, shared for a minute between the widgets and the Statistik page so
// the dashboard doesn't ask twice for the same numbers
const cache = new Map();
const CACHE_MS = 60 * 1000;

export function fetchAnalytics(range, { fresh = false } = {}) {
	const hit = cache.get(range);
	if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.promise;
	const promise = api.getAnalytics(range);
	cache.set(range, { at: Date.now(), promise });
	promise.catch(() => cache.delete(range));
	return promise;
}

// { data, error } for a range; data stays while a new range loads (no flash)
export function useAnalytics(range, reloadKey = 0) {
	const [state, setState] = useState({ data: null, error: null, loading: true });

	useEffect(() => {
		let cancelled = false;
		setState((prev) => ({ ...prev, loading: true }));
		fetchAnalytics(range, { fresh: reloadKey > 0 })
			.then((data) => !cancelled && setState({ data, error: null, loading: false }))
			.catch(
				(err) =>
					!cancelled &&
					setState((prev) => ({ ...prev, error: err.message, loading: false }))
			);
		return () => {
			cancelled = true;
		};
	}, [range, reloadKey]);

	return state;
}

// The "Mest besökta" tabs: pages, devices and countries by page views, referrers by
// visits. Where visitors came from is only our own counting, countries only Cloudflare.
export const BREAKDOWNS = [
	{ value: 'pages', label: 'Sidor', name: pageName, unit: 'sidvisningar' },
	{ value: 'referrers', label: 'Källor', name: referrerName, unit: 'besök' },
	{ value: 'devices', label: 'Enheter', name: deviceName, unit: 'sidvisningar' },
	{ value: 'countries', label: 'Länder', name: countryName, unit: 'sidvisningar' },
];

// Our own counting and Cloudflare's added together. An older API has no `combined`, so
// it's added up here the same way (without a comparison with the period before).
export function combinedOf(data) {
	if (data.combined) return data.combined;
	const ownSince = data.sources.own.since;
	const series = data.series.map((day) => {
		const own = ownSince && day.date >= ownSince ? day.own : null;
		const cf = day.cloudflare;
		if (!own && !cf) return { date: day.date, views: null, visits: null };
		return {
			date: day.date,
			views: (own?.views ?? 0) + (cf?.views ?? 0),
			visits: (own?.visits ?? 0) + (cf?.visits ?? 0),
		};
	});
	const sum = (metric) => series.reduce((total, day) => total + (day[metric] ?? 0), 0);
	const rows = (list = []) =>
		list
			.map((row) => ({ key: row.key, value: (row.own ?? 0) + (row.cloudflare ?? 0) }))
			.sort((a, b) => b.value - a.value);
	const since = [ownSince, data.sources.cloudflare.since].filter(Boolean).sort()[0] ?? null;
	return {
		series,
		totals: { views: sum('views'), visits: sum('visits') },
		previous: null,
		breakdown: Object.fromEntries(
			Object.entries(data.breakdown).map(([kind, list]) => [kind, rows(list)])
		),
		since,
	};
}

// "+12 %" for a period's total vs the period before, null when they can't be compared
export function totalChange(data, metric) {
	const { totals, previous } = combinedOf(data);
	return previous ? changePercent(totals[metric], previous[metric]) : null;
}

export const totalOf = (data, metric) => combinedOf(data).totals[metric];

// The tabs that have numbers: Länder only when Cloudflare is connected
export const availableBreakdowns = (data) =>
	BREAKDOWNS.filter(
		(b) => b.value !== 'countries' || combinedOf(data).breakdown.countries?.length
	);

// Values per day for <TrendChart>. Days nothing was counted (before counting started) are
// null (not drawn) instead of 0.
export const trendSeries = (data, metric) => [
	{
		key: 'total',
		label: METRICS[metric].label,
		color: COLOR,
		values: combinedOf(data).series.map((day) => day[metric]),
	},
];

// For <BarList series={…}>
export const barSeries = () => BARS;

// Rows for <BarList>, the biggest first
export function breakdownRows(data, kind, limit) {
	const { name } = BREAKDOWNS.find((b) => b.value === kind);
	return (combinedOf(data).breakdown[kind] ?? []).slice(0, limit).map((row) => ({
		key: row.key,
		label: name(row.key),
		values: { total: row.value },
	}));
}
