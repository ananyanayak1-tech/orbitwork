import React, { useState, useEffect } from 'react';
import { getKudos, createKudos, getEmployees } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HeartHandshake, Send, MessageSquare, Handshake, Lightbulb, Crown, Palette } from 'lucide-react';

const KudosWall = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [kudosLogs, setKudosLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

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

  // Form states
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('Collaboration');

  const badgeCategories = [
    { key: 'Collaboration', label: 'Collaboration', icon: Handshake, color: '#1D70B8' },
    { key: 'Helpful', label: 'Awesome Help', icon: Lightbulb, color: '#10B981' },
    { key: 'Leadership', label: 'Leadership', icon: Crown, color: '#F59E0B' },
    { key: 'Creativity', label: 'Creativity', icon: Palette, color: '#8B5CF6' }
  ];

  const fetchKudosData = async () => {
    try {
      const [k, e] = await Promise.all([
        getKudos(),
        getEmployees()
      ]);
      setKudosLogs(k);
      // Exclude logged in user from colleagues select list
      setEmployees(e.filter(emp => emp.email.toLowerCase() !== user.email.toLowerCase()));
    } catch (err) {
      console.error(err);
      showToast('Failed to load peer appreciation kudos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKudosData();
  }, []);

  const handlePostKudos = async (e) => {
    e.preventDefault();
    if (!recipient || !message.trim()) {
      showToast('Please select a colleague and write a message.', 'error');
      return;
    }

    // Get selected employee record
    const matchEmp = employees.find(emp => emp.id === recipient);
    if (!matchEmp) return;

    setPosting(true);
    try {
      await createKudos({
        recipientId: matchEmp.id || matchEmp._id,
        recipientName: matchEmp.name,
        message,
        badge
      });
      showToast('Kudos card posted to wall!');
      setMessage('');
      setRecipient('');
      fetchKudosData();
    } catch (err) {
      console.error(err);
      showToast('Failed to post kudos card.', 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Teammate Kudos Wall</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Send public appreciations to your colleagues and celebrate helpful achievements</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Post Appreciation Card Form */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartHandshake size={20} color="#1D70B8" /> Send Appreciation
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Acknowledge a peer's contribution publicly</p>
          </div>

          <form onSubmit={handlePostKudos} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Colleague Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select Colleague</label>
              <select 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.92rem' }}
              >
                <option value="">-- Choose Teammate --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                ))}
              </select>
            </div>

            {/* Badge Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select Kudos Badge</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {badgeCategories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setBadge(cat.key)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: badge === cat.key ? `2px solid ${cat.color}` : '1.5px solid var(--border)',
                      backgroundColor: badge === cat.key ? `${cat.color}08` : 'var(--bg)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: badge === cat.key ? cat.color : 'var(--text-primary)',
                      transition: 'border-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <cat.icon size={14} color={badge === cat.key ? cat.color : 'var(--text-secondary)'} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Appreciation Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what they did and thank them..."
                rows="4"
                required
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.92rem', resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="primary" 
              disabled={posting || !recipient || !message.trim()}
              style={{ padding: '0.75rem', fontSize: '0.95rem', backgroundColor: '#1D70B8', borderColor: '#1D70B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Send size={16} /> {posting ? 'Sending...' : 'Post Kudos Card'}
            </button>

          </form>
        </div>

        {/* Public Appreciation Wall Cards Feed */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="#1D70B8" /> Appreciation Board Feed
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Read peer-to-peer appreciations posted by teammates</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
              Loading appreciations...
            </div>
          ) : kudosLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {kudosLogs.map((item) => {
                const catInfo = badgeCategories.find(c => c.key === item.badge) || badgeCategories[0];
                return (
                  <div 
                    key={item._id}
                    style={{
                      padding: '1.25rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.senderName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}> appreciated </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.recipientName}</strong>
                      </div>
                      
                      <span 
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: `${catInfo.color}12`,
                          color: catInfo.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <catInfo.icon size={13} color={catInfo.color} />
                        {catInfo.label}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.45', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{item.message}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {formatDate(item.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              The kudos wall is empty. Be the first to appreciate a colleague!
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default KudosWall;
