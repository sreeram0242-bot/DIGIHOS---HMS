import React, { useState } from 'react';
import { X, Printer, Barcode, CheckCircle, Tag, Sparkles } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const LabelPrintModal = () => {
  const { 
    isLabelModalOpen, 
    setIsLabelModalOpen, 
    selectedPatientForSticker, 
    patients, 
    showToast,
    activeReceptionTab,
    setActiveReceptionTab
  } = useHospital();

  const safePatients = Array.isArray(patients) ? patients : [];

  const [selectedPatId, setSelectedPatId] = useState(
    selectedPatientForSticker ? selectedPatientForSticker.id : (safePatients[0]?.id || '')
  );

  // ALWAYS keep selectedPatId synchronized when a newly registered patient is selected or modal opens!
  React.useEffect(() => {
    if (selectedPatientForSticker?.id) {
      setSelectedPatId(selectedPatientForSticker.id);
    } else if (safePatients.length > 0 && !selectedPatId) {
      setSelectedPatId(safePatients[0].id);
    }
  }, [selectedPatientForSticker, isLabelModalOpen, safePatients]);

  const [labelType, setLabelType] = useState('patient-card'); // 'patient-card' | 'blood-edta' | 'blood-fluoride' | 'urine-cup'
  const [copies, setCopies] = useState(2);

  if (!isLabelModalOpen) return null;

  // Ensure newly registered patient is in the list even before full context re-render
  const allPatients = selectedPatientForSticker && !safePatients.some(p => p.id === selectedPatientForSticker.id)
    ? [selectedPatientForSticker, ...safePatients]
    : safePatients;

  const currentPatient = (selectedPatientForSticker && selectedPatientForSticker.id === selectedPatId)
    ? selectedPatientForSticker
    : (allPatients.find(p => p.id === selectedPatId) || selectedPatientForSticker || allPatients[0] || {
        fullName: 'Patient',
        id: 'DH-2026',
        barcode: '2026001',
        age: 30,
        gender: 'Male',
        phone: '-',
        nfcUid: 'NFC-A18F90C2'
      });

  const handleClose = () => {
    setIsLabelModalOpen(false);
    if (activeReceptionTab === 'register') {
      setActiveReceptionTab('dashboard');
    }
  };

  const handlePrint = () => {
    window.print();
    showToast(`Printed ${copies} Barcode Label(s) for ${currentPatient.fullName}`);
    handleClose();
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
        style={{ maxWidth: '620px', position: 'relative', zIndex: 100051 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e59500', color: '#ffffff', padding: '6px', borderRadius: '8px' }}>
              <Printer size={20} />
            </div>
            <div>
              <h3 className="modal-title">Thermal Barcode / NFC Label Printer</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Dual Desk Support: Available at both Reception & Lab</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Patient Selector */}
          <div className="form-grid-2" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label">Select Patient</label>
              <select 
                className="form-select"
                value={selectedPatId}
                onChange={(e) => setSelectedPatId(e.target.value)}
              >
                {allPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sticker Format / Purpose</label>
              <select 
                className="form-select"
                value={labelType}
                onChange={(e) => setLabelType(e.target.value)}
              >
                <option value="patient-card">Patient Card / NFC Tag (Reception)</option>
                <option value="blood-edta">Sample: EDTA Blood Tube (CBC - Purple)</option>
                <option value="blood-fluoride">Sample: Fluoride Tube (Glucose - Grey)</option>
                <option value="urine-cup">Sample: Sterile Urine Container</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Preview (Standard 50mm × 25mm Thermal Label):
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Copies:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={copies} 
                onChange={(e) => setCopies(e.target.value)}
                style={{ width: '50px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Realistic 50mm x 25mm Thermal Sticker Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: '#e2e8f0', borderRadius: '12px' }}>
            <div 
              className="printable-area"
              style={{
                width: '320px',
                minHeight: '160px',
                background: '#ffffff',
                border: '2px dashed #94a3b8',
                borderRadius: '8px',
                padding: '12px 14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
                    COIMBATORE GEN HOSPITAL
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                    {currentPatient.fullName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {currentPatient.age}Y / {currentPatient.gender?.[0]} | {currentPatient.bloodGroup}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                    {currentPatient.id}
                  </div>
                </div>
              </div>

              {/* Barcode & QR Code Center */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0' }}>
                {/* 1D Barcode Graphic */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <svg width="180" height="42" viewBox="0 0 180 42">
                    <rect x="0" y="0" width="3" height="34" fill="#000" />
                    <rect x="5" y="0" width="1" height="34" fill="#000" />
                    <rect x="8" y="0" width="4" height="34" fill="#000" />
                    <rect x="15" y="0" width="2" height="34" fill="#000" />
                    <rect x="19" y="0" width="1" height="34" fill="#000" />
                    <rect x="23" y="0" width="3" height="34" fill="#000" />
                    <rect x="29" y="0" width="2" height="34" fill="#000" />
                    <rect x="33" y="0" width="5" height="34" fill="#000" />
                    <rect x="41" y="0" width="2" height="34" fill="#000" />
                    <rect x="46" y="0" width="4" height="34" fill="#000" />
                    <rect x="53" y="0" width="1" height="34" fill="#000" />
                    <rect x="57" y="0" width="3" height="34" fill="#000" />
                    <rect x="63" y="0" width="2" height="34" fill="#000" />
                    <rect x="68" y="0" width="4" height="34" fill="#000" />
                    <rect x="75" y="0" width="1" height="34" fill="#000" />
                    <rect x="80" y="0" width="3" height="34" fill="#000" />
                    <rect x="86" y="0" width="5" height="34" fill="#000" />
                    <rect x="94" y="0" width="2" height="34" fill="#000" />
                    <rect x="99" y="0" width="1" height="34" fill="#000" />
                    <rect x="103" y="0" width="4" height="34" fill="#000" />
                    <rect x="110" y="0" width="2" height="34" fill="#000" />
                    <rect x="115" y="0" width="3" height="34" fill="#000" />
                    <rect x="121" y="0" width="1" height="34" fill="#000" />
                    <rect x="125" y="0" width="4" height="34" fill="#000" />
                    <rect x="132" y="0" width="2" height="34" fill="#000" />
                    <rect x="137" y="0" width="3" height="34" fill="#000" />
                    <rect x="143" y="0" width="1" height="34" fill="#000" />
                    <rect x="147" y="0" width="5" height="34" fill="#000" />
                    <rect x="155" y="0" width="2" height="34" fill="#000" />
                    <rect x="160" y="0" width="3" height="34" fill="#000" />
                    <rect x="166" y="0" width="1" height="34" fill="#000" />
                    <rect x="170" y="0" width="4" height="34" fill="#000" />
                  </svg>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', marginTop: '2px' }}>
                    *{currentPatient.barcode}*
                  </span>
                </div>

                {/* 2D QR Code Matrix */}
                <div style={{ width: '48px', height: '48px', background: '#000', padding: '3px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', padding: '2px' }}>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div>
                    <div style={{ background: '#000' }}></div>
                  </div>
                </div>
              </div>

              {/* Tag Details Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>
                  {labelType === 'patient-card' && `NFC: ${currentPatient.nfcUid}`}
                  {labelType === 'blood-edta' && `Sample: EDTA (CBC/ESR) Tube`}
                  {labelType === 'blood-fluoride' && `Sample: Fluoride (Glucose) Tube`}
                  {labelType === 'urine-cup' && `Sample: Sterile Urine Specimen`}
                </span>
                <span>19-03-2026 09:15 AM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-clean" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary-amber" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print {copies} Label(s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
