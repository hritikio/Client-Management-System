import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

// GET /api/dashboard
// Admin sees stats across all clients. Staff sees stats scoped to their own clients.
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const scopeFilter =
      req.user!.role === "STAFF" ? { assignedToId: req.user!.id } : {};

    const [total, byStatus, recentClients, recentNotes] = await Promise.all([
      prisma.client.count({ where: scopeFilter }),
      prisma.client.groupBy({
        by: ["status"],
        where: scopeFilter,
        _count: { status: true },
      }),
      prisma.client.findMany({
        where: scopeFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, company: true, status: true, createdAt: true },
      }),
      prisma.note.findMany({
        where: scopeFilter.assignedToId
          ? { client: { assignedToId: scopeFilter.assignedToId } }
          : {},
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { name: true } },
          client: { select: { name: true } },
        },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc: Record<string, number>, curr: { status: string; _count: { status: number } }) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const active = statusCounts["ACTIVE"] ?? 0;
    const closed = statusCounts["CLOSED"] ?? 0;
    const conversionRate = total > 0 ? Math.round(((active + closed) / total) * 100) : 0;

    // Admin-only: breakdown of clients per staff member
    let byStaff: any[] = [];
    if (req.user!.role === "ADMIN") {
      const staffMembers = await prisma.user.findMany({
        where: { role: "STAFF" },
        select: {
          id: true,
          name: true,
          _count: { select: { clients: true } },
        },
      });
      byStaff = staffMembers.map(
        (s: { id: string; name: string; _count: { clients: number } }) => ({
          staffId: s.id,
          staffName: s.name,
          clientCount: s._count.clients,
        })
      );
    }

    res.json({
      totalClients: total,
      statusCounts,
      conversionRate,
      byStaff,
      recentClients,
      recentActivity: recentNotes,
    });
  } catch (err) {
    next(err);
  }
}
