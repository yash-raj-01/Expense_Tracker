import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/api';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExpenses();
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Could not connect to the Ledger server. Check that it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalExpensePaise = transactions
    .filter((tx) => tx.type === 'EXPENSE' || !tx.type)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalIncomePaise = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const balancePaise = totalIncomePaise - totalExpensePaise;

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

      {error && (
        <div className="error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button className="retry-btn" type="button" onClick={loadTransactions}>
            Retry
          </button>
        </div>
      )}

      <section className="cards-grid">
        <div className="metric-card">
          <span className="card-label">Total Balance</span>
          <h2 className={`card-value ${balancePaise >= 0 ? 'text-income' : 'text-expense'}`}>
            {loading ? 'Loading…' : currencyFormatter.format(balancePaise / 100)}
          </h2>
          <span className="card-subtext">Net savings to date</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Income</span>
          <h2 className="card-value text-income">
            {loading ? 'Loading…' : currencyFormatter.format(totalIncomePaise / 100)}
          </h2>
          <span className="card-subtext">Recorded income</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Expenses</span>
          <h2 className="card-value text-expense">
            {loading ? 'Loading…' : currencyFormatter.format(totalExpensePaise / 100)}
          </h2>
          <span className="card-subtext">{transactions.length} total recorded</span>
        </div>
      </section>

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
                  {transactions.map((tx) => {
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
