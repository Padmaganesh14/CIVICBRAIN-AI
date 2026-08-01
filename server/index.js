import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/aiRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 👇 Add this here
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CivicBrain AI Backend 🚀',
    health: '/api/health',
    version: '1.0.0'
  });
});

// Existing Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CivicBrain AI Municipal Engine',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);

app.listen(PORT, () => {
  console.log(`CivicBrain AI Backend running on http://localhost:${PORT}`);
});