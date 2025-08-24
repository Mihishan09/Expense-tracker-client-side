import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axios';
import { API_PATHS } from '../utils/apiPaths';
import { clearToken, saveToken } from '../utils/helper';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(API_PATHS.auth.me);
				setUser(data);
			} catch {}
			setLoading(false);
		})();
	}, []);

	const login = async ({ email, password }) => {
		try {
			const { data } = await api.post(API_PATHS.auth.login, { email, password });
			if (data.success && data.data) {
				saveToken(data.data.token);
				setUser(data.data.user);
				return data.data.user;
			} else {
				throw new Error(data.message || 'Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	};

	const signup = async ({ fullName, email, password }) => {
		try {
			console.log('Frontend sending signup data:', { fullName, email, passwordLength: password.length });
			const { data } = await api.post(API_PATHS.auth.signup, { fullName, email, password });
			console.log('Backend response:', data);
			if (data.success && data.data) {
				saveToken(data.data.token);
				setUser(data.data.user);
				return data.data.user;
			} else {
				throw new Error(data.message || 'Signup failed');
			}
		} catch (error) {
			console.error('Signup error:', error);
			throw error;
		}
	};

	const logout = () => {
		clearToken();
		setUser(null);
	};

	const refreshUser = async () => {
		try {
			const { data } = await api.get(API_PATHS.auth.me);
			setUser(data);
		} catch (error) {
			console.error('Failed to refresh user data:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);


