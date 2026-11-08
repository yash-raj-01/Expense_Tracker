const prisma = require('../prismaClient');

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string',
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive integer in paise (greater than 0)',
      });
    }

    if (type !== undefined) {
      const allowedTypes = ['EXPENSE', 'INCOME'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction type. Allowed types are: EXPENSE, INCOME',
        });
      }
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required and must be a non-empty string',
      });
    }

    let parsedDate = new Date();
    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected a valid date string (e.g. YYYY-MM-DD)',
        });
      }
      parsedDate = parsed;
    }

    const newExpense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount: amount,
        category: category.trim(),
        date: parsedDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        ...newExpense,
        type: type || 'EXPENSE',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseId = parseInt(id, 10);

    if (isNaN(expenseId) || !Number.isInteger(Number(id)) || expenseId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID. ID must be a positive integer',
      });
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: `Expense with ID ${expenseId} not found`,
      });
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: existingExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
};
