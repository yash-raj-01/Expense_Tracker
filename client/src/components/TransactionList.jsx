import React, { useEffect, useState } from 'react';
import { deleteExpense, getExpenseCategories, getExpenses, updateExpense } from '../api/expenses';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function TransactionList({ refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getExpenses({ limit: 50, offset: 0, search: searchTerm, category: categoryFilter });
        if (isCurrentRequest) setTransactions(response.data || []);
      } catch (requestError) {
        if (isCurrentRequest) setError(requestError.message);
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isCurrentRequest = false;
    };
  }, [refreshKey, retryKey, searchTerm, categoryFilter]);

  useEffect(() => {
    let isCurrentRequest = true;
    getExpenseCategories()
      .then((response) => {
        if (isCurrentRequest) setCategories(response.data || []);
      })
      .catch((requestError) => {
        if (isCurrentRequest) setActionError(requestError.message);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [refreshKey, retryKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(`Delete "${transaction.title}" from your transactions?`);
    if (!confirmed) return;

    setDeletingId(transaction.id);
    setActionError('');
    setActionSuccess('');

    try {
      await deleteExpense(transaction.id);
      // Remove the item from UI immediately after successful deletion
      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
      setActionSuccess(`"${transaction.title}" was deleted successfully.`);
      // Refresh category list and synchronization
      setRetryKey((key) => key + 1);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      title: transaction.title,
      type: transaction.type || 'EXPENSE',
      category: transaction.category,
      amount: (transaction.amount / 100).toFixed(2),
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
    setActionError('');
    setActionSuccess('');
  };

  const updateEditField = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditSubmit = async (event, transactionId) => {
    event.preventDefault();
    const amountInRupees = Number(editForm.amount);

    if (!editForm.title.trim() || !editForm.category.trim()) {
      setActionError('Description and category cannot be empty.');
      return;
    }
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0 || !/^\d+(\.\d{1,2})?$/.test(editForm.amount)) {
      setActionError('Enter an amount greater than zero with up to two decimal places.');
      return;
    }

    setIsSavingEdit(true);
    setActionError('');
    setActionSuccess('');

    try {
      await updateExpense(transactionId, {
        title: editForm.title.trim(),
        type: editForm.type,
        category: editForm.category.trim(),
        amount: Math.round(amountInRupees * 100),
        date: editForm.date,
      });
      setActionSuccess('Transaction updated successfully.');
      setRetryKey((key) => key + 1);
      setEditingId(null);
      setEditForm(null);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <section className="transactions-section saved-transactions-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Saved transactions</h2>
          <p className="transactions-list-subtitle">Search descriptions and categories</p>
        </div>
        <div className="transaction-list-controls">
          <input
            className="transaction-search-input"
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setActionSuccess('');
              setActionError('');
            }}
            placeholder="Search transactions"
            aria-label="Search transactions by description or category"
            maxLength={100}
          />
          <select
            className="transaction-category-filter"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setActionSuccess('');
              setActionError('');
            }}
            aria-label="Filter transactions by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            className="transactions-refresh-button"
            type="button"
            onClick={() => {
              setActionSuccess('');
              setActionError('');
              setRetryKey((key) => key + 1);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="transactions-card">
        {actionSuccess && (
          <p className="transactions-action-success" role="status">
            {actionSuccess}
          </p>
        )}
        {actionError && (
          <p className="transactions-action-error" role="alert">
            {actionError}
          </p>
        )}
        {isLoading ? (
          <p className="transactions-state">Loading transactions…</p>
        ) : error ? (
          <div className="transactions-state error" role="alert">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <p className="transactions-state">
            {searchTerm || categoryFilter
              ? 'No transactions match the selected filters.'
              : 'No transactions yet. Add one using the form above.'}
          </p>
        ) : (
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const isIncome = transaction.type === 'INCOME';
                  return (
                    <React.Fragment key={transaction.id}>
                    <tr>
                      <td className="tx-title">{transaction.title}</td>
                      <td>
                        <span className="tx-badge">{isIncome ? 'Income' : 'Expense'}</span>
                      </td>
                      <td>{transaction.category}</td>
                      <td className="tx-date">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className={`tx-amount text-right ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '+' : '−'}{currencyFormatter.format(transaction.amount / 100)}
                      </td>
                      <td className="transaction-action-cell">
                        <button
                          className="transaction-edit-button"
                          type="button"
                          onClick={() => startEditing(transaction)}
                          disabled={deletingId !== null || isSavingEdit}
                        >
                          Edit
                        </button>
                        <button
                          className="transaction-delete-button"
                          type="button"
                          onClick={() => handleDelete(transaction)}
                          disabled={deletingId !== null || isSavingEdit}
                          aria-label={`Delete ${transaction.title}`}
                        >
                          {deletingId === transaction.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                    {editingId === transaction.id && editForm && (
                      <tr>
                        <td colSpan="6">
                          <form className="transaction-edit-form" onSubmit={(event) => handleEditSubmit(event, transaction.id)}>
                            <label>
                              Description
                              <input name="title" value={editForm.title} onChange={updateEditField} maxLength={120} required />
                            </label>
                            <label>
                              Type
                              <select name="type" value={editForm.type} onChange={updateEditField}>
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                              </select>
                            </label>
                            <label>
                              Category
                              <input name="category" value={editForm.category} onChange={updateEditField} maxLength={60} required />
                            </label>
                            <label>
                              Amount (₹)
                              <input name="amount" type="number" min="0.01" step="0.01" value={editForm.amount} onChange={updateEditField} required />
                            </label>
                            <label>
                              Date
                              <input name="date" type="date" value={editForm.date} onChange={updateEditField} required />
                            </label>
                            <div className="transaction-edit-actions">
                              <button type="submit" className="transaction-edit-save" disabled={isSavingEdit}>
                                {isSavingEdit ? 'Saving…' : 'Save changes'}
                              </button>
                              <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }} disabled={isSavingEdit}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default TransactionList;
