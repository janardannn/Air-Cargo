import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingAPI } from '../services/api-service';

const ManageBookingSearch: React.FC = () => {
    const navigate = useNavigate();
    const [refId, setRefId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Manage Booking';
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
            navigate(`/manage/${refId.trim()}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Booking not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-4 p-4 text-center bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        This page is for demo purposes to manage bookings
                    </p>
                </div>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Manage Booking Status</h2>
                    <p className="mt-2 text-gray-600">
                        Enter a booking reference ID to view and manage its status.
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
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Searching...' : 'Search & Manage'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageBookingSearch;