import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { createWorkLog, getWorkLogs } from '../../services/api';
import DataTable from '../../components/DataTable';
import { formatDate } from '../../utils/dateFormatter';

const DailyWorkLog = () => {
  const { showToast } = useToast();
  const [todayWork, setTodayWork] = useState('');
  const [hours, setHours] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkLogs = async () => {
    setLoading(true);
    try {
      const data = await getWorkLogs();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch work logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await createWorkLog({
        todayWork,
        hours: Number(hours),
        challenges,
        tomorrowPlan
      });
      showToast('Daily work log submitted successfully!');
      setTodayWork('');
      setHours('');
      setChallenges('');
      setTomorrowPlan('');
      fetchWorkLogs();
    } catch (err) {
      showToast('Failed to submit work log.', 'error');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { 
      header: 'Date', 
      render: (row) => row.date ? formatDate(row.date) : '-'
    },
    { header: 'Work Completed', accessor: 'todayWork' },
    { header: 'Hours', render: (row) => `${row.hours} hrs` },
    { header: 'Challenges', render: (row) => row.challenges || 'None' },
    { header: 'Plan for Tomorrow', accessor: 'tomorrowPlan' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div 
        className="card" 
        style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}
      >
        <div>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Submit Daily Work Log</h4>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            Log your daily contributions, hours worked, and roadblocks faced
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>What did you work on today?</label>
            <textarea 
              rows={4} 
              required 
              placeholder="Describe today's tasks..." 
              value={todayWork} 
              onChange={(e) => setTodayWork(e.target.value)} 
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Hours worked</label>
            <input 
              type="number" 
              step="0.5" 
              required 
              min="1" 
              max="24" 
              placeholder="e.g. 8" 
              value={hours} 
              onChange={(e) => setHours(e.target.value)} 
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Challenges or roadblocks faced (optional)</label>
            <textarea 
              rows={3} 
              placeholder="Describe any issues encountered..." 
              value={challenges} 
              onChange={(e) => setChallenges(e.target.value)} 
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>What is your plan for tomorrow?</label>
            <textarea 
              rows={3} 
              required 
              placeholder="Describe planned tasks..." 
              value={tomorrowPlan} 
              onChange={(e) => setTomorrowPlan(e.target.value)} 
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="primary" disabled={uploading} style={{ padding: '0.75rem 1.35rem', fontSize: '0.98rem' }}>
              {uploading ? 'Submitting...' : 'Submit Work Log'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>My Work Log History</h4>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: '1rem' }}>
            Loading work logs...
          </div>
        ) : (
          <DataTable columns={columns} data={history} />
        )}
      </div>
    </div>
  );
};

export default DailyWorkLog;
