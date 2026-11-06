import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
      <main className="main-content">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab !== 'dashboard' && (
          <div className="placeholder-view">
            <h2>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}</h2>
            <p>This section is under construction.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
