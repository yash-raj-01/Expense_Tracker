import React, { useState, useEffect } from 'react';
import { getExpenses } from '../api/expenses';
import { fetchAnalyticsSummary } from '../services/api';
import { formatDatePreference, formatMinorAmount } from '../utils/preferences';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest transactions from PostgreSQL via backend API
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsResponse, summaryResponse] = await Promise.all([
        getExpenses({ limit: 10, offset: 0 }),
        fetchAnalyticsSummary({ timeRange: 'all' }),
      ]);
      setTransactions(transactionsResponse.data || []);
      setSummary(summaryResponse);
    } catch (err) {
      setError(err.message || 'Could not connect to the Ledger server. Check that it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalExpensePaise = Number(summary?.totalExpenses) || 0;
  const totalIncomePaise = Number(summary?.totalIncome) || 0;
  const balancePaise = Number(summary?.netSavings) || 0;

  return (
    <div className="dashboard-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your latest ledger activity and spending summary.</p>
        </div>
        <div className="header-date">
          {formatDatePreference(new Date())}
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
            {loading ? 'Loading…' : formatMinorAmount(balancePaise)}
          </h2>
          <span className="card-subtext">Net savings to date</span>
        </div>

        {/* Total Income Card */}
        <div className="metric-card">
          <span className="card-label">Total Income</span>
          <h2 className="card-value text-income">
            {loading ? 'Loading…' : formatMinorAmount(totalIncomePaise)}
          </h2>
          <span className="card-subtext">Income recorded to date</span>
        </div>

        {/* Total Expenses Card */}
        <div className="metric-card">
          <span className="card-label">Total Expenses</span>
          <h2 className="card-value text-expense">
            {loading ? 'Loading…' : formatMinorAmount(totalExpensePaise)}
          </h2>
          <span className="card-subtext">Expenses recorded to date</span>
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
            <div className="loading-state">Loading recent transactions…</div>
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
                        <td className="tx-date">{formatDatePreference(tx.date)}</td>
                        <td className={`tx-amount text-right ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? '+' : '−'}
                          {formatMinorAmount(tx.amount)}
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
