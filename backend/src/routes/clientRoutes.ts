import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  updateClientStatus,
  deleteClient,
} from "../controllers/clientController";
import { createNote, getNotes } from "../controllers/noteController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.patch("/:id/status", updateClientStatus);
router.delete("/:id", requireRole("ADMIN"), deleteClient);

router.get("/:clientId/notes", getNotes);
router.post("/:clientId/notes", createNote);

export default router;
