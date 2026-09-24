import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { api } from '../api';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	// 'checking' while a saved token is verified on page load
	const [status, setStatus] = useState(() =>
		tokenStore.get() ? 'checking' : 'signedOut'
	);
	const [notice, setNotice] = useState(null);

	useEffect(() => {
		if (status !== 'checking') return;
		api
			.me()
			.then(({ user }) => {
				setUser(user);
				setStatus('signedIn');
			})
			.catch(() => {
				tokenStore.clear();
				setStatus('signedOut');
			});
	}, [status]);

	useEffect(() => {
		const onExpired = () => {
			setUser(null);
			setStatus('signedOut');
			setNotice('Du har blivit utloggad. Logga in igen för att fortsätta.');
		};
		window.addEventListener('auth:expired', onExpired);
		return () => window.removeEventListener('auth:expired', onExpired);
	}, []);

	const login = useCallback(async (username, password) => {
		const data = await api.login(username, password);
		// An API from before this admin logs in without returning a token
		if (!data?.token) {
			throw new Error(
				'API:t skickade ingen inloggningstoken. Är den nya API-versionen driftsatt?'
			);
		}
		const { token, user } = data;
		tokenStore.set(token);
		setUser(user);
		setNotice(null);
		setStatus('signedIn');
	}, []);

	const logout = useCallback(() => {
		tokenStore.clear();
		setUser(null);
		setStatus('signedOut');
	}, []);

	return (
		<AuthContext.Provider value={{ user, status, notice, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
