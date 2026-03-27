import axios from 'axios';

const instance = axios.create({
  // Use environment variable for flexibility, but fallback to the working URL
  baseURL: import.meta.env.VITE_API_URL || 'https://hospital-backend-myqc.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;