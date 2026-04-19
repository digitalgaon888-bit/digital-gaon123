// Central API configuration
const getBaseUrl = () => {
    // If we are running on localhost, force the local backend URL (port 5000)
    // This prevents accidental requests to the production Render server
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000';
    }
    return import.meta.env.VITE_API_BASE_URL || '';
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
