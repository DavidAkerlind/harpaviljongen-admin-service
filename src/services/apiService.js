import axios from 'axios';

const API_BASE_URL = 'https://harpaviljongen-db-api.onrender.com/api';
//const API_BASE_URL = 'http://localhost:7000/api';

// Common config for all API instances
const commonConfig = {
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
};

// Create separate instances for different API domains
const createApiInstance = (path) => {
	const instance = axios.create({
		baseURL: `${API_BASE_URL}/${path}`,
		...commonConfig,
	});

	// Add response interceptor
	instance.interceptors.response.use(
		(response) => {
			// Handle successful responses
			if (response.data.data && 'success' in response.data.data) {
				console.log(response);
				if (!response.data.success) {
					throw new Error(
						response.data.message || 'Operation failed'
					);
				}
				return response.data;
			}
			return response;
		},
		(error) => {
			// Handle errors
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			} else if (error.code === 'ERR_NETWORK') {
				console.log(error);
				throw new Error('Network error - Please check your connection');
			}
			throw new Error('An unexpected error occurred');
		}
	);

	return instance;
};

// Create API instances
const menuApi = createApiInstance('menus');
const authApi = createApiInstance('auth');
const eventsApi = createApiInstance('events');
const openingHoursApi = createApiInstance('openingHours');
const wineListApi = createApiInstance('wine-list');

export const api = {
	// Menu operations
	getAllMenus: async () => {
		const response = await menuApi.get('/');
		return response.data;
	},

	getMenuById: async (menuId) => {
		const response = await menuApi.get(`/${menuId}`);
		return response.data;
	},

	createMenu: async (menuData) => {
		const response = await menuApi.post('/', menuData);
		return response.data;
	},

	updateMenu: async (menuId, field, value) => {
		const response = await menuApi.put(`/${menuId}/${field}`, { value });
		return response.data;
	},

	deleteMenu: async (menuId) => {
		const response = await menuApi.delete(`/${menuId}`);
		return response.data;
	},

	// Item operations
	getMenuItems: async (menuId) => {
		const response = await menuApi.get(`/${menuId}/items`);
		return response.data;
	},

	addMenuItem: async (menuId, itemData) => {
		const response = await menuApi.post(`/${menuId}/items`, itemData);
		return response.data;
	},

	updateMenuItem: async (menuId, itemId, field, value) => {
		const response = await menuApi.put(
			`/${menuId}/items/${itemId}/${field}`,
			{ value }
		);
		return response.data;
	},

	toggleMenuItem: async (menuId, itemId) => {
		const response = await menuApi.patch(
			`/${menuId}/items/${itemId}/toggle`
		);
		return response.data;
	},

	deleteMenuItem: async (menuId, itemId) => {
		const response = await menuApi.delete(`/${menuId}/items/${itemId}`);
		return response.data;
	},

	// Auth operations
	login: async (username, password) => {
		try {
			const response = await authApi.post('/login', {
				username,
				password,
			});
			return response.data;
		} catch (error) {
			throw new Error(error.message || 'Login failed');
		}
	},

	logout: async () => {
		const response = await authApi.get('/logout');
		return response.data;
	},

	// Event operations
	getAllEvents: async () => {
		const response = await eventsApi.get('/');
		return response.data;
	},

	getEventById: async (eventId) => {
		const response = await eventsApi.get(`/${eventId}`);
		return response.data;
	},

	getFutureEvents: async () => {
		const response = await eventsApi.get('/future');
		return response.data;
	},

	createEvent: async (eventData) => {
		const response = await eventsApi.post('/', eventData);
		return response.data;
	},

	updateEvent: async (eventId, eventData) => {
		const response = await eventsApi.put(`/${eventId}`, eventData);
		return response.data;
	},

	deleteEvent: async (eventId) => {
		const response = await eventsApi.delete(`/${eventId}`);
		return response.data;
	},

	// Opening Hours operations
	getOpeningHours: async () => {
		const response = await openingHoursApi.get('/');
		return response.data;
	},

	updateOpeningHours: async (day, hours) => {
		const response = await openingHoursApi.put(`/day/${day}`, { hours });
		return response.data;
	},

	// Search operations
	searchItems: async (query) => {
		const response = await menuApi.get(`/search/items`, {
			params: { query },
		});
		return response.data;
	},

	// ...befintlig kod ovanför...

	// Wine List operations
	getAllWineLists: async () => {
		const response = await wineListApi.get('/');
		console.log(response.data);
		return response.data;
	},

	getWineListById: async (id) => {
		const response = await wineListApi.get(`/${id}`);
		console.log(response.data);
		return response.data;
	},

	updateWineList: async (id, data) => {
		const response = await wineListApi.put(`/${id}`, data);
		console.log(response.data);
		return response.data;
	},

	addWine: async (id, wine) => {
		const response = await wineListApi.post(`/${id}/wine`, wine);
		console.log(response.data);
		return response.data;
	},

	updateWine: async (listId, wineId, wine) => {
		const response = await wineListApi.put(
			`/${listId}/wine/${wineId}`,
			wine
		);
		console.log(response.data);
		return response.data;
	},

	deleteWine: async (listId, wineId) => {
		const response = await wineListApi.delete(`/${listId}/wine/${wineId}`);
		console.log(response.data);
		return response.data;
	},

	toggleWineActive: async (listId, wineId) => {
		const response = await wineListApi.patch(
			`/${listId}/wine/${wineId}/toggle`
		);
		console.log(response.data);
		return response.data;
	},

	// System status
	checkSystemStatus: async () => {
		const start = Date.now();
		try {
			await menuApi.get('/');
			return {
				status: 'healthy',
				message: 'System is operational',
				latency: Date.now() - start,
			};
		} catch (error) {
			return {
				status: 'error',
				message: error.message,
				latency: Date.now() - start,
			};
		}
	},
};
