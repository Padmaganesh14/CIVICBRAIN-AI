import express from 'express';
import { analyzeComplaint, generateDailyInsights, askCopilot } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', analyzeComplaint);
router.get('/insights', generateDailyInsights);
router.post('/copilot', askCopilot);

export default router;
