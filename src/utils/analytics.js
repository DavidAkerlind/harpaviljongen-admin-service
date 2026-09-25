import { useEffect, useState } from 'react';
import { api } from '../api';

// The two sources on the Statistik page, in fixed order and colors (checked for
// color blindness): our own counting and Cloudflare Web Analytics.
export const SOURCES = [
	{ key: 'own', label: 'Egen mätning', color: '#1a6e45' },
	{ key: 'cloudflare', label: 'Cloudflare', color: '#2a78d6' },
];

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

// The "Mest besökta" tabs: pages and devices by page views, referrers by visits
export const BREAKDOWNS = [
	{ value: 'pages', label: 'Sidor', name: pageName, unit: 'sidvisningar' },
	{ value: 'referrers', label: 'Källor', name: referrerName, unit: 'besök' },
	{ value: 'devices', label: 'Enheter', name: deviceName, unit: 'sidvisningar' },
];

// The sources that have numbers for this period (Cloudflare only when it's connected)
export const activeSources = (data) =>
	SOURCES.filter((s) => s.key === 'own' || data?.totals.cloudflare);

// Values per day for <TrendChart>. Our own counting has no numbers from before it
// started, so those days are null (not drawn) instead of 0.
export const trendSeries = (data, metric) =>
	activeSources(data).map((s) => ({
		...s,
		values: data.series.map((day) =>
			s.key === 'own' && (!data.sources.own.since || day.date < data.sources.own.since)
				? null
				: (day[s.key]?.[metric] ?? 0)
		),
	}));

// Rows for <BarList>, the biggest first
export function breakdownRows(data, kind, limit) {
	const { name } = BREAKDOWNS.find((b) => b.value === kind);
	return data.breakdown[kind].slice(0, limit).map((row) => ({
		key: row.key,
		label: name(row.key),
		values: { own: row.own, cloudflare: row.cloudflare },
	}));
}
