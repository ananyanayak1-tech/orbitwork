import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/dateFormatter';

const Reports = () => {
  const [reports, setReports] = useState([
    { title: 'Attendance Report Q2', desc: 'Detailed records of check-ins, check-outs, leave logs, and overtime hours.', date: '2026-07-31' },
    { title: 'Task Performance Stats', desc: 'Evaluation metrics mapping employee task completion ratios, deadlines missed, and task efficiency.', date: '2026-07-28' },
    { title: 'Departmental Cost Analysis', desc: 'Financial summaries showing budget allocations, employee payouts (excluding salary details), and resource utilization.', date: '2026-07-25' },
    { title: 'Active Projects Progress Log', desc: 'Real-time milestones tracking document for ongoing customer commitments and sprint targets.', date: '2026-07-20' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reportType, setReportType] = useState('Attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = (type, report) => {
    if (type === 'PDF') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .header { border-bottom: 2px solid #1D70B8; padding-bottom: 15px; margin-bottom: 30px; }
              .logo { font-size: 20px; font-weight: 800; color: #1D70B8; text-transform: uppercase; letter-spacing: 0.5px; }
              .title { font-size: 26px; margin-top: 10px; margin-bottom: 5px; color: #111; font-weight: 800; }
              .meta { font-size: 13px; color: #666; }
              .content { font-size: 15px; margin-bottom: 40px; }
              .footer { border-top: 1px solid #ddd; padding-top: 15px; font-size: 11px; color: #888; text-align: center; margin-top: 50px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #F4F6F8; color: #1D70B8; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">OrbitWorks Enterprise System</div>
              <h1 class="title">${report.title}</h1>
              <div class="meta">Generated Date: ${formatDate(report.date)} | Issued By: CEO Rajesh Kumar</div>
            </div>
            <div class="content">
              <h3>Executive Summary</h3>
              <p>${report.desc}</p>
              
              <h3>Key Performance Metrics</h3>
              <table>
                <thead>
                  <tr>
                    <th>Performance Metric</th>
                    <th>Recorded Value</th>
                    <th>Target Goal</th>
                    <th>Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Employee Workday Completion</td>
                    <td>94.2% Average</td>
                    <td>&gt; 90.0%</td>
                    <td>Exceeds Target</td>
                  </tr>
                  <tr>
                    <td>Sprint Deliverables Completion</td>
                    <td>88.5% Success</td>
                    <td>&gt; 85.0%</td>
                    <td>Compliant</td>
                  </tr>
                  <tr>
                    <td>Operational Budget Runway</td>
                    <td>Stable</td>
                    <td>24 Months</td>
                    <td>Secure</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              Confidential Document | OrbitWorks Enterprise Portal | For Internal Use Only
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else if (type === 'Excel') {
      const csvContent = [
        ["OrbitWorks Corporate Report Summary"],
        ["Report Title", report.title],
        ["Description", report.desc],
        ["Generated Date", formatDate(report.date)],
        ["Author", "CEO Rajesh Kumar"],
        [],
        ["Performance Metric", "Recorded Value", "Target Goal", "Compliance Status"],
        ["Employee Workday Completion", "94.2% Average", "> 90.0%", "Exceeds Target"],
        ["Sprint Deliverables Completion", "88.5% Success", "> 85.0%", "Compliant"],
        ["Operational Budget Runway", "Stable", "24 Months", "Secure"]
      ].map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    
    // Construct default description if blank
    const finalDesc = desc.trim() || `${reportType} analysis generated for timeline ${startDate || 'N/A'} to ${endDate || 'N/A'}.`;
    
    const newReport = {
      title: title.trim(),
      desc: finalDesc,
      date: new Date().toISOString().split('T')[0]
    };

    setReports([newReport, ...reports]);
    setIsModalOpen(false);

    // Reset fields
    setTitle('');
    setDesc('');
    setReportType('Attendance');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>Performance Reports</h4>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.98rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={18} /> Create Report
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {reports.map((rep, idx) => (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '1.5rem',
              padding: '1.75rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(11,27,43,0.02)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '250px' }}>
              <h4 style={{ margin: 0, fontSize: '1.28rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>{rep.title}</h4>
              <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '650px' }}>
                {rep.desc}
              </p>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: '500' }}>
                Generated Date: {formatDate(rep.date)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => handleExport('PDF', rep)} 
                className="secondary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.92rem', 
                  padding: '0.6rem 1rem'
                }}
              >
                <FileText size={16} /> Export PDF
              </button>
              <button 
                onClick={() => handleExport('Excel', rep)} 
                className="secondary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.92rem', 
                  padding: '0.6rem 1rem'
                }}
              >
                <FileSpreadsheet size={16} /> Export Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Report">
        <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Report Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Q3 Sales & Attendance Summary" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="Attendance">Attendance</option>
              <option value="Tasks">Tasks</option>
              <option value="Departments">Departments</option>
              <option value="Projects">Projects</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>Start Date</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label>End Date</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label>Description (Optional)</label>
            <textarea 
              rows={3} 
              placeholder="Provide context, parameters or notes for this report..." 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary">Generate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reports;
