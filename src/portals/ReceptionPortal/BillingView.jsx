import React, { useState } from 'react';
import { CreditCard, Receipt, CheckCircle2, Search, ArrowUpRight, Printer, Sparkles } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const BillingView = () => {
  const { bills, labOrders, prescriptions, showToast, setIsReceiptModalOpen, setSelectedBillForReceipt } = useHospital();
  const [filterType, setFilterType] = useState('all');

  const filteredBills = filterType === 'all' 
    ? (bills || [])
    : (bills || []).filter(b => (b.type || '').toLowerCase().includes(filterType.toLowerCase()));

  const handlePrintReceipt = (bill) => {
    setSelectedBillForReceipt(bill);
    setIsReceiptModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
            Billing & Invoices
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>
            Central Cashier for OPD Consultation, Diagnostic Lab investigations & Pharmacy
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-secondary-clean ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            All Invoices
          </button>
          <button 
            className={`btn-secondary-clean ${filterType === 'lab' ? 'active' : ''}`}
            onClick={() => setFilterType('lab')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Lab Bills
          </button>
          <button 
            className={`btn-secondary-clean ${filterType === 'pharmacy' ? 'active' : ''}`}
            onClick={() => setFilterType('pharmacy')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            Pharmacy Bills
          </button>
        </div>
      </div>

      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Invoice #</th>
              <th>Patient</th>
              <th>Bill Category</th>
              <th>Items & Tests</th>
              <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
              <th style={{ whiteSpace: 'nowrap' }}>Payment Mode</th>
              <th style={{ whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map(bill => (
              <tr key={bill.billId}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                    {bill.billId}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{bill.patientName}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{bill.patientId}</div>
                </td>
                <td>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: (bill.type || '').includes('Lab') ? '#8b5cf6' : '#10b981' }}>
                    {bill.type}
                  </span>
                </td>
                <td style={{ fontSize: '12.5px', color: '#334155', maxWidth: '280px' }}>
                  {bill.description || bill.items || 'Clinical Service'}
                </td>
                <td>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                    ₹{Number(bill.amount || 0).toFixed(2)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                    {bill.mode}
                  </span>
                </td>
                <td>
                  <span className="status-pill completed">
                    <CheckCircle2 size={12} /> {bill.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn-secondary-clean"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={() => handlePrintReceipt(bill)}
                  >
                    <Printer size={13} />
                    <span>Print</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
