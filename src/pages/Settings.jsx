import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Bell, Key, Database, Lock, ChevronRight, Check } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import '../components/ui/Table.css';
import '../components/ui/Form.css';

const SettingSection = ({ title, icon, children }) => (
  <motion.div
    className="glass"
    style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 260 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: 'var(--spacing-2)', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ color: 'var(--primary-gold)' }}>{icon}</span>
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{title}</h3>
    </div>
    {children}
  </motion.div>
);

const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
      {description && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{description}</span>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? 'var(--primary-gold)' : 'var(--bg-surface)',
        border: `1px solid ${checked ? 'var(--primary-gold)' : 'rgba(255,255,255,0.1)'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2, width: 18, height: 18,
        borderRadius: '50%', background: checked ? 'var(--bg-main)' : 'var(--text-secondary)',
        transition: 'left 0.2s',
      }} />
    </button>
  </div>
);

const Settings = () => {
  let username = 'admin';
  let role = 'ADMIN';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role || 'ADMIN';
    }
  } catch (e) {}

  const roleLabel = role === 'ADMIN' ? 'System Administrator' : role === 'BASE_COMMANDER' ? 'Base Commander' : role;

  const [settings, setSettings] = useState({
    emailAlerts: true,
    auditLogging: true,
    twoFactor: false,
    autoRefresh: true,
    darkMode: true,
  });

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`Setting updated`);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPw.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast.success('Password changed successfully');
    }, 1000);
  };

  return (
    <PageWrapper>
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ color: 'var(--primary-gold)', margin: 0 }}>System Settings</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Configure system preferences and security options
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-3)' }}>

          {/* Profile Section */}
          <SettingSection title="Account Profile" icon={<User size={18} />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--dark-gold), var(--primary-gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: 700, color: 'var(--bg-main)',
                flexShrink: 0
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{username}</span>
                <span style={{ color: 'var(--primary-gold)', fontSize: '0.8rem', fontWeight: 500 }}>{roleLabel}</span>
                <span style={{ color: 'var(--status-success)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block' }} />
                  Active Session
                </span>
              </div>
            </div>
          </SettingSection>

          {/* Security */}
          <SettingSection title="Security" icon={<Lock size={18} />}>
            <ToggleSwitch
              label="Two-Factor Authentication"
              description="Require OTP on login"
              checked={settings.twoFactor}
              onChange={() => toggleSetting('twoFactor')}
            />
            <ToggleSwitch
              label="Audit Logging"
              description="Record all user actions"
              checked={settings.auditLogging}
              onChange={() => toggleSetting('auditLogging')}
            />
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications" icon={<Bell size={18} />}>
            <ToggleSwitch
              label="Email Alerts"
              description="Send alerts for critical events"
              checked={settings.emailAlerts}
              onChange={() => toggleSetting('emailAlerts')}
            />
            <ToggleSwitch
              label="Auto Refresh Dashboard"
              description="Refresh metrics every 30 seconds"
              checked={settings.autoRefresh}
              onChange={() => toggleSetting('autoRefresh')}
            />
          </SettingSection>

          {/* System Info */}
          <SettingSection title="System Information" icon={<Database size={18} />}>
            {[
              { label: 'System', value: 'SentinelOps v1.0' },
              { label: 'Database', value: 'PostgreSQL (Supabase)' },
              { label: 'Backend', value: 'Node.js + Express' },
              { label: 'Environment', value: 'Production' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </SettingSection>
        </div>

        {/* Change Password */}
        <SettingSection title="Change Password" icon={<Key size={18} />}>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-2)' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="Current password" value={pwForm.current}
                  onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="New password" value={pwForm.newPw}
                  onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="Confirm new password" value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={pwLoading} style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 24px' }}>
              {pwLoading ? 'Updating...' : <><Check size={16} /> Update Password</>}
            </button>
          </form>
        </SettingSection>
      </div>
    </PageWrapper>
  );
};

export default Settings;
