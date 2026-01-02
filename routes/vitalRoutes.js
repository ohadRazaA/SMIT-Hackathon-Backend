import express from 'express';
import { addVitals, getLatestVitals, getVitalsHistory } from '../controllers/vitalController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/:id/vitals', authMiddleware, addVitals);
router.get('/:id/vitals', authMiddleware, getLatestVitals);
router.get('/:id/vitals/history', authMiddleware, getVitalsHistory);

export default router;
