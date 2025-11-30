import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Console logging for visibility
    // Logs method, URL, and payload (without Authorization header)
    const method = (config.method || 'GET').toUpperCase();
    const url = `${config.baseURL || ''}${config.url || ''}`;
    // Avoid logging huge blobs; stringify shallowly
    try {
        console.log('[API request]', method, url, { params: config.params, data: config.data });
    } catch (_) {
        console.log('[API request]', method, url);
    }
    return config;
});

client.interceptors.response.use(
    (response) => {
        console.log('[API response]', response.config?.method?.toUpperCase(), response.config?.url, response.status);
        return response;
    },
    (error) => {
        const { config, response } = error || {};
        const method = config?.method?.toUpperCase();
        const url = config?.url;
        const status = response?.status;
        console.log('[API error]', method, url, status, response?.data);
        return Promise.reject(error);
    }
);

export default client;
