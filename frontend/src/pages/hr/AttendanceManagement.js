import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { getAttendance, markAttendanceManually } from '../../services/api';
import { Calendar, QrCode, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5Qrcode } from 'html5-qrcode';

const formatTimeForInput = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  }
  return timeStr.slice(0, 5);
};

const AttendanceManagement = ({ employees = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGateScannerOpen, setIsGateScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanSuccess, setScanSuccess] = useState(null); // true / false / null
  const [scanHistory, setScanHistory] = useState([]);

  const fetchAttendance = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const records = await getAttendance(selectedDate);
      setAttendance(records);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // HTML5 QR Code Scanner Lifecycle for the Gate Scanner Tablet
  useEffect(() => {
    if (!isGateScannerOpen) return;

    let scanner = null;
    const containerId = "gate-scanner-container";

    const timer = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          containerId,
          { 
            fps: 10, 
            qrbox: { width: 220, height: 220 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
          },
          /* verbose= */ false
        );

        const onScanSuccess = async (decodedText) => {
          // Process scanned key badge
          if (decodedText.startsWith('ORBITWORKS_BADGE_')) {
            const empId = decodedText.replace('ORBITWORKS_BADGE_', '');
            handleScanGateCheckIn(empId);
          } else {
            setScanSuccess(false);
            setScanMessage(`Invalid badge scan: "${decodedText}"`);
            setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
          }
        };

        const onScanFailure = () => {
          // Silent failure on scanning empty frames
        };

        scanner.render(onScanSuccess, onScanFailure);
      } catch (err) {
        console.error("Gate scanner initialization error:", err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(err => console.error("Gate scanner clear on unmount error:", err));
      }
    };
  }, [isGateScannerOpen]);

  const handleScanGateCheckIn = async (empId) => {
    const targetEmp = employees.find(e => e.id === empId);
    if (!targetEmp) {
      setScanSuccess(false);
      setScanMessage(`Employee ID ${empId} not found in directory.`);
      setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const existing = attendance.find(a => a.employeeId === empId && a.date === todayStr);
    const nowTime = new Date().toTimeString().slice(0, 5); // "HH:MM"

    let actionType = 'checked in';
    let data = {
      employeeId: empId,
      date: todayStr,
      status: 'present',
      checkIn: existing ? (existing.checkIn || nowTime) : nowTime,
      checkOut: ''
    };

    // If already checked in but hasn't checked out, trigger checkout
    if (existing && existing.checkIn) {
      data.checkOut = nowTime;
      actionType = 'checked out';
    }

    try {
      await markAttendanceManually(data);
      setScanSuccess(true);
      setScanMessage(`Access Granted: ${targetEmp.name} ${actionType} at ${nowTime}`);
      
      // Update scan history log
      const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setScanHistory(prev => [
        { name: targetEmp.name, action: actionType, time: logTime, designation: targetEmp.designation },
        ...prev.slice(0, 3)
      ]);

      fetchAttendance();
      setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
    } catch (err) {
      console.error(err);
      setScanSuccess(false);
      setScanMessage(`Failed to log gate attendance for ${targetEmp.name}`);
      setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
    }
  };

  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanMessage("Decoding badge file...");
    setScanSuccess(null);

    try {
      const tempReaderId = "qr-temp-file-reader";
      let tempDiv = document.getElementById(tempReaderId);
      if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = tempReaderId;
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
      }
      
      const html5QrCode = new Html5Qrcode(tempReaderId);
      const decodedText = await html5QrCode.scanFile(file, true);
      
      if (decodedText.startsWith('ORBITWORKS_BADGE_')) {
        const empId = decodedText.replace('ORBITWORKS_BADGE_', '');
        handleScanGateCheckIn(empId);
      } else {
        setScanSuccess(false);
        setScanMessage(`Invalid QR code inside file: "${decodedText}"`);
        setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
      }
    } catch (err) {
      console.error("Failed to decode QR code file:", err);
      setScanSuccess(false);
      setScanMessage("No scannable QR Code found in this file.");
      setTimeout(() => { setScanMessage(''); setScanSuccess(null); }, 4000);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleMark = async (empId, status) => {
    let checkIn = '';
    let checkOut = '';

    if (status === 'present' || status === 'wfh') {
      checkIn = '09:00';
      checkOut = '17:00';
    } else if (status === 'late entry') {
      checkIn = '11:00';
      checkOut = '17:00';
    } else if (status === 'half day') {
      checkIn = '09:00';
      checkOut = '13:00';
    } else if (status === 'absent' || status === 'leave') {
      checkIn = '';
      checkOut = '';
    }

    // Optimistic UI update
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.employeeId === empId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], status, checkIn, checkOut };
        return copy;
      } else {
        return [...prev, { employeeId: empId, date: selectedDate, status, checkIn, checkOut }];
      }
    });

    const data = {
      employeeId: empId,
      date: selectedDate,
      status,
      checkIn,
      checkOut
    };
    try {
      await markAttendanceManually(data);
      fetchAttendance(false);
    } catch (err) {
      console.error(err);
      fetchAttendance(false);
    }
  };

  const handleTimeChange = async (empId, field, val) => {
    const existing = attendance.find(a => a.employeeId === empId);
    const status = existing?.status || 'present';
    const checkIn = field === 'checkIn' ? val : (existing?.checkIn || '09:00');
    const checkOut = field === 'checkOut' ? val : (existing?.checkOut || '17:00');

    // Optimistic UI update
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.employeeId === empId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], checkIn, checkOut };
        return copy;
      } else {
        return [...prev, { employeeId: empId, date: selectedDate, status, checkIn, checkOut }];
      }
    });

    const data = {
      employeeId: empId,
      date: selectedDate,
      status,
      checkIn,
      checkOut
    };
    try {
      await markAttendanceManually(data);
      fetchAttendance(false);
    } catch (err) {
      console.error(err);
      fetchAttendance(false);
    }
  };

  const tableData = employees.map(emp => {
    const record = attendance.find(a => a.employeeId === emp.id);
    return {
      empId: emp.id,
      name: emp.name,
      status: (record?.status || 'absent').toLowerCase(),
      checkIn: formatTimeForInput(record?.checkIn),
      checkOut: formatTimeForInput(record?.checkOut)
    };
  });

  const columns = [
    { header: 'Id', accessor: 'empId' },
    { header: 'Employee', accessor: 'name' },
    {
      header: 'Status',
      render: (row) => (
        <select 
          value={row.status} 
          onChange={(e) => handleMark(row.empId, e.target.value)}
          style={{ fontSize: '0.95rem', padding: '0.5rem 0.75rem' }}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late entry">Late entry</option>
          <option value="half day">Half day</option>
          <option value="wfh">WFH</option>
          <option value="leave">Leave</option>
        </select>
      )
    },
    {
      header: 'Check in',
      render: (row) => (
        <input 
          type="time" 
          value={row.checkIn} 
          onChange={(e) => handleTimeChange(row.empId, 'checkIn', e.target.value)}
          disabled={row.status === 'absent' || row.status === 'leave'}
          style={{ padding: '0.5rem 0.7rem', fontSize: '0.95rem' }}
        />
      )
    },
    {
      header: 'Check out',
      render: (row) => (
        <input 
          type="time" 
          value={row.checkOut} 
          onChange={(e) => handleTimeChange(row.empId, 'checkOut', e.target.value)}
          disabled={row.status === 'absent' || row.status === 'leave'}
          style={{ padding: '0.5rem 0.7rem', fontSize: '0.95rem' }}
        />
      )
    },
    {
      header: 'Badge',
      render: (row) => <Badge text={row.status} />
    }
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.75rem' }}>
      
      {/* Action Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Attendance Tracking System</h4>
          <span style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Manage daily register logs manually or launch the front gate scanner tablet</span>
        </div>

        <button 
          onClick={() => setIsGateScannerOpen(true)}
          className="primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.15rem', fontSize: '0.98rem', backgroundColor: 'var(--accent)', color: '#0B1B2B', border: '1px solid var(--accent)' }}
        >
          <QrCode size={20} /> Launch Office Gate Scanner
        </button>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem' 
        }}
      >
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Manual attendance register</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginRight: '3rem' }}>
          <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem', fontSize: '0.98rem' }}>
          Loading attendance logs...
        </div>
      ) : (
        <DataTable columns={columns} data={tableData} searchKey="name" searchPlaceholder="Search employees..." />
      )}

      {/* Front-Desk Gate Scanner Modal */}
      <Modal isOpen={isGateScannerOpen} onClose={() => setIsGateScannerOpen(false)} title="Office Entrance Gate Scanner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            Tablet Scanner Mode: Employees show their phone ID Badges to this camera to log attendance.
          </p>

          {/* Real-time Status Alert Banner */}
          {scanMessage && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                backgroundColor: scanSuccess ? 'var(--success-bg)' : 'var(--danger-bg)', 
                color: scanSuccess ? 'var(--success-text)' : 'var(--danger-text)', 
                border: `1px solid ${scanSuccess ? 'var(--success)' : 'var(--danger)'}`, 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {scanSuccess ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
              <strong>{scanMessage}</strong>
            </div>
          )}

          {/* Camera Scanner Box */}
          <div 
            id="gate-scanner-container" 
            style={{ 
              width: '100%', 
              maxWidth: '350px', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              border: '1px solid var(--border)',
              backgroundColor: '#000000'
            }} 
          />

          {/* File Upload Scanner */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <label 
              htmlFor="qr-file-upload" 
              className="secondary button"
              style={{ 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.6rem 1.25rem', 
                fontSize: '0.9rem',
                backgroundColor: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                color: '#0B1B2B',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(137, 225, 247, 0.15)'
              }}
            >
              Upload & Scan ID Badge File
            </label>
            <input 
              type="file" 
              id="qr-file-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileScan} 
            />
          </div>

          {/* Live History Logs */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Scanning Log
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '60px' }}>
              {scanHistory.length > 0 ? (
                scanHistory.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.2rem 0', borderBottom: idx === scanHistory.length - 1 ? 'none' : '1px dotted var(--border)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {item.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.75rem' }}>({item.designation})</span>
                    </span>
                    <span style={{ color: item.action === 'checked in' ? 'var(--success)' : 'var(--text-primary)', fontWeight: '700' }}>
                      {item.action.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.time}</span>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 'auto' }}>
                  No scans logged in this session
                </span>
              )}
            </div>
          </div>


          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '0.5rem' }}>
            <button type="button" className="primary" onClick={() => setIsGateScannerOpen(false)}>Close Scanner</button>
          </div>

        </div>
      </Modal>

    </div>
  );
};

export default AttendanceManagement;
