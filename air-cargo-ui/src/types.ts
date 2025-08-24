export type BookingStatus = 'BOOKED' | 'DEPARTED' | 'ARRIVED' | 'DELIVERED' | 'CANCELLED';

export type EventType = 'BOOKING_CREATED' | 'DEPARTURE' | 'ARRIVAL' | 'DELIVERY' | 'CANCELLATION';

export interface Flight {
    id: string;
    flightNumber: string;
    airlineName: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingEvent {
    id: string;
    eventType: EventType;
    location: string | null;
    notes: string | null;
    createdAt: string;
    flight?: {
        flightNumber: string;
        airlineName: string;
    } | null;
}

export interface Booking {
    id: string;
    refId: string;
    origin: string;
    destination: string;
    pieces: number;
    weightKg: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    events?: BookingEvent[];
}

export interface CreateBookingData {
    origin: string;
    destination: string;
    pieces: number;
    weightKg: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface StatusUpdateData {
    location: string;
    flightId?: string;
}

// Airport codes 
export const AIRPORT_CODES = [
    { code: 'DEL', name: 'Delhi (DEL)' },
    { code: 'BOM', name: 'Mumbai (BOM)' },
    { code: 'BLR', name: 'Bangalore (BLR)' },
    { code: 'HYD', name: 'Hyderabad (HYD)' },
    { code: 'CCU', name: 'Kolkata (CCU)' },
    { code: 'MAA', name: 'Chennai (MAA)' },
    { code: 'AMD', name: 'Ahmedabad (AMD)' },
    { code: 'GOI', name: 'Goa (GOI)' },
];