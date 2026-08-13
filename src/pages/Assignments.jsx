import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../services/api';
import '../components/ui/Table.css';
import '../components/ui/Form.css';

const Assignments = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    baseId: '', equipmentTypeId: '', quantity: '', personnelName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchMeta();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/assignments');
      setAssignments(res.data);
    } catch (err) {
      toast.error('Failed to fetch assignments');
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
      await api.post('/assignments', {
        baseId: parseInt(formData.baseId),
        equipmentTypeId: parseInt(formData.equipmentTypeId),
        quantity: parseInt(formData.quantity),
        personnelName: formData.personnelName
      });
      toast.success('Assignment created successfully!');
      setShowForm(false);
      setFormData({ baseId: '', equipmentTypeId: '', quantity: '', personnelName: '' });
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    (a.personnel_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.equipment_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.base_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="page-container animate-fade-in">
      <div className="dashboard-header mb-4" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2>Assignments</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus size={18} /> New Assignment</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="form-container" 
            style={{ marginBottom: 'var(--spacing-4)', overflow: 'hidden' }}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: 'var(--spacing-3)' }}>Assign Equipment to Personnel</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Personnel Name / ID</label>
                <input type="text" className="form-input" required placeholder="e.g. Sgt. John Doe" value={formData.personnelName} onChange={e => setFormData({...formData, personnelName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Base</label>
                <select className="form-select" required value={formData.baseId} onChange={e => setFormData({...formData, baseId: e.target.value})}>
                  <option value="">Select Base</option>
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <select className="form-select" required value={formData.equipmentTypeId} onChange={e => setFormData({...formData, equipmentTypeId: e.target.value})}>
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" className="form-input" min="1" required placeholder="Enter quantity" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Equipment'}
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
              placeholder="Search assignments..." 
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
              <th>Personnel</th>
              <th>Base</th>
              <th>Equipment</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'var(--spacing-5)'}}>Loading assignments...</td></tr>
            ) : filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment, i) => (
                <motion.tr 
                  key={assignment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td style={{ color: 'var(--primary-gold)' }}>ASN-{assignment.id}</td>
                  <td>{assignment.personnel_name}</td>
                  <td>{assignment.base_name}</td>
                  <td>{assignment.equipment_name}</td>
                  <td>{assignment.quantity.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${assignment.status === 'ACTIVE' ? 'pending' : 'completed'}`}>
                      {assignment.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-5)' }}>
                  No assignments found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing 1 to {filteredAssignments.length} of {filteredAssignments.length} entries</span>
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

export default Assignments;
