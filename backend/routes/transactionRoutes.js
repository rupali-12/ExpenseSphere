import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addTransaction,
  getTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

// Add new transaction
router.post("/add-transaction", protect, addTransaction);

// Get transactions with pagination, filters,search all.
router.get("/get-transactions", protect, getTransactions);

export default router;
