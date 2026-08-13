import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../components/ui/Table.css';
import '../components/ui/Form.css';

const MOCK_TRANSFERS = [
  { id: 'TRN-001', from: 'Fort Alpha', to: 'Camp Charlie', item: 'M4 Carbine', qty: 50, date: '2026-08-11', status: 'COMPLETED' },
  { id: 'TRN-002', from: 'Fort Bravo', to: 'Fort Alpha', item: '5.56mm Ammo', qty: 5000, date: '2026-08-10', status: 'IN_TRANSIT' },
  { id: 'TRN-003', from: 'Fort Delta', to: 'Fort Bravo', item: 'Humvee', qty: 2, date: '2026-08-09', status: 'PENDING' },
];

import PageWrapper from '../components/layout/PageWrapper';

const Transfers = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });

  useEffect(() => {
    fetchTransfers();
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

  const fetchTransfers = async () => {
    try {
      const res = await api.get('/transfers');
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transfers', {
        sourceBaseId: parseInt(formData.sourceBaseId),
        destinationBaseId: parseInt(formData.destinationBaseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity)
      });
      toast.success('Transfer initiated successfully!');
      setShowForm(false);
      setFormData({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransfers = transfers.filter(t => 
    (t.equipment_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.source_base || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.dest_base || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container animate-fade-in">
      <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2>Transfers</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus size={18} /> Initiate Transfer</>}
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
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: 'var(--spacing-3)' }}>Initiate Transfer</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Source Base</label>
                  <select className="form-select" value={formData.sourceBaseId} onChange={e => setFormData({...formData, sourceBaseId: e.target.value})} required>
                    <option value="">Select Origin</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Destination Base</label>
                  <select className="form-select" value={formData.destinationBaseId} onChange={e => setFormData({...formData, destinationBaseId: e.target.value})} required>
                    <option value="">Select Destination</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Equipment</label>
                  <select className="form-select" value={formData.equipmentTypeId} onChange={e => setFormData({...formData, equipmentTypeId: e.target.value})} required>
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required placeholder="Enter quantity" />
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Executing...' : 'Execute Transfer'}
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
              placeholder="Search transfers..." 
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
              <th>Source</th>
              <th>Destination</th>
              <th>Equipment</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.map((transfer, i) => (
              <motion.tr 
                key={transfer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td style={{ color: 'var(--primary-gold)' }}>TRN-{transfer.id}</td>
                <td>{transfer.source_base}</td>
                <td>{transfer.dest_base}</td>
                <td>{transfer.equipment_name}</td>
                <td>{transfer.quantity.toLocaleString()}</td>
                <td>{new Date(transfer.timestamp).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${transfer.status.toLowerCase()}`}>
                    {transfer.status}
                  </span>
                </td>
              </motion.tr>
            ))}
            {filteredTransfers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                  No transfers found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing 1 to {filteredTransfers.length} of {filteredTransfers.length} entries</span>
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

export default Transfers;
