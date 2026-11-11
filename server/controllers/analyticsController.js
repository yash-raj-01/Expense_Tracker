const prisma = require('../prismaClient');

const toRupees = (paise) => {
  return Number(((paise || 0) / 100).toFixed(2));
};

const parseDateFilters = (query) => {
  const { startDate, endDate, timeRange } = query;
  let dateFilter = {};

  if (timeRange) {
    const now = new Date();
    switch (timeRange) {
      case 'this-month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateFilter = { gte: start, lte: end };
        break;
      }
      case 'last-month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateFilter = { gte: start, lte: end };
        break;
      }
      case '30-days': {
        const start = new Date();
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        dateFilter = { gte: start, lte: now };
        break;
      }
      case '90-days': {
        const start = new Date();
        start.setDate(now.getDate() - 90);
        start.setHours(0, 0, 0, 0);
        dateFilter = { gte: start, lte: now };
        break;
      }
      case 'this-year': {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: start, lte: end };
        break;
      }
      case 'all':
        // no date filtering
        break;
      default:
        throw new Error(`Invalid timeRange parameter. Allowed values: all, this-month, last-month, 30-days, 90-days, this-year`);
    }
  }

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) {
      throw new Error('Invalid startDate format. Expected a valid date string (e.g. YYYY-MM-DD)');
    }
    dateFilter.gte = parsedStart;
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedEnd.getTime())) {
      throw new Error('Invalid endDate format. Expected a valid date string (e.g. YYYY-MM-DD)');
    }
    parsedEnd.setHours(23, 59, 59, 999);
    dateFilter.lte = parsedEnd;
  }

  if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
    throw new Error('startDate cannot be after endDate');
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

const getAnalyticsSummary = async (req, res) => {
  try {
    let dateFilter;
    try {
      dateFilter = parseDateFilters(req.query);
    } catch (validationErr) {
      return res.status(400).json({
        success: false,
        message: validationErr.message,
      });
    }

    const whereClause = {
      type: 'EXPENSE',
      ...(dateFilter ? { date: dateFilter } : {}),
    };

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        type: 'EXPENSE',
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const monthlyExpenses = currentMonthExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalTransactions = expenses.length;

    // Category aggregation to find highest spending category
    const categoryTotals = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    }

    let highestSpendingCategory = null;
    let maxCategoryAmount = 0;
    for (const [catName, amount] of Object.entries(categoryTotals)) {
      if (amount > maxCategoryAmount) {
        maxCategoryAmount = amount;
        highestSpendingCategory = {
          category: catName,
          amount: amount,
          amountRupees: toRupees(amount),
          percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        };
      }
    }

    // Average monthly spending calculation
    let averageMonthlySpending = 0;
    if (expenses.length > 0) {
      const distinctMonths = new Set(
        expenses.map((e) => {
          const d = new Date(e.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        })
      );
      const monthCount = Math.max(1, distinctMonths.size);
      averageMonthlySpending = Math.round(totalExpenses / monthCount);
    }

    // Check income transactions count & total if any exist in the database
    const incomeRecords = await prisma.expense.findMany({
      where: {
        type: 'INCOME',
        ...(dateFilter ? { date: dateFilter } : {}),
      },
    });
    const totalIncome = incomeRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const currentMonthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        totalExpensesRupees: toRupees(totalExpenses),
        monthlyExpenses,
        monthlyExpensesRupees: toRupees(monthlyExpenses),
        averageMonthlySpending,
        averageMonthlySpendingRupees: toRupees(averageMonthlySpending),
        totalTransactions,
        highestSpendingCategory,
        totalIncome,
        totalIncomeRupees: toRupees(totalIncome),
        netSavings: totalIncome - totalExpenses,
        netSavingsRupees: toRupees(totalIncome - totalExpenses),
        currentMonth: currentMonthLabel,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics summary',
      error: error.message,
    });
  }
};

const getCategoryAnalytics = async (req, res) => {
  try {
    let dateFilter;
    try {
      dateFilter = parseDateFilters(req.query);
    } catch (validationErr) {
      return res.status(400).json({
        success: false,
        message: validationErr.message,
      });
    }

    const whereClause = {
      type: 'EXPENSE',
      ...(dateFilter ? { date: dateFilter } : {}),
    };

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      select: {
        id: true,
        category: true,
        amount: true,
      },
    });

    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const categoryMap = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          amount: 0,
          count: 0,
        };
      }
      categoryMap[cat].amount += exp.amount;
      categoryMap[cat].count += 1;
    }

    const categories = Object.values(categoryMap)
      .map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        amountRupees: toRupees(cat.amount),
        count: cat.count,
        percentage: totalExpenses > 0 ? Number(((cat.amount / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    if (req.query.limit) {
      const limit = parseInt(req.query.limit, 10);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Limit must be a positive integer',
        });
      }
      return res.status(200).json({
        success: true,
        totalExpenses,
        totalExpensesRupees: toRupees(totalExpenses),
        count: Math.min(categories.length, limit),
        data: categories.slice(0, limit),
      });
    }

    return res.status(200).json({
      success: true,
      totalExpenses,
      totalExpensesRupees: toRupees(totalExpenses),
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category analytics',
      error: error.message,
    });
  }
};

