const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard  (3.2 DASHBOARD)
router.get("/", async (req, res) => {
  try {
    const totalMembers = await pool.query("SELECT COUNT(*) FROM members");
    const totalSavings = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM savings");
    const totalWithdrawals = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM withdrawals"
    );

    const currentBalance =
      parseFloat(totalSavings.rows[0].total) - parseFloat(totalWithdrawals.rows[0].total);

    // Recent transactions: union of last savings + withdrawals, most recent first
    const recent = await pool.query(`
      SELECT * FROM (
        SELECT s.txn_date AS date, 'Savings' AS description, m.full_name AS member,
               s.amount, 'Credit' AS type
        FROM savings s JOIN members m ON m.id = s.member_id
        UNION ALL
        SELECT w.txn_date AS date, 'Withdrawal' AS description, m.full_name AS member,
               w.amount, 'Debit' AS type
        FROM withdrawals w JOIN members m ON m.id = w.member_id
      ) t
      ORDER BY date DESC
      LIMIT 10
    `);

    res.json({
      totalMembers: parseInt(totalMembers.rows[0].count, 10),
      totalSavings: parseFloat(totalSavings.rows[0].total),
      totalWithdrawals: parseFloat(totalWithdrawals.rows[0].total),
      currentBalance,
      recentTransactions: recent.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

module.exports = router;
