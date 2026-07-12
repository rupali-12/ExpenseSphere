import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addTransaction,
  getTransactions,
  editTransactionNote,
} from "../controllers/transactionController.js";

const router = express.Router();

// Add new transaction
router.post("/add-transaction", protect, addTransaction);

// Get transactions with pagination, filters,search all.
router.get("/get-transactions", protect, getTransactions);

// Edit trasaction note
router.put("/:id/note", protect, editTransactionNote) 

export default router;
