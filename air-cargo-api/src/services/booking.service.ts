import { PrismaClient, Booking, BookingStatus, EventType } from '@prisma/client';
import { redisClient } from '../app';
import logger from '../utils/logger';
import { prisma } from "../app"


interface CreateBookingData {
    origin: string;
    destination: string;
    pieces: number;
    weightKg: number;
}

interface BookingWithEvents {
    id: string;
    refId: string;
    origin: string;
    destination: string;
    pieces: number;
    weightKg: number;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
    events: Array<{
        id: string;
        eventType: EventType;
        location: string | null;
        notes: string | null;
        createdAt: Date;
        flight?: {
            flightNumber: string;
            airlineName: string;
        } | null;
    }>;
}

export class BookingService {
    private static bookingCounter: number | null = null;

    // human-readable booking ID
    private static async generateRefId(): Promise<string> {
        if (this.bookingCounter === null) {
            await this.initializeCounter();
        }

        let refId: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            refId = `AC${String(this.bookingCounter!).padStart(6, '0')}`;
            this.bookingCounter!++;
            attempts++;

            const existing = await prisma.booking.findUnique({
                where: { refId }
            });

            if (!existing) {
                return refId;
            }

            if (attempts >= maxAttempts) {
                throw new Error('Unable to generate unique booking ID after multiple attempts');
            }
        } while (true);
    }

    private static async initializeCounter(): Promise<void> {
        try {
            const lastBooking = await prisma.booking.findFirst({
                select: { refId: true },
                where: {
                    refId: {
                        startsWith: 'AC'
                    }
                },
                orderBy: {
                    refId: 'desc'
                }
            });

            if (lastBooking) {
                const lastNumber = parseInt(lastBooking.refId.substring(2));
                this.bookingCounter = lastNumber + 1;
            } else {
                this.bookingCounter = 1001;
            }

            logger.info(`Initialized booking counter to: ${this.bookingCounter}`);
        } catch (error) {
            logger.error('Failed to initialize booking counter:', error);
            this.bookingCounter = 1000 + Math.floor(Date.now() / 1000) % 100000;
        }
    }

    // lock using Redis
    private static async acquireLock(bookingId: string, ttl: number = 10000): Promise<boolean> {
        try {
            const lockKey = `lock:booking:${bookingId}`;
            const result = await redisClient.setNX(lockKey, '1');
            if (result) {
                await redisClient.pExpire(lockKey, ttl);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Failed to acquire lock:', error);
            return false;
        }
    }

    private static async releaseLock(bookingId: string): Promise<void> {
        try {
            const lockKey = `lock:booking:${bookingId}`;
            await redisClient.del(lockKey);
        } catch (error) {
            logger.error('Failed to release lock:', error);
        }
    }

    // create new booking
    static async createBooking(data: CreateBookingData): Promise<Booking> {
        const refId = await this.generateRefId();

        try {
            const booking = await prisma.booking.create({
                data: {
                    refId,
                    origin: data.origin,
                    destination: data.destination,
                    pieces: data.pieces,
                    weightKg: data.weightKg,
                    status: 'BOOKED',
                },
            });

            await prisma.bookingEvent.create({
                data: {
                    bookingId: booking.id,
                    eventType: 'BOOKING_CREATED',
                    location: data.origin,
                    notes: `Cargo booking created for ${data.pieces} pieces (${data.weightKg}kg)`,
                },
            });

            await this.clearBookingCache(refId);

            logger.info(`Booking created: ${refId}`, { bookingId: booking.id, refId });
            return booking;
        } catch (error) {
            logger.error('Failed to create booking:', error);
            throw new Error('Failed to create booking');
        }
    }

    // get booking from cache
    static async getBookingByRefId(refId: string): Promise<BookingWithEvents | null> {
        const cacheKey = `booking:${refId}`;

        try {
            // try cache
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                logger.debug(`Booking found in cache: ${refId}`);
                return JSON.parse(cached);
            }

            // get from db
            const booking = await prisma.booking.findUnique({
                where: { refId },
                include: {
                    events: {
                        include: {
                            flight: {
                                select: {
                                    flightNumber: true,
                                    airlineName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });

            if (booking) {
                // cache for 5 minutes
                await redisClient.setEx(cacheKey, 300, JSON.stringify(booking));
                logger.debug(`Booking cached: ${refId}`);
            }

            return booking;
        } catch (error) {
            logger.error(`Failed to get booking ${refId}:`, error);
            throw new Error('Failed to retrieve booking');
        }
    }

    // update booking status with concurrency control
    static async updateBookingStatus(
        refId: string,
        status: BookingStatus,
        eventType: EventType,
        location?: string,
        flightId?: string,
        notes?: string
    ): Promise<Booking | null> {
        const lockAcquired = await this.acquireLock(refId);
        if (!lockAcquired) {
            throw new Error('Booking is currently being processed by another operation');
        }

        try {
            const currentBooking = await prisma.booking.findUnique({
                where: { refId },
            });

            if (!currentBooking) {
                throw new Error('Booking not found');
            }

            if (!this.isValidStatusTransition(currentBooking.status, status)) {
                throw new Error(`Invalid status transition from ${currentBooking.status} to ${status}`);
            }

            const updatedBooking = await prisma.booking.update({
                where: { refId },
                data: { status },
            });

            await prisma.bookingEvent.create({
                data: {
                    bookingId: currentBooking.id,
                    eventType,
                    location: location || null,
                    flightId: flightId || null,
                    notes: notes || null,
                },
            });

            await this.clearBookingCache(refId);

            logger.info(`Booking status updated: ${refId} -> ${status}`, {
                bookingId: currentBooking.id,
                refId,
                oldStatus: currentBooking.status,
                newStatus: status,
            });

            return updatedBooking;
        } catch (error) {
            logger.error(`Failed to update booking status ${refId}:`, error);
            throw error;
        } finally {
            await this.releaseLock(refId);
        }
    }

    // cancel booking
    static async cancelBooking(refId: string): Promise<Booking | null> {
        return this.updateBookingStatus(
            refId,
            'CANCELLED',
            'CANCELLATION',
            undefined,
            undefined,
            'Booking cancelled by user'
        );
    }

    // mark booking as departed
    static async departBooking(refId: string, location: string, flightId?: string): Promise<Booking | null> {
        return this.updateBookingStatus(
            refId,
            'DEPARTED',
            'DEPARTURE',
            location,
            flightId,
            `Cargo departed from ${location}`
        );
    }

    // mark booking as arrived
    static async arriveBooking(refId: string, location: string, flightId?: string): Promise<Booking | null> {
        return this.updateBookingStatus(
            refId,
            'ARRIVED',
            'ARRIVAL',
            location,
            flightId,
            `Cargo arrived at ${location}`
        );
    }

    // mark booking as delivered
    static async deliverBooking(refId: string, location: string): Promise<Booking | null> {
        return this.updateBookingStatus(
            refId,
            'DELIVERED',
            'DELIVERY',
            location,
            undefined,
            `Cargo delivered at ${location}`
        );
    }

    // validate status transitions
    private static isValidStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
        const validTransitions: Record<BookingStatus, BookingStatus[]> = {
            BOOKED: ['DEPARTED', 'CANCELLED'],
            DEPARTED: ['ARRIVED'],
            ARRIVED: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: [],
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    // clear booking cache
    private static async clearBookingCache(refId: string): Promise<void> {
        try {
            const cacheKey = `booking:${refId}`;
            await redisClient.del(cacheKey);
            logger.debug(`Cache cleared for booking: ${refId}`);
        } catch (error) {
            logger.error('Failed to clear cache:', error);
        }
    }

    // get all bookings 
    static async getAllBookings(): Promise<Booking[]> {
        try {
            return await prisma.booking.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
        } catch (error) {
            logger.error('Failed to get all bookings:', error);
            throw new Error('Failed to retrieve bookings');
        }
    }
}
