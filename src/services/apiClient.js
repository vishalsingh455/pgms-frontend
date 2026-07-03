import { API_BASE_URL } from '../config/constants.js';

// WHY: This is an abstracted, central API client wrapper. 
// It handles token injection, network errors, and JSON extraction automatically, 
// reducing duplicate code across the entire frontend application workspace.
export const apiClient = async (endpoint, options = {}) => {
    // 1. Build the complete network target URL string
    const url = `${API_BASE_URL}${endpoint}`;

    // 2. Initialize or merge incoming options custom headers array
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 3. SECURE AUTH KEYCARD INJECTION: Pull the saved token out of browser storage
    const token = localStorage.getItem('pgms_jwt_token');
    if (token) {
        // Inject the authentication token using standard Bearer schema signature layout
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Merge headers back into the network execution payload parameters
    const config = {
        ...options,
        headers,
    };

    try {
        // 5. Fire the native fetch web request browser loop
        const response = await fetch(url, config);

        // Parse the JSON data packet output returned from the Express server
        const data = await response.json();

        // 6. Evaluates HTTP response flags (e.g., status codes like 400, 401, 403, 404)
        if (!response.ok) {
            // Throw an error block containing the exact message string crafted by our backend middleware
            throw new Error(data.message || 'Something went wrong across the network server.');
        }

        // Return the clean data structure back to the UI state engine
        return data;
    } catch (error) {
        console.error(`[API Client Error Response Log]:`, error.message);
        throw error; // Propagate the error upward so components can catch it and display warnings
    }
};