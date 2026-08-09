import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
  createClientSchema,
  updateClientSchema,
  updateStatusSchema,
  isValidTransition,
} from "../lib/validators";
import { AppError } from "../middleware/errorHandler";

// GET /api/clients
// Admin sees all clients. Staff sees only clients assigned to them.
export async function getClients(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search } = req.query;

    const where: any = {};

    if (req.user!.role === "STAFF") {
      where.assignedToId = req.user!.id;
    }

    if (status && typeof status === "string") {
      where.status = status;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(clients);
  } catch (err) {
    next(err);
  }
}

// GET /api/clients/:id
export async function getClientById(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id as string },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    // Staff can only view clients assigned to them
    if (req.user!.role === "STAFF" && client.assignedToId !== req.user!.id) {
      throw new AppError("You do not have access to this client", 403);
    }

    res.json(client);
  } catch (err) {
    next(err);
  }
}

// POST /api/clients
export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createClientSchema.parse(req.body);

    const existing = await prisma.client.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError("A client with this email already exists", 409);
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        // Staff creating a client auto-assigns it to themselves unless admin specifies otherwise
        assignedToId:
          data.assignedToId ?? (req.user!.role === "STAFF" ? req.user!.id : undefined),
      },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/clients/:id
export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateClientSchema.parse(req.body);

    const existing = await prisma.client.findUnique({ where: { id: req.params.id as string} });
    if (!existing) {
      throw new AppError("Client not found", 404);
    }

    if (req.user!.role === "STAFF" && existing.assignedToId !== req.user!.id) {
      throw new AppError("You do not have access to this client", 403);
    }

    // Only admins can reassign clients to other staff
    if (data.assignedToId && req.user!.role !== "ADMIN") {
      throw new AppError("Only admins can reassign clients", 403);
    }

    const client = await prisma.client.update({
      where: { id: req.params.id as string   },
      data,
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });

    res.json(client);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/clients/:id/status
// Enforces the business-rule pipeline (no illegal status jumps)
export async function updateClientStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = updateStatusSchema.parse(req.body);

    const existing = await prisma.client.findUnique({ where: { id: req.params.id as string} });
    if (!existing) {
      throw new AppError("Client not found", 404);
    }

    if (req.user!.role === "STAFF" && existing.assignedToId !== req.user!.id) {
      throw new AppError("You do not have access to this client", 403);
    }

    if (!isValidTransition(existing.status, status)) {
      throw new AppError(
        `Cannot move client from ${existing.status} to ${status}`,
        400
      );
    }

    const client = await prisma.client.update({
      where: { id: req.params.id as string },
      data: { status },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });

    await prisma.note.create({
      data: {
        content: `Status changed from ${existing.status} to ${status}`,
        clientId: client.id,
        authorId: req.user!.id,
      },
    });

    res.json(client);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/clients/:id
// Admin only (enforced at route level too)
export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.client.findUnique({ where: { id: req.params.id  as string} });
    if (!existing) {
      throw new AppError("Client not found", 404);
    }

    await prisma.client.delete({ where: { id: req.params.id as string } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
