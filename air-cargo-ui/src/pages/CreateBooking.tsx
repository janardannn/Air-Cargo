import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingAPI } from '../services/api-service';
import { CreateBookingData, AIRPORT_CODES } from '../types';

const CreateBooking: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateBookingData>({
        origin: '',
        destination: '',
        pieces: 1,
        weightKg: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        document.title = 'Create Booking';
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const booking = await BookingAPI.createBooking(formData);

            // Navigate to the booking detail page
            navigate(`/booking/${booking.refId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'pieces' || name === 'weightKg' ? parseInt(value) || 0 : value
        }));
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Create New Booking</h2>
                    <p className="mt-2 text-gray-600">
                        Enter cargo details to create a new air cargo booking.
                    </p>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <div>
                                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                                    Origin Airport
                                </label>
                                <select
                                    id="origin"
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Origin</option>
                                    {AIRPORT_CODES.map((airport) => (
                                        <option key={airport.code} value={airport.code}>
                                            {airport.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                                    Destination Airport
                                </label>
                                <select
                                    id="destination"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Destination</option>
                                    {AIRPORT_CODES.map((airport) => (
                                        <option key={airport.code} value={airport.code}>
                                            {airport.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Pieces */}
                            <div>
                                <label htmlFor="pieces" className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Pieces
                                </label>
                                <input
                                    type="number"
                                    id="pieces"
                                    name="pieces"
                                    value={formData.pieces}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>


                            <div>
                                <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    id="weightKg"
                                    name="weightKg"
                                    value={formData.weightKg}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>


                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Booking'}
                            </button>
                        </div>
                    </form>
                </div>


                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Booking Information
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Once you create a booking, you'll receive a unique reference ID that you can use to track your cargo throughout its journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBooking;