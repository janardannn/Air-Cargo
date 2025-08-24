import express from 'express';
import { BookingService } from '../services/booking.service';
import logger from '../utils/logger';

const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const { origin, destination, pieces, weightKg } = req.body;

        // check
        if (!origin || !destination || !pieces || !weightKg) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['origin', 'destination', 'pieces', 'weightKg']
            });
        }

        if (pieces <= 0 || weightKg <= 0) {
            return res.status(400).json({
                error: 'Pieces and weight must be positive numbers'
            });
        }

        const booking = await BookingService.createBooking({
            origin,
            destination,
            pieces: parseInt(pieces),
            weightKg: parseInt(weightKg)
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        logger.error('Create booking error:', error);
        res.status(500).json({
            error: 'Failed to create booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/:refId', async (req, res) => {
    try {
        const { refId } = req.params;

        if (!refId) {
            return res.status(400).json({
                error: 'Booking reference ID is required'
            });
        }

        const booking = await BookingService.getBookingByRefId(refId);

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                refId
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        logger.error('Get booking error:', error);
        res.status(500).json({
            error: 'Failed to retrieve booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.patch('/:refId/depart', async (req, res) => {
    try {
        const { refId } = req.params;
        const { location, flightId } = req.body;

        if (!location) {
            return res.status(400).json({
                error: 'Departure location is required'
            });
        }

        const booking = await BookingService.departBooking(refId, location, flightId);

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                refId
            });
        }

        res.json({
            success: true,
            message: 'Booking marked as departed',
            data: booking
        });
    } catch (error) {
        logger.error('Depart booking error:', error);
        res.status(400).json({
            error: 'Failed to update booking status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


router.patch('/:refId/arrive', async (req, res) => {
    try {
        const { refId } = req.params;
        const { location, flightId } = req.body;

        if (!location) {
            return res.status(400).json({
                error: 'Arrival location is required'
            });
        }

        const booking = await BookingService.arriveBooking(refId, location, flightId);

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                refId
            });
        }

        res.json({
            success: true,
            message: 'Booking marked as arrived',
            data: booking
        });
    } catch (error) {
        logger.error('Arrive booking error:', error);
        res.status(400).json({
            error: 'Failed to update booking status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.patch('/:refId/deliver', async (req, res) => {
    try {
        const { refId } = req.params;
        const { location } = req.body;

        if (!location) {
            return res.status(400).json({
                error: 'Delivery location is required'
            });
        }

        const booking = await BookingService.deliverBooking(refId, location);

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                refId
            });
        }

        res.json({
            success: true,
            message: 'Booking marked as delivered',
            data: booking
        });
    } catch (error) {
        logger.error('Deliver booking error:', error);
        res.status(400).json({
            error: 'Failed to update booking status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


router.patch('/:refId/cancel', async (req, res) => {
    try {
        const { refId } = req.params;

        const booking = await BookingService.cancelBooking(refId);

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                refId
            });
        }

        res.json({
            success: true,
            message: 'Booking cancelled',
            data: booking
        });
    } catch (error) {
        logger.error('Cancel booking error:', error);
        res.status(400).json({
            error: 'Failed to cancel booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const bookings = await BookingService.getAllBookings();

        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        logger.error('Get all bookings error:', error);
        res.status(500).json({
            error: 'Failed to retrieve bookings',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;