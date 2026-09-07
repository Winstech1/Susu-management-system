const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/groups  (3.9 GROUPS list with member counts)
router.get("/", async (req, res) => {
  const result = await pool.query(
    `SELECT g.id, g.name, g.description,
            COUNT(m.id) AS member_count
     FROM groups g
     LEFT JOIN members m ON m.group_id = g.id
     GROUP BY g.id ORDER BY g.name`
  );
  res.json(result.rows);
});

// GET /api/groups/:id  (Group details - members in the group)
router.get("/:id", async (req, res) => {
  const group = await pool.query("SELECT * FROM groups WHERE id = $1", [req.params.id]);
  if (!group.rows[0]) return res.status(404).json({ message: "Group not found" });

  const members = await pool.query(
    "SELECT id, member_code, full_name, phone_number, date_joined FROM members WHERE group_id = $1",
    [req.params.id]
  );

  res.json({ ...group.rows[0], members: members.rows });
});

// POST /api/groups  (+ Add Group)
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const result = await pool.query(
      "INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *",
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "A group with this name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

// PUT /api/groups/:id
router.put("/:id", async (req, res) => {
  const { name, description } = req.body;
  const result = await pool.query(
    "UPDATE groups SET name=$1, description=$2 WHERE id=$3 RETURNING *",
    [name, description, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Group not found" });
  res.json(result.rows[0]);
});

// DELETE /api/groups/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM groups WHERE id = $1", [req.params.id]);
  res.json({ message: "Group deleted" });
});

module.exports = router;
