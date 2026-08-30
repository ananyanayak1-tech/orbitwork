import React, { useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { updateEmployee } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DocumentManagement = ({ employees, onRefresh }) => {
  const { showToast } = useToast();
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [docType, setDocType] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploading, setUploading] = useState(false);

  const handleDownload = (docName) => {
    // Generate a dummy text blob representing the document content
    const blob = new Blob([`OrbitWorks Employee Document System\n\nDocument Name: ${docName}\nThis is a placeholder/simulated file for the uploaded document.`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docName.includes('.') ? docName : `${docName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast(`Downloading: ${docName}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      showToast('Please select an employee.', 'error');
      return;
    }
    if (!docType) {
      showToast('Please select a document type.', 'error');
      return;
    }
    if (!fileName) {
      showToast('Please select a file first.', 'error');
      return;
    }

    setUploading(true);
    
    // Simulate upload delay
    setTimeout(async () => {
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
        const newDoc = {
          name: fileName,
          type: docType,
          uploadDate: new Date().toISOString().split('T')[0]
        };
        const updatedDocs = [...(emp.documents || []), newDoc];
        try {
          await updateEmployee(emp.id, { documents: updatedDocs });
          showToast('Document uploaded successfully!');
          // Clear inputs/placeholders
          setFileName('');
          setSelectedEmpId('');
          setDocType('');
          setFileInputKey(Date.now());
          onRefresh();
        } catch (err) {
          console.error(err);
          showToast('Upload failed. Please try again.', 'error');
        } finally {
          setUploading(false);
        }
      } else {
        setUploading(false);
        showToast('Employee not found.', 'error');
      }
    }, 1000);
  };

  // Compile all documents across employees for tracking
  const allDocs = employees.flatMap(emp => 
    (emp.documents || []).map(doc => ({
      ...doc,
      employeeName: emp.name,
      employeeId: emp.id
    }))
  );

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      
      {/* Upload UI */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.75rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Upload employee document</h4>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select employee</label>
            <select 
              value={selectedEmpId} 
              onChange={(e) => setSelectedEmpId(e.target.value)} 
              required
              style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Document type</label>
            <select 
              value={docType} 
              onChange={(e) => setDocType(e.target.value)}
              required
              style={{ padding: '0.75rem 1rem', fontSize: '0.98rem' }}
            >
              <option value="">Select Document Type</option>
              <option value="offer_letter">Offer letter</option>
              <option value="id_proof">ID proof</option>
              <option value="experience_letter">Experience letter</option>
              <option value="certificate">Certificates</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Choose File</label>
            <input 
              key={fileInputKey}
              type="file" 
              required 
              onChange={handleFileChange} 
              style={{ 
                padding: '0.65rem 0.9rem', 
                fontSize: '0.95rem',
                border: '1.5px dashed var(--border)',
                borderRadius: '10px',
                background: 'var(--bg)',
                cursor: 'pointer'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="primary" 
            disabled={uploading || !fileName || !selectedEmpId || !docType} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.6rem', 
              marginTop: '0.75rem',
              padding: '0.75rem 1.15rem', 
              fontSize: '0.98rem'
            }}
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload document'}
          </button>
        </form>
      </div>

      {/* Document Feed / List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.75rem' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.28rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Document log feed</h4>
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            maxHeight: '450px', 
            overflowY: 'auto', 
            paddingRight: '0.5rem' 
          }}
        >
          {allDocs.length > 0 ? (
            allDocs.map((doc, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'center', 
                  padding: '0.75rem', 
                  border: '1.5px solid var(--border)', 
                  borderRadius: '10px' 
                }}
              >
                <div 
                  style={{ 
                    padding: '0.55rem', 
                    backgroundColor: 'var(--bg)', 
                    borderRadius: '8px', 
                    border: '1.5px solid var(--border)', 
                    color: 'var(--text-secondary)', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{doc.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Owner: {doc.employeeName} ({doc.employeeId})</span>
                </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: '500' }}>{doc.type.replace('_', ' ')}</span>
                  <button 
                    onClick={() => handleDownload(doc.name)}
                    className="secondary"
                    style={{ 
                      padding: '0.35rem 0.65rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      fontSize: '0.8rem',
                      height: 'fit-content'
                    }}
                    title="Download document"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', padding: '2.5rem 0' }}>
              No documents found.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DocumentManagement;
