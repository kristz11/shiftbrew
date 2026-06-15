import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shiftbrew-production.up.railway.app';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);  // OAuth2 использует 'username' для email
    formData.append('password', password);
    
    const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
},
    register: async (userData) => {
        const response = await api.post('/register', userData);
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    }
};

export const shiftAPI = {
    getMyShifts: async () => {
        const response = await api.get('/shifts/my');
        return response.data;
    },
    getCoffeeShopShifts: async (shopId) => {
        const response = await api.get(`/shifts/coffee-shop/${shopId}`);
        return response.data;
    },
    createShift: async (shiftData) => {
        const response = await api.post('/shifts', shiftData);
        return response.data;
    },
    deleteShift: async (shiftId) => {
        const response = await api.delete(`/shifts/${shiftId}`);
        return response.data;
    }
};

export const wishAPI = {
    createWish: async (wishData) => {
        const response = await api.post('/shift-wishes', wishData);
        return response.data;
    },
    getMyWishes: async () => {
        const response = await api.get('/shift-wishes/my');
        return response.data;
    }
};

export const requestAPI = {
    createRequest: async (requestData) => {
        const response = await api.post('/shift-requests', requestData);
        return response.data;
    },
    getMyRequests: async () => {
        const response = await api.get('/shift-requests/my');
        return response.data;
    },
    updateRequestStatus: async (requestId, status) => {
        const response = await api.put(`/shift-requests/${requestId}/${status}`);
        return response.data;
    }
};

export const statsAPI = {
    getMyStats: async (startDate, endDate) => {
        const response = await api.get('/work-time/my-stats', {
            params: {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            }
        });
        return response.data;
    },
    getAllStats: async (params = {}) => {
        const response = await api.get('/work-time/stats', { params });
        return response.data;
    }
};

export const coffeeShopAPI = {
    getAll: async () => {
        const response = await api.get('/coffee-shops');
        return response.data;
    },
    create: async (shopData) => {
        const response = await api.post('/coffee-shops', shopData);
        return response.data;
    }
};

export default api;