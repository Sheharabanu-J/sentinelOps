import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Package, ShieldAlert, X, RefreshCw, 
  Building2, Activity, ShieldCheck, Zap, Layers 
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import './Dashboard.css';

const COLORS = ['#D4AF37', '#F5D76E', '#9C7C1E', '#E8A83E', '#4CAF7A', '#D95C5C'];

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBaseFilter, setSelectedBaseFilter] = useState('ALL');
  const [metrics, setMetrics] = useState({
    openingBalance: 0, purchases: 0, transfersIn: 0, transfersOut: 0,
    netMovement: 0, assigned: 0, expended: 0, closingBalance: 0
  });
  const [chartData, setChartData] = useState({
    inventoryData: [],
    movementData: [],
    baseComparisonData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/assets/metrics');
      if (res.data.metrics) setMetrics(res.data.metrics);
      if (res.data.chartData) setChartData(res.data.chartData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Base Comparison detailed data calculations
  const baseComparison = chartData.baseComparisonData.length > 0 
    ? chartData.baseComparisonData 
    : [
        { name: 'Fort Alpha', stock: 120, assigned: 45, expended: 12, readiness: 94 },
        { name: 'Fort Bravo', stock: 85, assigned: 30, expended: 8, readiness: 88 },
        { name: 'Camp Charlie', stock: 65, assigned: 20, expended: 5, readiness: 91 }
      ];

  const filteredBaseData = selectedBaseFilter === 'ALL'
    ? baseComparison
    : baseComparison.filter(b => b.name === selectedBaseFilter);

  return (
    <PageWrapper>
      <div className="dashboard">
        
        {/* Animated Header */}
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h2>Operational Overview</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Real-time military asset inventory & combat readiness analytics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.button 
              className="btn-secondary" 
              onClick={fetchDashboardData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} className={isLoading ? 'pulse-anim' : ''} /> Refresh
            </motion.button>
            <div className="date-filter glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--primary-gold)' }}>
              <span>Live System</span>
            </div>
          </div>
        </motion.div>

        {/* Core KPI Grid with Spring Hover Animations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="metrics-grid grid grid-cols-4">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }} className="metric-card glass" whileHover={{ y: -6, scale: 1.02, rotateX: 3, boxShadow: '0 16px 32px rgba(212, 175, 55, 0.2)' }}>
            <div className="metric-header">
              <span className="metric-title">Opening Balance</span>
              <Package size={18} className="metric-icon" />
            </div>
            <div className="metric-value">
              {isLoading ? '—' : <AnimatedCounter value={metrics.openingBalance} />}
            </div>
            <div className="metric-subtitle">Initial stock reserve</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
            className="metric-card glass clickable net-movement"
            onClick={() => setIsModalOpen(true)}
            whileHover={{ y: -6, scale: 1.03, rotateX: 3, boxShadow: '0 16px 36px rgba(76, 175, 122, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="metric-header">
              <span className="metric-title">Net Movement</span>
              <ArrowUpRight size={18} className="metric-icon success" />
            </div>
            <div className="metric-value success">
              {isLoading ? '—' : <AnimatedCounter value={metrics.netMovement} prefix="+" />}
            </div>
            <div className="metric-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Click for detail breakdown</span> <Zap size={12} color="var(--primary-gold)" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }} className="metric-card glass" whileHover={{ y: -6, scale: 1.02, rotateX: 3, boxShadow: '0 16px 32px rgba(232, 168, 62, 0.2)' }}>
            <div className="metric-header">
              <span className="metric-title">Assigned Personnel</span>
              <ArrowDownRight size={18} className="metric-icon warning" />
            </div>
            <div className="metric-value">
              {isLoading ? '—' : <AnimatedCounter value={metrics.assigned} />}
            </div>
            <div className="metric-subtitle">Active equipment deployed</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }} className="metric-card glass" whileHover={{ y: -6, scale: 1.02, rotateX: 3, boxShadow: '0 16px 32px rgba(217, 92, 92, 0.2)' }}>
            <div className="metric-header">
              <span className="metric-title">Expended Items</span>
              <ShieldAlert size={18} className="metric-icon danger" />
            </div>
            <div className="metric-value danger">
              {isLoading ? '—' : <AnimatedCounter value={metrics.expended} prefix="-" />}
            </div>
            <div className="metric-subtitle">Consumed / Decommissioned</div>
          </motion.div>
        </motion.div>

        {/* Closing Balance Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
          className="closing-balance-banner glass"
          whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(212, 175, 55, 0.35)' }}
        >
          <div className="banner-content">
            <h3>Total Closing Inventory Balance</h3>
            <div className="banner-value">
              {isLoading ? '—' : <AnimatedCounter value={metrics.closingBalance} />}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              Verified System Balance across all operational sector bases
            </span>
          </div>
        </motion.div>
        
        {/* Animated Charts Section */}
        <div className="charts-grid grid grid-cols-2">
          
          {/* Inventory Distribution Pie */}
          <motion.div 
            className="chart-card glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary-gold)" /> Inventory Distribution
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By Type</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.inventoryData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={chartData.inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
                  </PieChart>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No inventory records present
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Movement Trend Area */}
          <motion.div 
            className="chart-card glass"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--status-success)" /> Net Movement Trend
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inflow vs Outflow</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.movementData}>
                  <defs>
                    <linearGradient id="moveIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="moveOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-danger)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--status-danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
                  <Area type="monotone" dataKey="in" stroke="var(--status-success)" strokeWidth={2} fill="url(#moveIn)" name="Stock Added (+)" />
                  <Area type="monotone" dataKey="out" stroke="var(--status-danger)" strokeWidth={2} fill="url(#moveOut)" name="Stock Out (-)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ADVANCED ANIMATED BASE COMPARISON MODULE */}
          <motion.div 
            className="chart-card glass col-span-2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
              <div>
                <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-gold)' }}>
                  <Building2 size={20} /> Military Base Comparison Dashboard
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Comparative inventory holdings, active assignments & base combat readiness index
                </span>
              </div>
              
              {/* Interactive Base Filter Selector */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {['ALL', ...baseComparison.map(b => b.name)].map((baseName) => (
                  <button
                    key={baseName}
                    onClick={() => setSelectedBaseFilter(baseName)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: selectedBaseFilter === baseName ? 'var(--primary-gold)' : 'transparent',
                      color: selectedBaseFilter === baseName ? 'var(--bg-main)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {baseName}
                  </button>
                ))}
              </div>
            </div>

            {/* Base Comparison Visual Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-3)', margin: '16px 0' }}>
              {filteredBaseData.map((base, idx) => (
                <motion.div
                  key={base.name}
                  className="glass"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -3, background: 'rgba(212, 175, 55, 0.05)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{base.name}</span>
                    <span className="status-badge active" style={{ fontSize: '0.75rem' }}>
                      <ShieldCheck size={12} /> {base.readiness || 92}% Ready
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Holdings</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-gold)' }}>
                        {(base.stock || base.value || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-warning)' }}>
                        {(base.assigned || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Readiness Bar */}
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Readiness Index</span>
                      <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{base.readiness || 92}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary-gold), var(--status-success))', borderRadius: '3px' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${base.readiness || 92}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Base Stock Bar Chart */}
            <div className="chart-container" style={{ height: '280px', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredBaseData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
                  <Bar dataKey="stock" name="Total Equipment Stock" fill="var(--primary-gold)" radius={[6, 6, 0, 0]}>
                    {filteredBaseData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Net Movement Modal with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div 
                className="modal-content glass"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Net Movement Breakdown</h3>
                  <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="breakdown-item">
                    <span>Purchases (+)</span>
                    <span className="value">+{metrics.purchases.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Transfers In (+)</span>
                    <span className="value success">+{metrics.transfersIn.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Transfers Out (-)</span>
                    <span className="value danger">-{metrics.transfersOut.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-divider"></div>
                  <div className="breakdown-item total">
                    <span>Total Net Movement</span>
                    <span className="value success">+{metrics.netMovement.toLocaleString()}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
};

export default Dashboard;
