import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed organizer user
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@ruangtemu.com' },
    update: {},
    create: {
      email: 'organizer@ruangtemu.com',
      passwordHash,
      name: 'Demo Organizer',
      role: 'ORGANIZER',
      emailVerified: true,
    },
  });

  const attendee = await prisma.user.upsert({
    where: { email: 'attendee@ruangtemu.com' },
    update: {},
    create: {
      email: 'attendee@ruangtemu.com',
      passwordHash,
      name: 'Demo Attendee',
      role: 'ATTENDEE',
      emailVerified: true,
    },
  });

  // Seed events
  const now = new Date();
  const events = [
    {
      title: 'Board Game Night: Strategy & Snacks',
      description: 'Malam seru main board game bareng! Dari Catan sampai Ticket to Ride, semua level welcome.',
      category: 'SOCIAL' as const,
      locationName: 'Kopi Kenangan, Jakarta Selatan',
      locationLat: -6.26,
      locationLng: 106.81,
      eventDate: new Date(now.getTime() + 7 * 86400000),
      maxCapacity: 20,
      currentCount: 12,
      ticketType: 'FREE' as const,
      ticketPrice: 0,
      status: 'ACTIVE' as const,
    },
    {
      title: 'Tech Meetup: Next.js & Product Design',
      description: 'Sharing session tentang Next.js 15, server components, dan product design thinking.',
      category: 'TECHNOLOGY' as const,
      locationName: 'GoWork Coworking, Jakarta Pusat',
      locationLat: -6.19,
      locationLng: 106.82,
      eventDate: new Date(now.getTime() + 14 * 86400000),
      maxCapacity: 60,
      currentCount: 48,
      ticketType: 'PAID' as const,
      ticketPrice: 50000,
      status: 'ACTIVE' as const,
    },
    {
      title: 'Kopi Santai & Networking Komunitas',
      description: 'Ngopi bareng sambil networking ringan. Cocok buat yang baru mau mulai komunitas.',
      category: 'FOOD' as const,
      locationName: 'Titik Temu Cafe, Bandung',
      locationLat: -6.91,
      locationLng: 107.61,
      eventDate: new Date(now.getTime() + 3 * 86400000),
      maxCapacity: 15,
      currentCount: 8,
      ticketType: 'FREE' as const,
      ticketPrice: 0,
      status: 'ACTIVE' as const,
    },
    {
      title: 'Futsal Sore: Turnamen Mini',
      description: 'Turnamen futsal mini 5v5. Bawa tim atau gabung tim acak!',
      category: 'SPORTS' as const,
      locationName: 'Champion Futsal, Tangerang',
      locationLat: -6.17,
      locationLng: 106.63,
      eventDate: new Date(now.getTime() + 5 * 86400000),
      maxCapacity: 30,
      currentCount: 22,
      ticketType: 'PAID' as const,
      ticketPrice: 25000,
      status: 'ACTIVE' as const,
    },
    {
      title: 'Workshop Watercolor untuk Pemula',
      description: 'Belajar dasar-dasar watercolor painting. Semua material disediakan.',
      category: 'ART' as const,
      locationName: 'Artotel Suites, Surabaya',
      locationLat: -7.26,
      locationLng: 112.75,
      eventDate: new Date(now.getTime() + 10 * 86400000),
      maxCapacity: 12,
      currentCount: 5,
      ticketType: 'PAID' as const,
      ticketPrice: 150000,
      status: 'ACTIVE' as const,
    },
    {
      title: 'Yoga Pagi di Taman',
      description: 'Yoga session santai di taman kota. Bawa mat sendiri ya!',
      category: 'HEALTH' as const,
      locationName: 'Taman Menteng, Jakarta Pusat',
      locationLat: -6.19,
      locationLng: 106.83,
      eventDate: new Date(now.getTime() + 2 * 86400000),
      maxCapacity: 25,
      currentCount: 18,
      ticketType: 'FREE' as const,
      ticketPrice: 0,
      status: 'ACTIVE' as const,
    },
  ];

  for (const ev of events) {
    await prisma.event.create({
      data: {
        ...ev,
        organizerId: organizer.id,
      },
    });
  }

  console.log(`Seeded: ${events.length} events, 2 users (organizer + attendee)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());