import React from 'react';
import StatCard from '../../components/StatCard';
import { Users, Clock, CalendarDays, Gift, UserPlus, Sparkles } from 'lucide-react';
import { formatAllDatesInText, formatDate } from '../../utils/dateFormatter';

const HrDashboard = ({ employees = [], attendance = [], leaveRequests = [] }) => {
  const employeeCount = employees.length;
  
  const todayAttendanceCount = attendance.filter(
    a => {
      const status = (a.status || '').toLowerCase();
      return status === 'present' || status === 'late entry' || status === 'wfh';
    }
  ).length;

  const pendingLeaves = leaveRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length;

  // Dynamic Upcoming Anniversaries
  const upcomingAnniversaries = employees
    .map(emp => {
      if (!emp.joiningDate) return null;
      const joinDate = new Date(emp.joiningDate);
      if (isNaN(joinDate.getTime())) return null;
      const today = new Date();
      let years = today.getFullYear() - joinDate.getFullYear();
      if (years <= 0) years = 1; // default fallback if joined this year

      return {
        name: emp.name,
        years,
        joinedDate: emp.joiningDate,
        monthDay: `${joinDate.toLocaleString('default', { month: 'long' })} ${String(joinDate.getDate()).padStart(2, '0')}`
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Dashboard Overview</h2>
      <div className="stat-grid">
        <StatCard title="Employee Count" value={employeeCount} icon={Users} />
        <StatCard title="Today Attendance" value={`${todayAttendanceCount}/${employeeCount}`} icon={Clock} description="Present / WFH / Late Entry" />
        <StatCard title="Pending Leaves" value={pendingLeaves} icon={CalendarDays} description="Awaiting Approvals" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Birthdays */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.18rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Upcoming Birthdays</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <Gift size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>Vikram Singh</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>August 12</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.1rem' }}>
              <Gift size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>Pooja Sharma</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>September 05</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Anniversaries */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.18rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Work Anniversaries</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {upcomingAnniversaries.length > 0 ? (
              upcomingAnniversaries.map((ann, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.85rem', 
                    paddingBottom: '0.75rem', 
                    borderBottom: idx === upcomingAnniversaries.length - 1 ? 'none' : '1px solid var(--border)' 
                  }}
                >
                  <Sparkles size={20} style={{ color: 'var(--warning)' }} />
                  <div>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>{ann.name}</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Celebrating {ann.years} {ann.years === 1 ? 'Year' : 'Years'} • Joined {formatDate(ann.joinedDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>No upcoming anniversaries</span>
            )}
          </div>
        </div>

        {/* New Joiners */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.18rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>New Joiners</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <UserPlus size={20} style={{ color: 'var(--success)' }} />
              <div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>Vikram Singh</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatAllDatesInText('Frontend Developer • Joined 2025-01-15')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.1rem' }}>
              <UserPlus size={20} style={{ color: 'var(--success)' }} />
              <div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>Priya Iyer</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatAllDatesInText('UI/UX Designer • Joined 2024-11-20')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
