const prisma = require('../prismaClient');

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({
      success: true,
<<<<<<< HEAD
      count: expenses.length,
=======
>>>>>>> origin/main
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
<<<<<<< HEAD
      message: 'Failed to fetch expenses',
=======
      message: 'Failed to retrieve expenses',
>>>>>>> origin/main
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
        type: type || 'EXPENSE',
        category: category.trim(),
        date: parsedDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense,
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

<<<<<<< HEAD
=======
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseId = Number(id);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID. ID must be a positive integer',
      });
    }

    const allowedFields = ['title', 'amount', 'type', 'category', 'date'];
    const fields = Object.keys(req.body || {});
    const unsupportedFields = fields.filter((field) => !allowedFields.includes(field));

    if (fields.length === 0 || unsupportedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: fields.length === 0
          ? 'At least one expense field must be provided'
          : `Unsupported fields: ${unsupportedFields.join(', ')}`,
      });
    }

    const data = {};

    if (Object.hasOwn(req.body, 'title')) {
      if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title must be a non-empty string',
        });
      }
      data.title = req.body.title.trim();
    }

    if (Object.hasOwn(req.body, 'amount')) {
      if (typeof req.body.amount !== 'number' || !Number.isInteger(req.body.amount) || req.body.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive integer in paise (greater than 0)',
        });
      }
      data.amount = req.body.amount;
    }

    if (Object.hasOwn(req.body, 'type')) {
      if (!['EXPENSE', 'INCOME'].includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction type. Allowed types are: EXPENSE, INCOME',
        });
      }
      data.type = req.body.type;
    }

    if (Object.hasOwn(req.body, 'category')) {
      if (typeof req.body.category !== 'string' || req.body.category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category must be a non-empty string',
        });
      }
      data.category = req.body.category.trim();
    }

    if (Object.hasOwn(req.body, 'date')) {
      const parsedDate = new Date(req.body.date);
      if (typeof req.body.date !== 'string' || Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected a valid date string (e.g. YYYY-MM-DD)',
        });
      }
      data.date = parsedDate;
    }

    const existingExpense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: `Expense with ID ${expenseId} not found`,
      });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

>>>>>>> origin/main
module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
<<<<<<< HEAD
=======
  updateExpense,
>>>>>>> origin/main
};
