import express from "express";
import { getZones } from "../controllers/zoneController.js";

const router = express.Router();

router.get("/zones", getZones);

export default router;