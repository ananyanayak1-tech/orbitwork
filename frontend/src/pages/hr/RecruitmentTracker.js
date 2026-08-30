import React, { useState, useEffect } from 'react';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Upload, Trash2, Cpu, UserPlus, RefreshCw, ChevronRight } from 'lucide-react';

const RecruitmentTracker = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  
  // Simulation states
  const [parsing, setParsing] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchCandidatesData = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch candidate pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  const pipelineStages = [
    { key: 'Applied', label: 'Applied', color: '#8B5CF6' },
    { key: 'Shortlisted', label: 'Shortlisted', color: '#F59E0B' },
    { key: 'Interview', label: 'Interview', color: '#4AA9E8' },
    { key: 'Offer', label: 'Offer Sent', color: '#EC4899' },
    { key: 'Hired', label: 'Hired', color: '#10B981' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      showToast(`Selected resume: ${file.name}`);
    }
  };

  const handleMockParse = () => {
    if (!resumeFile) {
      showToast('Please select a resume file first.', 'error');
      return;
    }

    setParsing(true);
    // Simulate AI parsing delay
    setTimeout(() => {
      // Extract name from filename or use mock details
      const fileNameNoExt = resumeFile.name.split('.')[0];
      const parsedName = fileNameNoExt
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\d+/g, '')
        .trim() || "Rohan Joshi";

      const parsedEmail = `${parsedName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      const skillOptions = [
        'React, Node.js, MongoDB, TypeScript',
        'Python, Django, AWS, PostgreSQL',
        'UI/UX Design, Figma, Tailwind CSS',
        'Project Management, Agile, Jira, Scrum',
        'Sales, Business Development, Salesforce'
      ];
      const randomSkills = skillOptions[Math.floor(Math.random() * skillOptions.length)];

      setName(parsedName);
      setEmail(parsedEmail);
      setSkills(randomSkills);
      setParsing(false);
      showToast('AI parser extracted candidate details successfully!');
    }, 1500);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Please fill out Name and Email.', 'error');
      return;
    }

    setAdding(true);
    try {
      await createCandidate({
        name,
        email,
        skills,
        stage: 'Applied',
        resumeName: resumeFile ? resumeFile.name : 'resume.pdf'
      });
      showToast('Candidate added to pipeline successfully!');
      // Reset fields
      setName('');
      setEmail('');
      setSkills('');
      setResumeFile(null);
      fetchCandidatesData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save candidate.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handlePromoteStage = async (cand, currentStage) => {
    const stagesList = pipelineStages.map(s => s.key);
    const currentIndex = stagesList.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stagesList.length - 1) return;

    const nextStage = stagesList[currentIndex + 1];
    try {
      await updateCandidate(cand._id, { stage: nextStage });
      showToast(`${cand.name} promoted to ${nextStage}!`);
      fetchCandidatesData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update stage.', 'error');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to remove this candidate from the recruitment pipeline?")) return;
    try {
      await deleteCandidate(id);
      showToast('Candidate removed successfully.');
      fetchCandidatesData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete candidate.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Recruitment Pipeline</h2>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Upload resumes to parse candidate details automatically and manage the hiring stages</p>
      </div>

      {/* Upload and Form row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Mock AI Resume Parser card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="#1D70B8" /> AI Resume Parser
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Upload resume file to extract details automatically</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select Resume File</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ 
                  padding: '0.65rem 0.9rem', 
                  fontSize: '0.92rem',
                  border: '1.5px dashed var(--border)',
                  borderRadius: '10px',
                  background: 'var(--bg)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <button 
              type="button" 
              onClick={handleMockParse}
              disabled={parsing || !resumeFile}
              className="secondary"
              style={{ 
                padding: '0.65rem', 
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#1D70B8',
                borderColor: '#1D70B8'
              }}
            >
              {parsing ? (
                <>
                  <RefreshCw className="spin" size={16} /> Parsing Resume Content...
                </>
              ) : (
                <>
                  <Cpu size={16} /> Run AI Parser
                </>
              )}
            </button>
          </div>
        </div>

        {/* Candidate input form card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} color="#10B981" /> Candidate Profiles
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Verify parsed details or enter candidates manually</p>
          </div>

          <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Aarav Mehta"
                  required
                  style={{ padding: '0.65rem 0.9rem', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="aarav.mehta@example.com"
                  required
                  style={{ padding: '0.65rem 0.9rem', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Skills (Comma-separated)</label>
              <input 
                type="text" 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)} 
                placeholder="e.g. React, Node.js, Python"
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.95rem' }}
              />
            </div>

            <button 
              type="submit" 
              className="primary"
              disabled={adding || !name || !email}
              style={{ padding: '0.75rem', fontSize: '0.95rem', backgroundColor: '#1D70B8', borderColor: '#1D70B8', marginTop: '0.5rem' }}
            >
              {adding ? 'Saving...' : 'Add Candidate to Pipeline'}
            </button>
          </form>
        </div>

      </div>

      {/* Kanban Board */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowX: 'auto' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} color="#1D70B8" /> Applicant Kanban Pipeline
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Progress applicants from left to right as interviews progress</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Loading recruitment stages...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))', gap: '1rem', alignItems: 'start' }}>
            {pipelineStages.map((stage) => {
              const stageCandidates = candidates.filter(c => c.stage === stage.key);
              return (
                <div 
                  key={stage.key}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    backgroundColor: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    minHeight: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  {/* Stage Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2.5px solid ${stage.color}`, paddingBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{stage.label}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{stageCandidates.length}</span>
                  </div>

                  {/* Candidate List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stageCandidates.length > 0 ? (
                      stageCandidates.map((cand) => (
                        <div 
                          key={cand._id}
                          style={{
                            padding: '0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--card-bg, #ffffff)',
                            border: '1.5px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            position: 'relative'
                          }}
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => handleDeleteCandidate(cand._id)}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Delete candidate"
                          >
                            <Trash2 size={13} hover={{ color: '#EF4444' }} />
                          </button>

                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', paddingRight: '1rem' }}>{cand.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cand.email}</span>

                          {cand.skills && cand.skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                              {cand.skills.map((s, idx) => (
                                <span 
                                  key={idx}
                                  style={{
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '12px',
                                    fontSize: '0.68rem',
                                    backgroundColor: 'rgba(29, 112, 184, 0.06)',
                                    color: '#1D70B8'
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {stage.key !== 'Hired' && (
                            <button
                              onClick={() => handlePromoteStage(cand, stage.key)}
                              className="secondary"
                              style={{
                                padding: '0.25rem',
                                fontSize: '0.72rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.2rem',
                                marginTop: '0.4rem',
                                width: '100%',
                                color: '#1D70B8',
                                borderColor: '#1D70B8'
                              }}
                            >
                              Advance <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default RecruitmentTracker;
