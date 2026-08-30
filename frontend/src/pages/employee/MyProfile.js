import React, { useState } from 'react';
import { updateEmployee } from '../../services/api';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { CheckCircle2, Edit3, Mail, Phone, ShieldAlert, Calendar, User, Briefcase, Laptop, Target } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const MyProfile = ({ empRecord, onRefresh }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(empRecord.name);
  const [phone, setPhone] = useState(empRecord.phone);
  const [emergencyContact, setEmergencyContact] = useState(empRecord.emergencyContact);
  const [skills, setSkills] = useState(empRecord.skills ? empRecord.skills.join(', ') : '');
  const [profilePic, setProfilePic] = useState(empRecord.profilePic || '');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (empRecord) {
      setName(empRecord.name || '');
      setPhone(empRecord.phone || '');
      setEmergencyContact(empRecord.emergencyContact || '');
      setSkills(empRecord.skills ? empRecord.skills.join(', ') : '');
      setProfilePic(empRecord.profilePic || '');
    }
  }, [empRecord]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await updateEmployee(empRecord.id, {
        name,
        phone,
        emergencyContact,
        skills: skillsArray,
        profilePic
      });
      setMessage('Profile updated successfully');
      onRefresh();
      setIsEditModalOpen(false);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const downloadBadge = () => {
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

    // 4. Draw Profile Image
    const drawProfile = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(160, 150, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (empRecord.profilePic) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 110, 100, 100, 100);
          drawDetailsAndQR();
        };
        img.src = empRecord.profilePic;
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
      ctx.fillText(empRecord.name, 160, 230);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px sans-serif';
      ctx.fillText(empRecord.designation, 160, 250);

      ctx.fillStyle = '#89E1F7';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(empRecord.department.toUpperCase(), 160, 270);

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(110, 300, 100, 100);
        ctx.drawImage(qrImg, 115, 305, 90, 90);

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(empRecord.id, 160, 425);

        const link = document.createElement('a');
        link.download = `${empRecord.name.replace(/\s+/g, '_')}_ID_Badge.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=ORBITWORKS_BADGE_${empRecord.id}`;
    };

    drawProfile();
  };

  const initials = empRecord.name ? empRecord.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  // Mock OKR Goals
  const mockOKRs = [
    { title: 'Complete React & Node.js Sprint Task onboarding', progress: 100 },
    { title: 'Resolve 15+ high priority helpdesk tickets', progress: 60 },
    { title: 'Deliver UI mockup proposals for new projects', progress: 25 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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
            fontSize: '0.85rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
        
        {/* Profile Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Avatar / Picture Circle */}
            <div 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary) 0%, #1A365D 100%)', 
                color: 'var(--accent)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold', 
                fontSize: '2rem',
                border: '3px solid var(--accent)',
                boxShadow: '0 4px 14px rgba(137, 225, 247, 0.2)',
                overflow: 'hidden'
              }}
            >
              {empRecord.profilePic ? (
                <img src={empRecord.profilePic} alt={empRecord.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{empRecord.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={14} style={{ color: 'var(--accent)' }} />
                <span>{empRecord.designation}</span>
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <Badge text={empRecord.department} />
                <Badge text={empRecord.status} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div 
              style={{ 
                border: '1.5px solid var(--card-border)', 
                borderRadius: '12px', 
                padding: '0.6rem', 
                backgroundColor: 'var(--surface)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.35rem',
                boxShadow: 'var(--card-shadow)',
                width: '110px'
              }}
            >
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=ORBITWORKS_BADGE_${empRecord.id}`} 
                alt="Gate Pass QR" 
                style={{ width: '90px', height: '90px', borderRadius: '4px' }}
              />
            </div>

            <button 
              onClick={downloadBadge} 
              className="primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', width: '110px', justifyContent: 'center', backgroundColor: 'var(--accent)', color: '#0B1B2B', border: '1px solid var(--accent)', padding: '0.5rem' }}
            >
              Get ID Badge
            </button>

            <button 
              onClick={() => {
                setName(empRecord.name);
                setPhone(empRecord.phone);
                setEmergencyContact(empRecord.emergencyContact);
                setSkills(empRecord.skills ? empRecord.skills.join(', ') : '');
                setProfilePic(empRecord.profilePic || '');
                setIsEditModalOpen(true);
              }} 
              className="secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', marginTop: '0.15rem' }}><Mail size={18} /></div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{empRecord.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', marginTop: '0.15rem' }}><Phone size={18} /></div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</label>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{empRecord.phone || '-'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', marginTop: '0.15rem' }}><ShieldAlert size={18} /></div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Contact</label>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{empRecord.emergencyContact || '-'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', marginTop: '0.15rem' }}><Calendar size={18} /></div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Joining Date</label>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{formatDate(empRecord.joiningDate)}</p>
            </div>
          </div>

        </div>

        {/* Assigned Assets */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Laptop size={14} /> Assigned Assets
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {empRecord.assets && empRecord.assets.length > 0 ? (
              empRecord.assets.map((asset, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    backgroundColor: 'var(--success-bg)', 
                    border: '1px solid var(--success)', 
                    padding: '0.3rem 0.75rem', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    color: 'var(--success-text)',
                    fontWeight: '500'
                  }}
                >
                  {asset}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No assets assigned yet. Contact IT support.</span>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills & Qualifications</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {empRecord.skills && empRecord.skills.length > 0 ? (
              empRecord.skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    backgroundColor: 'var(--bg)', 
                    border: '1px solid var(--border)', 
                    padding: '0.3rem 0.75rem', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No skills listed. Click Edit Profile to add skills.</span>
            )}
          </div>
        </div>

        {/* Goals & OKRs */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Target size={14} /> Goals & OKR Progress
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mockOKRs.map((okr, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{okr.title}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{okr.progress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${okr.progress}%`, backgroundColor: 'var(--accent)', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Phone Number</label>
            <input 
              type="text" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Emergency Contact</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Contact Name (9876543210)"
              value={emergencyContact} 
              onChange={(e) => setEmergencyContact(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Skills (Comma Separated)</label>
            <input 
              type="text" 
              placeholder="e.g. React, TypeScript, Node.js"
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Profile Picture</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              {profilePic && (
                <img src={profilePic} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfilePic(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                style={{ fontSize: '0.85rem' }}
              />
            </div>
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

export default MyProfile;
