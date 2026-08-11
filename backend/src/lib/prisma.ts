import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
  connectionTimeoutMillis: 15000, // give Neon's cold start time to wake up
  max: 10,
});

export const prisma = new PrismaClient({ adapter });
