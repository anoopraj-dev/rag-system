import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import uploadRoutes from './routes/upload.js';
import chatRoutes from './routes/chat.js';

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
app.use('/', uploadRoutes);
app.use('/', chatRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Handle graceful shutdown to prevent orphaned processes on restart/Ctrl+C
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down server...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 2 seconds if connections don't close
  setTimeout(() => {
    console.error('Forcing shutdown due to timeout');
    process.exit(1);
  }, 2000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart signal
