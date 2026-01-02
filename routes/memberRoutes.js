import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js'
import { addMember, getAllMembers, getSingleMember } from '../controllers/memberController.js'

router.post('/add-member', authMiddleware, addMember);
router.get('/get-all-member', authMiddleware, getAllMembers);
router.get('/get-single-member/:id', authMiddleware, getSingleMember);
export default router;