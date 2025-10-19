import express from 'express';
import { 
    uploadReportController,
    addVitalsController,
    getHealthTimelineController,
    getFileInsightsController,
    getDashboardDataController,
    updateProfileController
} from '../controllers/healthController.js';
import { authMiddleware } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// File upload routes
router.post('/upload-report', upload.single('file'), uploadReportController);
router.get('/file/:fileId/insights', getFileInsightsController);

// Vitals routes
router.post('/add-vitals', addVitalsController);

// Data retrieval routes
router.get('/timeline', getHealthTimelineController);
router.get('/dashboard', getDashboardDataController);

// Profile routes
router.put('/profile', updateProfileController);

export default router;
