import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://expense-sphere-itklnw1kr-rupali12s-projects.vercel.app/',
      'https://expense-sphere-git-master-rupali12s-projects.vercel.app/',
      process.env.FRONTEND_URL,
    ]
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}));

// Connect to MongoDB
connectDB();

app.use('/api/users', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));