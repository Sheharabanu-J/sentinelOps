import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ArrowRightLeft, 
  Users, 
  TrendingDown, 
  FileText, 
  BarChart2, 
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  let userRole = 'viewer';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      userRole = decoded.role || 'viewer';
    }
  } catch (e) {
    console.error('Failed to decode token for RBAC');
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Assets', path: '/assets', icon: <Package size={20} /> },
    { name: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> },
    { name: 'Transfers', path: '/transfers', icon: <ArrowRightLeft size={20} /> },
    { name: 'Assignments', path: '/assignments', icon: <Users size={20} /> },
    { name: 'Expenditures', path: '/expenditures', icon: <TrendingDown size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const isAdmin = userRole === 'ADMIN' || userRole === 'admin';
  if (isAdmin) {
    navItems.splice(6, 0, { name: 'Audit Logs', path: '/audit', icon: <FileText size={20} /> });
  }

  return (
    <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img
            src="/sentinel-logo.png"
            alt="SentinelOps Logo"
            className="logo-img pulse-anim"
            style={{ height: '36px', width: '36px', objectFit: 'contain' }}
          />
          <span className="logo-text">SentinelOps</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 1024) toggleSidebar();
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {location.pathname === item.path && (
                  <span
                    className="nav-active-indicator"
                    style={{
                      position: 'absolute',
                      right: 12,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--primary-gold)',
                      boxShadow: '0 0 8px var(--primary-gold)',
                    }}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Developer Credit Footer */}
      <div
        style={{
          padding: 'var(--spacing-2) var(--spacing-3)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          color: 'var(--primary-gold)',
          fontWeight: 600,
        }}
      >
        <span
          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary-gold)', flexShrink: 0 }}
          className="pulse-anim"
        />
        Developed By Shehara
      </div>
    </aside>
  );
};

export default Sidebar;