const getMonthlyAnalytics = async (req, res) => {
  try {
    const { year, months } = req.query;
    let targetYear = null;
    let monthsCount = 6; // default past 6 months

    if (year) {
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year parameter. Expected a 4-digit year',
        });
      }
      targetYear = parsedYear;
    }

    if (months) {
      const parsedMonths = parseInt(months, 10);
      if (isNaN(parsedMonths) || parsedMonths <= 0 || parsedMonths > 36) {
        return res.status(400).json({
          success: false,
          message: 'Invalid months parameter. Expected an integer between 1 and 36',
        });
      }
      monthsCount = parsedMonths;
    }

    const monthShortNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    let monthlyBuckets = [];
    let startDate;
    let endDate;

    if (targetYear) {
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

      for (let m = 0; m < 12; m++) {
        const monthKey = `${targetYear}-${String(m + 1).padStart(2, '0')}`;
        const monthLabel = `${monthShortNames[m]} ${targetYear}`;
        monthlyBuckets.push({
          monthKey,
          monthLabel,
          month: m + 1,
          year: targetYear,
          amount: 0,
          amountRupees: 0,
          count: 0,
        });
      }
    } else {
      // Past N trailing months including current month
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
        const monthLabel = `${monthShortNames[m]} ${y}`;
        monthlyBuckets.push({
          monthKey,
          monthLabel,
          month: m + 1,
          year: y,
          amount: 0,
          amountRupees: 0,
          count: 0,
        });
      }
      const firstBucketDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
      startDate = firstBucketDate;
    }

    const expenses = await prisma.expense.findMany({
      where: {
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const bucketMap = {};
    monthlyBuckets.forEach((b) => {
      bucketMap[b.monthKey] = b;
    });

    for (const exp of expenses) {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (bucketMap[key]) {
        bucketMap[key].amount += exp.amount;
        bucketMap[key].count += 1;
      }
    }

    monthlyBuckets.forEach((b) => {
      b.amountRupees = toRupees(b.amount);
    });

    const totalPeriodSpending = monthlyBuckets.reduce((acc, curr) => acc + curr.amount, 0);
    const averageMonthly = monthlyBuckets.length > 0 ? Math.round(totalPeriodSpending / monthlyBuckets.length) : 0;

    let highestMonth = null;
    let maxSpending = 0;
    for (const b of monthlyBuckets) {
      if (b.amount > maxSpending) {
        maxSpending = b.amount;
        highestMonth = {
          monthKey: b.monthKey,
          monthLabel: b.monthLabel,
          amount: b.amount,
          amountRupees: b.amountRupees,
          count: b.count,
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: monthlyBuckets,
      summary: {
        totalPeriodSpending,
        totalPeriodSpendingRupees: toRupees(totalPeriodSpending),
        averageMonthly,
        averageMonthlyRupees: toRupees(averageMonthly),
        highestMonth,
        period: {
          from: monthlyBuckets[0]?.monthLabel || '',
          to: monthlyBuckets[monthlyBuckets.length - 1]?.monthLabel || '',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly analytics',
      error: error.message,
    });
  }
};

const getAnalyticsReports = async (req, res) => {
  try {
    let dateFilter;
    try {
      dateFilter = parseDateFilters(req.query);
    } catch (validationErr) {
      return res.status(400).json({
        success: false,
        message: validationErr.message,
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit parameter. Limit must be a positive integer',
      });
    }

    const whereClause = {
      type: 'EXPENSE',
      ...(dateFilter ? { date: dateFilter } : {}),
    };

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const transactionCount = expenses.length;

    // Highest expense transaction
    let highestExpense = null;
    if (expenses.length > 0) {
      const sortedByAmount = [...expenses].sort((a, b) => b.amount - a.amount);
      const topOne = sortedByAmount[0];
      highestExpense = {
        id: topOne.id,
        title: topOne.title,
        amount: topOne.amount,
        amountRupees: toRupees(topOne.amount),
        category: topOne.category,
        date: topOne.date,
      };
    }

    // Top 5 highest expenses
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        amountRupees: toRupees(e.amount),
        category: e.category,
        date: e.date,
      }));

    // Recent transactions (formatted)
    const recentTransactions = expenses.slice(0, limit).map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      amountRupees: toRupees(e.amount),
      category: e.category,
      date: e.date,
      type: e.type,
    }));

    // Category summary for report
    const categoryTotals = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Uncategorized';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { category: cat, amount: 0, count: 0 };
      }
      categoryTotals[cat].amount += exp.amount;
      categoryTotals[cat].count += 1;
    }

    const categorySummary = Object.values(categoryTotals)
      .map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        amountRupees: toRupees(cat.amount),
        count: cat.count,
        percentage: totalExpenses > 0 ? Number(((cat.amount / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly summary for report
    const monthMap = {};
    const monthShortNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    for (const exp of expenses) {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          monthKey: key,
          monthLabel: `${monthShortNames[d.getMonth()]} ${d.getFullYear()}`,
          amount: 0,
          count: 0,
        };
      }
      monthMap[key].amount += exp.amount;
      monthMap[key].count += 1;
    }

    const monthlyReport = Object.values(monthMap)
      .map((m) => ({
        ...m,
        amountRupees: toRupees(m.amount),
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    return res.status(200).json({
      success: true,
      data: {
        filter: {
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null,
          timeRange: req.query.timeRange || 'all',
        },
        totalExpenses,
        totalExpensesRupees: toRupees(totalExpenses),
        transactionCount,
        highestExpense,
        topExpenses,
        recentTransactions,
        categorySummary,
        monthlyReport,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics report',
      error: error.message,
    });
  }
};

module.exports = {
  getAnalyticsSummary,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getAnalyticsReports,
};
