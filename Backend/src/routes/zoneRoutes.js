import express from 'express';
import { getZones, predictLocation } from '../controllers/zoneController.js';

const router = express.Router();

router.get('/', getZones);
router.post('/predict', predictLocation);

export default router;