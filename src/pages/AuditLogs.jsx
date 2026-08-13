import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Activity, Calendar, User, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../services/api';
import '../components/ui/Table.css';

const getActionColor = (action) => {
  switch(action) {
    case 'LOGIN': return 'success';
    case 'PURCHASE': return 'pending';
    case 'TRANSFER': return 'warning';
    case 'EXPENDITURE': return 'danger';
    case 'ASSIGNMENT': return 'info';
    default: return 'active';
  }
};

const getActionIcon = (action) => {
  switch(action) {
    case 'LOGIN': return <User size={14} />;
    case 'PURCHASE': return <Activity size={14} />;
    case 'EXPENDITURE': return <ShieldAlert size={14} />;
    default: return <Calendar size={14} />;
  }
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
          <h2>System Audit Logs</h2>
        </div>
        
        <div className="toolbar" style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
          <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by action, user or details..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
            />
          </div>
          <button className="btn-secondary" onClick={fetchLogs}>
            <Filter size={18} /> Refresh
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Role</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign:'center', padding:'var(--spacing-5)'}}>Loading audit logs...</td></tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getActionIcon(log.action)}
                        <span className={`status-badge ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td>{log.username || 'System'}</td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        {log.role || 'N/A'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{log.details}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                    No logs found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AuditLogs;
