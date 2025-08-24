import axios from 'axios';
import { API_BASE } from './apiPaths';
import { getToken } from './helper';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default api;

