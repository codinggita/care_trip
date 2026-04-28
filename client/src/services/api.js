import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('caretrip_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth ---
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const googleLogin = (data) => api.post('/auth/google', data);

// --- Profile ---
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// --- Doctors ---
export const fetchDoctors = (params) => api.get('/doctors', { params });
export const fetchDoctor = (id) => api.get(`/doctors/${id}`);
export const fetchNearbyDoctors = (lat, lng, distance) => api.get('/doctors/nearby', { params: { lat, lng, distance } });

// --- Bookings ---
export const createBooking = (data) => api.post('/bookings', data);
export const fetchMyBookings = () => api.get('/bookings');
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const getBookedSlots = (doctorId, date) => api.get('/bookings/booked-slots', { params: { doctorId, date } });
export const submitReview = (bookingId, data) => api.post(`/bookings/${bookingId}/review`, data);
export const getDoctorReviews = (doctorId) => api.get(`/bookings/reviews/${doctorId}`);

// --- Emergency ---
export const sendEmergencyEmail = (data) => api.post('/emergency/email', data);
export const getWhatsAppSOSLink = (location) => api.get('/emergency/whatsapp-link', { params: { location } });

// --- Places ---
export const reverseGeocode = (lat, lng) => api.get('/places/reverse-geocode', { params: { lat, lng } });
export const searchDoctors = (query, lat, lng) => api.get('/places/search-doctors', { params: { query, lat, lng } });

export default api;
