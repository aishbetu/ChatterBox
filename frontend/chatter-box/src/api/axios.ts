import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add Authorization header to every request if token exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem('chatterBoxToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// handle global errors (e.g. 401 → redirect to login)
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('chatterBoxToken');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
)

export default api;