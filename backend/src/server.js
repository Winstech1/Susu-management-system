require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
const savingsRoutes = require("./routes/savings");
const withdrawalRoutes = require("./routes/withdrawals");
const groupRoutes = require("./routes/groups");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/reports");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "5mb" })); // larger limit needed for JSON backup restore

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Routes matching each wireframe module
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Susu backend running on port ${PORT}`));
