const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense, updateExpense } = require('../controllers/expenseController');

router.get('/', getExpenses);
router.post('/', createExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

