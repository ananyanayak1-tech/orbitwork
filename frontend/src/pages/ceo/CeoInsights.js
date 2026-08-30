import React, { useState, useEffect } from 'react';
import { getCeoInsights } from '../../services/api';
import { AlertTriangle, Award, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CeoInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchInsightsData = async () => {
    try {
      const data = await getCeoInsights();
      setInsights(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch AI insights.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-secondary)' }}>
        Analyzing team productivity patterns...
      </div>
    );
  }

  const { burnoutAlerts = [], overallStats = {}, leaderboard = [] } = insights || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>AI Team Insights</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Real-time workload alerts and productivity patterns</p>
      </div>

      {/* Stats row */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(74, 169, 232, 0.1)', borderRadius: '10px', color: '#4AA9E8' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Overall Task Completion</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {overallStats.completionRate || 0}%
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10B981' }}>
            <Zap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Task Completion Speed</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {overallStats.avgDaysToComplete || 0} Days
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: burnoutAlerts.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '10px', 
            color: burnoutAlerts.length > 0 ? '#EF4444' : '#10B981' 
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Burnout Risks</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {burnoutAlerts.length} Alerts
            </h3>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Burnout risk alerts */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={20} color="#EF4444" /> AI Workload & Burnout Alerts
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Identified using task counts, priority levels, and work hour analysis</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {burnoutAlerts.length > 0 ? (
              burnoutAlerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '1.25rem', 
                    border: '1.5px solid var(--border)', 
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{alert.name}</h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{alert.designation} ({alert.employeeId})</span>
                    </div>
                    <span 
                      style={{ 
                        padding: '0.25rem 0.65rem', 
                        borderRadius: '20px', 
                        fontSize: '0.78rem', 
                        fontWeight: '700',
                        backgroundColor: alert.riskLevel === 'Critical' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: alert.riskLevel === 'Critical' ? '#EF4444' : '#F59E0B'
                      }}
                    >
                      {alert.riskLevel} Load
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.88rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Active Tasks: <strong style={{ color: 'var(--text-primary)' }}>{alert.activeTasksCount}</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      High/Critical: <strong style={{ color: '#EF4444' }}>{alert.highPriorityCount}</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Average Hours: <strong style={{ color: 'var(--text-primary)' }}>{alert.avgHours}h/day</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #EF4444' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Risk Factors</span>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {alert.reasons.map((r, rIdx) => <li key={rIdx}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={36} color="#10B981" />
                <span style={{ fontSize: '0.95rem' }}>All employees currently show stable and balanced workloads.</span>
              </div>
            )}
          </div>
        </div>

        {/* Productivity Leaderboard */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={20} color="#F59E0B" /> Productivity Leaders
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Top employees by task completion velocity</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {leaderboard.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  paddingBottom: idx < leaderboard.length - 1 ? '1.25rem' : 0,
                  borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: idx === 0 ? '#FEF3C7' : idx === 1 ? '#E2E8F0' : '#E5E7EB',
                  color: idx === 0 ? '#D97706' : idx === 1 ? '#475569' : '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.9rem'
                }}>
                  #{idx + 1}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.designation} ({item.id})</span>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>{item.completed} Tasks</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.ratio}% Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CeoInsights;
