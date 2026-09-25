import axios from 'axios';

export const API_URL =
	import.meta.env.VITE_API_URL ||
	'https://harpaviljongen-db-api.onrender.com/api';
export const SITE_URL =
	import.meta.env.VITE_SITE_URL || 'https://harpaviljongen.com';

const TOKEN_KEY = 'harpaviljongen-admin-token';

// localStorage can throw (private mode, blocked storage) – the admin then just asks for login again
export const tokenStore = {
	get() {
		try {
			return localStorage.getItem(TOKEN_KEY);
		} catch {
			return null;
		}
	},
	set(token) {
		try {
			localStorage.setItem(TOKEN_KEY, token);
		} catch {
			/* ignore */
		}
	},
	clear() {
		try {
			localStorage.removeItem(TOKEN_KEY);
		} catch {
			/* ignore */
		}
	},
};

// Swedish text for the API errors staff can actually run into
const SWEDISH_STATUS_MESSAGES = {
	403: 'Du har inte behörighet att göra det här.',
	409: 'Användarnamnet är redan taget.',
	413: 'Filen är för stor (max 10 MB).',
	429: 'För många inloggningsförsök. Vänta en stund och försök igen.',
};

// API messages (English) that staff can run into, in Swedish
const SWEDISH_API_MESSAGES = {
	'Current password is incorrect': 'Nuvarande lösenord stämmer inte.',
	'The file is not a JPG, PNG or WebP image':
		'Bilden måste vara en JPG, PNG eller WebP.',
	'Only JPG, PNG or WebP images are allowed':
		'Bilden måste vara en JPG, PNG eller WebP.',
	'The image is too large (max 5 MB)': 'Bilden är för stor (max 5 MB).',
	'A menu with that name already exists': 'Det finns redan en meny med det namnet.',
	'Menu not found': 'Menyn finns inte längre. Ladda om sidan.',
	'There can be at most 20 menus': 'Det kan finnas högst 20 menyer.',
	'Meny and Vinlista can not be deleted': 'Meny och Vinlista kan inte tas bort.',
};

export const client = axios.create({ baseURL: API_URL, timeout: 60000 });

client.interceptors.request.use((config) => {
	const token = tokenStore.get();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

client.interceptors.response.use(
	(response) => response.data,
	(error) => {
		const status = error.response?.status;
		// Expired or invalid token: tell the app to log out (not for the login request itself)
		if (status === 401 && !error.config?.url?.includes('/auth/login')) {
			tokenStore.clear();
			window.dispatchEvent(new Event('auth:expired'));
		}
		const apiMessage = error.response?.data?.message;
		const message =
			SWEDISH_API_MESSAGES[apiMessage] ||
			SWEDISH_STATUS_MESSAGES[status] ||
			apiMessage ||
			(error.code === 'ECONNABORTED'
				? 'Servern svarade inte i tid. Försök igen.'
				: error.code === 'ERR_NETWORK'
					? 'Kunde inte nå servern. Kontrollera internetanslutningen.'
					: 'Något gick fel. Försök igen.');
		return Promise.reject(Object.assign(new Error(message), { status }));
	}
);
