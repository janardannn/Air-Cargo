import axios from 'axios';
import { Booking, CreateBookingData, ApiResponse, StatusUpdateData, Flight } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export class BookingAPI {
    // Create new booking
    static async createBooking(data: CreateBookingData): Promise<Booking> {
        const response = await api.post<ApiResponse<Booking>>('/bookings', data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to create booking');
        }
        return response.data.data;
    }

    // Get booking by refId
    static async getBookingByRefId(refId: string): Promise<Booking> {
        const response = await api.get<ApiResponse<Booking>>(`/bookings/${refId}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Booking not found');
        }
        return response.data.data;
    }

    // Mark booking as departed
    static async departBooking(refId: string, data: StatusUpdateData): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/bookings/${refId}/depart`, data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to update booking status');
        }
        return response.data.data;
    }

    // Mark booking as arrived
    static async arriveBooking(refId: string, data: StatusUpdateData): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/bookings/${refId}/arrive`, data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to update booking status');
        }
        return response.data.data;
    }

    // Mark booking as delivered
    static async deliverBooking(refId: string, location: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/bookings/${refId}/deliver`, { location });
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to update booking status');
        }
        return response.data.data;
    }

    // Cancel booking
    static async cancelBooking(refId: string): Promise<Booking> {
        const response = await api.patch<ApiResponse<Booking>>(`/bookings/${refId}/cancel`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to cancel booking');
        }
        return response.data.data;
    }

    // Get all bookings 
    static async getAllBookings(): Promise<Booking[]> {
        const response = await api.get<ApiResponse<Booking[]>>('/bookings');
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to fetch bookings');
        }
        return response.data.data;
    }
}

export class FlightAPI {
    // Get all flights
    static async getAllFlights(origin?: string, destination?: string): Promise<Flight[]> {
        const params = new URLSearchParams();
        if (origin) params.append('origin', origin);
        if (destination) params.append('destination', destination);

        const response = await api.get<ApiResponse<Flight[]>>(`/flights?${params.toString()}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to fetch flights');
        }
        return response.data.data;
    }

    // Get routes
    static async getRoutes(origin: string, destination: string, departureDate?: string) {
        const params = new URLSearchParams({
            origin,
            destination,
        });
        if (departureDate) params.append('departure_date', departureDate);

        const response = await api.get(`/flights/routes?${params.toString()}`);
        return response.data;
    }
}

export default api;