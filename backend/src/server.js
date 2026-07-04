import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Middlewares 
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RAG system running successfully'
  });
});

// Routes
app.use('/upload', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
