import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateBooking from './pages/CreateBooking';
import SearchBooking from './pages/SearchBooking';
import BookingDetail from './pages/BookingDetail';
import ManageBookingSearch from './pages/ManageBookingSearch';
import ManageBookingDetail from './pages/ManageBookingDetail';
import AllBookings from './pages/AllBookings';
import './index.css';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    document.title = 'AirCargo';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-8 max-w-7xl left-1/4 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex justify-center">
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    to={"/"}
                  >
                    <h1 className="text-2xl font-bold text-primary-600">
                      AirCargo
                    </h1>
                  </Link>
                </div>
                <div className='ml-24 flex'>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-primary-600 transition-colors"
                    >
                      Create Booking
                    </Link>
                    <Link
                      to="/search"
                      className="text-gray-500 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-primary-600 transition-colors"
                    >
                      Search Booking
                    </Link>
                    <Link
                      to="/bookings"
                      className="text-gray-500 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-primary-600 transition-colors"
                    >
                      All Bookings
                    </Link>
                    <Link
                      to="/manage"
                      className="text-red-600 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-red-800 transition-colors"
                    >
                      Manage Booking (Admin Only)
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="mt-24 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<CreateBooking />} />
            <Route path="/search" element={<SearchBooking />} />
            <Route path="/bookings" element={<AllBookings />} />
            <Route path="/booking/:refId" element={<BookingDetail />} />
            <Route path="/manage" element={<ManageBookingSearch />} />
            <Route path="/manage/:refId" element={<ManageBookingDetail />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              Air Cargo Booking & Tracking System
            </div>
          </div>
        </footer>
      </div >
    </Router >
  );
}

export default App;