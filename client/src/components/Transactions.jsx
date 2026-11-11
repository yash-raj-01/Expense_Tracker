import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import TransactionList from './TransactionList';
import './Transactions.css';

function Transactions() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="transactions-view">
      <ExpenseForm onCreated={() => setRefreshKey((key) => key + 1)} />
      <TransactionList refreshKey={refreshKey} />
    </div>
  );
}

export default Transactions;
