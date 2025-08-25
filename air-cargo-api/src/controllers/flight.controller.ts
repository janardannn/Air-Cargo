import express from 'express';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../app';
import logger from '../utils/logger';
import { prisma } from '../app';

const router = express.Router();

// Get all flights
router.get('/', async (req, res) => {
    try {
        const { origin, destination } = req.query;
        const cacheKey = `flights:${origin || 'all'}:${destination || 'all'}`;

        // Try cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: JSON.parse(cached),
                source: 'cache'
            });
        }


        const where: any = {};
        if (origin) where.origin = origin as string;
        if (destination) where.destination = destination as string;

        const flights = await prisma.flight.findMany({
            where,
            orderBy: { departureTime: 'asc' }
        });

        // Cache for 10 minutes
        await redisClient.setEx(cacheKey, 600, JSON.stringify(flights));

        res.json({
            success: true,
            data: flights,
            count: flights.length,
            source: 'database'
        });
    } catch (error) {
        logger.error('Get flights error:', error);
        res.status(500).json({
            error: 'Failed to retrieve flights',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get routes between origin and destination
router.get('/routes', async (req, res) => {
    try {
        const { origin, destination, departure_date } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({
                error: 'Origin and destination are required',
                required: ['origin', 'destination']
            });
        }

        const directFlights = await prisma.flight.findMany({
            where: {
                origin: origin as string,
                destination: destination as string
            },
            orderBy: { departureTime: 'asc' }
        });

        res.json({
            success: true,
            data: {
                direct: directFlights,
                message: 'Showing direct flights only. Transit routes not implemented for demo.'
            }
        });
    } catch (error) {
        logger.error('Get routes error:', error);
        res.status(500).json({
            error: 'Failed to find routes',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const flight = await prisma.flight.findUnique({
            where: { id }
        });

        if (!flight) {
            return res.status(404).json({
                error: 'Flight not found',
                id
            });
        }

        res.json({
            success: true,
            data: flight
        });
    } catch (error) {
        logger.error('Get flight error:', error);
        res.status(500).json({
            error: 'Failed to retrieve flight',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;