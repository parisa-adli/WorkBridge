import { Router } from "express";
import { StatsController } from "../http/controllers/stats.controller";

const router = Router();

router.get("/public", StatsController.getPublicStats);

export { router as statsRoutes };
