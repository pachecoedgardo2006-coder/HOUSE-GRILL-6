import axios from 'axios';

const api = axios.create({
    // VITE_API_URL debe estar definido en tu archivo .env del frontend
    baseURL: 'https://house-grill-6.onrender.com/api' || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de petición: Adjunta el token si existe
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Interceptor de respuesta: Unificado para manejar éxito, errores y redirección 401
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token'); // Limpiamos por seguridad
            window.location.hash = '#login';
        }
        console.error('Error en la petición API:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;