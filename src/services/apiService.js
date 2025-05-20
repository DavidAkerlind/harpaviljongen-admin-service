import axios from 'axios';

// const BASE_URL = 'https://harpaviljongen-db-api.onrender.com/api/menus';
const BASE_URL = 'http://localhost:7000/api/menus';

export const api = {
	// Menu operations
	getAllMenus: () => axios.get(BASE_URL),
	getMenuById: (menuId) => axios.get(`${BASE_URL}/${menuId}`),
	createMenu: (menuData) => axios.post(BASE_URL, menuData),
	updateMenu: (menuId, field, value) =>
		axios.put(`${BASE_URL}/${menuId}/${field}`, { value }),
	deleteMenu: (menuId) => axios.delete(`${BASE_URL}/${menuId}`),

	// Item operations
	getMenuItems: (menuId) => axios.get(`${BASE_URL}/${menuId}/items`),
	addMenuItem: (menuId, itemData) =>
		axios.post(`${BASE_URL}/${menuId}/items`, itemData),
	updateMenuItem: (menuId, itemId, field, value) =>
		axios.put(`${BASE_URL}/${menuId}/items/${itemId}/${field}`, { value }),
	toggleMenuItem: (menuId, itemId) =>
		axios.patch(`${BASE_URL}/${menuId}/items/${itemId}/toggle`),
	deleteMenuItem: (menuId, itemId) =>
		axios.delete(`${BASE_URL}/${menuId}/items/${itemId}`),

	// Search
	searchItems: (query) =>
		axios.get(`${BASE_URL}/search/items`, { params: { query } }),
};
