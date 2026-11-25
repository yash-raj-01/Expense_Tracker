/**
 * Database Seed Script for Expense Tracker
 * Seeds realistic expense and income records into PostgreSQL.
 * Amount is stored as an integer in paise (1 INR = 100 paise).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const prisma = require('../prismaClient');

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Base dates for current and previous months
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getDate = (monthOffset, day) => {
    return new Date(currentYear, currentMonth + monthOffset, day, 12, 0, 0);
  };

  const seedData = [
    // --- Current Month Expenses ---
    // Food (Total: ₹4,200 = 420,000 paise)
    {
      title: 'Weekly Supermarket Grocery Restock',
      amount: 215000,
      category: 'Food',
      type: 'EXPENSE',
      date: getDate(0, 12),
    },
    {
      title: 'Weekend Dining Out & Cafe Visits',
      amount: 145000,
      category: 'Food',
      type: 'EXPENSE',
      date: getDate(0, 14),
    },
    {
      title: 'Daily Espresso & Snack Bar',
      amount: 60000,
      category: 'Food',
      type: 'EXPENSE',
      date: getDate(0, 15),
    },

    // Travel (Total: ₹1,800 = 180,000 paise)
    {
      title: 'Metro Smart Card Recharge',
      amount: 80000,
      category: 'Travel',
      type: 'EXPENSE',
      date: getDate(0, 3),
    },
    {
      title: 'City Cab Ride Share',
      amount: 65000,
      category: 'Travel',
      type: 'EXPENSE',
      date: getDate(0, 8),
    },
    {
      title: 'EV Charging Station Fee',
      amount: 35000,
      category: 'Travel',
      type: 'EXPENSE',
      date: getDate(0, 13),
    },

    // Bills (Total: ₹3,500 = 350,000 paise)
    {
      title: 'Residential Electricity Bill',
      amount: 195000,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(0, 5),
    },
    {
      title: 'High-Speed Fiber Broadband',
      amount: 110000,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(0, 7),
    },
    {
      title: 'Municipal Water Supply',
      amount: 45000,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(0, 10),
    },

    // Shopping (Total: ₹2,100 = 210,000 paise)
    {
      title: 'Winter Apparel & Thermal Wear',
      amount: 135000,
      category: 'Shopping',
      type: 'EXPENSE',
      date: getDate(0, 6),
    },
    {
      title: 'Desk Ergonomics & Accessories',
      amount: 75000,
      category: 'Shopping',
      type: 'EXPENSE',
      date: getDate(0, 11),
    },

    // Entertainment (Total: ₹1,500 = 150,000 paise)
    {
      title: 'Cinema IMAX Tickets (2x)',
      amount: 90000,
      category: 'Entertainment',
      type: 'EXPENSE',
      date: getDate(0, 9),
    },
    {
      title: 'OTT Streaming Subscription',
      amount: 40000,
      category: 'Entertainment',
      type: 'EXPENSE',
      date: getDate(0, 12),
    },
    {
      title: 'Online Indie Game Purchase',
      amount: 20000,
      category: 'Entertainment',
      type: 'EXPENSE',
      date: getDate(0, 14),
    },

    // Recurring Subscriptions ("Tower of Leaks")
    {
      title: 'Broadband Internet',
      amount: 79900,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(0, 1),
    },
    {
      title: 'Netflix Premium 4K',
      amount: 19900,
      category: 'Entertainment',
      type: 'EXPENSE',
      date: getDate(0, 2),
    },
    {
      title: 'Spotify Family Subscription',
      amount: 11900,
      category: 'Entertainment',
      type: 'EXPENSE',
      date: getDate(0, 2),
    },
    {
      title: 'AWS Cloud Hosting',
      amount: 45000,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(0, 4),
    },
    {
      title: 'Gym & Fitness Center',
      amount: 150000,
      category: 'Health',
      type: 'EXPENSE',
      date: getDate(0, 1),
    },
    {
      title: 'Hostel Mess Monthly Fee',
      amount: 350000,
      category: 'Food',
      type: 'EXPENSE',
      date: getDate(0, 1),
    },

    // --- Previous Month Expenses (for Monthly Trends) ---
    {
      title: 'Supermarket Groceries',
      amount: 230000,
      category: 'Food',
      type: 'EXPENSE',
      date: getDate(-1, 15),
    },
    {
      title: 'Intercity Train Ticket',
      amount: 120000,
      category: 'Travel',
      type: 'EXPENSE',
      date: getDate(-1, 20),
    },
    {
      title: 'Electricity Utility Bill',
      amount: 185000,
      category: 'Bills',
      type: 'EXPENSE',
      date: getDate(-1, 5),
    },
    {
      title: 'Electronics & Headphones',
      amount: 250000,
      category: 'Shopping',
      type: 'EXPENSE',
      date: getDate(-1, 10),
    },

    // --- Incomes ---
    {
      title: 'Primary Engineering Salary',
      amount: 8000000, // ₹80,000
      category: 'Salary',
      type: 'INCOME',
      date: getDate(0, 1),
    },
    {
      title: 'Freelance Technical Writing',
      amount: 2000000, // ₹20,000
      category: 'Freelance',
      type: 'INCOME',
      date: getDate(0, 16),
    },
    {
      title: 'Previous Month Salary',
      amount: 8000000, // ₹80,000
      category: 'Salary',
      type: 'INCOME',
      date: getDate(-1, 1),
    },
  ];

  console.log(`Inserting ${seedData.length} records...`);

  let count = 0;
  for (const item of seedData) {
    await prisma.expense.create({
      data: item,
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} transactions!`);

  // Print summary of seeded data
  const totalRecords = await prisma.expense.count();
  const expenses = await prisma.expense.findMany({ where: { type: 'EXPENSE' } });
  const incomes = await prisma.expense.findMany({ where: { type: 'INCOME' } });

  const totalExpensePaise = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomePaise = incomes.reduce((sum, e) => sum + e.amount, 0);

  console.log('\n📊 Database Summary:');
  console.log(`- Total Records: ${totalRecords}`);
  console.log(`- Total Expenses: ₹${(totalExpensePaise / 100).toLocaleString('en-IN')}`);
  console.log(`- Total Income: ₹${(totalIncomePaise / 100).toLocaleString('en-IN')}`);
  console.log(`- Net Savings: ₹${((totalIncomePaise - totalExpensePaise) / 100).toLocaleString('en-IN')}`);
}

seed()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
