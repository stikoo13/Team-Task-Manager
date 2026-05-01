import axios from 'axios';

const instance = axios.create({ baseURL: 'https://bug-free-guide-5grvrpxjqp952vqw6-5000.app.github.dev/api' });

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;