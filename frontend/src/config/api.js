// Centralized API configuration supporting environment variables and fallback
const envUrl = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL;
const defaultUrl = 'https://ziptrrip-assignment-b.onrender.com/api/todos';

export const API_BASE = envUrl
  ? (envUrl.endsWith('/api/todos') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api/todos`)
  : defaultUrl;

export default API_BASE;
