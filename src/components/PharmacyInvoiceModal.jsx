import React from 'react';
import { X, Printer, Pill, CheckCircle2, Building2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const PharmacyInvoiceModal = () => {
  const { 
    isPharmacyInvoiceModalOpen, 
    setIsPharmacyInvoiceModalOpen, 
    selectedRxForInvoice, 
    patients, 
    pharmacyStock,
    showToast 
  } = useHospital();

  if (!isPharmacyInvoiceModalOpen || !selectedRxForInvoice) return null;

  const rx = selectedRxForInvoice;
  const safePatients = Array.isArray(patients) ? patients : [];
  const patient = safePatients.find(p => p.id === rx.patientId) || {
    id: rx.patientId || 'DH-2026',
    fullName: rx.patientName || 'Patient',
    age: rx.age || 35,
    gender: rx.gender || 'Male',
    phone: rx.phone || '-'
  };

  const handlePrint = () => {
    window.print();
    showToast(`Printed Pharmacy Invoice for Rx #${rx.prescriptionId}`);
  };

  const handleClose = () => {
    setIsPharmacyInvoiceModalOpen(false);
  };

  const safeItems = Array.isArray(rx.items) ? rx.items : [];
  const totalAmount = safeItems.reduce((sum, it) => sum + ((Number(it.qty) || 1) * (Number(it.unitPrice) || 10)), 0) || Number(rx.totalAmount) || 150;
  const cgst = (totalAmount * 0.06).toFixed(2);
  const sgst = (totalAmount * 0.06).toFixed(2);
  const subtotal = (totalAmount - (totalAmount * 0.12)).toFixed(2);

  return (
    <div 
      className="modal-backdrop" 
      style={{ zIndex: 100050 }}
      onClick={handleClose}
    >
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '720px', position: 'relative', zIndex: 100051 }}
      >
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0284c7', color: '#ffffff', padding: '6px', borderRadius: '8px' }}>
              <Pill size={20} />
            </div>
            <div>
              <h3 className="modal-title">Pharmacy Tax Invoice & Dispensing Slip</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Rx Ref: {rx.prescriptionId} &bull; Official Drug Invoice</p>
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
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '28px 32px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              color: '#0f172a',
              fontFamily: 'var(--font-body)'
            }}
          >
            {/* Pharmacy Letterhead Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #cbd5e1', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="#0a1f36" />
                  <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0a1f36', letterSpacing: '0.5px' }}>
                    DIGIHOS PHARMACY & MEDICAL STORES
                  </h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  Division of Coimbatore General Hospital &bull; 104 Trichy Road, Coimbatore - 641005
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
                  DL Nos: 20B/TN/10492, 21B/TN/10493 &bull; GSTIN: 33AAACG1234F1Z5 &bull; Ph: +91 422 2456799
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  background: '#eff6ff', 
                  color: '#0369a1', 
                  border: '1px solid #bae6fd', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 700 
                }}>
                  PHARMACY CASH MEMO
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
                  Invoice: <strong style={{ fontFamily: 'var(--font-mono)' }}>PHARM-{rx.prescriptionId}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Patient & Doctor Demographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Patient Details:</div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>{patient.fullName}</div>
                <div style={{ color: '#475569', marginTop: '1px' }}>
                  UHID: <strong style={{ fontFamily: 'var(--font-mono)', color: '#0369a1' }}>{patient.id}</strong> &bull; {patient.age}Y / {patient.gender}
                </div>
                <div style={{ color: '#475569' }}>Phone: {patient.phone}</div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Prescribing Physician:</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Dr. Arvind Ramesh, MD (Gen Med)</div>
                <div style={{ color: '#475569', marginTop: '1px' }}>Reg No: TN-MC-44910 &bull; Room 102</div>
                <div style={{ color: '#475569' }}>Rx ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{rx.prescriptionId}</strong></div>
              </div>
            </div>

            {/* Dispensed Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '11.5px', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', width: '25px', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Medicine Name & Generic Salt</th>
                  <th style={{ textAlign: 'left', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Batch / Exp</th>
                  <th style={{ textAlign: 'left', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Dosage & Timing</th>
                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', width: '45px', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', width: '65px', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: '7px 8px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', width: '75px', whiteSpace: 'nowrap' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rx.items?.map((item, idx) => {
                  const stockMatch = pharmacyStock.find(m => m.id === item.medicineId || m.name.toLowerCase().includes(item.name?.toLowerCase()));
                  const itemTotal = (item.qty * (item.unitPrice || 10)).toFixed(2);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 8px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{stockMatch?.generic || 'Essential Therapeutic Form'}</div>
                      </td>
                      <td style={{ padding: '8px 8px', color: '#475569', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {stockMatch?.batch || 'BT-2026'}<br />
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Exp: {stockMatch?.expiry || '12/2028'}</span>
                      </td>
                      <td style={{ padding: '8px 8px', color: '#334155' }}>
                        <strong>{item.dosage}</strong> ({item.duration})<br />
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>{item.timing}</span>
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700 }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {Number(item.unitPrice || 10).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {itemTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', color: '#475569', maxWidth: '340px' }}>
                <div>Payment Mode: <strong>Central Pharmacy Cash / UPI Counter</strong></div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px' }}>
                  * Schedule H & H1 warning: To be sold by retail on the prescription of a Registered Medical Practitioner only.
                </div>
              </div>

              <div style={{ width: '220px', textAlign: 'right', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>Taxable Amount:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>INR {subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>CGST @ 6%:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>INR {cgst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>SGST @ 6%:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>INR {sgst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #0f172a', paddingTop: '5px', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>INR {Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pharmacist Signature & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                Goods once sold cannot be returned without original cash memo and intact manufacturer packaging.
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  border: '1.5px solid #0284c7', 
                  borderRadius: '4px', 
                  padding: '3px 8px', 
                  fontSize: '9.5px', 
                  fontWeight: 800, 
                  color: '#0284c7', 
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  DIGIHOS PHARMACY &bull; DISPENSED & VERIFIED
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>R. Balasubramanian (Reg. Pharmacist)</div>
              </div>
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
            <span>Print Tax Invoice & Dispensing Bill</span>
          </button>
        </div>

      </div>
    </div>
  );
};
