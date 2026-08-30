import React, { useState, useEffect } from 'react';
import { getWellnessLogs, createWellnessLog } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Heart, Send, Calendar, Smile, Brain, Coffee, Meh, Frown, Compass, AlertCircle } from 'lucide-react';

const WellnessCheckIn = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [score, setScore] = useState(8);
  const [mood, setMood] = useState('Happy');
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const clean = dateStr.replace(/[^0-9]/g, ' ').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  const moodsList = [
    { mood: 'Happy', icon: Smile, score: 9, color: '#10B981', tip: 'Fantastic! Keep up the great energy and share some positive vibes with the team today.' },
    { mood: 'Focused', icon: Brain, score: 8, color: '#4AA9E8', tip: 'You are in the zone. Great time to tackle deep-focus tasks. Remember to blink and stretch!' },
    { mood: 'Tired', icon: Coffee, score: 5, color: '#F59E0B', tip: 'Take a step back. Stand up, stretch, or grab a glass of water. A 10-minute break can recharge you.' },
    { mood: 'Stressed', icon: Meh, score: 4, color: '#8B5CF6', tip: 'Take 5 deep breaths. Breathe in for 4s, hold for 4s, exhale for 4s. Your task reminders have been quieted.' },
    { mood: 'Overwhelmed', icon: Frown, score: 2, color: '#EF4444', tip: 'Please talk to your manager or HR Pooja Sharma about your workload. Your mental well-being is our highest priority.' }
  ];

  const fetchLogs = async () => {
    try {
      const data = await getWellnessLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load wellness history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleMoodSelect = (item) => {
    setMood(item.mood);
    setScore(item.score);
  };

  const activeMoodInfo = moodsList.find(m => m.mood === mood) || moodsList[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createWellnessLog({
        score,
        mood,
        energy,
        note
      });
      showToast('Mood check-in saved. Stay healthy!');
      setNote('');
      fetchLogs();
    } catch (err) {
      console.error(err);
      showToast('Failed to save mood log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>AI Wellness Check-In</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Check in daily to track your work-life balance and receive AI wellness guidance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Check-In Form */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="#1D70B8" /> Today's Check-In
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>How are you feeling at work today?</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Mood Emojis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select your Mood</label>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                {moodsList.map((item) => (
                  <button
                    key={item.mood}
                    type="button"
                    onClick={() => handleMoodSelect(item)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      border: mood === item.mood ? `2px solid ${item.color}` : '1.5px solid var(--border)',
                      backgroundColor: mood === item.mood ? `${item.color}08` : 'var(--bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'transform 0.15s, border-color 0.15s'
                    }}
                  >
                    <item.icon size={18} color={mood === item.mood ? item.color : 'var(--text-secondary)'} />
                    <strong style={{ fontSize: '0.88rem', color: mood === item.mood ? item.color : 'var(--text-primary)' }}>{item.mood}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Energy Level</span>
                  <strong>{energy}/10</strong>
                </label>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  style={{ accentColor: '#1D70B8', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wellness Index</span>
                  <strong>{score}/10</strong>
                </label>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  style={{ accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>

            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Log Details / Notes (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write down any notes about your workload, physical health, or stress levels today..."
                rows="3"
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.92rem', resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="primary" 
              disabled={submitting}
              style={{ padding: '0.75rem', fontSize: '0.95rem', backgroundColor: '#1D70B8', borderColor: '#1D70B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Send size={16} /> {submitting ? 'Saving...' : 'Submit Wellness Log'}
            </button>

          </form>
        </div>

        {/* Dynamic Coach Tips Card */}
        <div 
          className="card" 
          style={{ 
            padding: '1.75rem', 
            borderLeft: `5px solid ${activeMoodInfo.color}`,
            backgroundColor: 'var(--card-bg, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: activeMoodInfo.color, textTransform: 'uppercase', display: 'block' }}>
              AI Wellness Recommendation
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
              Feeling {mood} Today
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <Compass size={20} color={activeMoodInfo.color} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
              {activeMoodInfo.tip}
            </p>
          </div>
        </div>

      </div>

      {/* Wellness log history grid */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="#1D70B8" /> Wellness Log History
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Review your health trend logs over the past week</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            Loading history logs...
          </div>
        ) : logs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {logs.map((log) => {
              const moodInfo = moodsList.find(m => m.mood === log.mood) || moodsList[0];
              return (
                <div 
                  key={log._id} 
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: '1.5px solid var(--border)', 
                    backgroundColor: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <moodInfo.icon size={16} color={moodInfo.color} />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{log.mood}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{formatDate(log.date)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span>Energy: <strong>{log.energy}/10</strong></span>
                    <span>Wellness: <strong>{log.score}/10</strong></span>
                  </div>

                  {log.note && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
                      "{log.note}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No wellness check-ins found. Submit your check-in above to start logging!
          </div>
        )}
      </div>

    </div>
  );
};

export default WellnessCheckIn;
