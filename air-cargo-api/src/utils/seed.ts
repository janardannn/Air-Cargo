import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.bookingEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();

  const flights = await prisma.flight.createMany({
    data: [
      {
        flightNumber: 'AI101',
        airlineName: 'Air India',
        origin: 'DEL',
        destination: 'BOM',
        departureTime: new Date(2025, 7, 24, 22, 30),
        arrivalTime: new Date(2025, 7, 25, 1, 0),
      },
      {
        flightNumber: 'SG201',
        airlineName: 'SpiceJet',
        origin: 'BOM',
        destination: 'BLR',
        departureTime: new Date(2025, 7, 25, 6, 0),
        arrivalTime: new Date(2025, 7, 25, 7, 30),
      },
      {
        flightNumber: '6E301',
        airlineName: 'IndiGo',
        origin: 'DEL',
        destination: 'BLR',
        departureTime: new Date(2025, 7, 25, 10, 0),
        arrivalTime: new Date(2025, 7, 25, 13, 0),
      },
      {
        flightNumber: 'UK401',
        airlineName: 'Vistara',
        origin: 'BLR',
        destination: 'HYD',
        departureTime: new Date(2025, 7, 25, 16, 30),
        arrivalTime: new Date(2025, 7, 25, 17, 45),
      },
      {
        flightNumber: 'AI501',
        airlineName: 'Air India',
        origin: 'HYD',
        destination: 'CCU',
        departureTime: new Date(2025, 7, 26, 8, 0),
        arrivalTime: new Date(2025, 7, 26, 10, 30),
      },
      {
        flightNumber: '6E402',
        airlineName: 'IndiGo',
        origin: 'CCU',
        destination: 'DEL',
        departureTime: new Date(2025, 7, 26, 14, 0),
        arrivalTime: new Date(2025, 7, 26, 16, 30),
      },
      {
        flightNumber: 'SG301',
        airlineName: 'SpiceJet',
        origin: 'MAA',
        destination: 'BOM',
        departureTime: new Date(2025, 7, 25, 12, 15),
        arrivalTime: new Date(2025, 7, 25, 13, 45),
      },
      {
        flightNumber: 'UK501',
        airlineName: 'Vistara',
        origin: 'AMD',
        destination: 'DEL',
        departureTime: new Date(2025, 7, 25, 18, 30),
        arrivalTime: new Date(2025, 7, 25, 20, 15),
      },
    ],
  });


  const booking1 = await prisma.booking.create({
    data: {
      refId: 'AC001001',
      origin: 'DEL',
      destination: 'BOM',
      pieces: 2,
      weightKg: 25,
      status: 'BOOKED',
      createdAt: new Date(2025, 7, 24, 10, 30),
      updatedAt: new Date(2025, 7, 24, 10, 30),
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking1.id,
      eventType: 'BOOKING_CREATED',
      location: 'DEL',
      notes: 'Cargo booking created for Delhi to Mumbai route',
      createdAt: new Date(2025, 7, 24, 10, 30),
    },
  });


  const booking2 = await prisma.booking.create({
    data: {
      refId: 'AC001002',
      origin: 'BLR',
      destination: 'HYD',
      pieces: 1,
      weightKg: 15,
      status: 'DEPARTED',
      createdAt: new Date(2025, 7, 23, 14, 15),
      updatedAt: new Date(2025, 7, 24, 16, 30),
    },
  });


  await prisma.bookingEvent.create({
    data: {
      bookingId: booking2.id,
      eventType: 'BOOKING_CREATED',
      location: 'BLR',
      notes: 'Cargo booking created for Bangalore to Hyderabad route',
      createdAt: new Date(2025, 7, 23, 14, 15),
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking2.id,
      eventType: 'DEPARTURE',
      location: 'BLR',
      notes: 'Cargo departed from Bangalore International Airport',
      createdAt: new Date(2025, 7, 24, 16, 30),
    },
  });


  const booking3 = await prisma.booking.create({
    data: {
      refId: 'AC001003',
      origin: 'MAA',
      destination: 'BOM',
      pieces: 3,
      weightKg: 40,
      status: 'ARRIVED',
      createdAt: new Date(2025, 7, 22, 9, 0),
      updatedAt: new Date(2025, 7, 24, 18, 45),
    },
  });


  await prisma.bookingEvent.create({
    data: {
      bookingId: booking3.id,
      eventType: 'BOOKING_CREATED',
      location: 'MAA',
      notes: 'Cargo booking created for Chennai to Mumbai route',
      createdAt: new Date(2025, 7, 22, 9, 0),
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking3.id,
      eventType: 'DEPARTURE',
      location: 'MAA',
      notes: 'Cargo departed from Chennai International Airport',
      createdAt: new Date(2025, 7, 23, 11, 30),
    },
  });

  await prisma.bookingEvent.create({
    data: {
      bookingId: booking3.id,
      eventType: 'ARRIVAL',
      location: 'BOM',
      notes: 'Cargo arrived at Mumbai Chhatrapati Shivaji Airport',
      createdAt: new Date(2025, 7, 24, 18, 45),
    },
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${flights.count} flights and 3 sample bookings`);
  console.log('Sample booking IDs:');
  console.log('- AC001001 (BOOKED) - Created today morning');
  console.log('- AC001002 (DEPARTED) - Created yesterday, departed today');
  console.log('- AC001003 (ARRIVED) - Full journey completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
