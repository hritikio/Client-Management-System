import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

// GET /api/users
// Admin only - used to populate "assign to staff" dropdowns
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}
