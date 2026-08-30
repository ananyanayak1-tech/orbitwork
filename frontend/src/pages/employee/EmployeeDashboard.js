import React, { useState } from 'react';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { CheckSquare, Calendar, ShieldCheck, Megaphone, CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const formatDateTime12h = (isoString) => {
  if (!isoString) return 'None';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const hoursStr = String(hours).padStart(2, '0');
  
  return `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
};

const EmployeeDashboard = ({ tasks = [], attendance = [], leaveRequests = [], announcements = [], empRecord }) => {
  const myTasks = tasks.filter(t => t.assignedTo.includes(empRecord.id));
  const pendingTasksCount = myTasks.filter(t => (t.status || '').toLowerCase() !== 'completed').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.employeeId === empRecord.id && a.date === today);
  const checkInStatusText = todayAttendance ? (
    <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '0.1rem 0.2rem', fontSize: '0.72rem', lineHeight: '1.2', textAlign: 'left' }}>
      <span style={{ color: 'var(--text-secondary)' }}>In:</span>
      <span>{todayAttendance.checkIn ? formatDateTime12h(todayAttendance.checkIn) : 'None'}</span>
      <span style={{ color: 'var(--text-secondary)' }}>Out:</span>
      <span>{todayAttendance.checkOut ? formatDateTime12h(todayAttendance.checkOut) : 'None'}</span>
    </div>
  ) : 'Not checked in';

  const upcomingDeadlines = myTasks
    .filter(t => (t.status || '').toLowerCase() !== 'completed')
    .sort((a, b) => new Date(a.deadline || a.dueDate) - new Date(b.deadline || b.dueDate))
    .slice(0, 3);

  // Dynamic Activity Timeline
  const recentActivities = [
    { text: todayAttendance ? `Checked in today at ${todayAttendance.checkIn ? formatDateTime12h(todayAttendance.checkIn) : '09:00 AM'}` : 'Attendance pending for today', time: 'Today', type: 'attendance' },
    { text: myTasks.length > 0 ? `Assigned to ${myTasks.length} projects & tasks` : 'No tasks assigned yet', time: '1 day ago', type: 'task' },
    { text: empRecord.phone ? 'Updated profile contact details' : 'Complete profile contact fields', time: '2 days ago', type: 'profile' }
  ];

  // Onboarding Checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Submit Identity Proof Document', done: true },
    { id: 2, text: 'Log first Daily Attendance Check-In', done: !!todayAttendance },
    { id: 3, text: 'Complete Profile emergency contact details', done: !!empRecord.emergencyContact },
    { id: 4, text: 'Fill out skills list in Profile settings', done: !!(empRecord.skills && empRecord.skills.length > 0) },
    { id: 5, text: 'Read the latest Company Announcements', done: announcements.length > 0 }
  ]);

  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Dashboard Overview</h2>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Pending Tasks" value={pendingTasksCount} icon={CheckSquare} />
        <StatCard title="Attendance Status" value={todayAttendance ? todayAttendance.status : 'Absent'} icon={ShieldCheck} description={checkInStatusText} />
        <StatCard title="Leave Requests" value={leaveRequests.filter(r => r.employeeId === empRecord.id && (r.status || '').toLowerCase() === 'pending').length} icon={Calendar} description="Pending Approvals" />
      </div>

      {/* Content Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* Onboarding Checklist */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Onboarding Checklist</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checklist.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleChecklistItem(item.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.9rem', 
                  padding: '0.65rem 0.85rem', 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {item.done ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                ) : (
                  <Circle size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                )}
                <span style={{ 
                  fontSize: '0.98rem', 
                  color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  lineHeight: '1.4'
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>My Activity Timeline</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: '7px', top: '6px', bottom: '6px', width: '2px', backgroundColor: 'var(--border)' }} />
            
            {recentActivities.map((act, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {/* Bullet node */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-22px', 
                    top: '5px', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent)',
                    border: '2px solid var(--surface)'
                  }} 
                />
                <span style={{ fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.4' }}>
                  {act.text}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks & Deadlines */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Upcoming Deadlines</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1.5px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{task.title}</strong>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Project: {task.projectName || 'General'}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                    <Badge text={task.priority} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Due: {task.deadline || task.dueDate ? formatDate(task.deadline || task.dueDate) : 'No deadline'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>No upcoming deadlines. Great job!</span>
            )}
          </div>
        </div>

        {/* Company Announcements Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem', gridColumn: '1 / -1' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Company Announcements</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.slice(0, 3).map((anc) => (
              <div key={anc.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: '1.5px solid var(--border)', paddingBottom: '0.75rem' }}>
                <Megaphone size={18} style={{ color: 'var(--accent)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{anc.title}</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{anc.content.slice(0, 160)}...</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatDate(anc.createdAt || anc.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
