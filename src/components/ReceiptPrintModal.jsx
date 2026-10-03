import React, { useRef } from 'react';
import { X, Printer, Receipt, CheckCircle2, ShieldCheck, Building2, ExternalLink } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const ReceiptPrintModal = () => {
  const { 
    isReceiptModalOpen, 
    setIsReceiptModalOpen, 
    selectedBillForReceipt, 
    patients, 
    showToast 
  } = useHospital();

  const printAreaRef = useRef(null);

  if (!isReceiptModalOpen || !selectedBillForReceipt) return null;

  const bill = selectedBillForReceipt;
  const safePatients = Array.isArray(patients) ? patients : [];
  const patient = safePatients.find(p => p.id === bill.patientId) || {
    id: bill.patientId || 'DH-2026',
    fullName: bill.patientName || 'Patient',
    age: bill.age || 38,
    gender: bill.gender || 'Male',
    phone: bill.phone || '-'
  };

  const handlePrint = () => {
    window.print();
    showToast(`Printed Receipt #${bill.billId} for ${bill.patientName}`);
  };

  const handlePrintPopup = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${bill.billId}_${patient.fullName?.replace(/\\s+/g, '_')}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; padding: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, th * { color: #000000 !important; -webkit-text-fill-color: #000000 !important; font-weight: 700 !important; white-space: nowrap !important; }
            td, td * { color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
          </style>
        </head>
        <body>
          <div>${content}</div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`Opened Receipt Print Window`);
  };

  const handleClose = () => {
    setIsReceiptModalOpen(false);
  };

  const getCategoryLabel = (cat) => {
    if (cat === 'doctor_fee') return 'Doctor OPD Consultation Fee';
    if (cat === 'lab_payment') return 'Diagnostic Pathology Lab Investigation';
    if (cat === 'medical_payment') return 'In-House Pharmacy & Medication';
    return bill.type || 'Hospital Healthcare Service';
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
        style={{ maxWidth: '680px', position: 'relative', zIndex: 100051 }}
      >
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#10b981', color: '#ffffff', padding: '6px', borderRadius: '8px' }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="modal-title">Official Billing & Cashier Receipt</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Receipt Ref: {bill.billId} &bull; Payment Settled</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Printable Document */}
        <div className="modal-body" style={{ background: '#f1f5f9', padding: '20px' }}>
          
          <div 
            ref={printAreaRef}
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
            {/* Hospital Letterhead Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #cbd5e1', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={24} color="#0a1f36" />
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0a1f36', letterSpacing: '0.5px' }}>
                    COIMBATORE GENERAL HOSPITAL
                  </h2>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  104, Trichy Road, Singanallur, Coimbatore - 641005 &bull; Phone: +91 422 2456789
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Govt Reg No: CGH-MED-2026-TN &bull; GSTIN: 33AAACG1234F1Z5 &bull; NABH Accredited
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  background: '#ecfdf5', 
                  color: '#065f46', 
                  border: '1px solid #a7f3d0', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}>
                  <CheckCircle2 size={12} color="#059669" /> PAYMENT PAID
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
                  Date: <strong>{bill.date || new Date().toISOString().split('T')[0]}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Time: <strong>{bill.time || '10:00 AM'}</strong>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#0f172a' }}>
                OFFICIAL CASH RECEIPT / TAX MEMO
              </span>
            </div>

            {/* Patient & Billing Demographics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '12px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Patient Full Name:</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{patient.fullName}</div>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  Age / Sex: <strong>{patient.age} Y / {patient.gender}</strong>
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Hospital UHID / Patient ID:</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0369a1' }}>{patient.id}</div>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  Phone: <strong>{patient.phone}</strong>
                </div>
              </div>
            </div>

            {/* Particulars Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12.5px', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', width: '35px', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Particulars / Service Description</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap', borderRight: '1px solid #cbd5e1' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 700, color: '#000000', WebkitTextFillColor: '#000000', whiteSpace: 'nowrap' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 10px', verticalAlign: 'top', color: '#64748b' }}>1</td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{bill.type}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{bill.description}</div>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#475569', verticalAlign: 'top' }}>
                    {getCategoryLabel(bill.category)}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a', verticalAlign: 'top' }}>
                    {Number(bill.amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total Calculation & Payment Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px' }}>
                <div style={{ color: '#475569' }}>
                  Payment Mode: <strong style={{ color: '#0f172a' }}>{bill.mode || 'Cash Counter'}</strong>
                </div>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  Settlement Ref: <strong style={{ fontFamily: 'var(--font-mono)', color: '#0369a1' }}>{bill.billId}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
                  &bull; Verified & Deposited into Central Hospital Treasury
                </div>
              </div>

              <div style={{ width: '220px', textAlign: 'right', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>INR {Number(bill.amount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>GST (Health Exempt):</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>INR 0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #0f172a', paddingTop: '6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  <span>Net Paid:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#0369a1' }}>INR {Number(bill.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Official Hospital Seal & Cashier Signature Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b', maxWidth: '320px' }}>
                * This is a computer generated official receipt. Valid for insurance claims and tax deduction under Sec 80D of the Income Tax Act.
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  border: '1.5px solid #0369a1', 
                  borderRadius: '4px', 
                  padding: '4px 10px', 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  color: '#0369a1', 
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  letterSpacing: '0.5px'
                }}>
                  COIMBATORE GEN HOSPITAL &bull; CASHIER DESK 01
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Authorized Cashier Signature</div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Official Cashier Receipt &bull; Section 80D Tax Deductible
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary-clean" onClick={handleClose}>
              Close
            </button>
            <button 
              className="btn-secondary-clean" 
              onClick={handlePrintPopup}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <ExternalLink size={14} />
              <span>Print in New Tab</span>
            </button>
            <button className="btn-primary-amber" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
