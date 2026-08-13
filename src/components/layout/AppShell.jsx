import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppShell.css';

const AppShell = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="main-content">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay animate-fade-in" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default AppShell;
