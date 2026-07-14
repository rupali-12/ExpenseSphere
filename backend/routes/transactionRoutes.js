import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addTransaction,
  getTransactions,
  editTransactionNote,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

// Add new transaction
router.post("/add-transaction", protect, addTransaction);

// Get transactions with pagination, filters,search all.
router.get("/get-transactions", protect, getTransactions);

// Edit trasaction note
router.put("/:id/note", protect, editTransactionNote) 

// Delete transaction
router.delete("/:id", protect, deleteTransaction)

export default router;
