-- Expense amounts are accepted by the API as whole paise values.
ALTER TABLE "expenses"
ALTER COLUMN "amount" TYPE INTEGER
USING ROUND("amount")::INTEGER;
