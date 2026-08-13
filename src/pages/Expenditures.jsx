import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import '../components/ui/Table.css';
import '../components/ui/Form.css';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../services/api';

const Expenditures = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    baseId: '', equipmentTypeId: '', quantity: '', reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenditures();
    fetchMeta();
  }, []);

  const fetchExpenditures = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/expenditures');
      setExpenditures(res.data);
    } catch (err) {
      toast.error('Failed to fetch expenditures');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [basesRes, eqRes] = await Promise.all([
        api.get('/meta/bases'),
        api.get('/meta/equipment-types')
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      toast.error('Failed to fetch metadata for forms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/expenditures', {
        baseId: parseInt(formData.baseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity),
        reason: formData.reason
      });
      toast.success('Expenditure logged successfully!');
      setShowForm(false);
      setFormData({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });
      fetchExpenditures();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log expenditure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenditures = expenditures.filter(e => 
    (e.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.equipment_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.base_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container animate-fade-in">
      <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2>Expenditures</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus size={18} /> Log Expenditure</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="form-container" 
            style={{ marginBottom: 'var(--spacing-4)', overflow: 'hidden', borderLeft: '4px solid var(--status-danger)' }}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-3)' }}>
            <AlertTriangle size={24} color="var(--status-danger)" />
            <h3 style={{ color: 'var(--status-danger)', margin: 0 }}>Log Expenditure</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
            Warning: Logging an expenditure permanently removes the specified quantity from the base inventory.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <select 
                  className="form-select" 
                  required
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({...formData, equipmentTypeId: e.target.value})}
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" 
                  required 
                  placeholder="Enter quantity expended" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base</label>
                <select 
                  className="form-select" 
                  required
                  value={formData.baseId}
                  onChange={(e) => setFormData({...formData, baseId: e.target.value})}
                >
                  <option value="">Select Base</option>
                  {bases.map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Training, Maintenance" 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={isSubmitting} style={{ backgroundColor: 'rgba(217, 92, 92, 0.1)', color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}>
              {isSubmitting ? 'Logging...' : 'Confirm Expenditure'}
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
              placeholder="Search expenditures..." 
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
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'var(--spacing-5)'}}>Loading expenditures...</td></tr>
            ) : filteredExpenditures.length > 0 ? (
              filteredExpenditures.map((expenditure, i) => (
                <motion.tr 
                  key={expenditure.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td style={{ color: 'var(--status-danger)' }}>EXP-{expenditure.id}</td>
                  <td>{expenditure.base_name}</td>
                  <td>{expenditure.equipment_name}</td>
                  <td style={{ color: 'var(--status-danger)' }}>-{expenditure.quantity.toLocaleString()}</td>
                  <td>{expenditure.reason}</td>
                  <td>{new Date(expenditure.created_at).toLocaleDateString()}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                  No expenditures found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing 1 to {filteredExpenditures.length} of {filteredExpenditures.length} entries</span>
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

export default Expenditures;
