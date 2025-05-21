import axios from 'axios';
import { handleApiResponse } from '../utils/apiResponses';

const BASE_URL = 'https://harpaviljongen-db-api.onrender.com/api/menus';
//const BASE_URL = 'http://localhost:7000/api/menus';

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	},
});

// Uncomment and update the interceptor
axiosInstance.interceptors.response.use(
	(response) => {
		// Check if response has expected structure
		if (response.data && 'success' in response.data) {
			if (!response.data.success) {
				throw new Error(response.data.message);
			}
			return response.data;
		}
		return response;
	},
	(error) => {
		if (error.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw new Error('Network error occurred');
	}
);

export const api = {
	// Menu operations
	getAllMenus: async () => {
		return await axiosInstance.get('/');
	},

	getMenuById: async (menuId) => {
		return await axiosInstance.get(`/${menuId}`);
	},

	createMenu: async (menuData) => {
		return await axiosInstance.post('/', menuData);
	},

	updateMenu: async (menuId, field, value) => {
		return await axiosInstance.put(`/${menuId}/${field}`, { value });
	},

	deleteMenu: async (menuId) => {
		return await axiosInstance.delete(`/${menuId}`);
	},

	// Item operations
	getMenuItems: async (menuId) => {
		return await axiosInstance.get(`/${menuId}/items`);
	},

	addMenuItem: async (menuId, itemData) => {
		return await axiosInstance.post(`/${menuId}/items`, itemData);
	},

	updateMenuItem: async (menuId, itemId, field, value) => {
		return await axiosInstance.put(`/${menuId}/items/${itemId}/${field}`, {
			value,
		});
	},

	toggleMenuItem: async (menuId, itemId) => {
		return await axiosInstance.patch(`/${menuId}/items/${itemId}/toggle`);
	},

	deleteMenuItem: async (menuId, itemId) => {
		return await axiosInstance.delete(`/${menuId}/items/${itemId}`);
	},

	// Search operations
	searchItems: async (query) => {
		return await axiosInstance.get(`/search/items`, { params: { query } });
	},

	// System status
	checkSystemStatus: async () => {
		const start = Date.now();
		const response = await axiosInstance.get('/');
		const latency = Date.now() - start;

		return {
			status: response.status,
			message: response.message,
			latency,
		};
	},
};
