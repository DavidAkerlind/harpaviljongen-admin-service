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

// Share of the recipients who opened, in whole percent; null when unknown
export function openRate(newsletter) {
	const { uniqueOpens, recipients } = newsletter;
	if (uniqueOpens === null || !recipients) return null;
	return Math.min(100, Math.round((uniqueOpens / recipients) * 100));
}

export const websiteChange = (data) =>
	data.website.previous === null ? null : changePercent(data.website.total, data.website.previous);
