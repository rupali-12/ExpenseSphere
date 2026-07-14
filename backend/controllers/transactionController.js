import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// @desc Add new transaction (deposit or withdrawal)
// @route POST /api/transactions/add-transaction
// @access Private
export const addTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, amount, note } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: "Type and amount are required" });
    }

    // Find user and their current balance
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const beforeBalance = user.currentBalance;
    let afterBalance = beforeBalance;

    if (type === "deposit") {
      afterBalance = beforeBalance + amount;
    } else if (type === "withdrawal") {
      if (amount > beforeBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      afterBalance = beforeBalance - amount;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      note,
      beforeBalance,
      afterBalance,
    });

    // Update user's current balance
    user.currentBalance = afterBalance;
    await user.save();

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
      currentBalance: user.currentBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding transaction" });
  }
};

// @desc Get all transactions with pagination. filters, search
// @route GET /api/transactions/get-transactions
// @access Private
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, startDate, endDate, search } = req.query;

    const query = { user: userId };

    // Filter by type
    if (type) query.type = type;

    // Date range filter
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full day
      query.date = { $gte: new Date(startDate), $lte: end };
    }

    // Search by keyword in note
    if (search) {
      query.note = { $regex: search, $options: "i" };
    }

    // Pagination setup
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Fetch filtered transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Aggregate summary for visible range (total deposits/withdrawals)
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [{ $eq: ["$type", "deposit"] }, "$amount", 0],
            },
          },
          totalWithdrawals: {
            $sum: {
              $cond: [{ $eq: ["$type", "withdrawal"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    const totals = summary[0] || { totalDeposits: 0, totalWithdrawals: 0 };
    const netChange = totals.totalDeposits - totals.totalWithdrawals;

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      totalDeposits: totals.totalDeposits,
      totalWithdrawals: totals.totalWithdrawals,
      netChange,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc  Edit transaction note
// @route PUT /api/transactions/:id/note
// @access Private
export const editTransactionNote = async (req, res) => {
  try {
    const { note } = req.body
    const userId = req.user._id

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId, // ensure user owns this transaction
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    transaction.note = note?.trim() || ""
    await transaction.save()

    res.json({
      message: "Note updated successfully",
      transaction,
    })
  } catch (error) {
    console.error("Edit note error:", error)
    res.status(500).json({ message: "Error updating note" })
  }
}

// @desc  Delete transaction and reverse balance
// @route DELETE /api/transactions/:id
// @access Private
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId,
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Reverse the balance impact
    if (transaction.type === "deposit") {
      user.currentBalance -= transaction.amount
    } else if (transaction.type === "withdrawal") {
      user.currentBalance += transaction.amount
    }

    // Ensure balance never goes negative
    if (user.currentBalance < 0) user.currentBalance = 0

    await user.save()
    await transaction.deleteOne()

    res.json({
      message: "Transaction deleted successfully",
      currentBalance: user.currentBalance,
    })
  } catch (error) {
    console.error("Delete transaction error:", error)
    res.status(500).json({ message: "Error deleting transaction" })
  }
}