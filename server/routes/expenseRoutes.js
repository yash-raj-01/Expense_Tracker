const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

