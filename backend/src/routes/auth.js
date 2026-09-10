const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, full_name, username, email, role, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, async (req, res) => {
  const { fullName, email } = req.body;
  const result = await pool.query(
    "UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, full_name, username, email, role",
    [fullName, email, req.user.id]
  );
  res.json(result.rows[0]);
});

// PUT /api/auth/change-password
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    const user = result.rows[0];

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
      newHash,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ===== USER MANAGEMENT (admin only) =====

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, full_name, username, email, role, created_at FROM users ORDER BY id"
  );
  res.json(result.rows);
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;
    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Full name, username, and password are required" });
    }
    if (!["admin", "agent"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin' or 'agent'" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, username, email, role`,
      [fullName, username, email || null, hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "That username is already taken" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  if (parseInt(req.params.id, 10) === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }
  await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
  res.json({ message: "User deleted" });
});

module.exports = router;