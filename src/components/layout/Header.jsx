import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, ChevronDown, Compass, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/assets': 'Assets Inventory',
  '/purchases': 'Purchase Ledger',
  '/transfers': 'Equipment Transfers',
  '/assignments': 'Personnel Assignments',
  '/expenditures': 'Expenditure Log',
  '/audit': 'System Audit Logs',
  '/analytics': 'Readiness Analytics',
  '/settings': 'System Settings'
};

const Header = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timeString, setTimeString] = useState('');
  const location = useLocation();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setTimeString(timeStr + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  let username = 'admin';
  let role = 'ADMIN';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role || 'ADMIN';
    }
  } catch (e) {
    // ignore
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const roleLabel = role === 'ADMIN' ? 'System Administrator' : role === 'BASE_COMMANDER' ? 'Base Commander' : role;
  const currentTitle = routeTitles[location.pathname] || 'SentinelOps';

  return (
    <header className="header glass">
      <div className="header-left">
        <button 
          className="menu-button" 
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        <div className="mobile-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/sentinel-logo.png" alt="SentinelOps Logo" className="logo-img pulse-anim" style={{ height: '30px', width: '30px', objectFit: 'contain' }} />
          <span className="logo-text" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-gold)' }}>SentinelOps</span>
        </div>
        <div className="desktop-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: 'var(--primary-gold)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {currentTitle}
          </h2>
        </div>
      </div>

      <div className="header-right">
        {/* Tactical Clock Display */}
        <div className="hidden-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid var(--border-color)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          color: 'var(--primary-gold)',
          letterSpacing: '1px'
        }}>
          <Compass size={14} className="radar-spin" />
          <span>{timeString || '00:00:00 UTC'}</span>
        </div>

        <div className="notification-wrapper">
          <motion.button 
            className="icon-button" 
            aria-label="Notifications"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell size={20} />
            <span className="notification-badge"></span>
          </motion.button>
        </div>

        <div className="user-profile" style={{ position: 'relative' }}>
          <div className="user-info hidden-mobile">
            <span className="user-name">admin</span>
            <span className="user-role">{roleLabel}</span>
          </div>
          <motion.div className="avatar" whileHover={{ scale: 1.1, borderColor: 'var(--bright-gold)' }}>
            <User size={20} />
          </motion.div>
          <button 
            className="icon-button" 
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Menu"
            style={{ padding: '4px' }}
          >
            <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'none' }} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                className="user-dropdown glass"
                initial={{ opacity: 0, y: -12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.92 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="user-dropdown-header">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Signed in as</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-gold)' }}>admin</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{roleLabel}</span>
                </div>
                <div className="user-dropdown-divider"></div>
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
