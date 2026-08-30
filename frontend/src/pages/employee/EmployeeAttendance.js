import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { getEmployeeAttendanceHistory, checkIn as apiCheckIn, checkOut as apiCheckOut } from '../../services/api';
import { LogIn, LogOut, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

const EmployeeAttendance = ({ empRecord }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [checkInType, setCheckInType] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const records = await getEmployeeAttendanceHistory(empRecord.id);
      setHistory(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalDateString = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const today = getLocalDateString();
  const todayRecord = history.find(h => h.date === today);

  const handleCheckIn = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await apiCheckIn(empRecord.id, { checkInType, timezone });
      setMessage('Checked in successfully!');
      fetchHistory();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiCheckOut(empRecord.id);
      setMessage('Checked out successfully!');
      fetchHistory();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { 
      header: 'Date', 
      render: (row) => {
        if (!row.date) return '-';
        const parts = row.date.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return row.date;
      }
    },
    { header: 'Check In', render: (row) => row.checkIn ? formatDateTime12h(row.checkIn) : '-' },
    { header: 'Check Out', render: (row) => row.checkOut ? formatDateTime12h(row.checkOut) : '-' },
    { header: 'Status', render: (row) => <Badge text={row.status} /> }
  ];

  // Calculations for monthly summary
  const presentDays = history.filter(h => String(h.status).toLowerCase() === 'present').length;
  const lateDays = history.filter(h => String(h.status).toLowerCase() === 'late entry').length;
  const wfhDays = history.filter(h => String(h.status).toLowerCase() === 'wfh').length;
  const absentDays = history.filter(h => String(h.status).toLowerCase() === 'absent').length;

  const initials = empRecord.name ? empRecord.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {message && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: 'var(--success-bg)', 
            color: 'var(--success-text)', 
            border: '1px solid var(--success)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Buttons Action card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem', justifyContent: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Clock Register</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Register check-ins and check-outs for daily attendance logs</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>Check-in Mode</label>
            <select 
              value={todayRecord ? (String(todayRecord.status || '').toLowerCase() === 'wfh' ? 'wfh' : 'regular') : checkInType} 
              onChange={(e) => setCheckInType(e.target.value)}
              disabled={!!todayRecord?.checkIn}
              style={{ 
                padding: '0.8rem 1rem', 
                fontSize: '0.98rem', 
                borderRadius: '8px', 
                border: '1.5px solid var(--border)', 
                backgroundColor: 'var(--bg)', 
                color: 'var(--text-primary)',
                cursor: !!todayRecord?.checkIn ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Choose the check-in mode</option>
              <option value="regular">Regular Office Check-In</option>
              <option value="wfh">Work From Home (WFH)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <button 
              disabled={!checkInType || !!todayRecord?.checkIn}
              onClick={handleCheckIn}
              className="primary" 
              style={{ flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontSize: '0.98rem' }}
            >
              <LogIn size={16} /> Check In
            </button>
            
            <button 
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
              onClick={handleCheckOut}
              className="secondary" 
              style={{ flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontSize: '0.98rem' }}
            >
              <LogOut size={16} /> Check Out
            </button>

            <button 
              onClick={() => setIsBadgeOpen(true)}
              className="primary" 
              style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontSize: '0.98rem', backgroundColor: 'var(--accent)', color: '#0B1B2B', border: '1px solid var(--accent)' }}
            >
              <QrCode size={16} /> Show Attendance QR Badge
            </button>
          </div>
          
          <div 
            style={{ 
              borderTop: '1px solid var(--border)', 
              paddingTop: '1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem', 
              fontSize: '0.95rem', 
              color: 'var(--text-primary)' 
            }}
          >
            <span>Today Status: <strong style={{ color: 'var(--text-primary)' }}>{todayRecord ? todayRecord.status : 'Not Registered'}</strong></span>
            <span>Check-in Time: <strong style={{ color: 'var(--text-primary)' }}>{todayRecord?.checkIn ? formatDateTime12h(todayRecord.checkIn) : 'None'}</strong></span>
            <span>Check-out Time: <strong style={{ color: 'var(--text-primary)' }}>{todayRecord?.checkOut ? formatDateTime12h(todayRecord.checkOut) : 'None'}</strong></span>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Monthly Attendance Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', backgroundColor: 'var(--bg)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Present Days</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{presentDays}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', backgroundColor: 'var(--bg)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>WFH Days</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{wfhDays}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', backgroundColor: 'var(--bg)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Late Entry Days</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{lateDays}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem', backgroundColor: 'var(--bg)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Absent Days</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{absentDays}</div>
            </div>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Attendance History</h4>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: '1rem' }}>
            Loading history...
          </div>
        ) : (
          <DataTable columns={columns} data={history} />
        )}
      </div>

      {/* Digital QR ID Badge Modal */}
      <Modal isOpen={isBadgeOpen} onClose={() => setIsBadgeOpen(false)} title="My Digital Attendance Badge">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
          
          {/* Badge Layout Card */}
          <div 
            style={{ 
              width: '280px', 
              borderRadius: '12px', 
              border: '3px solid #89E1F7', 
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              background: 'linear-gradient(135deg, #0B1B2B 0%, #1E3A8A 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
              gap: '1rem',
              position: 'relative'
            }}
          >
            {/* Header section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#89E1F7', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                ORBITWORKS
              </span>
              <span style={{ fontWeight: '600', fontSize: '0.7rem', color: '#FFFFFF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                EMPLOYEE ID BADGE
              </span>
            </div>

            {/* Profile Image (Square) */}
            <div 
              style={{ 
                width: '100px', 
                height: '100px', 
                border: '2px solid #89E1F7',
                backgroundColor: '#1E3A8A',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden'
              }}
            >
              {empRecord.profilePic ? (
                <img src={empRecord.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#89E1F7', fontWeight: 'bold', fontSize: '1.75rem' }}>{initials}</span>
              )}
            </div>

            {/* User Details */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{empRecord.name}</strong>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{empRecord.designation}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#89E1F7', textTransform: 'uppercase' }}>
                {empRecord.department}
              </span>
            </div>

            {/* QR Code Container */}
            <div style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRCodeSVG 
                value={`ORBITWORKS_BADGE_${empRecord.id}`} 
                size={100}
                fgColor="#0B1B2B"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>

            {/* Employee ID */}
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94A3B8', fontFamily: 'monospace' }}>
              {empRecord.id}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
            <button type="button" className="primary" onClick={() => setIsBadgeOpen(false)}>Close Badge</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default EmployeeAttendance;
