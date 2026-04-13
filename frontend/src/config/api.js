// Central API configuration
// Vite environment variable se URL aata hai
// Production mein VITE_API_BASE_URL = Render backend URL hoga
// Development mein automatically localhost:5000 use hoga

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;
