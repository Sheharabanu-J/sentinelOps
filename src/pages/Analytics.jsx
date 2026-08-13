import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import api from '../services/api';
import '../components/ui/Table.css';

const COLORS = ['#D4AF37', '#F5D76E', '#9C7C1E', '#E8A83E', '#4CAF7A', '#D95C5C', '#64a0ff'];

const Analytics = () => {
  const [metrics, setMetrics] = useState({ purchases: 0, transfersIn: 0, transfersOut: 0, assigned: 0, expended: 0, closingBalance: 0 });
  const [chartData, setChartData] = useState({ inventoryData: [], movementData: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  const summaryData = [
    { label: 'Total Purchased', value: metrics.purchases, color: 'var(--status-success)', icon: <TrendingUp size={20} />, trend: '+12.5%' },
    { label: 'Transfers In', value: metrics.transfersIn, color: '#64a0ff', icon: <Activity size={20} />, trend: '+5.2%' },
    { label: 'Transfers Out', value: metrics.transfersOut, color: 'var(--status-warning)', icon: <TrendingDown size={20} />, trend: '-3.1%' },
    { label: 'Expended', value: metrics.expended, color: 'var(--status-danger)', icon: <BarChart2 size={20} />, trend: '-8.7%' },
  ];

  const efficiencyData = [
    { name: 'Purchased', value: metrics.purchases },
    { name: 'Assigned', value: metrics.assigned },
    { name: 'Expended', value: metrics.expended },
    { name: 'Available', value: Math.max(0, metrics.closingBalance) },
  ].filter(d => d.value > 0);

  const movementTrend = chartData.movementData.length > 0 ? chartData.movementData : [
    { name: 'Week 1', in: 0, out: 0 },
    { name: 'Week 2', in: metrics.purchases + metrics.transfersIn, out: metrics.transfersOut },
  ];

  return (
    <PageWrapper>
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="dashboard-header" style={{ marginBottom: 0 }}>
            <h2 style={{ color: 'var(--primary-gold)', margin: 0 }}>Advanced Analytics</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Live operational intelligence dashboard
            </span>
          </div>
        </motion.div>

        {/* Summary KPI Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
          {summaryData.map((item, idx) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 260 }}
              className="glass"
              style={{
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: `4px solid ${item.color}`,
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.label}
                </span>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isLoading ? '—' : <AnimatedCounter value={item.value} />}
              </div>
              <div style={{ fontSize: '0.8rem', color: item.trend.startsWith('+') ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 600 }}>
                {item.trend} from last period
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
          <motion.div className="glass" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 'var(--spacing-3)', margin: 0, marginBottom: 16 }}>
              Asset Allocation Breakdown
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                {efficiencyData.length > 0 ? (
                  <PieChart>
                    <Pie data={efficiencyData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} />
                  </PieChart>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No data yet — log purchases or assignments
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="glass" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, marginBottom: 16 }}>
              Movement Trend (In vs Out)
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementTrend}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-danger)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--status-danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} />
                  <Area type="monotone" dataKey="in" stroke="var(--status-success)" strokeWidth={2} fill="url(#colorIn)" name="Inflow" />
                  <Area type="monotone" dataKey="out" stroke="var(--status-danger)" strokeWidth={2} fill="url(#colorOut)" name="Outflow" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Inventory by type bar chart */}
        {chartData.inventoryData.length > 0 && (
          <motion.div className="glass" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, marginBottom: 16 }}>
              Current Inventory by Equipment Type
            </h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.inventoryData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" fill="var(--primary-gold)" radius={[4, 4, 0, 0]} name="Units">
                    {chartData.inventoryData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Analytics;
