import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/api';

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
      setError(err.message || 'Could not connect to the backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalPaise = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRupees = (totalPaise / 100).toFixed(2);

  return (
    <div className="dashboard-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Yash. Here is your financial overview.</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button className="retry-btn" onClick={loadTransactions}>Retry</button>
        </div>
      )}

      <section className="cards-grid">
        <div className="metric-card">
          <span className="card-label">Total Recorded</span>
          <h2 className="card-value">Rs. {totalRupees}</h2>
          <span className="card-subtext">{transactions.length} total entries</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Expenses</span>
          <h2 className="card-value text-expense">Rs. {totalRupees}</h2>
          <span className="card-subtext">Live from PostgreSQL</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Backend Status</span>
          <h2 className="card-value text-income">{loading ? 'Syncing...' : 'Connected'}</h2>
          <span className="card-subtext">Port 5001</span>
        </div>
      </section>

      <section className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <span className="section-link" onClick={loadTransactions}>Refresh</span>
        </div>

        <div className="transactions-card">
          {loading ? (
            <div className="loading-state">Loading transactions from database...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found in PostgreSQL.</p>
              <span className="empty-subtext">Expenses you create will appear here.</span>
            </div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="tx-title">{tx.title}</td>
                    <td>
                      <span className="tx-badge">{tx.category}</span>
                    </td>
                    <td className="tx-date">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="tx-amount text-right expense">
                      -Rs. {(tx.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
