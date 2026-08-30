import React, { useState } from 'react';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { createHoliday } from '../../services/api';
import { Plus, Calendar, Clock, Star, Landmark } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useToast } from '../../context/ToastContext';

const HolidayCalendar = ({ holidays = [], onRefresh }) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('public');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createHoliday({ name, date, type });
      showToast('Holiday added successfully!');
      setIsModalOpen(false);
      setName('');
      setDate('');
      setType('public');
      onRefresh();
    } catch (err) {
      showToast('Failed to add holiday.', 'error');
      console.error(err);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find next holiday
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextHoliday = upcomingHolidays[0];

  // Calculate days remaining to next holiday
  let daysRemaining = 0;
  if (nextHoliday) {
    const diffTime = new Date(nextHoliday.date) - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const passedHolidaysCount = holidays.filter(h => new Date(h.date) < today).length;
  const remainingHolidaysCount = upcomingHolidays.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Holiday Calendar</h4>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.15rem', fontSize: '0.98rem' }}
        >
          <Plus size={20} /> Add Holiday
        </button>
      </div>

      {/* Countdown Hero Banner */}
      {nextHoliday && (
        <div 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #1E3A8A 100%)', 
            color: '#FFFFFF', 
            borderRadius: '12px', 
            padding: '1.25rem 1.75rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1.25rem',
            border: '1px solid var(--border)',
            boxShadow: '0 6px 20px rgba(137, 225, 247, 0.08)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: '700' }}>
              Upcoming Holiday Countdown
            </span>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', fontFamily: 'Manrope, sans-serif' }}>
              {nextHoliday.name}
            </h3>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>
              {formatDate(nextHoliday.date)} • {nextHoliday.type.toUpperCase()} HOLIDAY
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent)' }}>
              {daysRemaining}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: '600' }}>
              {daysRemaining === 1 ? 'day left' : 'days left'}
            </span>
          </div>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* Stat 1 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Landmark size={14} /> Total Holidays
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--text-primary)' }}>
            {holidays.length} Days
          </span>
        </div>

        {/* Stat 2 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} /> Remaining Holidays
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--text-primary)' }}>
            {remainingHolidaysCount} Days
          </span>
        </div>

        {/* Stat 3 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Star size={14} /> Passed Holidays
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--text-primary)' }}>
            {passedHolidaysCount} Days
          </span>
        </div>

      </div>

      {/* Holiday Grid Section Title */}
      <h5 style={{ margin: '0.5rem 0 -0.5rem 0', fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
        All Holidays
      </h5>

      {/* Holiday Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {holidays.map((h) => (
          <div key={h._id || h.id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.25rem' }}>
            <div 
              style={{ 
                padding: '0.9rem', 
                backgroundColor: 'var(--bg)', 
                borderRadius: '10px', 
                border: '1.5px solid var(--border)', 
                color: 'var(--accent)', 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <Calendar size={22} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '750', color: 'var(--text-primary)' }}>{h.name}</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{formatDate(h.date)}</span>
                <Badge text={h.type} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Holiday Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Holiday">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Holiday Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ padding: '0.7rem', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ padding: '0.7rem', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Type of Holiday</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '0.7rem', fontSize: '0.95rem' }}
            >
              <option value="public">Public</option>
              <option value="company">Company Holiday</option>
              <option value="optional">Optional Leave</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary">Add Holiday</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidayCalendar;
