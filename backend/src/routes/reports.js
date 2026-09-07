const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/reports/savings?from=&to=  (3.10 REPORTS > Savings Report)
router.get("/savings", async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let where = "WHERE 1=1";
  if (from) { params.push(from); where += ` AND s.txn_date >= $${params.length}`; }
  if (to) { params.push(to); where += ` AND s.txn_date <= $${params.length}`; }

  const result = await pool.query(
    `SELECT s.txn_date, m.full_name AS member, s.amount, s.payment_method, s.note
     FROM savings s JOIN members m ON m.id = s.member_id
     ${where} ORDER BY s.txn_date DESC`,
    params
  );
  const total = result.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  res.json({ rows: result.rows, total });
});

// GET /api/reports/withdrawals?from=&to=  (Withdrawals Report)
router.get("/withdrawals", async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  let where = "WHERE 1=1";
  if (from) { params.push(from); where += ` AND w.txn_date >= $${params.length}`; }
  if (to) { params.push(to); where += ` AND w.txn_date <= $${params.length}`; }

  const result = await pool.query(
    `SELECT w.txn_date, m.full_name AS member, w.amount, w.reason, w.payment_method
     FROM withdrawals w JOIN members m ON m.id = w.member_id
     ${where} ORDER BY w.txn_date DESC`,
    params
  );
  const total = result.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  res.json({ rows: result.rows, total });
});

// GET /api/reports/member-statement/:memberId?from=&to=  (3.11 MEMBER STATEMENT)
router.get("/member-statement/:memberId", async (req, res) => {
  const { memberId } = req.params;
  const { from, to } = req.query;

  const dateFilter = (col) => {
    const parts = [];
    if (from) parts.push(`${col} >= '${from}'`);
    if (to) parts.push(`${col} <= '${to}'`);
    return parts.length ? "AND " + parts.join(" AND ") : "";
  };

  const savingsTotal = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM savings WHERE member_id = $1 ${dateFilter("txn_date")}`,
    [memberId]
  );
  const withdrawalsTotal = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM withdrawals WHERE member_id = $1 ${dateFilter("txn_date")}`,
    [memberId]
  );
  const member = await pool.query("SELECT * FROM members WHERE id = $1", [memberId]);

  const totalSavings = parseFloat(savingsTotal.rows[0].total);
  const totalWithdrawals = parseFloat(withdrawalsTotal.rows[0].total);

  res.json({
    member: member.rows[0],
    totalSavings,
    totalWithdrawals,
    currentBalance: totalSavings - totalWithdrawals,
  });
});

// GET /api/reports/daily-cashbook?date=YYYY-MM-DD  (Daily Cashbook)
router.get("/daily-cashbook", async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const savings = await pool.query(
    `SELECT m.full_name AS member, s.amount FROM savings s
     JOIN members m ON m.id = s.member_id WHERE s.txn_date = $1`,
    [targetDate]
  );
  const withdrawals = await pool.query(
    `SELECT m.full_name AS member, w.amount FROM withdrawals w
     JOIN members m ON m.id = w.member_id WHERE w.txn_date = $1`,
    [targetDate]
  );

  const totalIn = savings.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalOut = withdrawals.rows.reduce((s, r) => s + parseFloat(r.amount), 0);

  res.json({
    date: targetDate,
    savings: savings.rows,
    withdrawals: withdrawals.rows,
    totalIn,
    totalOut,
    netCashflow: totalIn - totalOut,
  });
});

module.exports = router;
