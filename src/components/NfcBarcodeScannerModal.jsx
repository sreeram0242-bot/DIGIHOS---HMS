import React, { useState } from 'react';
import { X, Barcode, Radio, Search, CheckCircle2, User, Zap, FileText, Printer, PlusSquare } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const NfcBarcodeScannerModal = () => {
  const { 
    isScannerOpen, 
    setIsScannerOpen, 
    patients = [], 
    handleUniversalScan, 
    setSelectedPatientForSticker,
    setIsLabelModalOpen,
    openPatientDossier,
    setActivePortal,
    setActiveReceptionTab
  } = useHospital();

  const [inputVal, setInputVal] = useState('');
  const [lastScanned, setLastScanned] = useState(null);

  if (!isScannerOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal) return;
    const pat = handleUniversalScan(inputVal, false);
    if (pat) {
      setLastScanned(pat);
    }
  };

  const handleSimulateScan = (code) => {
    setInputVal(code);
    const pat = handleUniversalScan(code, false);
    if (pat) {
      setLastScanned(pat);
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      style={{ zIndex: 100050 }}
      onClick={() => setIsScannerOpen(false)}
    >
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '540px', position: 'relative', zIndex: 100051 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#0d2847', color: '#fbbf24', padding: '5px', borderRadius: '7px' }}>
              <Barcode size={18} />
            </div>
            <h3 className="modal-title">Hardware Scanner Simulator</h3>
          </div>
          <button className="modal-close-btn" onClick={() => setIsScannerOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
            Simulate scanning a patient's <strong>2D Barcode (QR)</strong>, <strong>1D Barcode</strong>, or tapping an <strong>NFC Smart Card</strong>. In production, this trigger fires instantly when hardware detects the signal.
          </p>

          <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  autoFocus
                  className="form-input" 
                  placeholder="Scan or type Patient ID / Phone / Barcode / NFC..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  style={{ paddingLeft: '34px', fontFamily: 'var(--font-mono)' }}
                />
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
              <button type="submit" className="btn-primary-amber" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                Simulate Scan
              </button>
            </div>
          </form>

          {/* Quick Tap NFC / Barcode presets */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Radio size={13} color="#0284c7" />
              <span>Tap Sample NFC Card or Scan Barcode:</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {patients.slice(0, 3).map(pat => (
                <div 
                  key={pat.id}
                  onClick={() => handleSimulateScan(pat.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '7px 10px', 
                    background: '#ffffff', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e59500'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>{pat.fullName}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        ID: {pat.id} | Barcode: {pat.barcode}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Radio size={11} /> {pat.nfcUid}
                    </span>
                    <button 
                      type="button" 
                      className="btn-navy" 
                      style={{ padding: '3px 7px', fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateScan(pat.id);
                      }}
                    >
                      <Zap size={11} /> Tap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Scanned Result */}
          {lastScanned && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <strong style={{ fontSize: '14px', color: '#14532d' }}>
                    Match Verified: {lastScanned.fullName}
                  </strong>
                </div>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {lastScanned.id}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '10px', fontSize: '11.5px', textAlign: 'center' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Age / Sex</span>
                  <strong style={{ color: '#0f172a' }}>{lastScanned.age}Y &bull; {lastScanned.gender}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Blood</span>
                  <strong style={{ color: '#dc2626' }}>{lastScanned.bloodGroup || 'O+'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>BP</span>
                  <strong style={{ color: '#0369a1' }}>{lastScanned.vitals?.bp || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Pulse</span>
                  <strong style={{ color: '#0369a1' }}>{lastScanned.vitals?.pulse || '-'} bpm</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary-clean"
                  style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setSelectedPatientForSticker(lastScanned);
                    setIsScannerOpen(false);
                    setIsLabelModalOpen(true);
                  }}
                  title="Print barcode or sample tube sticker"
                >
                  <Printer size={12} />
                  <span>Print Label</span>
                </button>

                <button
                  type="button"
                  className="btn-navy"
                  style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setIsScannerOpen(false);
                    setActivePortal('reception');
                    setActiveReceptionTab('op-visit');
                  }}
                  title="Create OP or IP visit for this patient"
                >
                  <PlusSquare size={12} />
                  <span>Create Visit</span>
                </button>

                <button
                  type="button"
                  className="btn-primary-amber"
                  style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setIsScannerOpen(false);
                    openPatientDossier(lastScanned);
                  }}
                  title="Open 360 degree Patient History Dossier"
                >
                  <FileText size={12} />
                  <span>All Visits Dossier</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-clean" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => setIsScannerOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
