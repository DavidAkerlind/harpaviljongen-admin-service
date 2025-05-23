import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const login = async (username, password) => {
		try {
			const response = await api.login(username, password);
			if (response.success) {
				setUser({ username });
				return { success: true };
			}
			return { success: false, message: response.message };
		} catch (error) {
			return { success: false, message: error.message };
		}
	};

	const logout = async () => {
		try {
			await api.logout();
			setUser(null);
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	useEffect(() => {
		// Check if user is already logged in
		// You might want to add an endpoint to check auth status
		setLoading(false);
	}, []);

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
