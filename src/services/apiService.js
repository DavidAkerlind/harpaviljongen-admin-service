import axios from 'axios';

const BASE_URL = 'https://harpaviljongen-db-api.onrender.com/api/menus';
//const BASE_URL = 'http://localhost:7000/api/menus';

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	},
});

export const api = {
	// Menu operations
	getAllMenus: () => axiosInstance.get('/'),
	getMenuById: (menuId) => axiosInstance.get(`/${menuId}`),
	createMenu: (menuData) => axiosInstance.post('/', menuData),
	updateMenu: (menuId, field, value) =>
		axiosInstance.put(`/${menuId}/${field}`, { value }),
	deleteMenu: (menuId) => axiosInstance.delete(`/${menuId}`),

	// Item operations
	getMenuItems: (menuId) => axiosInstance.get(`/${menuId}/items`),
	addMenuItem: (menuId, itemData) =>
		axiosInstance.post(`/${menuId}/items`, itemData),
	updateMenuItem: (menuId, itemId, field, value) =>
		axiosInstance.put(`/${menuId}/items/${itemId}/${field}`, { value }),
	toggleMenuItem: (menuId, itemId) =>
		axiosInstance.patch(`/${menuId}/items/${itemId}/toggle`),
	deleteMenuItem: (menuId, itemId) =>
		axiosInstance.delete(`/${menuId}/items/${itemId}`),

	// Search
	searchItems: (query) =>
		axiosInstance.get(`/search/items`, { params: { query } }),
};
