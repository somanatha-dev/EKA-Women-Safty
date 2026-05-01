import express from 'express';
import { getNearbyUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/nearby-users', getNearbyUsers);

export default router;
