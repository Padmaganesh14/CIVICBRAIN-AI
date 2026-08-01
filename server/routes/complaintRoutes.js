import express from 'express';
import { getComplaints, createComplaint, mergeDuplicate, updateStatus } from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', createComplaint);
router.post('/merge', mergeDuplicate);
router.patch('/:id/status', updateStatus);

export default router;
