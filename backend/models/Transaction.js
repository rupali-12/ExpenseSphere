import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter transaction amount"],
      min: [1, "Amount must be at least 1"],
    },
    note: {
      type: String,
      trim: true,
    },
    beforeBalance: {
      type: Number,
      required: true,
    },
    afterBalance: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now, 
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
