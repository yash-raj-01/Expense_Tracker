import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [profileName, setProfileName] = useState(
    () => localStorage.getItem('ledger_profile_name') || 'Yash'
  );

  // Apply saved theme immediately on startup
  useEffect(() => {
    const savedTheme = localStorage.getItem('ledger_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profileName={profileName}
      />
      <main className="main-content">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'transactions' && <Transactions />}
        {currentTab === 'analytics' && <Analytics />}
        {currentTab === 'settings' && (
          <Settings onProfileUpdate={setProfileName} />
        )}
      </main>
    </div>
  );
}

export default App;
