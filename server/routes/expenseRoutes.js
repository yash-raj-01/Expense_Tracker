const express = require('express');
const router = express.Router();
const { createExpense, deleteExpense } = require('../controllers/expenseController');

router.post('/', createExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

