import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingAPI } from '../services/api-service';

const SearchBooking: React.FC = () => {
    const navigate = useNavigate();
    const [refId, setRefId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Search Booking';
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!refId.trim()) {
            setError('Please enter a booking reference ID');
            return;
        }

        setError(null);
        setLoading(true);

        try {

            await BookingAPI.getBookingByRefId(refId.trim());

            navigate(`/booking/${refId.trim()}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Booking not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Search Booking</h2>
                    <p className="mt-2 text-gray-600">
                        Enter your booking reference ID to track your cargo shipment.
                    </p>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="refId" className="block text-sm font-medium text-gray-700 mb-2">
                                Booking Reference ID
                            </label>
                            <input
                                type="text"
                                id="refId"
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                placeholder="Enter booking ID (e.g., AC001001)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Format: AC followed by 6 digits (e.g., AC001001)
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Searching...' : 'Search Booking'}
                            </button>
                        </div>
                    </form>
                </div>


                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-800">
                                Demo Information
                            </h3>
                            <div className="mt-2 text-sm text-gray-600">
                                <p className="mb-2">
                                    Try searching with the sample booking ID: <strong>AC001001</strong>
                                </p>
                                <p>
                                    This booking was created during database seeding for demonstration purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBooking;