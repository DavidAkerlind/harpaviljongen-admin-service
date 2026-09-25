import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { api } from '../api';

// The menus PDFs are uploaded to (Meny, Vinlista and the ones created in the admin),
// shared by Menyer, Översikt and the log. Loaded once after login; reload() after a change.
const MenuListsContext = createContext(null);

export function MenuListsProvider({ children }) {
	const [lists, setLists] = useState(null);
	const [error, setError] = useState(null);

	const reload = useCallback(async () => {
		setError(null);
		try {
			const result = await api.getMenuLists();
			setLists(result);
			return result;
		} catch (err) {
			setError(err.message);
			return null;
		}
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	return (
		<MenuListsContext.Provider value={{ lists, error, reload }}>
			{children}
		</MenuListsContext.Provider>
	);
}

// { lists: [{ type, label, navbar, home, builtIn }] | null while loading, error, reload }
// eslint-disable-next-line react-refresh/only-export-components
export const useMenuLists = () => useContext(MenuListsContext);
