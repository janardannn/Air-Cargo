import request from 'supertest';
import app from '../app';

describe('API Health Check', () => {
    it('return 200', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
    });
});

describe('Booking API', () => {
    it('create a new booking', async () => {
        const bookingData = {
            origin: 'DEL',
            destination: 'BOM',
            pieces: 2,
            weightKg: 25
        };

        const response = await request(app)
            .post('/api/bookings')
            .send(bookingData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.refId).toMatch(/^AC\d{6}$/);
        expect(response.body.data.origin).toBe('DEL');
        expect(response.body.data.destination).toBe('BOM');
    });

    it('validate required fields', async () => {
        const response = await request(app)
            .post('/api/bookings')
            .send({
                origin: 'DEL'
                // missing 
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });
});

describe('Flight API', () => {
    it('get all flights', async () => {
        const response = await request(app).get('/api/flights');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});