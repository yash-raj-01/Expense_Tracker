-- Persist whether each transaction is an expense or income.
ALTER TABLE "expenses"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'EXPENSE';
