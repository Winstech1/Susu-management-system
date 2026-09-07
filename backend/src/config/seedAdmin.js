// Run with: npm run seed:admin
// Creates the ONE admin account for the system (as per design: single admin access)

const bcrypt = require("bcryptjs");
const readline = require("readline");
const pool = require("./db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    const existing = await pool.query("SELECT id FROM users LIMIT 1");
    if (existing.rows.length > 0) {
      console.log("An admin account already exists. Delete it first if you want to reset.");
      process.exit(0);
    }

    const fullName = await ask("Admin full name: ");
    const username = await ask("Admin username: ");
    const email = await ask("Admin email (optional): ");
    const password = await ask("Admin password: ");

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash) VALUES ($1, $2, $3, $4)`,
      [fullName, username, email || null, hash]
    );

    console.log("✅ Admin account created successfully. You can now log in.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
})();
