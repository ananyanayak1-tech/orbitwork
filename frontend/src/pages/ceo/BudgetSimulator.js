import React, { useState } from 'react';
import { DollarSign, Landmark, HelpCircle, UserPlus, Calendar } from 'lucide-react';

const BudgetSimulator = () => {
  // Baseline initial state
  const totalFundingPool = 1500000; // $1.5M pool
  const averageSalary = 95000;      // Avg salary of a hire

  const [budgets, setBudgets] = useState({
    engineering: 450000,
    design: 250000,
    marketing: 180000,
    hr: 120000,
    ops: 100000
  });

  const handleSliderChange = (dept, value) => {
    setBudgets(prev => ({
      ...prev,
      [dept]: Number(value)
    }));
  };

  const totalAllocated = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const remainingPool = totalFundingPool - totalAllocated;
  const runwayMonths = totalAllocated > 0 ? parseFloat(((totalFundingPool / totalAllocated) * 12).toFixed(1)) : 99;
  const potentialHires = averageSalary > 0 ? Math.max(0, Math.floor(remainingPool / averageSalary)) : 0;

  const deptsInfo = [
    { key: 'engineering', label: 'Engineering', color: '#4AA9E8' },
    { key: 'design', label: 'Design', color: '#10B981' },
    { key: 'marketing', label: 'Marketing', color: '#F59E0B' },
    { key: 'hr', label: 'HR & Admins', color: '#EC4899' },
    { key: 'ops', label: 'Operations', color: '#8B5CF6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Interactive Budget Simulator</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Simulate division funding allocations, runway impact, and headcount scaling</p>
      </div>

      {/* Widget Grid */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(74, 169, 232, 0.1)', borderRadius: '10px', color: '#4AA9E8' }}>
            <Landmark size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Funding Pool</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              ${totalFundingPool.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10B981' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Simulated Burn Rate</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              ${totalAllocated.toLocaleString()}/yr
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: runwayMonths < 12 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '10px', 
            color: runwayMonths < 12 ? '#EF4444' : '#10B981' 
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Funding Runway</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {runwayMonths} Months
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: '#F59E0B' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Affordable New Hires</span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              +{potentialHires} Employees
            </h3>
          </div>
        </div>

      </div>

      {/* Simulator Layout Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Department Budget Sliders */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Department Allocations</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Adjust division spending lines to simulate team expansions</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {deptsInfo.map((dept) => (
              <div key={dept.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{dept.label}</span>
                  <span style={{ fontWeight: '800', color: 'var(--text-secondary)' }}>
                    ${budgets[dept.key].toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="600000"
                  step="10000"
                  value={budgets[dept.key]}
                  onChange={(e) => handleSliderChange(dept.key, e.target.value)}
                  style={{
                    width: '100%',
                    accentColor: dept.color,
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visual Charts/Bars */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Allocation Weight</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Percentage of total budget currently simulated</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {deptsInfo.map((dept) => {
              const share = totalAllocated > 0 ? ((budgets[dept.key] / totalAllocated) * 100).toFixed(0) : 0;
              return (
                <div key={dept.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{dept.label}</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{share}%</strong>
                  </div>
                  {/* Custom progress bar */}
                  <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div 
                      style={{ 
                        width: `${share}%`, 
                        height: '100%', 
                        backgroundColor: dept.color, 
                        transition: 'width 0.3s ease-out' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allocation Warning / Suggestion */}
          {remainingPool < 0 ? (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid #EF4444', borderRadius: '8px', fontSize: '0.88rem', color: '#EF4444' }}>
              <strong>Caution:</strong> Simulated spending exceeds available funding pool by <strong>${Math.abs(remainingPool).toLocaleString()}</strong>.
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid #10B981', borderRadius: '8px', fontSize: '0.88rem', color: '#10B981' }}>
              <strong>Healthy:</strong> You have <strong>${remainingPool.toLocaleString()}</strong> in backup funding pool.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BudgetSimulator;
