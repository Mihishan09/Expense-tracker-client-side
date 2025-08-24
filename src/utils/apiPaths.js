export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export const API_PATHS = {
	auth: {
		login: `${API_BASE}/api/auth/login`,
		signup: `${API_BASE}/api/auth/signup`,
		me: `${API_BASE}/api/auth/me`,
		profileImage: `${API_BASE}/api/auth/profile-image`,
		updateProfile: `${API_BASE}/api/auth/profile`,
		changePassword: `${API_BASE}/api/auth/change-password`,
		bankAccounts: {
			list: `${API_BASE}/api/auth/bank-accounts`,
			add: `${API_BASE}/api/auth/bank-accounts`,
			update: (id) => `${API_BASE}/api/auth/bank-accounts/${id}`,
			delete: (id) => `${API_BASE}/api/auth/bank-accounts/${id}`,
		},
	},
	income: {
		list: `${API_BASE}/income`,
		add: `${API_BASE}/income`,
		remove: (id) => `${API_BASE}/income/${id}`,
		export: `${API_BASE}/income/export`,
	},
	expense: {
		list: `${API_BASE}/expense`,
		add: `${API_BASE}/expense`,
		remove: (id) => `${API_BASE}/expense/${id}`,
		export: `${API_BASE}/expense/export`,
	},
	dashboard: `${API_BASE}/dashboard`,
};

