const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/members?search=&group=&page=&limit=  (3.3 MEMBERS LIST)
router.get("/", async (req, res) => {
  try {
    const { search = "", group = "", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const params = [];
    let where = "WHERE 1=1";

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (m.full_name ILIKE $${params.length} OR m.phone_number ILIKE $${params.length})`;
    }
    if (group) {
      params.push(group);
      where += ` AND m.group_id = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM members m ${where}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await pool.query(
      `SELECT m.id, m.member_code, m.full_name, m.phone_number, m.address, m.date_joined,
              g.name AS group_name, g.id AS group_id
       FROM members m
       LEFT JOIN groups g ON g.id = m.group_id
       ${where}
       ORDER BY m.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      members: dataResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});

// GET /api/members/:id  (3.4 view / member details)
router.get("/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT m.*, g.name AS group_name FROM members m
     LEFT JOIN groups g ON g.id = m.group_id WHERE m.id = $1`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Member not found" });
  res.json(result.rows[0]);
});

// POST /api/members  (3.4 ADD MEMBER)
router.post("/", async (req, res) => {
  try {
    const { fullName, phoneNumber, address, groupId, dateJoined } = req.body;
    if (!fullName || !phoneNumber) {
      return res.status(400).json({ message: "Full name and phone number are required" });
    }

    // Auto-generate member code like 001, 002, ...
    const countResult = await pool.query("SELECT COUNT(*) FROM members");
    const nextCode = String(parseInt(countResult.rows[0].count, 10) + 1).padStart(3, "0");

    const result = await pool.query(
      `INSERT INTO members (member_code, full_name, phone_number, address, group_id, date_joined)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE)) RETURNING *`,
      [nextCode, fullName, phoneNumber, address || null, groupId || null, dateJoined || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
});

// PUT /api/members/:id  (Edit Member)
router.put("/:id", async (req, res) => {
  try {
    const { fullName, phoneNumber, address, groupId, dateJoined } = req.body;
    const result = await pool.query(
      `UPDATE members SET full_name=$1, phone_number=$2, address=$3, group_id=$4,
       date_joined=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
      [fullName, phoneNumber, address, groupId || null, dateJoined, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Member not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update member" });
  }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM members WHERE id = $1", [req.params.id]);
  res.json({ message: "Member deleted" });
});

module.exports = router;
