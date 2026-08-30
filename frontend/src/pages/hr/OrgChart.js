import React, { useState } from 'react';
import { User, ShieldAlert, Award, Cpu, Mail, Phone } from 'lucide-react';

const OrgChart = ({ employees = [] }) => {
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Hardcode the tree structure relationships based on designation and role hierarchy
  // Top: CEO
  const ceo = employees.find(e => e.designation.toLowerCase().includes('ceo')) || {
    id: 'EMP000',
    name: 'Rajesh Kumar',
    designation: 'CEO & Founder',
    department: 'Management',
    email: 'ceo@orbitworks.com',
    skills: ['Strategy', 'Leadership', 'Financial Steering']
  };

  // Level 1 managers / heads
  const hrManager = employees.find(e => e.designation.toLowerCase() === 'hr manager') || employees.find(e => e.email.toLowerCase() === 'admin@orbitworks.com');
  
  // Software Engineers / Employees under Management or directly under organization
  const engineers = employees.filter(e => 
    e.department.toLowerCase().includes('engineering') || 
    e.department.toLowerCase().includes('tech') ||
    e.designation.toLowerCase().includes('engineer') ||
    e.designation.toLowerCase().includes('developer')
  );

  // Other HR staff (reporters to HR manager)
  const hrStaff = employees.filter(e => 
    (e.department.toLowerCase().includes('hr') || e.department.toLowerCase().includes('resource')) &&
    e.id !== hrManager?.id
  );

  const handleNodeClick = (emp) => {
    setSelectedEmp(emp);
  };

  const renderCard = (emp) => {
    if (!emp) return null;
    return (
      <div 
        onClick={() => handleNodeClick(emp)}
        style={{
          padding: '1rem',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          cursor: 'pointer',
          width: '200px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          textAlign: 'center',
          transition: 'transform 0.2s, border-color 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem'
        }}
        className="org-node-card"
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(29, 112, 184, 0.1)',
          color: '#1D70B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: '700'
        }}>
          {emp.name ? emp.name[0].toUpperCase() : 'U'}
        </div>
        <div>
          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '180px' }}>
            {emp.name}
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '180px' }}>
            {emp.designation}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '600px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Corporate Hierarchy Chart</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Interactive visualization of OrbitWorks reporting lines and roles</p>
      </div>

      {/* Org Chart Tree Container */}
      <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto', minWidth: 'fit-content' }}>
        
        {/* Level 0: CEO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderCard(ceo)}
          <div style={{ width: '2px', height: '28px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
        </div>

        {/* Horizontal Connector Line for level 1 */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '60%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '2px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Level 1: HR & Engineering Split */}
        <div style={{ display: 'flex', gap: '5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          
          {/* Left Branch: HR Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '2px', height: '20px', backgroundColor: 'var(--border)' }} />
            {renderCard(hrManager)}

            {/* HR Reporters */}
            {hrStaff.length > 0 && (
              <>
                <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {hrStaff.map(staff => (
                    <div key={staff.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {renderCard(staff)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Branch: Tech/Engineering */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '2px', height: '20px', backgroundColor: 'var(--border)' }} />
            
            {/* Tech Lead Placeholder or Software Engineers */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {engineers.slice(0, 3).map(eng => (
                <div key={eng.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {renderCard(eng)}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Detail Modal */}
      {selectedEmp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(29, 112, 184, 0.1)',
                color: '#1D70B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: '800'
              }}>
                {selectedEmp.name ? selectedEmp.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.35rem', color: 'var(--text-primary)' }}>{selectedEmp.name}</h3>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{selectedEmp.designation}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem' }}>
                <Mail size={16} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-primary)' }}>{selectedEmp.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem' }}>
                <Phone size={16} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-primary)' }}>{selectedEmp.phone || 'No phone set'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</span>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600' }}>{selectedEmp.department}</span>
              </div>

              {selectedEmp.skills && selectedEmp.skills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Key Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedEmp.skills.map((s, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          padding: '0.2rem 0.55rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          backgroundColor: 'rgba(29, 112, 184, 0.08)',
                          color: '#1D70B8'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmp.emergencyContact && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '8px', borderLeft: '3px solid #1D70B8' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Emergency Contact</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600' }}>{selectedEmp.emergencyContact}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedEmp(null)}
              className="primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', backgroundColor: '#1D70B8', borderColor: '#1D70B8' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrgChart;
