import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import logger from './utils/logger';
import bookingRoutes from './controllers/booking.controller';
import flightRoutes from './controllers/flight.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


export const prisma = new PrismaClient();


export const redisClient = createClient({
    username: process.env.REDIS_USERNAME!,
    password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!)
    }
});


app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json());

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    next();
});


app.use('/api/bookings', bookingRoutes);
app.use('/api/flights', flightRoutes);


app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Air Cargo Backend'
    });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.all('/{*any}', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});


const startServer = async () => {
    try {
        await redisClient.connect();
        logger.info('Connected to Redis');

        await prisma.$connect();
        logger.info('Connected to PostgreSQL');

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;