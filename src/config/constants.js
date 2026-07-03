// WHY: Centralizes all dropdown options and structural constants. 
// If management decides to add a new room category or ticket type later, 
// you only change it here rather than hunting through 20 different user interface files.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const ROOM_TYPES = {
    SingleSharing: 'Single Sharing',
    DoubleSharing: 'Double Sharing',
    TripleSharing: 'Triple Sharing',
    FourSharing: 'Four Sharing'
};

export const TICKET_CATEGORIES = [
    'Wi-Fi/Network',
    'Plumbing',
    'Electrical',
    'Food Quality',
    'Pest Control',
    'Other'
];

export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];