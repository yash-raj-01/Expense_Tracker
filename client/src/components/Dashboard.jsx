import React from 'react';

function Dashboard() {
  // Sample data for summary metrics
  const summary = {
    balance: '$12,450.00',
    income: '$4,800.00',
    expenses: '$1,920.50',
  };

  // Sample data for recent transactions
  const transactions = [
    { id: 1, title: 'Apple Store', category: 'Technology', date: 'Nov 04, 2026', amount: -899.00, type: 'expense' },
    { id: 2, title: 'Client Invoice #1042', category: 'Freelance', date: 'Nov 03, 2026', amount: 2400.00, type: 'income' },
    { id: 3, title: 'Whole Foods Market', category: 'Groceries', date: 'Nov 02, 2026', amount: -142.30, type: 'expense' },
    { id: 4, title: 'Starbucks Coffee', category: 'Dining', date: 'Nov 01, 2026', amount: -6.75, type: 'expense' },
    { id: 5, title: 'Monthly Salary', category: 'Employment', date: 'Oct 31, 2026', amount: 2400.00, type: 'income' },
  ];

  return (
    <div className="dashboard-view">
      {/* Top Header */}
      <header className="content-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Yash. Here is your financial overview.</p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* Metric Summary Cards */}
      <section className="cards-grid">
        <div className="metric-card">
          <span className="card-label">Total Balance</span>
          <h2 className="card-value">{summary.balance}</h2>
          <span className="card-trend positive">+12.4% from last month</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Income</span>
          <h2 className="card-value text-income">{summary.income}</h2>
          <span className="card-subtext">2 incoming transfers</span>
        </div>

        <div className="metric-card">
          <span className="card-label">Monthly Expenses</span>
          <h2 className="card-value text-expense">{summary.expenses}</h2>
          <span className="card-subtext">14 recorded payments</span>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <span className="section-link">View all</span>
        </div>

        <div className="transactions-card">
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
                  <td className="tx-date">{tx.date}</td>
                  <td className={`tx-amount text-right ${tx.type === 'income' ? 'income' : 'expense'}`}>
                    {tx.type === 'income' ? `+${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

