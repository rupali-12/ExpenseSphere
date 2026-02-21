import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
const PORT = process.env.PORT; 

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));

// Connect to MongoDB
connectDB();

app.use('/api/users', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
