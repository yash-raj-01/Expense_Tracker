import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <h1 className="content-title">{activeTab}</h1>
        </header>

        <section className="content-body">
          {activeTab === 'dashboard' ? (
            <div className="placeholder-view">
              <h2>Dashboard View</h2>
              <p>In Step 2, we will display your Summary Cards here.</p>
            </div>
          ) : (
            <div className="placeholder-view">
              <h2>{activeTab.toUpperCase()} Section</h2>
              <p>Reserved for team members working on {activeTab}.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}