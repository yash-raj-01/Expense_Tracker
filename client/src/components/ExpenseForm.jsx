import React, { useState } from 'react';
import { createExpense } from '../api/expenses';
import { formatDatePreference, getCurrencySymbol, getDefaultTransactionType } from '../utils/preferences';
import './ExpenseForm.css';

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialForm = () => ({
  title: '',
  type: getDefaultTransactionType(),
  category: '',
  amount: '',
  date: getToday(),
});

function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const currencySymbol = getCurrencySymbol();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amountInRupees = Number(form.amount);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0 || !/^\d+(\.\d{1,2})?$/.test(form.amount)) {
      setFeedback({ type: 'error', message: 'Enter an amount greater than zero with up to two decimal places.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      await createExpense({
        title: form.title.trim(),
        type: form.type,
        category: form.category.trim(),
        amount: Math.round(amountInRupees * 100),
        date: form.date,
      });
      setForm(initialForm());
      setFeedback({ type: 'success', message: 'Transaction saved successfully.' });
      onCreated?.();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="expense-form-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Add transaction</h1>
          <p className="page-subtitle">Record an income or expense in your ledger.</p>
        </div>
        <div className="header-date">
          {formatDatePreference(new Date())}
        </div>
      </header>

      <form className="expense-form-card" onSubmit={handleSubmit}>
        <div className="expense-form-grid">
          <label className="expense-field expense-field-wide">
            <span>Description</span>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Groceries"
              maxLength={120}
              required
            />
          </label>

          <label className="expense-field">
            <span>Type</span>
            <select name="type" value={form.type} onChange={updateField}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label className="expense-field">
            <span>Category</span>
            <input
              name="category"
              type="text"
              value={form.category}
              onChange={updateField}
              placeholder="e.g. Food"
              maxLength={60}
              required
            />
          </label>

          <label className="expense-field">
            <span>Amount ({currencySymbol})</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={updateField}
              placeholder="0.00"
              required
            />
          </label>

          <label className="expense-field">
            <span>Date</span>
            <input name="date" type="date" value={form.date} onChange={updateField} required />
          </label>
        </div>

        <div className="expense-form-footer">
          <p className="expense-form-hint">Amounts are entered in {currencySymbol} and saved in minor units.</p>
          {feedback && (
            <p className={`expense-form-feedback ${feedback.type}`} role="status">
              {feedback.message}
            </p>
          )}
          <button className="expense-submit-button" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save transaction'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ExpenseForm;
