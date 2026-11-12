const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to connect to the Ledger server. Check that it is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The Ledger server returned an invalid response.');
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'The request could not be completed.');
  }

  return payload;
}

export function getExpenses({ limit = 50, offset = 0, search = '', category = '' } = {}) {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search.trim()) query.set('search', search.trim());
  if (category) query.set('category', category);
  return request(`/expenses?${query}`);
}

export function getExpenseCategories() {
  return request('/expenses/categories');
}

export function createExpense(expense) {
  return request('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
}

export function updateExpense(id, changes) {
  return request(`/expenses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function deleteExpense(id) {
  return request(`/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
