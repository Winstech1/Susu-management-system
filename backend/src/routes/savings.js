const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// POST /api/savings  (3.5 RECORD SAVINGS)
router.post("/", async (req, res) => {
  try {
    const { memberId, amount, paymentMethod, note, txnDate } = req.body;
    if (!memberId || !amount) {
      return res.status(400).json({ message: "Member and amount are required" });
    }

    const result = await pool.query(
      `INSERT INTO savings (member_id, amount, payment_method, note, txn_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) RETURNING *`,
      [memberId, amount, paymentMethod || "Cash", note || null, txnDate || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record savings" });
  }
});

// GET /api/savings/member/:memberId  (3.6 SAVINGS HISTORY - MEMBER)
router.get("/member/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;

    const history = await pool.query(
      `SELECT id, amount, payment_method, note, txn_date,
              SUM(amount) OVER (ORDER BY txn_date, id) AS running_balance
       FROM savings WHERE member_id = $1 ORDER BY txn_date DESC, id DESC`,
      [memberId]
    );

    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM savings WHERE member_id = $1",
      [memberId]
    );

    res.json({ history: history.rows, totalSavings: totalResult.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch savings history" });
  }
});

// GET /api/savings/summary?period=daily|monthly  (Daily/Monthly Summary)
router.get("/summary", async (req, res) => {
  const { period = "daily" } = req.query;
  const groupExpr = period === "monthly" ? "TO_CHAR(txn_date, 'YYYY-MM')" : "txn_date::text";

  const result = await pool.query(
    `SELECT ${groupExpr} AS period, SUM(amount) AS total, COUNT(*) AS transactions
     FROM savings GROUP BY ${groupExpr} ORDER BY period DESC LIMIT 30`
  );

  res.json(result.rows);
});

module.exports = router;
