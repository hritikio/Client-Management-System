import "dotenv/config";
import { PrismaClient, Role, ClientStatus } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.note.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Hritik Mokase",
      email: "admin@cms.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@cms.com",
      password: staffPassword,
      role: Role.STAFF,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@cms.com",
      password: staffPassword,
      role: Role.STAFF,
    },
  });

  const clientsData = [
    {
      name: "Aarav Enterprises",
      company: "Aarav Textiles Pvt Ltd",
      email: "contact@aaravtextiles.com",
      phone: "9876543210",
      address: "Pune, Maharashtra",
      source: "Referral",
      status: ClientStatus.LEAD,
      assignedToId: staff1.id,
    },
    {
      name: "Meera Kapoor",
      company: "Kapoor Designs",
      email: "meera@kapoordesigns.com",
      phone: "9876543211",
      address: "Mumbai, Maharashtra",
      source: "Website",
      status: ClientStatus.ONBOARDING,
      assignedToId: staff1.id,
    },
    {
      name: "Vikram Industries",
      company: "Vikram Steel Works",
      email: "info@vikramsteel.com",
      phone: "9876543212",
      address: "Nagpur, Maharashtra",
      source: "Cold Call",
      status: ClientStatus.ACTIVE,
      assignedToId: staff2.id,
    },
    {
      name: "Sanya Retail",
      company: "Sanya Fashion Hub",
      email: "sanya@fashionhub.com",
      phone: "9876543213",
      address: "Nashik, Maharashtra",
      source: "Social Media",
      status: ClientStatus.ACTIVE,
      assignedToId: staff2.id,
    },
    {
      name: "Karan Logistics",
      company: "Karan Transport Co",
      email: "karan@transportco.com",
      phone: "9876543214",
      address: "Pune, Maharashtra",
      source: "Referral",
      status: ClientStatus.ON_HOLD,
      assignedToId: staff1.id,
    },
    {
      name: "Neha Consultants",
      company: "Neha Business Solutions",
      email: "neha@bizsolutions.com",
      phone: "9876543215",
      address: "Pune, Maharashtra",
      source: "Website",
      status: ClientStatus.CLOSED,
      assignedToId: staff2.id,
    },
  ];

  for (const clientData of clientsData) {
    const client = await prisma.client.create({ data: clientData });

    await prisma.note.create({
      data: {
        content: `Initial contact made with ${client.name}. Status: ${client.status}.`,
        clientId: client.id,
        authorId: client.assignedToId as string,
      },
    });
  }

  console.log("Seed data created successfully.");
  console.log("Admin login: admin@cms.com / admin123");
  console.log("Staff login: priya@cms.com / staff123");
  console.log("Staff login: rahul@cms.com / staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
