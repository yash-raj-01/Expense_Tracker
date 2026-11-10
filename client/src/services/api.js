const API_BASE_URL = 'http://localhost:5001/api';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

// ==================== Expense APIs ====================

export const fetchExpenses = async () => {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: Failed to fetch expenses`);
  }
  const result = await response.json();
  return result.data || [];
};

export const createExpenseApi = async (expenseData) => {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create expense');
  }
  return result.data;
};

export const updateExpenseApi = async (id, updateData) => {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update expense');
  }
  return result.data;
};

export const deleteExpenseApi = async (id) => {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete expense');
  }
  return result.data;
};

// ==================== Analytics APIs ====================

export const fetchAnalyticsSummary = async (params = {}) => {
  const qs = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/analytics/summary${qs}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch analytics summary');
  }
  return result.data;
};

export const fetchCategoryAnalytics = async (params = {}) => {
  const qs = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/analytics/categories${qs}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch category analytics');
  }
  return result;
};

export const fetchMonthlyAnalytics = async (params = {}) => {
  const qs = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/analytics/monthly${qs}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch monthly analytics');
  }
  return result;
};

export const fetchAnalyticsReports = async (params = {}) => {
  const qs = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/analytics/reports${qs}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch analytics reports');
  }
  return result.data;
};
