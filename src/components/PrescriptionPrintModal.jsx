import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Stethoscope, 
  ExternalLink,
  HeartPulse,
  Activity,
  Thermometer,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  QrCode,
  Pill
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const PrescriptionPrintModal = () => {
  const { 
    isPrescriptionModalOpen, 
    setIsPrescriptionModalOpen, 
    selectedPrescriptionForPrint, 
    patients, 
    showToast 
  } = useHospital();

  const printAreaRef = useRef(null);

  if (!isPrescriptionModalOpen || !selectedPrescriptionForPrint) return null;

  const rx = selectedPrescriptionForPrint;
  const safePatients = Array.isArray(patients) ? patients : [];
  const patient = safePatients.find(p => p.id === rx.patientId) || {
    id: rx.patientId || 'DH-2026-0814',
    fullName: rx.patientName || 'Consultation Patient',
    age: rx.age || 42,
    gender: rx.gender || 'Male',
    phone: rx.phone || '+91 98421 55678',
    vitals: rx.vitals || {}
  };

  const vitals = rx.vitals || patient.vitals || {};
  const items = Array.isArray(rx.items) ? rx.items : [];
  const currentDateStr = rx.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTimeStr = rx.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Direct native browser print
  const handlePrint = () => {
    window.print();
    showToast(`Printing prescription for ${patient.fullName}...`);
  };

  // Dedicated Popup Window Print (isolated, pixel-perfect A4)
  const handlePrintPopup = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rx_${patient.fullName?.replace(/\\s+/g, '_')}_${rx.tokenNo || 'TK'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 0;
              margin: 0;
              font-size: 12.5px;
              line-height: 1.45;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .prescription-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto;
              background: #ffffff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, th * {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
              font-weight: 700 !important;
              white-space: nowrap !important;
              opacity: 1 !important;
            }
            td, td * {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
              opacity: 1 !important;
            }
            .token-chip, .badge, .nowrap, [data-nowrap] {
              white-space: nowrap !important;
            }
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              th, th * {
                color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
                font-weight: 700 !important;
                white-space: nowrap !important;
              }
              td, td * {
                color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="prescription-sheet">
            ${content}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`Opened clean prescription print view`);
  };

  const handleClose = () => {
    setIsPrescriptionModalOpen(false);
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
        style={{ 
          maxWidth: '860px', 
          width: '95%',
          position: 'relative', 
          zIndex: 100051,
          background: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1'
        }}
      >
        
        {/* Modal Top Ribbon (Hidden on print) */}
        <div className="modal-header" style={{ background: '#ffffff', color: '#0f172a', padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#059669', color: '#ffffff', padding: '6px', borderRadius: '7px' }}>
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Doctor's Medical e-Prescription (Rx Sheet)
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                Patient: <strong style={{ color: '#0f172a' }}>{patient.fullName}</strong> &bull; Token: <strong style={{ color: '#059669' }}>{rx.tokenNo || 'TK-01'}</strong> &bull; Date: {currentDateStr}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-primary-amber" 
              onClick={handlePrint} 
              style={{ background: '#059669', borderColor: '#047857', padding: '6px 14px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Print Prescription (A4)</span>
            </button>

            <button 
              className="btn-secondary-clean"
              onClick={handlePrintPopup}
              style={{ padding: '6px 12px', fontSize: '12px', background: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              title="Open full page in standalone print window"
            >
              <ExternalLink size={13} />
              <span>Print in Tab</span>
            </button>

            <button className="modal-close-btn" onClick={handleClose} style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Paper Container */}
        <div className="modal-body" style={{ background: '#f1f5f9', padding: '24px 20px', maxHeight: '84vh', overflowY: 'auto' }}>
          
          {/* ========================================================================= */}
          {/* THE OFFICIAL PRESCRIPTION SHEET (A4 PHYSICAL DESIGN)                      */}
          {/* ========================================================================= */}
          <div 
            ref={printAreaRef}
            className="printable-area"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '28px 34px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              color: '#0f172a',
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '12.5px',
              lineHeight: 1.45,
              width: '100%',
              maxWidth: '780px',
              margin: '0 auto',
              position: 'relative'
            }}
          >

            {/* 1. PROFESSIONAL HOSPITAL & DOCTOR HEADER */}
            <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                {/* Hospital Brand Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '8px', 
                    background: '#0a1f36', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <HeartPulse size={26} color="#e59500" strokeWidth={2.4} />
                  </div>
                  <div>
                    <h1 style={{ 
                      fontSize: '18px', 
                      fontWeight: 800, 
                      color: '#0a1f36', 
                      letterSpacing: '0.4px', 
                      margin: 0, 
                      lineHeight: 1.15,
                      textTransform: 'uppercase'
                    }}>
                      Coimbatore General Hospital
                    </h1>
                    <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>
                      Multi-Speciality Hospital &bull; NABH Accredited
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '1px' }}>
                      104 Trichy Road, Coimbatore - 641005 &bull; Emergency: 1066 / 0422-2456789
                    </div>
                  </div>
                </div>

                {/* Doctor Credentials Right */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0a1f36' }}>
                    {rx.doctor || 'Dr. Arvind Ramesh, MD'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 700, marginTop: '1px' }}>
                    Consultant Physician & Diabetologist
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    Reg No: <strong style={{ color: '#0f172a' }}>TNMC 74829</strong> &bull; Room 102
                  </div>
                </div>

              </div>
            </div>

            {/* 2. STRUCTURED PATIENT DEMOGRAPHICS & VITALS CARD */}
            <div style={{ 
              border: '1px solid #cbd5e1', 
              borderRadius: '6px', 
              background: '#f8fafc',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              {/* Row 1: Core Demographics */}
              <div style={{ 
                padding: '7px 12px', 
                borderBottom: '1px solid #e2e8f0', 
                display: 'grid', 
                gridTemplateColumns: 'minmax(180px, 1.8fr) minmax(110px, 1fr) minmax(130px, 1.2fr) minmax(140px, 1.2fr)', 
                gap: '8px',
                alignItems: 'center',
                fontSize: '11.5px',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Patient: </span>
                  <strong style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap' }}>{patient.fullName}</strong>
                </div>

                <div style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Age/Sex: </span>
                  <strong style={{ color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap' }}>{patient.age}Y / {patient.gender}</strong>
                </div>

                <div style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>UHID: </span>
                  <strong style={{ color: '#0284c7', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>{patient.id}</strong>
                </div>

                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Date: </span>
                  <strong style={{ color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap' }}>{currentDateStr}</strong>
                  <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>({currentTimeStr})</span>
                </div>
              </div>

              {/* Row 2: Clinical Vitals & Flags */}
              <div style={{ 
                padding: '6px 12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontSize: '11px',
                background: '#ffffff',
                flexWrap: 'nowrap',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#334155', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <Activity size={12} color="#0284c7" />
                    <span style={{ whiteSpace: 'nowrap' }}>BP: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{vitals.bp || '120/80'}</strong> mmHg</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <HeartPulse size={12} color="#ef4444" />
                    <span style={{ whiteSpace: 'nowrap' }}>Pulse: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{vitals.pulse || '76'}</strong> bpm</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <Thermometer size={12} color="#f59e0b" />
                    <span style={{ whiteSpace: 'nowrap' }}>Temp: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{vitals.temp || '98.6'}</strong>&deg;F</span>
                  </div>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>SpO2: <strong style={{ color: '#059669', fontWeight: 600 }}>{vitals.spo2 || '99'}%</strong></span>
                  </div>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>Wt: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{vitals.weight || '70'}</strong> kg</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    background: '#f8fafc', 
                    color: '#334155', 
                    border: '1px solid #cbd5e1', 
                    padding: '2px 7px', 
                    borderRadius: '4px', 
                    fontSize: '10.5px', 
                    fontWeight: 600,
                    whiteSpace: 'nowrap' 
                  }}>
                    Token: {rx.tokenNo || 'TK-01'}
                  </span>
                  <span style={{ 
                    background: '#ecfdf5', 
                    color: '#065f46', 
                    border: '1px solid #a7f3d0', 
                    padding: '2px 7px', 
                    borderRadius: '4px', 
                    fontSize: '10.5px', 
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    <ShieldCheck size={12} color="#059669" /> No Drug Allergies
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PROVISIONAL DIAGNOSIS & CLINICAL NOTES (INFORMATIVE & COMPACT) */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #cbd5e1', 
              borderRadius: '6px', 
              padding: '7px 12px', 
              marginBottom: '14px', 
              fontSize: '11.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'nowrap',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}>
              <div style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Provisional Diagnosis:
                </span>
                <strong style={{ color: '#0c4a6e', fontSize: '12.5px', marginLeft: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {rx.diagnosis || 'Acute Upper Respiratory Tract Infection (URTI) with Pharyngitis'}
                </strong>
              </div>

              {rx.clinicalNotes && (
                <div style={{ color: '#475569', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 600, color: '#0369a1', whiteSpace: 'nowrap' }}>Complaints: </span>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{rx.clinicalNotes}</span>
                </div>
              )}
            </div>

            {/* 4. THE CLASSICAL LATIN Rx SECTION WITH CRISP TABLE */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    fontSize: '26px', 
                    fontWeight: 700, 
                    color: '#0a1f36', 
                    fontFamily: 'Georgia, serif', 
                    fontStyle: 'italic', 
                    lineHeight: 1 
                  }}>
                    &#8478;
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0a1f36', whiteSpace: 'nowrap' }}>
                    Prescribed Medicines & Dosage Schedule
                  </span>
                </div>

                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Dosage: <strong>M - A - N</strong> (Morning - Afternoon - Night)
                </div>
              </div>

              {/* Table */}
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #cbd5e1',
                fontSize: '12px' 
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', color: '#000000' }}>
                    <th style={{ textAlign: 'center', padding: '7px 6px', width: '36px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11.5px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '7px 10px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11.5px' }}>Medicine Name & Formulation</th>
                    <th style={{ textAlign: 'center', padding: '7px 10px', width: '135px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11.5px' }}>Dosage (M-A-N)</th>
                    <th style={{ textAlign: 'left', padding: '7px 10px', width: '125px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11.5px' }}>Meal Timing</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px', width: '90px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '11.5px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '7px 8px', width: '55px', color: '#000000', WebkitTextFillColor: '#000000', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '11.5px' }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfc'
                        }}
                      >
                        <td style={{ 
                          padding: '7px 6px', 
                          textAlign: 'center', 
                          fontWeight: 600, 
                          color: '#64748b', 
                          borderRight: '1px solid #e2e8f0',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                          fontSize: '11.5px'
                        }}>
                          {idx + 1}
                        </td>

                        <td style={{ 
                          padding: '7px 10px', 
                          borderRight: '1px solid #e2e8f0',
                          verticalAlign: 'middle'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>
                            {item.name}
                          </div>
                          {item.generic && (
                            <div style={{ fontSize: '10.5px', color: '#475569', fontStyle: 'italic', marginTop: '1px', fontWeight: 400 }}>
                              Salt: {item.generic}
                            </div>
                          )}
                          {item.instructions && (
                            <div style={{ fontSize: '10.5px', color: '#0369a1', fontWeight: 500, marginTop: '2px' }}>
                              * Instructions: {item.instructions}
                            </div>
                          )}
                        </td>

                        <td style={{ 
                          padding: '7px 8px', 
                          textAlign: 'center', 
                          borderRight: '1px solid #e2e8f0',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ 
                            background: '#f8fafc', 
                            color: '#0f172a', 
                            border: '1px solid #cbd5e1', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 600, 
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.dosage}
                          </span>
                        </td>

                        <td style={{ 
                          padding: '7px 10px', 
                          borderRight: '1px solid #e2e8f0',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ 
                            color: '#334155', 
                            fontWeight: 500,
                            fontSize: '11.5px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.timing || 'After Food'}
                          </span>
                        </td>

                        <td style={{ 
                          padding: '7px 8px', 
                          textAlign: 'center', 
                          fontWeight: 500, 
                          color: '#334155',
                          borderRight: '1px solid #e2e8f0',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                          fontSize: '11.5px'
                        }}>
                          {item.duration || '5 Days'}
                        </td>

                        <td style={{ 
                          padding: '7px 8px', 
                          textAlign: 'center', 
                          fontWeight: 600, 
                          color: '#0f172a',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                          fontSize: '11.5px'
                        }}>
                          {item.qty}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontWeight: 500 }}>
                        No medicines listed in this prescription.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. CLINICAL ADVICE & NEXT REVIEW BOX (INFORMATIVE & RELEVANT) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.6fr 1fr', 
              gap: '10px', 
              marginBottom: '16px',
              fontSize: '11.5px'
            }}>
              {/* Doctor's Advice */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                padding: '8px 12px' 
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '3px', fontSize: '10.5px' }}>
                  Doctor's Instructions & Care Advice:
                </div>
                <div style={{ color: '#334155', lineHeight: 1.45, fontWeight: 400 }}>
                  &bull; Complete the full antibiotic & medicine course as prescribed. Do not discontinue.<br />
                  &bull; Drink adequate warm water, take light non-spicy diet, and ensure proper rest.
                </div>
              </div>

              {/* Review & Helpline */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', fontSize: '10.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                    Follow-Up / Review:
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    Review after 5 Days (or SOS)
                  </div>
                </div>
                <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap' }}>
                  24x7 Emergency Casualty: 1066 / 0422-2456789
                </div>
              </div>
            </div>

            {/* 6. DOCTOR SIGNATURE & AUTHENTICATION STAMP */}
            <div style={{ 
              borderTop: '1px solid #cbd5e1', 
              paddingTop: '10px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end' 
            }}>
              
              {/* Left EMR QR & Dispatch Ref */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f8fafc',
                  flexShrink: 0
                }}>
                  <QrCode size={36} color="#0f172a" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    DIGIHOS EMR &bull; Authenticated e-Rx
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Rx Ref: <strong style={{ color: '#0f172a' }}>{rx.prescriptionId || 'RX-OPD-901'}</strong> &bull; Token: <strong>{rx.tokenNo || 'TK-01'}</strong>
                  </div>
                </div>
              </div>

              {/* Right: Doctor's Signature */}
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ 
                  fontFamily: "'Brush Script MT', 'Dancing Script', cursive", 
                  fontSize: '20px', 
                  color: '#0a1f36', 
                  fontWeight: 700, 
                  marginBottom: '1px' 
                }}>
                  Dr. Arvind Ramesh
                </div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '2px', fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                  DR. ARVIND RAMESH, MD
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                  Reg. No: TNMC 74829 &bull; Consultant Physician
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="modal-footer" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <span>Standard A4 Format &bull; High-Clarity Hospital Prescription Pad</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary-clean" onClick={handleClose} style={{ padding: '6px 14px', fontSize: '12.5px', background: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }}>
              Close
            </button>
            <button 
              className="btn-secondary-clean" 
              onClick={handlePrintPopup}
              style={{ padding: '6px 14px', fontSize: '12.5px', background: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <ExternalLink size={14} />
              <span>Print in New Tab</span>
            </button>
            <button 
              className="btn-primary-amber" 
              onClick={handlePrint} 
              style={{ background: '#059669', borderColor: '#047857', padding: '6px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Print Prescription (A4)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
