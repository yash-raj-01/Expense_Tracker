import React, { useEffect, useState } from 'react';
import { getExpenses } from '../api/expenses';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function TransactionList({ refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getExpenses({ limit: 50, offset: 0 });
        if (isCurrentRequest) setTransactions(response.data || []);
      } catch (requestError) {
        if (isCurrentRequest) setError(requestError.message);
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isCurrentRequest = false;
    };
  }, [refreshKey, retryKey]);

  return (
    <section className="transactions-section saved-transactions-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Saved transactions</h2>
          <p className="transactions-list-subtitle">Your latest 50 records</p>
        </div>
        <button
          className="transactions-refresh-button"
          type="button"
          onClick={() => setRetryKey((key) => key + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="transactions-card">
        {isLoading ? (
          <p className="transactions-state">Loading transactions…</p>
        ) : error ? (
          <div className="transactions-state error" role="alert">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <p className="transactions-state">No transactions yet. Add one using the form above.</p>
        ) : (
          <div className="transactions-table-wrap">
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
                      <td>
                        <span className="tx-badge">{isIncome ? 'Income' : 'Expense'}</span>
                      </td>
                      <td>{transaction.category}</td>
                      <td className="tx-date">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
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
  );
}

export default TransactionList;
