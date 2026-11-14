const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5001/api';

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

async function apiRequest(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to connect to the Ledger server. Check that it is running on port 5001.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The Ledger server returned an invalid JSON response.');
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Server returned status ${response.status}`);
  }

  return result;
}

// ==================== Expense APIs ====================

export const fetchExpenses = async () => {
  const result = await apiRequest('/expenses');
  return result.data || [];
};

export const createExpenseApi = async (expenseData) => {
  const result = await apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
  return result.data;
};

export const updateExpenseApi = async (id, updateData) => {
  const result = await apiRequest(`/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return result.data;
};

export const deleteExpenseApi = async (id) => {
  const result = await apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  });
  return result.data;
};

// ==================== Analytics APIs ====================

export const fetchAnalyticsSummary = async (params = {}) => {
  const qs = buildQueryString(params);
  const result = await apiRequest(`/analytics/summary${qs}`);
  return result.data;
};

export const fetchCategoryAnalytics = async (params = {}) => {
  const qs = buildQueryString(params);
  const result = await apiRequest(`/analytics/categories${qs}`);
  return result;
};

export const fetchMonthlyAnalytics = async (params = {}) => {
  const qs = buildQueryString(params);
  const result = await apiRequest(`/analytics/monthly${qs}`);
  return result;
};

export const fetchAnalyticsReports = async (params = {}) => {
  const qs = buildQueryString(params);
  const result = await apiRequest(`/analytics/reports${qs}`);
  return result.data;
};
