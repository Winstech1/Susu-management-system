const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// POST /api/withdrawals  (3.7 RECORD WITHDRAWAL)
router.post("/", async (req, res) => {
  try {
    const { memberId, amount, reason, paymentMethod, txnDate } = req.body;
    if (!memberId || !amount) {
      return res.status(400).json({ message: "Member and amount are required" });
    }

    // Optional but recommended: prevent withdrawing more than current balance
    const balanceResult = await pool.query(
      "SELECT current_balance FROM member_balances WHERE member_id = $1",
      [memberId]
    );
    const currentBalance = balanceResult.rows[0]?.current_balance || 0;
    if (parseFloat(amount) > parseFloat(currentBalance)) {
      return res.status(400).json({
        message: `Insufficient balance. Member's current balance is GHC ${currentBalance}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO withdrawals (member_id, amount, reason, payment_method, txn_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) RETURNING *`,
      [memberId, amount, reason || null, paymentMethod || "Cash", txnDate || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record withdrawal" });
  }
});

// GET /api/withdrawals/member/:memberId  (3.8 WITHDRAWAL HISTORY - MEMBER)
router.get("/member/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;

    const history = await pool.query(
      `SELECT id, amount, reason, payment_method, txn_date
       FROM withdrawals WHERE member_id = $1 ORDER BY txn_date DESC, id DESC`,
      [memberId]
    );

    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM withdrawals WHERE member_id = $1",
      [memberId]
    );

    res.json({ history: history.rows, totalWithdrawn: totalResult.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch withdrawal history" });
  }
});

module.exports = router;
