const { pool } = require('../prismaClient');

const getExpenses = async (req, res) => {
  try {
    const rawLimit = req.query.limit ?? '50';
    const rawOffset = req.query.offset ?? '0';
    const limit = Number(rawLimit);
    const offset = Number(rawOffset);
    const search = req.query.search ?? '';
    const category = req.query.category ?? '';

    if (!/^\d+$/.test(String(rawLimit)) || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }

    if (!/^\d+$/.test(String(rawOffset)) || !Number.isSafeInteger(offset)) {
      return res.status(400).json({
        success: false,
        message: 'Offset must be a non-negative integer',
      });
    }

    if (typeof search !== 'string' || search.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search must be a string no longer than 100 characters',
      });
    }

    if (typeof category !== 'string' || category.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Category filter must be a string no longer than 60 characters',
      });
    }

    const searchTerm = search.trim();

    // Build parameterized query
    let sql = `SELECT * FROM "expenses"`;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (searchTerm) {
      conditions.push(`(title ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY date DESC, id DESC`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit + 1, offset);

    const result = await pool.query(sql, params);
    const expenses = result.rows;

    const hasMore = expenses.length > limit;
    if (hasMore) expenses.pop();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
      pagination: {
        limit,
        offset,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

const getExpenseCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM "expenses" ORDER BY category ASC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows.map((record) => record.category),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense categories',
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

    const expenseType = type || 'EXPENSE';

    // Use pg pool directly — Prisma adapter blocks writes with EPERM
    const result = await pool.query(
      `INSERT INTO "expenses" (title, amount, "type", category, date, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [title.trim(), amount, expenseType, category.trim(), parsedDate]
    );

    const newExpense = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
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

    // Check if the expense exists
    const existing = await pool.query(
      `SELECT * FROM "expenses" WHERE id = $1`, [expenseId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Expense with ID ${expenseId} not found`,
      });
    }

    await pool.query(`DELETE FROM "expenses" WHERE id = $1`, [expenseId]);

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: existing.rows[0],
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message,
    });
  }
};

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

    // Validate each field
    if (Object.hasOwn(req.body, 'title')) {
      if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title must be a non-empty string',
        });
      }
    }

    if (Object.hasOwn(req.body, 'amount')) {
      if (typeof req.body.amount !== 'number' || !Number.isInteger(req.body.amount) || req.body.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive integer in paise (greater than 0)',
        });
      }
    }

    if (Object.hasOwn(req.body, 'type')) {
      if (!['EXPENSE', 'INCOME'].includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction type. Allowed types are: EXPENSE, INCOME',
        });
      }
    }

    if (Object.hasOwn(req.body, 'category')) {
      if (typeof req.body.category !== 'string' || req.body.category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category must be a non-empty string',
        });
      }
    }

    if (Object.hasOwn(req.body, 'date')) {
      const parsedDate = new Date(req.body.date);
      if (typeof req.body.date !== 'string' || Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected a valid date string (e.g. YYYY-MM-DD)',
        });
      }
    }

    // Check if expense exists
    const existing = await pool.query(
      `SELECT * FROM "expenses" WHERE id = $1`, [expenseId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Expense with ID ${expenseId} not found`,
      });
    }

    // Build SET clause dynamically
    const setClauses = [];
    const values = [];
    let paramIdx = 1;

    if (Object.hasOwn(req.body, 'title')) {
      setClauses.push(`title = $${paramIdx}`);
      values.push(req.body.title.trim());
      paramIdx++;
    }
    if (Object.hasOwn(req.body, 'amount')) {
      setClauses.push(`amount = $${paramIdx}`);
      values.push(req.body.amount);
      paramIdx++;
    }
    if (Object.hasOwn(req.body, 'type')) {
      setClauses.push(`"type" = $${paramIdx}`);
      values.push(req.body.type);
      paramIdx++;
    }
    if (Object.hasOwn(req.body, 'category')) {
      setClauses.push(`category = $${paramIdx}`);
      values.push(req.body.category.trim());
      paramIdx++;
    }
    if (Object.hasOwn(req.body, 'date')) {
      setClauses.push(`date = $${paramIdx}`);
      values.push(new Date(req.body.date));
      paramIdx++;
    }

    // Always update updatedAt
    setClauses.push(`"updatedAt" = NOW()`);

    const updateSql = `UPDATE "expenses" SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
    values.push(expenseId);

    const updated = await pool.query(updateSql, values);

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updated.rows[0],
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseCategories,
  createExpense,
  deleteExpense,
  updateExpense,
};
