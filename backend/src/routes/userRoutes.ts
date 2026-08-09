import { Router } from "express";
import { getUsers } from "../controllers/userController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), getUsers);

export default router;
