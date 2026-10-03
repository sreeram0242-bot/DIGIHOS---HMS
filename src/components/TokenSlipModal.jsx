import React from 'react';
import { X, Printer, Clock, Building2, CheckCircle2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const TokenSlipModal = () => {
  const { 
    isTokenSlipModalOpen, 
    setIsTokenSlipModalOpen, 
    selectedTokenForSlip, 
    patients, 
    showToast 
  } = useHospital();

  if (!isTokenSlipModalOpen || !selectedTokenForSlip) return null;

  const token = selectedTokenForSlip;
  const safePatients = Array.isArray(patients) ? patients : [];
  const patient = safePatients.find(p => p.id === token.patientId) || {
    id: token.patientId || 'DH-2026',
    fullName: token.patientName || 'Patient',
    age: token.age || 35,
    gender: token.gender || 'Male',
    phone: token.phone || '-',
    vitals: token.vitals || {
      bp: '120/80',
      pulse: '74',
      weight: '68',
      temp: '98.6',
      spo2: '99'
    }
  };

  const handlePrint = () => {
    window.print();
    showToast(`Printed Token Slip #${token.tokenNo} for ${token.patientName}`);
  };

  const handleClose = () => {
    setIsTokenSlipModalOpen(false);
  };

  return (
    <div 
      className="modal-backdrop" 
      style={{ zIndex: 100050 }}
      onClick={handleClose}
    >
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '480px', position: 'relative', zIndex: 100051 }}
      >
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0a1f36', color: '#ffffff', padding: '6px', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 className="modal-title">OPD Consultation Token Slip</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Token: {token.tokenNo} &bull; Thermal / A5 Format</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Printable Document */}
        <div className="modal-body" style={{ background: '#f1f5f9', padding: '20px' }}>
          
          <div 
            className="printable-area"
            style={{
              background: '#ffffff',
              border: '2px dashed #94a3b8',
              borderRadius: '8px',
              padding: '20px 24px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              color: '#0f172a',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Building2 size={18} color="#0a1f36" />
                <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0a1f36', letterSpacing: '0.5px' }}>
                  COIMBATORE GENERAL HOSPITAL
                </h2>
              </div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                104, Trichy Road, Coimbatore &bull; Ph: +91 422 2456789
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', marginTop: '4px', textTransform: 'uppercase' }}>
                OPD CONSULTATION & QUEUE TOKEN
              </div>
            </div>

            {/* Giant Token Chip */}
            <div style={{ textAlign: 'center', background: '#0a1f36', color: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#bae6fd', display: 'block', marginBottom: '2px' }}>
                YOUR QUEUE TOKEN NUMBER
              </span>
              <div style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '2px', color: '#ffffff', lineHeight: 1 }}>
                {token.tokenNo}
              </div>
              <div style={{ fontSize: '12.5px', color: '#fef08a', marginTop: '6px', fontWeight: 700 }}>
                {token.room || 'Consultation Room 102'}
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '10px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Consulting Doctor:</span>
                <strong style={{ color: '#0f172a' }}>{token.doctor || 'Dr. Arvind Ramesh, MD'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Patient Name:</span>
                <strong style={{ color: '#0f172a' }}>{patient.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Hospital UHID:</span>
                <strong style={{ color: '#0369a1' }}>{patient.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Age / Gender:</span>
                <span>{patient.age} Y / {patient.gender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Issued Date & Time:</span>
                <span>{token.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Triage Vitals Ribbon */}
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Triage Vitals Recorded at Reception:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', fontSize: '10.5px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>BP</span>
                  <strong>{patient.vitals?.bp || '120/80'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Weight</span>
                  <strong>{patient.vitals?.weight || '68'} kg</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>Pulse</span>
                  <strong>{patient.vitals?.pulse || '74'} bpm</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>SpO2</span>
                  <strong>{patient.vitals?.spo2 || '99'}%</strong>
                </div>
              </div>
            </div>

            {/* Barcode Graphic */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <svg width="180" height="34" viewBox="0 0 180 34" style={{ margin: '0 auto' }}>
                <rect x="0" y="0" width="3" height="30" fill="#000" />
                <rect x="5" y="0" width="1" height="30" fill="#000" />
                <rect x="8" y="0" width="4" height="30" fill="#000" />
                <rect x="15" y="0" width="2" height="30" fill="#000" />
                <rect x="19" y="0" width="1" height="30" fill="#000" />
                <rect x="23" y="0" width="3" height="30" fill="#000" />
                <rect x="29" y="0" width="2" height="30" fill="#000" />
                <rect x="33" y="0" width="5" height="30" fill="#000" />
                <rect x="41" y="0" width="2" height="30" fill="#000" />
                <rect x="46" y="0" width="4" height="30" fill="#000" />
                <rect x="53" y="0" width="1" height="30" fill="#000" />
                <rect x="57" y="0" width="3" height="30" fill="#000" />
                <rect x="63" y="0" width="2" height="30" fill="#000" />
                <rect x="68" y="0" width="4" height="30" fill="#000" />
                <rect x="75" y="0" width="1" height="30" fill="#000" />
                <rect x="80" y="0" width="3" height="30" fill="#000" />
                <rect x="86" y="0" width="5" height="30" fill="#000" />
                <rect x="94" y="0" width="2" height="30" fill="#000" />
                <rect x="99" y="0" width="1" height="30" fill="#000" />
                <rect x="103" y="0" width="4" height="30" fill="#000" />
                <rect x="110" y="0" width="2" height="30" fill="#000" />
                <rect x="115" y="0" width="3" height="30" fill="#000" />
                <rect x="121" y="0" width="1" height="30" fill="#000" />
                <rect x="125" y="0" width="4" height="30" fill="#000" />
                <rect x="132" y="0" width="2" height="30" fill="#000" />
                <rect x="137" y="0" width="3" height="30" fill="#000" />
                <rect x="143" y="0" width="1" height="30" fill="#000" />
                <rect x="147" y="0" width="5" height="30" fill="#000" />
                <rect x="155" y="0" width="2" height="30" fill="#000" />
                <rect x="160" y="0" width="3" height="30" fill="#000" />
                <rect x="166" y="0" width="1" height="30" fill="#000" />
                <rect x="170" y="0" width="4" height="30" fill="#000" />
              </svg>
              <div style={{ fontSize: '9.5px', letterSpacing: '2px', color: '#475569' }}>
                *{token.tokenNo}*
              </div>
            </div>

            {/* Patient Notice Footer */}
            <div style={{ textAlign: 'center', fontSize: '9.5px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              Please take your seat in Lounge (2nd Floor). When your token appears on the LED display, proceed into Room 102.
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button className="btn-secondary-clean" onClick={handleClose}>
            Close
          </button>
          <button className="btn-primary-amber" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Token Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
};
