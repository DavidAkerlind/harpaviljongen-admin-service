import { client, SITE_URL } from './client';

// PDF-typerna i API:t: food = Meny, wine = Vinlista
export const PDF_LISTS = {
	meny: { type: 'food', label: 'Meny', noun: 'menyn' },
	vinlista: { type: 'wine', label: 'Vinlista', noun: 'vinlistan' },
};

export const api = {
	// Auth
	login: (username, password) =>
		client.post('/auth/login', { username, password }).then((r) => r.data),
	me: () => client.get('/auth/me').then((r) => r.data),

	// Öppettider
	getOpeningHours: () => client.get('/openingHours').then((r) => r.data ?? []),
	saveOpeningHours: (days) =>
		client.put('/openingHours', { days }).then((r) => r.data),

	// Sidor
	getSiteSettings: () => client.get('/site-settings').then((r) => r.data),
	updateSiteSettings: (pages) =>
		client.put('/site-settings', { pages }).then((r) => r.data),

	// Meny- och vinlista-PDF:er
	getPdfs: (type) =>
		client.get('/menu-pdfs', { params: { type } }).then((r) => r.data ?? []),
	uploadPdf: ({ file, type, title, activate }, onProgress) => {
		const form = new FormData();
		form.append('file', file);
		form.append('type', type);
		form.append('title', title);
		form.append('activate', activate ? 'true' : 'false');
		return client
			.post('/menu-pdfs/upload', form, {
				timeout: 120000,
				onUploadProgress: (e) =>
					e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
			})
			.then((r) => r.data);
	},
	activatePdf: (id) =>
		client.patch(`/menu-pdfs/${id}/activate`).then((r) => r.data),
	deactivatePdf: (id) =>
		client.patch(`/menu-pdfs/${id}/deactivate`).then((r) => r.data),
	deletePdf: (id) => client.delete(`/menu-pdfs/${id}`).then((r) => r.data),

	// Status
	getHealth: async () => {
		const start = performance.now();
		const res = await client.get('/health');
		return { ...res.data, latency: Math.round(performance.now() - start) };
	},
	// Cross-origin, so the response can't be read; a resolved fetch means the site answered
	checkWebsite: async () => {
		const start = performance.now();
		await fetch(SITE_URL, { mode: 'no-cors', cache: 'no-store' });
		return { latency: Math.round(performance.now() - start) };
	},
};
