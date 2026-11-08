const API_BASE_URL = 'http://localhost:5001/api';

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

