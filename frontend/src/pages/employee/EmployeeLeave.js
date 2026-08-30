import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import { createLeaveRequest } from '../../services/api';
import { FilePlus } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useToast } from '../../context/ToastContext';

const EmployeeLeave = ({ leaveRequests, empRecord, onRefresh }) => {
  const { showToast } = useToast();
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await createLeaveRequest({
        employeeId: empRecord.id,
        employeeName: empRecord.name,
        type: leaveType,
        leaveType,
        startDate,
        endDate,
        reason
      });
      showToast('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      onRefresh();
    } catch (err) {
      showToast('Failed to submit leave request.', 'error');
      console.error(err);
    }
  };

  const myLeaves = leaveRequests.filter(r => r.employeeId === empRecord.id);

  const columns = [
    { 
      header: 'ID', 
      accessor: 'employeeId' 
    },
    { 
      header: 'Type', 
      render: (row) => row.type || row.leaveType || '-' 
    },
    { 
      header: 'Timeline', 
      render: (row) => `${formatDate(row.startDate)} to ${formatDate(row.endDate)}` 
    },
    { 
      header: 'Reason', 
      accessor: 'reason' 
    },
    { 
      header: 'Status', 
      render: (row) => <Badge text={row.status} /> 
    }
  ];

  return (
    <div className="dashboard-grid" style={{ gap: '2rem' }}>
      
      {/* Apply Form */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Apply for Leave</h4>

        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Leave Type</label>
            <select 
              value={leaveType} 
              onChange={(e) => setLeaveType(e.target.value)}
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="WFH">WFH</option>
              <option value="Permission">Permission</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Start Date</label>
              <input 
                type="date" 
                required 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>End Date</label>
              <input 
                type="date" 
                required 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Reason</label>
            <textarea 
              rows={4} 
              required 
              placeholder="State your reason..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              style={{ padding: '0.8rem 1rem', fontSize: '0.98rem' }}
            />
          </div>

          <button 
            type="submit" 
            className="primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginTop: '0.5rem',
              padding: '0.85rem 1.5rem',
              fontSize: '0.98rem'
            }}
          >
            <FilePlus size={16} /> Submit Request
          </button>
        </form>
      </div>

      {/* History log */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>My Leave Requests</h4>
        <DataTable columns={columns} data={myLeaves} />
      </div>

    </div>
  );
};

export default EmployeeLeave;
