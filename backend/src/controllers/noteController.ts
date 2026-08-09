import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { createNoteSchema } from "../lib/validators";
import { AppError } from "../middleware/errorHandler";

// POST /api/clients/:clientId/notes
export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = createNoteSchema.parse(req.body);

    const client = await prisma.client.findUnique({
      where: { id: req.params.clientId },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    if (req.user!.role === "STAFF" && client.assignedToId !== req.user!.id) {
      throw new AppError("You do not have access to this client", 403);
    }

    const note = await prisma.note.create({
      data: {
        content,
        clientId: client.id,
        authorId: req.user!.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

// GET /api/clients/:clientId/notes
export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.clientId },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    if (req.user!.role === "STAFF" && client.assignedToId !== req.user!.id) {
      throw new AppError("You do not have access to this client", 403);
    }

    const notes = await prisma.note.findMany({
      where: { clientId: req.params.clientId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  } catch (err) {
    next(err);
  }
}
