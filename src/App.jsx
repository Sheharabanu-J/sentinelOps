import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Expenditures from './pages/Expenditures';
import Assets from './pages/Assets';
import AuditLogs from './pages/AuditLogs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import api from './services/api';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/expenditures" element={<Expenditures />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          toast.error("Session expired or access denied. Please log in again.");
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  if (isCheckingAuth) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)'}}>Initializing Secure Connection...</div>;
  }

  // Toast container with high z-index to always appear above modals
  const toastContainer = (
    <ToastContainer 
      theme="dark" 
      position="top-right" 
      autoClose={3000}
      style={{ zIndex: 99999 }}
      toastStyle={{ zIndex: 99999 }}
    />
  );

  if (!isAuthenticated) {
    return (
      <>
        {toastContainer}
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <Router>
      {toastContainer}
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </Router>
  );
}

export default App;
