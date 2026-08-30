import React, { useState, useEffect } from 'react';
import { getOkrs, createOkr, updateOkr } from '../../services/api';
import { Target, CheckSquare, Plus, PlusCircle, Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const OkrTracker = ({ onNavigate }) => {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Create OKR Modal states
  const [showModal, setShowModal] = useState(false);
  const [objective, setObjective] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [targetTime, setTargetTime] = useState('Q3 2026');
  const [krInputs, setKrInputs] = useState(['', '']);

  const fetchOkrsData = async () => {
    try {
      const data = await getOkrs();
      setOkrs(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch OKRs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOkrsData();
  }, []);

  const handleCreateOkr = async (e) => {
    e.preventDefault();
    if (!objective.trim()) {
      showToast('Objective name cannot be empty.', 'error');
      return;
    }

    const filteredKrs = krInputs.filter(k => k.trim() !== '');
    if (filteredKrs.length === 0) {
      showToast('Please add at least one Key Result.', 'error');
      return;
    }

    try {
      await createOkr({
        objective,
        department,
        target: targetTime,
        keyResults: filteredKrs
      });
      showToast('Strategic OKR added successfully!');
      setObjective('');
      setKrInputs(['', '']);
      setShowModal(false);
      fetchOkrsData();
    } catch (err) {
      console.error(err);
      showToast('Failed to create OKR.', 'error');
    }
  };

  const handleKrProgressChange = async (okr, krIdx, newProgress) => {
    const updatedKrs = [...okr.keyResults];
    updatedKrs[krIdx] = {
      ...updatedKrs[krIdx],
      progress: Number(newProgress)
    };

    // Recalculate Objective overall progress as average of KRs
    const avgProgress = Math.round(
      updatedKrs.reduce((sum, kr) => sum + kr.progress, 0) / updatedKrs.length
    );

    try {
      await updateOkr(okr._id, {
        progress: avgProgress,
        keyResults: updatedKrs
      });
      fetchOkrsData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update Key Result progress.', 'error');
    }
  };

  const handleAddKrInput = () => {
    setKrInputs(prev => [...prev, '']);
  };

  const handleKrInputChange = (idx, val) => {
    const next = [...krInputs];
    next[idx] = val;
    setKrInputs(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back button */}
      {onNavigate && (
        <button 
          onClick={() => onNavigate('dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: '700',
            padding: 0,
            width: 'fit-content',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#1D70B8'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Company Strategy & OKRs</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Establish Objectives and track Key Results progress across quarters</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.15rem' }}
        >
          <Plus size={18} /> New Objective
        </button>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-secondary)' }}>
          Loading corporate objectives...
        </div>
      ) : (
        <div className="dashboard-grid">
          {okrs.length > 0 ? (
            okrs.map((okr) => (
              <div 
                key={okr._id} 
                className="card" 
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* OKR Header Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.65rem', backgroundColor: 'rgba(29, 112, 184, 0.1)', borderRadius: '10px', color: '#1D70B8', display: 'flex', alignItems: 'center' }}>
                      <Target size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{okr.objective}</h4>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={14} /> {okr.department}
                        </span>
                        <span>• Target: {okr.target}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall progress ring indicator */}
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{okr.progress}%</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Overall Progress</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div 
                    style={{ 
                      width: `${okr.progress}%`, 
                      height: '100%', 
                      backgroundColor: '#1D70B8', 
                      transition: 'width 0.3s ease-out' 
                    }} 
                  />
                </div>

                {/* Key Results list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Results</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {okr.keyResults.map((kr, idx) => (
                      <div 
                        key={idx}
                        style={{ 
                          padding: '1rem', 
                          border: '1.5px solid var(--border)', 
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          backgroundColor: 'var(--bg)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <CheckSquare size={16} color="var(--text-secondary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>{kr.text}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={kr.progress}
                            onChange={(e) => handleKrProgressChange(okr, idx, e.target.value)}
                            style={{ flex: 1, accentColor: '#1D70B8', cursor: 'pointer', height: '4px' }}
                          />
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', minWidth: '35px', textAlign: 'right' }}>
                            {kr.progress}%
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Target size={48} style={{ color: 'var(--border)' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>No OKRs configured for this quarter yet.</span>
            </div>
          )}
        </div>
      )}

      {/* New Objective Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s' }}>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.35rem', color: 'var(--text-primary)' }}>Create Strategic Objective</h3>
            
            <form onSubmit={handleCreateOkr} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Objective Title</label>
                <input 
                  type="text" 
                  value={objective} 
                  onChange={(e) => setObjective(e.target.value)} 
                  placeholder="e.g. Expand OrbitWorks design system"
                  required
                  style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Department</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR & Admin">HR & Admin</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Target Quarter</label>
                  <input 
                    type="text" 
                    value={targetTime} 
                    onChange={(e) => setTargetTime(e.target.value)} 
                    placeholder="Q3 2026"
                    required
                    style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Key Results 
                  <button 
                    type="button" 
                    onClick={handleAddKrInput}
                    style={{ background: 'none', border: 'none', color: '#1D70B8', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                  >
                    <PlusCircle size={14} /> Add KR
                  </button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.3rem' }}>
                  {krInputs.map((kr, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      value={kr} 
                      onChange={(e) => handleKrInputChange(idx, e.target.value)} 
                      placeholder={`Key Result #${idx + 1}`}
                      required={idx === 0}
                      style={{ padding: '0.6rem 0.9rem', fontSize: '0.9rem' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="secondary"
                  style={{ flex: 1, padding: '0.75rem 1rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary" 
                  style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: '#1D70B8', borderColor: '#1D70B8' }}
                >
                  Create OKR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OkrTracker;
