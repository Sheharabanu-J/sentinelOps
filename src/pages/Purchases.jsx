import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../components/ui/Table.css';
import '../components/ui/Form.css';

const MOCK_PURCHASES = [
  { id: 'PUR-001', base: 'Fort Alpha', item: 'M4 Carbine', qty: 500, date: '2026-08-10', status: 'COMPLETED' },
  { id: 'PUR-002', base: 'Fort Bravo', item: '5.56mm Ammo', qty: 25000, date: '2026-08-09', status: 'COMPLETED' },
  { id: 'PUR-003', base: 'Camp Charlie', item: 'Humvee', qty: 12, date: '2026-08-08', status: 'PENDING' },
  { id: 'PUR-004', base: 'Fort Delta', item: 'Night Vision Goggles', qty: 150, date: '2026-08-05', status: 'COMPLETED' },
];

import PageWrapper from '../components/layout/PageWrapper';

const Purchases = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ baseId: '', equipmentTypeId: '', quantity: '' });

  useEffect(() => {
    fetchPurchases();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const [basesRes, eqRes] = await Promise.all([
        api.get('/meta/bases'),
        api.get('/meta/equipment-types')
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      toast.error('Failed to fetch metadata');
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/purchases');
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/purchases', {
        baseId: parseInt(formData.baseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity)
      });
      toast.success('Purchase logged successfully!');
      setShowForm(false);
      setFormData({ baseId: '', equipmentTypeId: '', quantity: '' });
      fetchPurchases();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    (p.equipment_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.base_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container animate-fade-in">
      <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2>Purchases</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus size={18} /> New Purchase</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="form-container" style={{ marginBottom: 'var(--spacing-4)', overflow: 'hidden' }}
          >
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: 'var(--spacing-3)' }}>Log New Purchase</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base</label>
                  <select className="form-select" value={formData.baseId} onChange={e => setFormData({...formData, baseId: e.target.value})} required>
                    <option value="">Select Base</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Equipment Type</label>
                  <select className="form-select" value={formData.equipmentTypeId} onChange={e => setFormData({...formData, equipmentTypeId: e.target.value})} required>
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required placeholder="Enter quantity" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date (Auto)</label>
                  <input type="text" className="form-input" value={new Date().toISOString().split('T')[0]} disabled />
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Purchase'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="table-container">
        <div className="table-header-controls">
          <div className="search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search purchases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="icon-button" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <Filter size={18} /> <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>Filter</span>
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Base</th>
              <th>Equipment</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase, i) => (
              <motion.tr 
                key={purchase.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td style={{ color: 'var(--primary-gold)' }}>PUR-{purchase.id}</td>
                <td>{purchase.base_name}</td>
                <td>{purchase.equipment_name}</td>
                <td>{purchase.quantity.toLocaleString()}</td>
                <td>{new Date(purchase.created_at).toLocaleDateString()}</td>
                <td>
                  <span className="status-badge completed">
                    COMPLETED
                  </span>
                </td>
              </motion.tr>
            ))}
            {filteredPurchases.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                  No purchases found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination mock */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing 1 to {filteredPurchases.length} of {filteredPurchases.length} entries</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="icon-button" disabled><ChevronLeft size={18} /></button>
            <button className="icon-button" disabled><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
};

export default Purchases;
