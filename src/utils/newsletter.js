import { useEffect, useState } from 'react';
import { api } from '../api';
import { changePercent } from './analytics';

// The lines in "Nya prenumeranter per dag"
export const NEWSLETTER_SERIES = {
	added: { label: 'Nya', color: '#1a6e45' },
	website: { label: 'Via hemsidan', color: '#a8741c' },
	cancelled: { label: 'Avslutade', color: '#b3453a' },
};

// { data, error, loading } for a period; data stays while another period loads
export function useNewsletterStats(range) {
	const [state, setState] = useState({ data: null, error: null, loading: true });

	useEffect(() => {
		let cancelled = false;
		setState((prev) => ({ ...prev, loading: true }));
		api
			.getNewsletterStats(range)
			.then((data) => !cancelled && setState({ data, error: null, loading: false }))
			.catch(
				(err) =>
					!cancelled &&
					setState((prev) => ({ ...prev, error: err.message, loading: false }))
			);
		return () => {
			cancelled = true;
		};
	}, [range]);

	return state;
}

// The lines to draw: Get a Newsletter's new and cancelled when they can be counted per day
export function newsletterSeries(data) {
	const keys = data.series.some((day) => day.added !== null)
		? ['added', 'website', 'cancelled']
		: ['website'];
	return keys.map((key) => ({
		key,
		...NEWSLETTER_SERIES[key],
		values: data.series.map((day) => day[key]),
	}));
}

// How many more (or fewer) subscribe than when the period started: new minus cancelled
export const subscriberChange = (gan) => gan.growth.added - gan.growth.cancelled;

// '2026-10-01' -> '2026-09-30'
const dayBefore = (day) => {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() - 1);
	return date.toISOString().slice(0, 10);
};

// The "Totalt" line: how many subscribed at the end of each day, counted back from the
// number now with each day's new and cancelled. It starts the day before the period, so
// it goes from the number then to the number now (the same change as "+N på X dagar").
// null when it can't be counted (no per-day numbers from Get a Newsletter).
export function totalSeries(data) {
	const gan = data.getanewsletter;
	if (gan.status !== 'ok' || !gan.growth || gan.subscribers === null || !data.series.length) {
		return null;
	}
	const values = [gan.subscribers];
	for (let i = data.series.length - 1; i >= 0; i--) {
		const day = data.series[i];
		values.unshift(Math.max(0, values[0] - (day.added ?? 0) + (day.cancelled ?? 0)));
	}
	return {
		dates: [dayBefore(data.series[0].date), ...data.series.map((day) => day.date)],
		values,
	};
}

// Share of the recipients who opened, in whole percent; null when unknown
export function openRate(newsletter) {
	const { uniqueOpens, recipients } = newsletter;
	if (uniqueOpens === null || !recipients) return null;
	return Math.min(100, Math.round((uniqueOpens / recipients) * 100));
}

export const websiteChange = (data) =>
	data.website.previous === null ? null : changePercent(data.website.total, data.website.previous);
