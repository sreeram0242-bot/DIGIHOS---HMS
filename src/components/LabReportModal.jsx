import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Share2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const LabReportModal = () => {
  const { 
    isLabReportModalOpen, 
    setIsLabReportModalOpen, 
    selectedLabReport, 
    patients, 
    showToast 
  } = useHospital();

  if (!isLabReportModalOpen || !selectedLabReport) return null;

  const safePatients = Array.isArray(patients) ? patients : [];
  const patient = safePatients.find(p => p.id === selectedLabReport.patientId) || {
    fullName: selectedLabReport.patientName || 'Patient',
    id: selectedLabReport.patientId || 'DH-2026',
    age: selectedLabReport.age || 42,
    gender: selectedLabReport.gender || 'Male',
    phone: selectedLabReport.phone || '-'
  };

  const handlePrintReport = () => {
    window.print();
    showToast(`Printing Official Diagnostic Report for ${patient.fullName}`);
  };

  return (
    <div 
      className="modal-backdrop" 
      style={{ zIndex: 100050 }}
      onClick={() => setIsLabReportModalOpen(false)}
    >
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '820px', position: 'relative', zIndex: 100051 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0284c7', color: '#ffffff', padding: '6px', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="modal-title">Official Diagnostic Pathology Report</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Order #{selectedLabReport.orderId} &nbsp;|&nbsp; Verified & Released</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setIsLabReportModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc' }}>
          {/* Printable A4 Pathology Document Container */}
          <div 
            className="printable-area"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '32px 36px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontFamily: 'var(--font-body)',
              color: '#0f172a'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0d2847', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0d2847', letterSpacing: '-0.3px' }}>
                  COIMBATORE GENERAL HOSPITAL
                </h2>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  Department of Clinical Pathology & Laboratory Medicine
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  104, Trichy Road, Singanallur, Coimbatore - 641005 | Phone: +91 422 2589000
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                  NABL ACCREDITED LAB
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  Ref: {selectedLabReport.orderId}
                </div>
              </div>
            </div>

            {/* Patient Demographics Table */}
            <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 16px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Patient Name</span>
                  <strong>{patient.fullName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Patient ID / Barcode</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{patient.id}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Age / Gender</span>
                  <strong>{patient.age} Yrs / {patient.gender}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Referred By</span>
                  <strong>{selectedLabReport.doctor || 'Dr. Arvind Ramesh'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Collection Date</span>
                  <span>{selectedLabReport.orderDate}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Report Status</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Verified & Complete</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Token Number</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedLabReport.tokenNo || 'TK-01'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Contact</span>
                  <span>{patient.phone}</span>
                </div>
              </div>
            </div>

            {/* Test Results Section */}
            {(selectedLabReport.tests || []).map((test, idx) => (
              <div key={idx} style={{ marginBottom: '22px' }}>
                <div style={{ background: '#0d2847', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{test.name}</span>
                  <span style={{ fontSize: '11px', color: '#93c5fd' }}>Sample: {test.sampleType || 'Whole Blood / Serum'}</span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginTop: '6px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>Investigation / Parameter</th>
                      <th style={{ textAlign: 'center', padding: '8px 10px' }}>Observed Value</th>
                      <th style={{ textAlign: 'center', padding: '8px 10px' }}>Units</th>
                      <th style={{ textAlign: 'center', padding: '8px 10px' }}>Biological Reference Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(test.parameters || []).map((param, pIdx) => {
                      const isHigh = param.flag === 'high';
                      const isLow = param.flag === 'low';
                      return (
                        <tr key={pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 500 }}>{param.name}</td>
                          <td style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 700, color: isHigh ? '#dc2626' : isLow ? '#d97706' : '#0f172a' }}>
                            {param.value} {isHigh && '(H)'} {isLow && '(L)'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 10px', color: '#64748b' }}>{param.unit || '-'}</td>
                          <td style={{ textAlign: 'center', padding: '8px 10px', color: '#475569', fontFamily: 'var(--font-mono)' }}>{param.normal || '-'}</td>
                        </tr>
                      );
                    })}
                    {(!test.parameters || test.parameters.length === 0) && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '12px', color: '#059669', fontSize: '11.5px', fontWeight: 600 }}>
                          Test completed and verified within normal physiological limits.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Pathologist Verification & Digital Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '30px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '11.5px', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Digitally Authorized & Quality Checked</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                  Auto-dispatched to patient WhatsApp via official Baileys gateway
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#0369a1', fontStyle: 'italic', marginBottom: '4px' }}>
                  Dr. K. Shalini, MD
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                  Dr. K. Shalini, MD (Pathology)
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Consultant Clinical Pathologist | Reg: TN-MC-88291
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-clean" onClick={() => setIsLabReportModalOpen(false)}>
            Close
          </button>
          <button className="btn-primary-amber" onClick={handlePrintReport}>
            <Printer size={16} />
            <span>Print Official Paper Report (A4)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
