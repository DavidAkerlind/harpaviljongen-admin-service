import { client, SITE_URL } from './client';

// Roller i API:t: admin = allt + användare, employee = menyer, öppettider och sidor
export const ROLES = {
	employee: {
		label: 'Personal',
		description: 'Menyer, öppettider och sidor',
	},
	admin: {
		label: 'Admin',
		description: 'Allt, plus lägga till och ta bort användare',
	},
};

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
	// Send only what changes: { username?, name? }. Returns { user }
	updateMe: (fields) => client.patch('/auth/me', fields).then((r) => r.data),
	uploadAvatar: (blob, onProgress) => {
		const form = new FormData();
		form.append('file', blob, 'avatar.jpg');
		return client
			.put('/auth/avatar', form, {
				timeout: 60000,
				onUploadProgress: (e) =>
					e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
			})
			.then((r) => r.data);
	},
	deleteAvatar: () => client.delete('/auth/avatar').then((r) => r.data),
	// Returns { token, user }; the old token stops working
	changePassword: (currentPassword, newPassword) =>
		client
			.put('/auth/password', { currentPassword, newPassword })
			.then((r) => r.data),

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
	renamePdf: (id, title) =>
		client.patch(`/menu-pdfs/${id}`, { title }).then((r) => r.data),
	deletePdf: (id) => client.delete(`/menu-pdfs/${id}`).then((r) => r.data),

	// Ändringar. params: { limit, from, to (ISO, to exclusive), category, userId, before }
	// Returns { items, total, hasMore }
	getActivity: (params) =>
		client.get('/activity', { params }).then((r) => r.data),
	getActivityUsers: () =>
		client.get('/activity/users').then((r) => r.data ?? []),

	// Användare (bara admin)
	getUsers: () => client.get('/users').then((r) => r.data ?? []),
	createUser: ({ username, password, role }) =>
		client.post('/users', { username, password, role }).then((r) => r.data),
	updateUserRole: (userId, role) =>
		client.patch(`/users/${userId}`, { role }).then((r) => r.data),
	resetUserPassword: (userId, password) =>
		client.put(`/users/${userId}/password`, { password }).then((r) => r.data),
	deleteUser: (userId) => client.delete(`/users/${userId}`).then((r) => r.data),

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
