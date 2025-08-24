import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookingAPI } from '../services/api-service';
import { Booking, BookingEvent, AIRPORT_CODES } from '../types';

const ManageBookingDetail: React.FC = () => {
    const { refId } = useParams<{ refId: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);
    const [updateForm, setUpdateForm] = useState({
        location: '',
        flightId: ''
    });

    useEffect(() => {
        document.title = `Manage Booking`;
        if (refId) {
            fetchBooking();
        }
    }, [refId]);

    const fetchBooking = async () => {
        if (!refId) return;
        try {
            const bookingData = await BookingAPI.getBookingByRefId(refId);
            setBooking(bookingData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch booking');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (action: string) => {
        if (!booking || !updateForm.location) return;
        setUpdateLoading(action);
        try {
            let updatedBooking: Booking;
            switch (action) {
                case 'depart':
                    updatedBooking = await BookingAPI.departBooking(booking.refId, updateForm);
                    break;
                case 'arrive':
                    updatedBooking = await BookingAPI.arriveBooking(booking.refId, updateForm);
                    break;
                case 'deliver':
                    updatedBooking = await BookingAPI.deliverBooking(booking.refId, updateForm.location);
                    break;
                default:
                    return;
            }
            setBooking(updatedBooking);
            await fetchBooking();
            setUpdateForm({ location: '', flightId: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update booking');
        } finally {
            setUpdateLoading(null);
        }
    };

    const handleCancel = async () => {
        if (!booking) return;
        setUpdateLoading('cancel');
        try {
            const updatedBooking = await BookingAPI.cancelBooking(booking.refId);
            setBooking(updatedBooking);
            await fetchBooking();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        } finally {
            setUpdateLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'bg-blue-100 text-blue-800';
            case 'DEPARTED': return 'bg-yellow-100 text-yellow-800';
            case 'ARRIVED': return 'bg-orange-100 text-orange-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'BOOKING_CREATED': return '📋';
            case 'DEPARTURE': return '✈️';
            case 'ARRIVAL': return '🛬';
            case 'DELIVERY': return '📦';
            case 'CANCELLATION': return '❌';
            default: return '📍';
        }
    };

    const canUpdateStatus = (currentStatus: string) => {
        return !['DELIVERED', 'CANCELLED'].includes(currentStatus);
    };

    const getAvailableActions = (currentStatus: string) => {
        switch (currentStatus) {
            case 'BOOKED': return ['depart'];
            case 'DEPARTED': return ['arrive'];
            case 'ARRIVED': return ['deliver'];
            default: return [];
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">Booking not found</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manage Booking {booking.refId}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        View and update cargo shipment status and timeline.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-gray-500">From</p><p className="font-medium">{booking.origin}</p></div>
                                <div><p className="text-sm text-gray-500">To</p><p className="font-medium">{booking.destination}</p></div>
                                <div><p className="text-sm text-gray-500">Pieces</p><p className="font-medium">{booking.pieces}</p></div>
                                <div><p className="text-sm text-gray-500">Weight</p><p className="font-medium">{booking.weightKg} kg</p></div>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment Timeline</h3>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {booking.events?.map((event: BookingEvent, eventIndex: number) => (
                                        <li key={event.id}>
                                            <div className="relative pb-8">
                                                {eventIndex !== (booking.events?.length || 0) - 1 ? (<span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />) : null}
                                                <div className="relative flex space-x-3">
                                                    <div><span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">{getEventIcon(event.eventType)}</span></div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{event.eventType.replace('_', ' ')}{event.location && ` at ${event.location}`}</p>
                                                            {event.notes && (<p className="text-sm text-gray-500">{event.notes}</p>)}
                                                            {event.flight && (<p className="text-sm text-gray-500">Flight: {event.flight.flightNumber} ({event.flight.airlineName})</p>)}
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">{new Date(event.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {canUpdateStatus(booking.status) && (
                            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                        <select
                                            id="location"
                                            value={updateForm.location}
                                            onChange={(e) => setUpdateForm(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Location</option>
                                            {AIRPORT_CODES.map((airport) => (<option key={airport.code} value={airport.code}>{airport.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        {getAvailableActions(booking.status).map((action) => (
                                            <button
                                                key={action}
                                                onClick={() => handleStatusUpdate(action)}
                                                disabled={!updateForm.location || updateLoading === action}
                                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {updateLoading === action ? 'Updating...' : `Mark as ${action.charAt(0).toUpperCase() + action.slice(1)}ed`}
                                            </button>
                                        ))}
                                    </div>
                                    {booking.status !== 'CANCELLED' && booking.status !== 'ARRIVED' && (
                                        <button
                                            onClick={handleCancel}
                                            disabled={updateLoading === 'cancel'}
                                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {updateLoading === 'cancel' ? 'Cancelling...' : 'Cancel Booking'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h3>
                            <dl className="space-y-2">
                                <div><dt className="text-sm text-gray-500">Created</dt><dd className="text-sm font-medium text-gray-900">{new Date(booking.createdAt).toLocaleString()}</dd></div>
                                <div><dt className="text-sm text-gray-500">Last Updated</dt><dd className="text-sm font-medium text-gray-900">{new Date(booking.updatedAt).toLocaleString()}</dd></div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBookingDetail;