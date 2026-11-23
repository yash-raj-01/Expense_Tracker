-- =====================================================================
-- Ledger Expense Tracker — Database Schema DDL
-- Database Management System: PostgreSQL
-- Database Engine Version: PostgreSQL 14+ / Neon Serverless PostgreSQL
-- =====================================================================

-- 1. Main Transaction Entity Table
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EXPENSE',
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "expenses_amount_positive" CHECK ("amount" > 0),
    CONSTRAINT "expenses_type_check" CHECK ("type" IN ('EXPENSE', 'INCOME'))
);

-- 2. Indexes for Query Optimization
-- Primary key unique B-Tree index (generated automatically by PostgreSQL)
-- CREATE UNIQUE INDEX "expenses_pkey" ON "expenses" USING btree ("id");

-- Supporting index for date-range analytics and filtering
CREATE INDEX IF NOT EXISTS "idx_expenses_date_type" ON "expenses" USING btree ("date" DESC, "type");

-- Supporting index for category breakdown queries
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "expenses" USING btree ("category");

-- =====================================================================
-- Relational Multi-Tenant Model (Extended Design)
-- =====================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories Lookup Table (Normalized Design)
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(60) UNIQUE NOT NULL,
    "icon" VARCHAR(50) DEFAULT 'receipt'
);

-- Tags Table (for M:N Tagging)
CREATE TABLE IF NOT EXISTS "tags" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE NOT NULL
);

-- Associative Junction Table Resolving M:N Relationship (Expenses <-> Tags)
CREATE TABLE IF NOT EXISTS "expense_tags" (
    "expense_id" INTEGER NOT NULL REFERENCES "expenses"("id") ON DELETE CASCADE,
    "tag_id" INTEGER NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    PRIMARY KEY ("expense_id", "tag_id")
);
