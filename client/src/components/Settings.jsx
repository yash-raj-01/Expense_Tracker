import React, { useState, useEffect } from 'react';
import { getExpenses } from '../api/expenses';
import './Settings.css';

// Helper function to escape CSV fields according to RFC 4180
function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const stringVal = String(val);
  if (/[",\n\r]/.test(stringVal)) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

function Settings({ onProfileUpdate }) {
  // 1. Profile State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // 2. Appearance State
  const [theme, setTheme] = useState('light');

  // 3. Preferences State
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [defaultType, setDefaultType] = useState('EXPENSE');

  // 4. Data Management State
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Feedback state for user confirmation messages
  const [feedback, setFeedback] = useState(null);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('ledger_profile_name') || 'Yash Raj';
    const savedEmail = localStorage.getItem('ledger_profile_email') || 'yash@example.com';
    const savedTheme = localStorage.getItem('ledger_theme') || 'light';
    const savedCurrency = localStorage.getItem('ledger_currency') || 'INR';
    const savedDateFormat = localStorage.getItem('ledger_date_format') || 'DD/MM/YYYY';
    const savedDefaultType = localStorage.getItem('ledger_default_transaction_type') || 'EXPENSE';

    setProfileName(savedName);
    setProfileEmail(savedEmail);
    setTheme(savedTheme);
    setCurrency(savedCurrency);
    setDateFormat(savedDateFormat);
    setDefaultType(savedDefaultType);
  }, []);

  // Show a temporary feedback banner
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const trimmedName = profileName.trim();
    const trimmedEmail = profileEmail.trim();

    if (!trimmedName) {
      showFeedback('Name cannot be empty.', 'error');
      return;
    }

    localStorage.setItem('ledger_profile_name', trimmedName);
    localStorage.setItem('ledger_profile_email', trimmedEmail);

    if (onProfileUpdate) {
      onProfileUpdate(trimmedName);
    }

    showFeedback('Profile details saved successfully.');
  };

  // Handle Theme Change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ledger_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showFeedback(`Appearance switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme.`);
  };

  // Handle Preferences Save
  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('ledger_currency', currency);
    localStorage.setItem('ledger_date_format', dateFormat);
    localStorage.setItem('ledger_default_transaction_type', defaultType);
    showFeedback('Preferences updated successfully.');
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    setIsExportingCsv(true);

    try {
      // Fetch all transactions in batches (backend limit is 100 per request)
      let allTransactions = [];
      let offset = 0;
      const batchLimit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await getExpenses({ limit: batchLimit, offset });
        const batch = response.data || [];
        allTransactions = allTransactions.concat(batch);
        hasMore = Boolean(response.pagination?.hasMore && batch.length === batchLimit);
        offset += batchLimit;
      }

      if (allTransactions.length === 0) {
        showFeedback('No transactions found to export.', 'error');
        return;
      }

      // Build CSV Headers
      const headers = ['Date', 'Description', 'Type', 'Category', `Amount (${currency})`];

      // Format Rows
      const rows = allTransactions.map((tx) => {
        const txDate = tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '';
        const txAmount = (Number(tx.amount) / 100).toFixed(2);
        return [
          escapeCsvField(txDate),
          escapeCsvField(tx.title),
          escapeCsvField(tx.type || 'EXPENSE'),
          escapeCsvField(tx.category),
          escapeCsvField(txAmount),
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

      // Create download blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger_transactions_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showFeedback(`Exported ${allTransactions.length} transactions to CSV.`);
    } catch (err) {
      showFeedback(err.message || 'Failed to export CSV.', 'error');
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="settings-view">
      <header className="content-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your personal profile, appearance, preferences, and ledger data.</p>
        </div>
      </header>

      {/* Feedback banner */}
      {feedback && (
        <div className={`settings-feedback-banner ${feedback.type}`} role="status">
          <span>{feedback.type === 'success' ? '✓' : '⚠️'} {feedback.message}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Section A: Profile */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Profile</h2>
            <p className="settings-card-description">Customize your local display name and email address.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="settings-field-group">
              <label className="settings-field">
                <span className="settings-label">Full Name</span>
                <input
                  type="text"
                  className="settings-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Yash Raj"
                  maxLength={60}
                  required
                />
              </label>

              <label className="settings-field">
                <span className="settings-label">Email Address</span>
                <input
                  type="email"
                  className="settings-input"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="e.g. yash@example.com"
                  maxLength={100}
                />
              </label>
            </div>

            <div className="settings-card-footer">
              <p className="settings-hint">Stored locally on your device.</p>
              <button type="submit" className="settings-save-button">
                Save profile
              </button>
            </div>
          </form>
        </section>

        {/* Section B: Appearance */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Appearance</h2>
            <p className="settings-card-description">Choose how Ledger looks to you. Switches immediately.</p>
          </div>

          <div className="theme-toggle-grid">
            <button
              type="button"
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="theme-option-icon">☀️</div>
              <div className="theme-option-info">
                <span className="theme-option-name">Light Theme</span>
                <span className="theme-option-desc">Clean, warm off-white surface</span>
              </div>
              {theme === 'light' && <span className="theme-check">✓</span>}
            </button>

            <button
              type="button"
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="theme-option-icon">🌙</div>
              <div className="theme-option-info">
                <span className="theme-option-name">Dark Theme</span>
                <span className="theme-option-desc">Deep slate surface easy on the eyes</span>
              </div>
              {theme === 'dark' && <span className="theme-check">✓</span>}
            </button>
          </div>
        </section>

        {/* Section C: Preferences */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Preferences</h2>
            <p className="settings-card-description">Set your default currency symbol, date display, and transaction type.</p>
          </div>

          <form onSubmit={handleSavePreferences} className="settings-form">
            <div className="settings-field-group">
              <label className="settings-field">
                <span className="settings-label">Default Currency</span>
                <select
                  className="settings-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </label>

              <label className="settings-field">
                <span className="settings-label">Date Format</span>
                <select
                  className="settings-select"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 13/11/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/13/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-13)</option>
                </select>
              </label>

              <label className="settings-field">
                <span className="settings-label">Default Transaction Type</span>
                <select
                  className="settings-select"
                  value={defaultType}
                  onChange={(e) => setDefaultType(e.target.value)}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </label>
            </div>

            <div className="settings-card-footer">
              <p className="settings-hint">Applies to forms and formatting.</p>
              <button type="submit" className="settings-save-button">
                Save preferences
              </button>
            </div>
          </form>
        </section>

        {/* Section D: Data Management */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Data Management</h2>
            <p className="settings-card-description">Export your recorded transactions to external files.</p>
          </div>

          <div className="data-management-list">
            <div className="data-action-item">
              <div className="data-action-info">
                <span className="data-action-title">Export Transactions as CSV</span>
                <p className="data-action-description">
                  Download all expenses and incomes in a spreadsheet-friendly CSV format compatible with Excel and Google Sheets.
                </p>
              </div>
              <button
                type="button"
                className="settings-secondary-button"
                onClick={handleExportCsv}
                disabled={isExportingCsv}
              >
                {isExportingCsv ? 'Exporting CSV…' : 'Export CSV'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
