-- ============================================
-- SUSU MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Single-admin desktop/web system
-- ============================================

-- Admin user (only ONE admin account, as per wireframe: "Only one admin user has access")
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Groups (Group A, Group B, Group C ...)
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_code VARCHAR(20) UNIQUE, -- e.g. 001, 002 shown in wireframe
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  address TEXT,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active', -- active / inactive
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Savings records
CREATE TABLE IF NOT EXISTS savings (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'Cash', -- Cash, Momo, Bank
  note TEXT,
  txn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal records
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  reason VARCHAR(255),
  payment_method VARCHAR(30) DEFAULT 'Cash',
  txn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_savings_member ON savings(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_date ON savings(txn_date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_member ON withdrawals(member_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(txn_date);

-- View: member balance = total savings - total withdrawals
CREATE OR REPLACE VIEW member_balances AS
SELECT
  m.id AS member_id,
  m.full_name,
  COALESCE(s.total_savings, 0) AS total_savings,
  COALESCE(w.total_withdrawals, 0) AS total_withdrawals,
  COALESCE(s.total_savings, 0) - COALESCE(w.total_withdrawals, 0) AS current_balance
FROM members m
LEFT JOIN (
  SELECT member_id, SUM(amount) AS total_savings FROM savings GROUP BY member_id
) s ON s.member_id = m.id
LEFT JOIN (
  SELECT member_id, SUM(amount) AS total_withdrawals FROM withdrawals GROUP BY member_id
) w ON w.member_id = m.id;
