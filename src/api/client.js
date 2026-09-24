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
			SWEDISH_STATUS_MESSAGES[status] ||
			SWEDISH_API_MESSAGES[apiMessage] ||
			apiMessage ||
			(error.code === 'ECONNABORTED'
				? 'Servern svarade inte i tid. Försök igen.'
				: error.code === 'ERR_NETWORK'
					? 'Kunde inte nå servern. Kontrollera internetanslutningen.'
					: 'Något gick fel. Försök igen.');
		return Promise.reject(Object.assign(new Error(message), { status }));
	}
);
