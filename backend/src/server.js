import dotenv from 'dotenv'

dotenv.config();
import express from 'express';
import cors from 'cors'
import uploadRoutes from './routes/upload.js'

const app = express();

// middlewares 
app.use(cors());
app.use(express.json({ limit: '10mb' }))

// HealthCheck route 

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RAG system running successfully'
  })
})

app.use('/upload', uploadRoutes)

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server listening on https://localhost:${PORT}`)
});
