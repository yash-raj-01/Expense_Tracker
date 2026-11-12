import React, { useEffect, useState } from 'react';
import { getExpenses } from '../api/expenses';
import { fetchAnalyticsSummary } from '../services/api';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [expensesResponse, allTimeSummary, currentMonthSummary] = await Promise.all([
          getExpenses({ limit: 5, offset: 0 }),
          fetchAnalyticsSummary({ timeRange: 'all' }),
          fetchAnalyticsSummary({ timeRange: 'this-month' }),
        ]);

        if (!isCurrentRequest) return;
        setTransactions(expensesResponse.data || []);
        setSummary(allTimeSummary);
        setMonthlySummary(currentMonthSummary);
      } catch (requestError) {
        if (isCurrentRequest) setError(requestError.message || 'Could not load your dashboard.');
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isCurrentRequest = false;
    };
  }, [refreshKey]);

  const netSavings = Number(summary?.netSavingsRupees || 0);

  return (
    <div className="dashboard-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your latest ledger activity and spending summary.</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button className="retry-btn" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button>
        </div>
      )}

      <section className="cards-grid">
        <div className="metric-card">
          <span className="card-label">Net Savings</span>
          <h2 className={`card-value ${netSavings >= 0 ? 'text-income' : 'text-expense'}`}>
            {loading ? 'Loading…' : currencyFormatter.format(netSavings)}
          </h2>
          <span className="card-subtext">Income minus expenses to date</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Income</span>
          <h2 className="card-value text-income">
            {loading ? 'Loading…' : currencyFormatter.format(monthlySummary?.totalIncomeRupees || 0)}
          </h2>
          <span className="card-subtext">{monthlySummary?.currentMonth || 'This month'}</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Expenses</span>
          <h2 className="card-value text-expense">
            {loading ? 'Loading…' : currencyFormatter.format(monthlySummary?.monthlyExpensesRupees || 0)}
          </h2>
          <span className="card-subtext">{monthlySummary?.currentMonth || 'This month'}</span>
        </div>
      </section>

      <section className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button
            className="section-link dashboard-refresh-button"
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
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
              <p>No transactions found.</p>
              <span className="empty-subtext">Transactions you add will appear here.</span>
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
                  {transactions.map((transaction) => {
                    const isIncome = transaction.type === 'INCOME';
                    return (
                      <tr key={transaction.id}>
                        <td className="tx-title">{transaction.title}</td>
                        <td><span className="tx-badge">{isIncome ? 'Income' : 'Expense'}</span></td>
                        <td><span className="tx-badge">{transaction.category}</span></td>
                        <td className="tx-date">
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className={`tx-amount text-right ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? '+' : '−'}{currencyFormatter.format(transaction.amount / 100)}
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
