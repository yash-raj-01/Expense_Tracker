-- =====================================================================
-- Ledger Expense Tracker — 10 Project-Specific Database Queries
-- Database Management System: PostgreSQL
-- Description: Core queries powering Ledger's API endpoints & analytics
-- =====================================================================

-- ---------------------------------------------------------------------
-- QUERY 1: Paginated & Chronologically Ordered Transaction Feed
-- Feature: Powers GET /api/expenses?limit=10&offset=0
-- Explanation: Fetches transactions ordered by date descending with a secondary
--              sort on ID to ensure deterministic pagination across identical dates.
-- ---------------------------------------------------------------------
SELECT id, title, amount, type, category, date 
FROM expenses 
ORDER BY date DESC, id DESC 
LIMIT 10 OFFSET 0;

-- ---------------------------------------------------------------------
-- QUERY 2: Category Breakdown and Aggregated Spending
-- Feature: Powers GET /api/analytics/categories & Dashboard Donut Chart
-- Explanation: Groups expense transactions by category, aggregates total
--              amount in paise, and counts transactions per category.
-- ---------------------------------------------------------------------
SELECT 
    category, 
    SUM(amount)::INTEGER AS total_paise, 
    COUNT(*)::INTEGER AS transaction_count 
FROM expenses 
WHERE type = 'EXPENSE' 
GROUP BY category 
ORDER BY total_paise DESC;

-- ---------------------------------------------------------------------
-- QUERY 3: Monthly Aggregation & Spending Trends
-- Feature: Powers GET /api/analytics/monthly & Monthly Spending Bar Chart
-- Explanation: Formats the date column into year-month buckets ('YYYY-MM'),
--              aggregating total monthly expenses for trend analysis.
-- ---------------------------------------------------------------------
SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month_key, 
    SUM(amount)::INTEGER AS total_expense_paise, 
    COUNT(*)::INTEGER AS transaction_count 
FROM expenses 
WHERE type = 'EXPENSE' 
GROUP BY TO_CHAR(date, 'YYYY-MM') 
ORDER BY month_key DESC;

-- ---------------------------------------------------------------------
-- QUERY 4: Overall Financial Health (Income vs Expense & Net Savings)
-- Feature: Powers GET /api/analytics/summary Top Cards
-- Explanation: Performs conditional summation to compute total income,
--              total expenses, and net savings in a single database pass.
-- ---------------------------------------------------------------------
SELECT 
    COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0)::INTEGER AS total_income_paise,
    COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)::INTEGER AS total_expense_paise,
    (COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0))::INTEGER AS net_savings_paise
FROM expenses;

-- ---------------------------------------------------------------------
-- QUERY 5: Case-Insensitive Substring Search
-- Feature: Powers Search Bar in Transactions View
-- Explanation: Filters records matching the search query across either title
--              or category using ILIKE for case-insensitive matching.
-- ---------------------------------------------------------------------
SELECT id, title, amount, type, category, date 
FROM expenses 
WHERE title ILIKE '%ch%' OR category ILIKE '%ch%'
ORDER BY date DESC;

-- ---------------------------------------------------------------------
-- QUERY 6: Date Range Filtered Query
-- Feature: Powers Custom Date Filter & Financial Reports
-- Explanation: Selects records within a bounded date range [startDate, endDate],
--              leveraging the B-Tree index on the date column.
-- ---------------------------------------------------------------------
SELECT id, title, amount, type, category, date 
FROM expenses 
WHERE date >= '2026-11-01' AND date <= '2026-11-30 23:59:59.999'
ORDER BY date DESC;

-- ---------------------------------------------------------------------
-- QUERY 7: Distinct Active Categories
-- Feature: Powers Category Filter Dropdown in ExpenseForm & Filters
-- Explanation: Returns unique, alphabetically sorted category names present
--              in the ledger to populate frontend filter dropdowns dynamically.
-- ---------------------------------------------------------------------
SELECT DISTINCT category 
FROM expenses 
ORDER BY category ASC;

-- ---------------------------------------------------------------------
-- QUERY 8: Single Highest Expense Identification
-- Feature: Powers "Largest Expense" Insight Card in Reports
-- Explanation: Retrieves the single highest expenditure using an ORDER BY
--              amount descending with a LIMIT 1 clause.
-- ---------------------------------------------------------------------
SELECT id, title, amount, category, date 
FROM expenses 
WHERE type = 'EXPENSE' 
ORDER BY amount DESC 
LIMIT 1;

-- ---------------------------------------------------------------------
-- QUERY 9: Record Retrieval & Existence Verification by Primary Key
-- Feature: Powers PATCH /api/expenses/:id & DELETE /api/expenses/:id
-- Explanation: Performs an O(log N) index scan on the primary key to verify
--              record existence before executing mutation operations.
-- ---------------------------------------------------------------------
SELECT id, title, amount, type, category, date, "updatedAt"
FROM expenses 
WHERE id = 23;

-- ---------------------------------------------------------------------
-- QUERY 10: Statistical Expense Averages (Paise & Rupee Conversion)
-- Feature: Powers Analytics Summary Average Transaction Metrics
-- Explanation: Computes count, average in paise, and converts to fractional
--              rupees with numeric rounding.
-- ---------------------------------------------------------------------
SELECT 
    COUNT(*)::INTEGER AS total_expense_count,
    ROUND(AVG(amount))::INTEGER AS average_expense_paise,
    ROUND((AVG(amount) / 100.0)::NUMERIC, 2)::FLOAT AS average_expense_rupees
FROM expenses 
WHERE type = 'EXPENSE';
