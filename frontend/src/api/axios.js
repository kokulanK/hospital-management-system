import axios from 'axios';

const instance = axios.create({
  // Use the correct backend URL – replace with your actual deployed backend
  baseURL: 'https://hospital-backend-myqc.onrender.com/api', // <-- include /api
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