const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {
  getExpenses,
  createExpense,
  deleteExpense,
} = require('../controllers/expenseController');
=======
const { getExpenses, createExpense, deleteExpense, updateExpense } = require('../controllers/expenseController');
>>>>>>> origin/main

router.get('/', getExpenses);
router.post('/', createExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
