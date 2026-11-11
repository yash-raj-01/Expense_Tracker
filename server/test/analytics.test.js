const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const prisma = require('../prismaClient');

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, body: data };
};

describe('Analytics & Expense APIs Test Suite', () => {
  before(async () => {
    // Start test server on random free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clean existing test data
    await prisma.expense.deleteMany({});
  });

  after(async () => {
    // Cleanup and close
    await prisma.expense.deleteMany({});
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  describe('Empty Database Handling', () => {
    test('GET /api/analytics/summary returns zeroed metrics on empty DB', async () => {
      const res = await request('/api/analytics/summary');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.totalExpenses, 0);
      assert.equal(res.body.data.totalExpensesRupees, 0);
      assert.equal(res.body.data.monthlyExpenses, 0);
      assert.equal(res.body.data.monthlyExpensesRupees, 0);
      assert.equal(res.body.data.averageMonthlySpending, 0);
      assert.equal(res.body.data.totalTransactions, 0);
      assert.equal(res.body.data.highestSpendingCategory, null);
    });

    test('GET /api/analytics/categories returns empty list on empty DB', async () => {
      const res = await request('/api/analytics/categories');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 0);
      assert.deepEqual(res.body.data, []);
    });

    test('GET /api/analytics/monthly returns empty amounts in buckets on empty DB', async () => {
      const res = await request('/api/analytics/monthly?months=6');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 6);
      assert.equal(res.body.summary.totalPeriodSpending, 0);
      assert.equal(res.body.summary.averageMonthly, 0);
    });

    test('GET /api/analytics/reports returns null highestExpense on empty DB', async () => {
      const res = await request('/api/analytics/reports');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.totalExpenses, 0);
      assert.equal(res.body.data.transactionCount, 0);
      assert.equal(res.body.data.highestExpense, null);
      assert.deepEqual(res.body.data.recentTransactions, []);
    });
  });

  describe('Validation & Error Handling', () => {
    test('Rejects invalid startDate format', async () => {
      const res = await request('/api/analytics/summary?startDate=not-a-date');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid startdate/i);
    });

    test('Rejects invalid endDate format', async () => {
      const res = await request('/api/analytics/categories?endDate=invalid-date');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid enddate/i);
    });

    test('Rejects startDate later than endDate', async () => {
      const res = await request('/api/analytics/reports?startDate=2026-12-01&endDate=2026-01-01');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /startdate cannot be after enddate/i);
    });

    test('Rejects invalid year in monthly analytics', async () => {
      const res = await request('/api/analytics/monthly?year=abc');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid year/i);
    });

    test('Rejects negative or invalid limit', async () => {
      const res = await request('/api/analytics/categories?limit=-5');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid limit/i);
    });
  });

  describe('Calculations with Seeded Database Records', () => {
    let createdIds = [];

    before(async () => {
      const today = new Date();
      const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 10);
      const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 15);

      const items = [
        { title: 'Office Supplies', amount: 5000, category: 'Business', type: 'EXPENSE', date: currentMonthDate },
        { title: 'Dinner with Client', amount: 15000, category: 'Food & Dining', type: 'EXPENSE', date: currentMonthDate },
        { title: 'Groceries', amount: 10000, category: 'Food & Dining', type: 'EXPENSE', date: currentMonthDate },
        { title: 'Flight Ticket', amount: 30000, category: 'Travel', type: 'EXPENSE', date: prevMonthDate },
        { title: 'Consulting Fee', amount: 100000, category: 'Salary', type: 'INCOME', date: currentMonthDate },
      ];

      for (const item of items) {
        const record = await prisma.expense.create({ data: item });
        createdIds.push(record.id);
      }
    });

    test('GET /api/analytics/summary correctly calculates total, monthly, and highest category', async () => {
      const res = await request('/api/analytics/summary');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Expenses total: 5000 + 15000 + 10000 + 30000 = 60000 paise (Rs. 600.00)
      assert.equal(res.body.data.totalExpenses, 60000);
      assert.equal(res.body.data.totalExpensesRupees, 600.00);

      // Current month expenses: 5000 + 15000 + 10000 = 30000 paise (Rs. 300.00)
      assert.equal(res.body.data.monthlyExpenses, 30000);
      assert.equal(res.body.data.monthlyExpensesRupees, 300.00);

      // Highest spending category should be Travel (30000 paise)
      assert.ok(res.body.data.highestSpendingCategory);
      assert.equal(res.body.data.highestSpendingCategory.category, 'Travel');
      assert.equal(res.body.data.highestSpendingCategory.amount, 30000);
      assert.equal(res.body.data.highestSpendingCategory.amountRupees, 300.00);
      assert.equal(res.body.data.highestSpendingCategory.percentage, 50.0);

      // Total expense transactions: 4 (INCOME excluded from expense count)
      assert.equal(res.body.data.totalTransactions, 4);

      // Total income: 100000 paise (Rs. 1000.00)
      assert.equal(res.body.data.totalIncome, 100000);
      assert.equal(res.body.data.totalIncomeRupees, 1000.00);
    });

    test('GET /api/analytics/categories returns categories ordered descending with percentage', async () => {
      const res = await request('/api/analytics/categories');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 3); // Travel, Food & Dining, Business

      const [c1, c2, c3] = res.body.data;
      assert.equal(c1.category, 'Travel');
      assert.equal(c1.amount, 30000);
      assert.equal(c1.amountRupees, 300.00);
      assert.equal(c1.percentage, 50.0);

      assert.equal(c2.category, 'Food & Dining');
      assert.equal(c2.amount, 25000);
      assert.equal(c2.amountRupees, 250.00);
      assert.equal(c2.count, 2);
      assert.equal(c2.percentage, 41.7);

      assert.equal(c3.category, 'Business');
      assert.equal(c3.amount, 5000);
      assert.equal(c3.amountRupees, 50.00);
    });

    test('GET /api/analytics/monthly returns aggregated spending by month', async () => {
      const res = await request('/api/analytics/monthly?months=6');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 6);

      const currentMonthBucket = res.body.data[res.body.data.length - 1];
      assert.equal(currentMonthBucket.amount, 30000);
      assert.equal(currentMonthBucket.count, 3);

      const prevMonthBucket = res.body.data[res.body.data.length - 2];
      assert.equal(prevMonthBucket.amount, 30000);
      assert.equal(prevMonthBucket.count, 1);

      assert.equal(res.body.summary.totalPeriodSpending, 60000);
      assert.equal(res.body.summary.totalPeriodSpendingRupees, 600.00);
    });

    test('GET /api/analytics/reports returns comprehensive report with highest expense', async () => {
      const res = await request('/api/analytics/reports');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      assert.equal(res.body.data.totalExpenses, 60000);
      assert.equal(res.body.data.transactionCount, 4);

      // Highest single expense
      assert.ok(res.body.data.highestExpense);
      assert.equal(res.body.data.highestExpense.title, 'Flight Ticket');
      assert.equal(res.body.data.highestExpense.amount, 30000);

      // Recent transactions
      assert.equal(res.body.data.recentTransactions.length, 4);

      // Category breakdown
      assert.equal(res.body.data.categorySummary.length, 3);
    });
  });

  describe('Existing CRUD Features Preservation', () => {
    let testExpenseId;

    test('POST /api/expenses creates a new expense successfully', async () => {
      const res = await request('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Team Coffee',
          amount: 4500,
          category: 'Food & Dining',
          type: 'EXPENSE',
        }),
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Team Coffee');
      assert.equal(res.body.data.amount, 4500);
      testExpenseId = res.body.data.id;
    });

    test('PATCH /api/expenses/:id updates an expense successfully', async () => {
      const res = await request(`/api/expenses/${testExpenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Specialty Team Coffee',
          amount: 5500,
        }),
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Specialty Team Coffee');
      assert.equal(res.body.data.amount, 5500);
    });

    test('DELETE /api/expenses/:id deletes an expense successfully', async () => {
      const res = await request(`/api/expenses/${testExpenseId}`, {
        method: 'DELETE',
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, testExpenseId);
    });
  });
});
