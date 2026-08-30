import React, { useState } from 'react';
import { updateEmployee } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserCheck, ArrowRight, CheckCircle2, AlertCircle, Laptop, ShieldCheck, Mail } from 'lucide-react';

const OnboardingTracker = ({ employees = [], onRefresh }) => {
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  // Define onboarding stages
  const stages = [
    { key: 'newly_hired', label: 'Newly Hired', color: '#8B5CF6' },
    { key: 'documents', label: 'Document Review', color: '#F59E0B' },
    { key: 'it_setup', label: 'IT & Accounts Setup', color: '#4AA9E8' },
    { key: 'completed', label: 'Completed', color: '#10B981' }
  ];

  // Helper to map employee to an onboarding stage
  const getEmployeeStage = (emp) => {
    if (emp.onboardingStage) return emp.onboardingStage;
    
    // Fallback logic for seeded employees
    if (emp.documents && emp.documents.length > 0 && emp.assets && emp.assets.length > 0) {
      return 'completed';
    }
    if (emp.assets && emp.assets.length > 0) {
      return 'it_setup';
    }
    return 'newly_hired';
  };

  const handleAdvanceStage = async (emp, currentStage) => {
    const stageKeys = stages.map(s => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stageKeys.length - 1) return;

    const nextStage = stageKeys[currentIndex + 1];
    setUpdatingId(emp.id);

    try {
      await updateEmployee(emp.id, { onboardingStage: nextStage });
      showToast(`${emp.name} advanced to ${stages[currentIndex + 1].label}!`);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast('Failed to update onboarding stage.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderChecklist = (emp, stage) => {
    const items = {
      newly_hired: [
        { label: 'Create employee profile in system', done: true },
        { label: 'Issue initial welcome email package', done: emp.joiningDate ? true : false }
      ],
      documents: [
        { label: 'Verify personal ID & Address proof', done: (emp.documents || []).some(d => d.type === 'id_proof') },
        { label: 'Verify academic & experience certs', done: (emp.documents || []).some(d => d.type === 'experience_letter') }
      ],
      it_setup: [
        { label: 'Configure official corporate email', done: emp.email ? true : false },
        { label: 'Allocate primary IT asset laptop', done: (emp.assets || []).length > 0 }
      ],
      completed: [
        { label: 'All onboarding tasks completed', done: true }
      ]
    };

    const stageItems = items[stage] || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
        {stageItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ color: item.done ? '#10B981' : 'var(--text-secondary)' }}>
              {item.done ? '✓' : '○'}
            </span>
            <span style={{ color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: item.done && stage === 'completed' ? 'line-through' : 'none' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Onboarding Roadmap</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Verify documents, configure IT systems, and complete new joiner onboarding</p>
      </div>

      {/* Board Layout */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {stages.map((stage) => {
          // Filter employees belonging to this onboarding stage, excluding CEO
          const stageEmployees = employees.filter(e => 
            getEmployeeStage(e) === stage.key && 
            !e.designation.toLowerCase().includes('ceo') && 
            !e.role?.toLowerCase().includes('ceo')
          );

          return (
            <div 
              key={stage.key} 
              className="card" 
              style={{ 
                padding: '1.25rem', 
                backgroundColor: 'var(--card-bg, #ffffff)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                minHeight: '400px'
              }}
            >
              {/* Stage Title Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2.5px solid ${stage.color}`, paddingBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{stage.label}</strong>
                <span 
                  style={{ 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {stageEmployees.length}
                </span>
              </div>

              {/* Employee Cards list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stageEmployees.length > 0 ? (
                  stageEmployees.map((emp) => (
                    <div 
                      key={emp.id}
                      style={{ 
                        padding: '1rem', 
                        border: '1.5px solid var(--border)', 
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{emp.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{emp.id}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{emp.designation}</span>

                      {/* Checklist */}
                      {renderChecklist(emp, stage.key)}

                      {/* Advancement Trigger */}
                      {stage.key !== 'completed' && (
                        <button 
                          disabled={updatingId === emp.id}
                          onClick={() => handleAdvanceStage(emp, stage.key)}
                          className="secondary"
                          style={{ 
                            padding: '0.35rem', 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.3rem',
                            marginTop: '0.5rem',
                            width: '100%',
                            color: '#1D70B8',
                            borderColor: '#1D70B8'
                          }}
                        >
                          {updatingId === emp.id ? 'Advancing...' : (
                            <>
                              Next Stage <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No employees in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OnboardingTracker;
