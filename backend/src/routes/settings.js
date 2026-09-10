const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/settings/backup  (3.12 SETTINGS > Backup)
// Exports all data as JSON the admin can save/download
router.get("/backup", async (req, res) => {
  try {
    const members = await pool.query("SELECT * FROM members");
    const groups = await pool.query("SELECT * FROM groups");
    const savings = await pool.query("SELECT * FROM savings");
    const withdrawals = await pool.query("SELECT * FROM withdrawals");

    res.json({
      exportedAt: new Date().toISOString(),
      members: members.rows,
      groups: groups.rows,
      savings: savings.rows,
      withdrawals: withdrawals.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Backup failed" });
  }
});

// POST /api/settings/restore  (3.12 SETTINGS > Restore)
// Accepts a JSON backup file body and restores it (wipes and reloads)
router.post("/restore", async (req, res) => {
  const client = await pool.connect();
  try {
    const { members = [], groups = [], savings = [], withdrawals = [] } = req.body;

    await client.query("BEGIN");
    await client.query("DELETE FROM withdrawals");
    await client.query("DELETE FROM savings");
    await client.query("DELETE FROM members");
    await client.query("DELETE FROM groups");

    for (const g of groups) {
      await client.query(
        "INSERT INTO groups (id, name, description) VALUES ($1,$2,$3)",
        [g.id, g.name, g.description]
      );
    }
    for (const m of members) {
      await client.query(
        `INSERT INTO members (id, member_code, full_name, phone_number, address, group_id, date_joined, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [m.id, m.member_code, m.full_name, m.phone_number, m.address, m.group_id, m.date_joined, m.status]
      );
    }
    for (const s of savings) {
      await client.query(
        `INSERT INTO savings (id, member_id, amount, payment_method, note, txn_date)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [s.id, s.member_id, s.amount, s.payment_method, s.note, s.txn_date]
      );
    }
    for (const w of withdrawals) {
      await client.query(
        `INSERT INTO withdrawals (id, member_id, amount, reason, payment_method, txn_date)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [w.id, w.member_id, w.amount, w.reason, w.payment_method, w.txn_date]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Data restored successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Restore failed", error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
