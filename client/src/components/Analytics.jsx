import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAnalyticsSummary,
  fetchCategoryAnalytics,
  fetchMonthlyAnalytics,
  fetchAnalyticsReports,
  createExpenseApi,
} from '../services/api';
import CategoryPieChart from './charts/CategoryPieChart';
import MonthlyBarChart from './charts/MonthlyBarChart';
import ExpenseReports from './ExpenseReports';
import { formatCurrencyAmount } from '../utils/preferences';

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [reportsData, setReportsData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [timeRange, setTimeRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [monthsWindow, setMonthsWindow] = useState('6');

  // Quick Expense Modal state for testing & seamless adding
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmountRupees, setNewAmountRupees] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Dining');
  const [newType, setNewType] = useState('EXPENSE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadAllAnalytics = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const filterParams = {};
        if (timeRange === 'custom') {
          if (customStart) filterParams.startDate = customStart;
          if (customEnd) filterParams.endDate = customEnd;
        } else if (timeRange !== 'all') {
          filterParams.timeRange = timeRange;
        }

        const [summaryRes, categoryRes, monthlyRes, reportsRes] = await Promise.all([
          fetchAnalyticsSummary(filterParams),
          fetchCategoryAnalytics(filterParams),
          fetchMonthlyAnalytics({ months: monthsWindow }),
          fetchAnalyticsReports(filterParams),
        ]);

        setSummary(summaryRes);
        setCategoryData(categoryRes.data || []);
        setMonthlyData(monthlyRes.data || []);
        setMonthlySummary(monthlyRes.summary || {});
        setReportsData(reportsRes);
      } catch (err) {
        setError(err.message || 'Could not load analytics from backend');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange, customStart, customEnd, monthsWindow]
  );

  useEffect(() => {
    loadAllAnalytics(false);
  }, [loadAllAnalytics]);

  const handleCustomDatesChange = (start, end) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  const handleApplyCustomDates = () => {
    if (customStart && customEnd && customStart > customEnd) {
      setError('Start date cannot be after end date.');
      return;
    }
    loadAllAnalytics(true);
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  const handleQuickAddExpense = async (e) => {
    e.preventDefault();
    const rupees = parseFloat(newAmountRupees);
    if (!newTitle.trim() || isNaN(rupees) || rupees <= 0) {
      setError('Please provide a valid title and positive amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      const paise = Math.round(rupees * 100);
      await createExpenseApi({
        title: newTitle.trim(),
        amount: paise,
        category: newCategory,
        type: newType,
      });

      setNewTitle('');
      setNewAmountRupees('');
      setShowAddModal(false);
      setActionSuccess('Expense recorded successfully! Analytics updated.');
      setTimeout(() => setActionSuccess(null), 3500);

      // Re-fetch all analytics data to reflect the new transaction immediately
      await loadAllAnalytics(true);
    } catch (err) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportAnalyticsCSV = () => {
    if (!categoryData || categoryData.length === 0) {
      setError('No analytics data available to export.');
      return;
    }
    const rows = [
      ['Ledger Expense Tracker - Analytics Report'],
      [`Generated at: ${new Date().toISOString()}`],
      [`Filter Timeframe: ${timeRange}`],
      [],
      ['Category Breakdown'],
      ['Category', 'Transactions', 'Amount (Rupees)', 'Share (%)'],
      ...categoryData.map((c) => [
        `"${c.category}"`,
        c.count,
        c.amountRupees,
        `${c.percentage}%`,
      ]),
      [],
      ['Monthly Spending Trends'],
      ['Month', 'Transactions', 'Amount (Rupees)'],
      ...monthlyData.map((m) => [
        `"${m.monthLabel}"`,
        m.count,
        m.amountRupees,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-view">
      {/* Top Header */}
      <header className="content-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">
            Financial analytics, category breakdown, spending trends and reports.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="action-btn-secondary"
            onClick={handleExportAnalyticsCSV}
            title="Export analytics summary to CSV"
          >
            <span>↓</span> Export CSV
          </button>
          <button
            className="action-btn-secondary"
            onClick={() => loadAllAnalytics(true)}
            disabled={refreshing || loading}
            title="Refresh analytics data"
          >
            <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`}>↻</span>{' '}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="action-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Expense
          </button>
        </div>
      </header>

      {/* Notifications */}
      {actionSuccess && (
        <div className="success-banner">
          <span>✓ {actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button className="retry-btn" onClick={() => loadAllAnalytics(false)}>
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton if initial load */}
      {loading ? (
        <div className="analytics-loading-wrapper">
          <div className="spinner"></div>
          <p>Calculating financial metrics from database...</p>
        </div>
      ) : (
        <>
          {/* ================= 1. SUMMARY CARDS ================= */}
          <section className="analytics-summary-cards">
            {/* Total Expenses */}
            <div className="metric-card analytics-card">
              <div className="card-top">
                <span className="card-label">Total Expenses</span>
                <span className="card-pill">All-Time</span>
              </div>
              <h2 className="card-value text-expense">
                {formatCurrencyAmount(summary?.totalExpensesRupees || 0)}
              </h2>
              <span className="card-subtext">
                {summary?.totalTransactions || 0} total transactions
              </span>
            </div>

            {/* Monthly Expenses */}
            <div className="metric-card analytics-card">
              <div className="card-top">
                <span className="card-label">Monthly Expenses</span>
                <span className="card-pill highlight">{summary?.currentMonth || 'Current'}</span>
              </div>
              <h2 className="card-value">
                {formatCurrencyAmount(summary?.monthlyExpensesRupees || 0)}
              </h2>
              <span className="card-subtext">This calendar month</span>
            </div>

            {/* Average Monthly Spending */}
            <div className="metric-card analytics-card">
              <div className="card-top">
                <span className="card-label">Avg. Monthly Spending</span>
                <span className="card-pill">Average</span>
              </div>
              <h2 className="card-value">
                {formatCurrencyAmount(summary?.averageMonthlySpendingRupees || 0)}
              </h2>
              <span className="card-subtext">Based on active months</span>
            </div>

            {/* Total Transactions */}
            <div className="metric-card analytics-card">
              <div className="card-top">
                <span className="card-label">Total Transactions</span>
                <span className="card-pill">Count</span>
              </div>
              <h2 className="card-value text-income">
                {summary?.totalTransactions || 0}
              </h2>
              <span className="card-subtext">Recorded in PostgreSQL</span>
            </div>

            {/* Highest Spending Category */}
            <div className="metric-card analytics-card">
              <div className="card-top">
                <span className="card-label">Highest Category</span>
                <span className="card-pill">Peak</span>
              </div>
              {summary?.highestSpendingCategory ? (
                <>
                  <h2 className="card-value text-category">
                    {summary.highestSpendingCategory.category}
                  </h2>
                  <span className="card-subtext">
                    {formatCurrencyAmount(summary.highestSpendingCategory.amountRupees)} ({summary.highestSpendingCategory.percentage}%)
                  </span>
                </>
              ) : (
                <>
                  <h2 className="card-value text-muted">None</h2>
                  <span className="card-subtext">No expenses recorded</span>
                </>
              )}
            </div>
          </section>

          {/* ================= 2 & 3. CHARTS GRID ================= */}
          <section className="analytics-charts-grid">
            {/* Category Donut Chart Card */}
            <div className="analytics-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">Category-wise Analytics</h3>
                  <p className="chart-card-subtitle">
                    Distribution of expenses across categories
                  </p>
                </div>
                <span className="chart-badge">{categoryData.length} Categories</span>
              </div>
              <div className="chart-body">
                <CategoryPieChart
                  data={categoryData}
                  totalExpensesRupees={summary?.totalExpensesRupees || 0}
                />
              </div>
            </div>

            {/* Monthly Bar Chart Card */}
            <div className="analytics-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">Monthly Expense Analytics</h3>
                  <p className="chart-card-subtitle">
                    Historical spending trends over time
                  </p>
                </div>
                <div className="chart-actions">
                  <button
                    className={`window-pill ${monthsWindow === '6' ? 'active' : ''}`}
                    onClick={() => setMonthsWindow('6')}
                  >
                    6M
                  </button>
                  <button
                    className={`window-pill ${monthsWindow === '12' ? 'active' : ''}`}
                    onClick={() => setMonthsWindow('12')}
                  >
                    12M
                  </button>
                </div>
              </div>
              <div className="chart-body">
                <MonthlyBarChart data={monthlyData} summary={monthlySummary} />
              </div>
            </div>
          </section>

          {/* ================= 4. EXPENSE REPORTS ================= */}
          <section className="analytics-reports-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Expense Reports & Breakdown</h2>
                <p className="section-subtitle">
                  Filter by date, inspect highest expenses, and view recent activity.
                </p>
              </div>
            </div>

            <ExpenseReports
              reportsData={reportsData}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomDatesChange={handleCustomDatesChange}
              onApplyCustomDates={handleApplyCustomDates}
            />
          </section>
        </>
      )}

      {/* QUICK ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record New Expense</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddExpense} className="modal-form">
              <div className="form-group">
                <label className="form-label">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery shopping, Server hosting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Amount (in Rupees) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={newAmountRupees}
                    onChange={(e) => setNewAmountRupees(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="form-select"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Travel">Travel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save & Refresh Analytics'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
