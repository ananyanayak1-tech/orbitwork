import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { updateEmployee } from '../../services/api';
import { Edit2, Eye, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useToast } from '../../context/ToastContext';

const EmployeeRecords = ({ employees, onRefresh }) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const downloadBadge = (emp) => {
    if (!emp) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    // 1. Draw Background
    const grad = ctx.createLinearGradient(0, 0, 0, 480);
    grad.addColorStop(0, '#0B1B2B');
    grad.addColorStop(1, '#1E3A8A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 320, 480);

    // 2. Draw Border accent
    ctx.strokeStyle = '#89E1F7';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 300, 460);

    // 3. Header Text
    ctx.fillStyle = '#89E1F7';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ORBITWORKS', 160, 45);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.fillText('EMPLOYEE ID BADGE', 160, 65);

    const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

    // 4. Draw Profile Image
    const drawProfile = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(160, 150, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (emp.profilePic) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 110, 100, 100, 100);
          drawDetailsAndQR();
        };
        img.src = emp.profilePic;
      } else {
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(110, 100, 100, 100);
        ctx.fillStyle = '#89E1F7';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(initials, 160, 160);
        drawDetailsAndQR();
      }
      ctx.restore();
    };

    // 5. Draw Details & QR Code
    const drawDetailsAndQR = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(emp.name, 160, 230);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px sans-serif';
      ctx.fillText(emp.designation, 160, 250);

      ctx.fillStyle = '#89E1F7';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(emp.department.toUpperCase(), 160, 270);

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(110, 300, 100, 100);
        ctx.drawImage(qrImg, 115, 305, 90, 90);

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(emp.id, 160, 425);

        const link = document.createElement('a');
        link.download = `${emp.name.replace(/\s+/g, '_')}_ID_Badge.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=ORBITWORKS_BADGE_${emp.id}`;
    };

    drawProfile();
  };

  // Search filters
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');

  // Form edit fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [skills, setSkills] = useState('');

  const openViewProfile = (emp) => {
    setSelectedEmp(emp);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setDepartment(emp.department);
    setDesignation(emp.designation);
    setPhone(emp.phone);
    setEmergencyContact(emp.emergencyContact);
    setJoiningDate(emp.joiningDate ? emp.joiningDate.split('T')[0] : '');
    setSkills(emp.skills ? emp.skills.join(', ') : '');
    setIsEditModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const updatedData = {
      name,
      department,
      designation,
      phone,
      emergencyContact,
      joiningDate,
      skills: skillsArray
    };

    try {
      await updateEmployee(selectedEmp.id, updatedData);
      showToast('Employee records updated successfully', 'success');
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update employee records', 'error');
    }
  };

  const columns = [
    { header: 'Id', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Joining date', accessor: 'joiningDate' },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button 
            onClick={() => openViewProfile(row)} 
            className="secondary" 
            style={{ padding: '0.5rem 0.6rem', display: 'flex', alignItems: 'center' }}
            title="view records"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => openEditModal(row)} 
            className="secondary" 
            style={{ padding: '0.5rem 0.6rem', display: 'flex', alignItems: 'center' }}
            title="edit records"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const filteredEmployees = employees.filter(emp => {
    if (String(emp.designation || '').toLowerCase() === 'ceo') {
      return false;
    }
    const matchesName = !searchName || String(emp.name || '').toLowerCase().includes(searchName.toLowerCase());
    const matchesDept = !searchDept || String(emp.department || '').toLowerCase().includes(searchDept.toLowerCase());
    return matchesName && matchesDept;
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.75rem' }}>
      <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Employee records management</h4>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Search by Name</label>
          <input 
            type="text" 
            placeholder="Search by Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Search by Department</label>
          <input 
            type="text" 
            placeholder="Search by Department..."
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
            style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredEmployees} />

      {/* View Detailed Record modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detailed employee records">
        {selectedEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textTransform: 'lowercase' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent)', 
                    color: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold', 
                    fontSize: '1.25rem',
                    overflow: 'hidden',
                    border: '2px solid var(--accent)'
                  }}
                >
                  {selectedEmp.profilePic ? (
                    <img src={selectedEmp.profilePic} alt={selectedEmp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedEmp.name ? selectedEmp.name[0].toLowerCase() : '?'
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>{selectedEmp.name}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedEmp.designation} • {selectedEmp.department}</p>
                </div>
              </div>

              {/* QR and Download button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=ORBITWORKS_BADGE_${selectedEmp.id}`} 
                  alt="QR Badge"
                  style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: '#FFFFFF' }}
                />
                <button 
                  onClick={() => downloadBadge(selectedEmp)}
                  className="primary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', backgroundColor: 'var(--accent)', color: '#0B1B2B', border: '1px solid var(--accent)' }}
                >
                  Get Badge
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <strong>employee ID:</strong>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{selectedEmp.id}</p>
              </div>
              <div>
                <strong>contact:</strong>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{selectedEmp.phone}</p>
              </div>
              <div>
                <strong>emergency contact:</strong>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{selectedEmp.emergencyContact}</p>
              </div>
              <div>
                <strong>joining date:</strong>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{formatDate(selectedEmp.joiningDate)}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>skills & qualifications:</strong>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {selectedEmp.skills && selectedEmp.skills.map((skill, idx) => (
                  <span key={idx} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>employee documents:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {selectedEmp.documents && selectedEmp.documents.length > 0 ? (
                  selectedEmp.documents.map((doc, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '0.8rem', 
                        padding: '0.4rem', 
                        border: '1px solid var(--border)', 
                        borderRadius: '4px', 
                        backgroundColor: 'var(--bg)' 
                      }}
                    >
                      <FileText size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ flex: 1 }}>{doc.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{doc.type} • {doc.uploadDate}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>no documents uploaded</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Record Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee Records">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                <option value="" disabled hidden>Choose the Department</option>
                <option value="Management">Management</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>Designation</label>
              <input type="text" required value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>Phone Number</label>
              <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>Joining Date</label>
              <input type="date" required value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Emergency Contact Details</label>
            <input type="text" required value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Skills</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeRecords;
