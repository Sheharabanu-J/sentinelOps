import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Settings, FileText } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../services/api';
import '../components/ui/Table.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.base_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container">
        <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
          <h2>Asset Inventory</h2>
        </div>

        <div className="toolbar" style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
          <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by ID, asset or base..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
            />
          </div>
          <button className="btn-secondary" onClick={fetchAssets}>
            <Filter size={18} /> Refresh
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'var(--spacing-5)'}}>Loading assets...</td></tr>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset, i) => (
                  <motion.tr 
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ color: 'var(--primary-gold)' }}>{asset.id}</td>
                    <td>{asset.base_name}</td>
                    <td>{asset.equipment_name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.quantity.toLocaleString()}</td>
                    <td>
                      <span className="status-badge active">
                        ACTIVE
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="View details"><FileText size={16} /></button>
                        <button className="action-btn" title="Manage asset"><Settings size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                    No assets found matching "{searchTerm}"
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

export default Assets;
