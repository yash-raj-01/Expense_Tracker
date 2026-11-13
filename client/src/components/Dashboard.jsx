import React, { useState, useEffect } from 'react';
import { getExpenses } from '../api/expenses';

// Standard Indian Rupee currency formatter
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest transactions from PostgreSQL via backend API
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExpenses({ limit: 100, offset: 0 });
      setTransactions(response.data || []);
    } catch (err) {
      setError(err.message || 'Could not connect to the Ledger server. Check that it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // --- Dynamic calculations derived directly from the transaction list ---

  // 1. Total Expenses: Sum of transactions where type is 'EXPENSE' (or untyped legacy)
  const totalExpensePaise = transactions
    .filter((tx) => tx.type === 'EXPENSE' || !tx.type)
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // 2. Total Income: Sum of transactions where type is 'INCOME'
  const totalIncomePaise = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // 3. Balance: Total Income minus Total Expenses
  const balancePaise = totalIncomePaise - totalExpensePaise;

  // Count of expenses and incomes for subtitle information
  const expenseCount = transactions.filter((tx) => tx.type === 'EXPENSE' || !tx.type).length;
  const incomeCount = transactions.filter((tx) => tx.type === 'INCOME').length;

  return (
    <div className="dashboard-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Yash. Here is your financial overview.</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* API Error Banner with Retry button */}
      {error && (
        <div className="error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button className="retry-btn" type="button" onClick={loadTransactions}>
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards Grid */}
      <section className="cards-grid">
        {/* Total Balance Card */}
        <div className="metric-card">
          <span className="card-label">Total Balance</span>
          <h2 className={`card-value ${balancePaise >= 0 ? 'text-income' : 'text-expense'}`}>
            {loading ? 'Loading…' : currencyFormatter.format(balancePaise / 100)}
          </h2>
          <span className="card-subtext">Net savings to date</span>
        </div>

        {/* Total Income Card */}
        <div className="metric-card">
          <span className="card-label">Total Income</span>
          <h2 className="card-value text-income">
            {loading ? 'Loading…' : currencyFormatter.format(totalIncomePaise / 100)}
          </h2>
          <span className="card-subtext">
            {incomeCount} {incomeCount === 1 ? 'income transaction' : 'income transactions'}
          </span>
        </div>

        {/* Total Expenses Card */}
        <div className="metric-card">
          <span className="card-label">Total Expenses</span>
          <h2 className="card-value text-expense">
            {loading ? 'Loading…' : currencyFormatter.format(totalExpensePaise / 100)}
          </h2>
          <span className="card-subtext">
            {expenseCount} {expenseCount === 1 ? 'expense recorded' : 'expenses recorded'}
          </span>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button
            className="section-link dashboard-refresh-button"
            type="button"
            onClick={loadTransactions}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <div className="transactions-card">
          {loading ? (
            <div className="loading-state">Loading transactions from database…</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found in PostgreSQL.</p>
              <span className="empty-subtext">Transactions you create will appear here.</span>
            </div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <tr key={tx.id}>
                        <td className="tx-title">{tx.title}</td>
                        <td>
                          <span className="tx-badge">{isIncome ? 'Income' : 'Expense'}</span>
                        </td>
                        <td>
                          <span className="tx-badge">{tx.category}</span>
                        </td>
                        <td className="tx-date">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className={`tx-amount text-right ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? '+' : '−'}
                          {currencyFormatter.format(tx.amount / 100)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
