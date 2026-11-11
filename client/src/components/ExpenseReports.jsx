import React, { useState } from 'react';

function ExpenseReports({
  reportsData,
  timeRange,
  onTimeRangeChange,
  customStart,
  customEnd,
  onCustomDatesChange,
  onApplyCustomDates,
}) {
  const [activeReportTab, setActiveReportTab] = useState('overview');

  if (!reportsData) {
    return null;
  }

  const {
    totalExpensesRupees = 0,
    transactionCount = 0,
    highestExpense = null,
    topExpenses = [],
    recentTransactions = [],
    categorySummary = [],
    monthlyReport = [],
  } = reportsData;

  const timeRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'this-month', label: 'This Month' },
    { id: '30-days', label: 'Last 30 Days' },
    { id: '90-days', label: 'Last 90 Days' },
    { id: 'this-year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="reports-container">
      {/* Date Filtering Bar */}
      <div className="reports-filter-bar">
        <div className="filter-pills">
          {timeRanges.map((tr) => (
            <button
              key={tr.id}
              className={`filter-pill ${timeRange === tr.id ? 'active' : ''}`}
              onClick={() => onTimeRangeChange(tr.id)}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {timeRange === 'custom' && (
          <form
            className="custom-date-inputs"
            onSubmit={(e) => {
              e.preventDefault();
              onApplyCustomDates();
            }}
          >
            <div className="date-input-group">
              <label>From:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => onCustomDatesChange(e.target.value, customEnd)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => onCustomDatesChange(customStart, e.target.value)}
                className="date-input"
              />
            </div>
            <button type="submit" className="apply-filter-btn">
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="report-subtabs">
        <button
          className={`subtab-btn ${activeReportTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('overview')}
        >
          Overview & Highlights
        </button>
        <button
          className={`subtab-btn ${activeReportTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('categories')}
        >
          Category Summary ({categorySummary.length})
        </button>
        <button
          className={`subtab-btn ${activeReportTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('monthly')}
        >
          Monthly Report ({monthlyReport.length})
        </button>
        <button
          className={`subtab-btn ${activeReportTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('transactions')}
        >
          Recent Transactions ({recentTransactions.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
      {activeReportTab === 'overview' && (
        <div className="reports-overview-grid">
          {/* Highest Expense Card */}
          <div className="report-card highlight-card">
            <div className="card-header-with-badge">
              <span className="card-badge-label">HIGHEST EXPENSE</span>
              <span className="star-icon">★ Peak Spend</span>
            </div>
            {highestExpense ? (
              <div className="highest-expense-content">
                <h3 className="highest-title">{highestExpense.title}</h3>
                <div className="highest-amount text-expense">
                  Rs. {highestExpense.amountRupees.toFixed(2)}
                </div>
                <div className="highest-meta">
                  <span className="tx-badge">{highestExpense.category}</span>
                  <span className="highest-date">
                    {new Date(highestExpense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {totalExpensesRupees > 0 && (
                  <p className="highest-percentage-note">
                    Accounted for{' '}
                    <strong>
                      {((highestExpense.amountRupees / totalExpensesRupees) * 100).toFixed(1)}%
                    </strong>{' '}
                    of your total period expenses.
                  </p>
                )}
              </div>
            ) : (
              <div className="empty-subcard">No expenses recorded for this period.</div>
            )}
          </div>

          {/* Top 5 Expenses Spotlight */}
          <div className="report-card">
            <h4 className="report-card-title">Top 5 Spending Items</h4>
            {topExpenses.length === 0 ? (
              <div className="empty-subcard">No expenses found.</div>
            ) : (
              <ul className="top-expenses-list">
                {topExpenses.map((exp, idx) => (
                  <li key={exp.id} className="top-expense-row">
                    <span className="top-rank">{idx + 1}</span>
                    <div className="top-info">
                      <span className="top-title">{exp.title}</span>
                      <span className="top-category-date">
                        {exp.category} •{' '}
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="top-amount text-expense">
                      Rs. {exp.amountRupees.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY BREAKDOWN TABLE */}
      {activeReportTab === 'categories' && (
        <div className="transactions-card">
          {categorySummary.length === 0 ? (
            <div className="empty-state">
              <p>No category spending data for this period.</p>
            </div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Share of Spending</th>
                  <th>Txns</th>
                  <th className="text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map((cat) => (
                  <tr key={cat.category}>
                    <td className="tx-title">
                      <span className="tx-badge">{cat.category}</span>
                    </td>
                    <td>
                      <div className="progress-bar-wrapper">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        ></div>
                        <span className="progress-bar-label">{cat.percentage}%</span>
                      </div>
                    </td>
                    <td className="tx-date">{cat.count}</td>
                    <td className="tx-amount text-right expense">
                      Rs. {cat.amountRupees.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: MONTHLY REPORT TABLE */}
      {activeReportTab === 'monthly' && (
        <div className="transactions-card">
          {monthlyReport.length === 0 ? (
            <div className="empty-state">
              <p>No monthly spending data found for this period.</p>
            </div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Transactions</th>
                  <th>Avg / Transaction</th>
                  <th className="text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((m) => {
                  const avgPerTx = m.count > 0 ? (m.amountRupees / m.count).toFixed(2) : '0.00';
                  return (
                    <tr key={m.monthKey}>
                      <td className="tx-title">{m.monthLabel}</td>
                      <td>
                        <span className="tx-badge">{m.count} entries</span>
                      </td>
                      <td className="tx-date">Rs. {avgPerTx}</td>
                      <td className="tx-amount text-right expense">
                        Rs. {m.amountRupees.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: RECENT TRANSACTIONS */}
      {activeReportTab === 'transactions' && (
        <div className="transactions-card">
          {recentTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found for the selected period.</p>
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
                {recentTransactions.map((tx) => (
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
                      -Rs. {tx.amountRupees.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseReports;
