import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/apiService';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
	const [menus, setMenus] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedMenu, setSelectedMenu] = useState(null);

	const fetchMenus = useCallback(async () => {
		try {
			setLoading(true);
			const response = await api.getAllMenus();
			setMenus(response.data.data);
			setError(null);
		} catch (err) {
			setError('Failed to fetch menus: ' + err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	const addMenu = useCallback(
		async (menuData) => {
			try {
				setLoading(true);
				await api.createMenu(menuData);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to add menu: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const updateMenu = useCallback(
		async (menuId, field, value) => {
			try {
				setLoading(true);
				await api.updateMenu(menuId, field, value);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to update menu: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const deleteMenu = useCallback(
		async (menuId) => {
			try {
				setLoading(true);
				await api.deleteMenu(menuId);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to delete menu: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const addMenuItem = useCallback(
		async (menuId, itemData) => {
			try {
				setLoading(true);
				await api.addMenuItem(menuId, itemData);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to add item: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const updateMenuItem = useCallback(
		async (menuId, itemId, field, value) => {
			try {
				setLoading(true);
				await api.updateMenuItem(menuId, itemId, field, value);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to update item: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const deleteMenuItem = useCallback(
		async (menuId, itemId) => {
			try {
				setLoading(true);
				await api.deleteMenuItem(menuId, itemId);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to delete item: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const toggleMenuItem = useCallback(
		async (menuId, itemId) => {
			try {
				setLoading(true);
				await api.toggleMenuItem(menuId, itemId);
				await fetchMenus();
				setError(null);
				return true;
			} catch (err) {
				setError('Failed to toggle item: ' + err.message);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchMenus]
	);

	const value = {
		menus,
		loading,
		error,
		selectedMenu,
		setSelectedMenu,
		fetchMenus,
		addMenu,
		updateMenu,
		deleteMenu,
		addMenuItem,
		updateMenuItem,
		deleteMenuItem,
		toggleMenuItem,
	};

	return (
		<MenuContext.Provider value={value}>{children}</MenuContext.Provider>
	);
};

export const useMenu = () => {
	const context = useContext(MenuContext);
	if (!context) {
		throw new Error('useMenu must be used within a MenuProvider');
	}
	return context;
};
