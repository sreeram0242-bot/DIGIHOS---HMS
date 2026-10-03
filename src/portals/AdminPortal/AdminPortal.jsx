import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Users, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Printer, 
  Search, 
  Filter,
  Package,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { EmployeePortal } from './EmployeePortal';
import { AttendancePortal } from './AttendancePortal';

export const AdminPortal = () => {
  const { 
    bills, 
    pharmacyStock, 
    employees, 
    attendance, 
    addEmployee, 
    markAttendance, 
    addPharmacyItem, 
    updatePharmacyStockQty, 
    showToast 
  } = useHospital();

  const [activeAdminTab, setActiveAdminTab] = useState('revenue'); // 'revenue' | 'pharmacy' | 'employees' | 'attendance'
  const [revenueFilter, setRevenueFilter] = useState('all'); // 'all' | 'doctor_fee' | 'lab_payment' | 'medical_payment'

  // Modals for adding records
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // New Employee Form State
  const [empForm, setEmpForm] = useState({
    name: '',
    designation: '',
    department: 'General Medicine',
    phone: '',
    email: '',
    shift: 'General (09:00 AM - 05:00 PM)',
    salary: 35000
  });

  // New Medicine Form State
  const [medForm, setMedForm] = useState({
    name: '',
    generic: '',
    category: 'Analgesic / Antipyretic',
    unitPrice: 5.0,
    stockQty: 100,
    batch: 'BT-889',
    expiry: '12/2028'
  });

  // Calculations for Combined Revenue
  const totalCombinedRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalDoctorFees = bills.filter(b => b.category === 'doctor_fee').reduce((sum, b) => sum + b.amount, 0);
  const totalLabPayments = bills.filter(b => b.category === 'lab_payment').reduce((sum, b) => sum + b.amount, 0);
  const totalMedicalPayments = bills.filter(b => b.category === 'medical_payment').reduce((sum, b) => sum + b.amount, 0);

  const filteredBills = revenueFilter === 'all'
    ? bills
    : bills.filter(b => b.category === revenueFilter);

  // Attendance stats
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.phone) {
      alert('Please fill employee name and phone');
      return;
    }
    addEmployee(empForm);
    setShowAddEmpModal(false);
    setEmpForm({
      name: '',
      designation: '',
      department: 'General Medicine',
      phone: '',
      email: '',
      shift: 'General (09:00 AM - 05:00 PM)',
      salary: 35000
    });
  };

  const handleCreateMedicine = (e) => {
    e.preventDefault();
    if (!medForm.name) {
      alert('Please enter medicine name');
      return;
    }
    addPharmacyItem(medForm);
    setShowAddMedModal(false);
    setMedForm({
      name: '',
      generic: '',
      category: 'Analgesic / Antipyretic',
      unitPrice: 5.0,
      stockQty: 100,
      batch: 'BT-889',
      expiry: '12/2028'
    });
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Header & Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            Hospital Administration & Governance
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Central financial revenue ledger, pharmacy inventory master, staff employees & attendance
          </p>
        </div>

        {/* Compact Admin Tabs */}
        <div className="tab-pills-row">
          <button 
            className={`tab-pill-btn ${activeAdminTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('revenue')}
          >
            <DollarSign size={14} />
            <span>Combined Revenue</span>
          </button>

          <button 
            className={`tab-pill-btn ${activeAdminTab === 'pharmacy' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('pharmacy')}
          >
            <Package size={14} />
            <span>Pharmacy Items</span>
          </button>

          <button 
            className={`tab-pill-btn ${activeAdminTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('employees')}
          >
            <Users size={14} />
            <span>Employees ({employees.length})</span>
          </button>

          <button 
            className={`tab-pill-btn ${activeAdminTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('attendance')}
          >
            <CalendarCheck size={14} />
            <span>Attendance</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COMBINED REVENUE LEDGER */}
      {activeAdminTab === 'revenue' && (
        <div>
          {/* Revenue KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Combined Revenue</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                INR {totalCombinedRevenue.toFixed(2)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '3px' }}>
                All hospital receipts combined
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Doctor Consultation Fees</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                INR {totalDoctorFees.toFixed(2)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '3px' }}>
                OPD Tokens & Consultations
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Lab / Diagnostic Payments</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlaskConical size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                INR {totalLabPayments.toFixed(2)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#7c3aed', marginTop: '3px' }}>
                Pathology & Blood Tests
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Pharmacy / Medical Payments</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                INR {totalMedicalPayments.toFixed(2)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#d97706', marginTop: '3px' }}>
                Medicines & Pharmacy Counter
              </div>
            </div>
          </div>

          {/* Revenue Filters & Table */}
          <div className="modern-table-container printable-area">
            {/* Header visible only on print */}
            <div className="print-only" style={{ padding: '16px 20px', borderBottom: '2px solid #0f172a', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0a1f36', margin: 0 }}>
                    COIMBATORE GENERAL HOSPITAL
                  </h2>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                    Central Financial Audit & Collections Statement
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    GSTIN: 33AAACG1234F1Z5 &bull; Reg: CGH-MED-2026-TN
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                  <div>Category: <strong style={{ color: '#0f172a' }}>{revenueFilter.toUpperCase()}</strong></div>
                  <div>Report Generated: <strong>{new Date().toLocaleString('en-IN')}</strong></div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>
                    Total: INR {filteredBills.reduce((s, b) => s + b.amount, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} color="#64748b" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Filter Revenue Stream:</span>
                <button 
                  className={`btn-secondary-clean ${revenueFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRevenueFilter('all')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  All Streams ({bills.length})
                </button>
                <button 
                  className={`btn-secondary-clean ${revenueFilter === 'doctor_fee' ? 'active' : ''}`}
                  onClick={() => setRevenueFilter('doctor_fee')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  Doctor Fees
                </button>
                <button 
                  className={`btn-secondary-clean ${revenueFilter === 'lab_payment' ? 'active' : ''}`}
                  onClick={() => setRevenueFilter('lab_payment')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  Lab Payments
                </button>
                <button 
                  className={`btn-secondary-clean ${revenueFilter === 'medical_payment' ? 'active' : ''}`}
                  onClick={() => setRevenueFilter('medical_payment')}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  Medical / Pharmacy
                </button>
              </div>

              <button 
                className="btn-navy" 
                style={{ padding: '5px 12px', fontSize: '12px' }}
                onClick={() => window.print()}
              >
                <Printer size={13} />
                <span>Print Ledger</span>
              </button>
            </div>

            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Invoice Ref</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th>Stream Category</th>
                  <th>Patient Details</th>
                  <th>Description / Services</th>
                  <th>Payment Mode</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill.billId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                      {bill.billId}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                      {bill.date} {bill.time}
                    </td>
                    <td>
                      {bill.category === 'doctor_fee' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#0369a1', background: '#eff6ff', padding: '2px 7px', borderRadius: '4px' }}>
                          <Stethoscope size={12} /> Doctor Fee
                        </span>
                      )}
                      {bill.category === 'lab_payment' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '2px 7px', borderRadius: '4px' }}>
                          <FlaskConical size={12} /> Lab Payment
                        </span>
                      )}
                      {bill.category === 'medical_payment' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#b45309', background: '#fffbeb', padding: '2px 7px', borderRadius: '4px' }}>
                          <Pill size={12} /> Pharmacy
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{bill.patientName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{bill.patientId}</div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#334155', maxWidth: '300px' }}>
                      {bill.description}
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {bill.mode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                        INR {bill.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill completed">
                        <CheckCircle2 size={11} /> Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PHARMACY ITEMS MASTER */}
      {activeAdminTab === 'pharmacy' && (
        <div>
          <div className="modern-table-container">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Pharmacy Stock Master ({pharmacyStock.length} Medicines)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Manage stock quantities, unit pricing, batch numbers, and reorder levels
                </p>
              </div>

              <button 
                className="btn-primary-amber" 
                onClick={() => setShowAddMedModal(true)}
                style={{ padding: '6px 12px', fontSize: '12.5px' }}
              >
                <Plus size={14} />
                <span>Add New Medicine</span>
              </button>
            </div>

            <table className="modern-table">
              <thead>
                <tr>
                  <th>Item Code & Name</th>
                  <th>Generic Formula</th>
                  <th>Category</th>
                  <th>Batch / Expiry</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyStock.map(med => (
                  <tr key={med.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{med.name}</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>{med.id}</span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#475569' }}>{med.generic}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{med.category}</td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {med.batch} &bull; {med.expiry}
                    </td>
                    <td style={{ fontWeight: 600 }}>INR {med.unitPrice.toFixed(2)}</td>
                    <td>
                      <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: med.stockQty === 0 ? '#ef4444' : med.stockQty < 30 ? '#d97706' : '#059669' }}>
                        {med.stockQty} tabs
                      </span>
                    </td>
                    <td>
                      {med.isAvailable ? (
                        <span className="status-pill completed">In Stock</span>
                      ) : (
                        <span className="status-pill cancelled">Out of Stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button 
                          className="btn-secondary-clean" 
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          onClick={() => updatePharmacyStockQty(med.id, 20)}
                          title="Restock +20 tabs"
                        >
                          +20
                        </button>
                        <button 
                          className="btn-secondary-clean" 
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          onClick={() => updatePharmacyStockQty(med.id, -10)}
                          title="Reduce -10 tabs"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEES ROSTER (DEDICATED DETAILED PORTAL) */}
      {activeAdminTab === 'employees' && (
        <EmployeePortal />
      )}

      {/* TAB 4: STAFF ATTENDANCE (DEDICATED DETAILED BIOMETRIC PORTAL) */}
      {activeAdminTab === 'attendance' && (
        <AttendancePortal />
      )}

      {/* Modal: Add Employee */}
      {showAddEmpModal && (
        <div className="modal-backdrop" onClick={() => setShowAddEmpModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Hospital Employee</h3>
              <button className="modal-close-btn" onClick={() => setShowAddEmpModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Employee Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={empForm.name} 
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} 
                    placeholder="e.g. Dr. Ramesh Kumar"
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Designation / Role</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={empForm.designation} 
                      onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })} 
                      placeholder="e.g. Staff Nurse"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select 
                      className="form-select"
                      value={empForm.department}
                      onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pathology & Lab">Pathology & Lab</option>
                      <option value="Pharmacy Dispensary">Pharmacy Dispensary</option>
                      <option value="Front Desk & Triage">Front Desk & Triage</option>
                      <option value="Nursing & Casualty">Nursing & Casualty</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      className="form-input" 
                      value={empForm.phone} 
                      onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} 
                      placeholder="+91 98400 XXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={empForm.email} 
                      onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} 
                      placeholder="staff@digihos.in"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Shift Timing</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={empForm.shift} 
                      onChange={(e) => setEmpForm({ ...empForm, shift: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Salary (INR)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={empForm.salary} 
                      onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowAddEmpModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-amber">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Medicine */}
      {showAddMedModal && (
        <div className="modal-backdrop" onClick={() => setShowAddMedModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Medicine to Pharmacy Inventory</h3>
              <button className="modal-close-btn" onClick={() => setShowAddMedModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateMedicine}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Medicine Brand Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={medForm.name} 
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} 
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Generic Formula</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={medForm.generic} 
                      onChange={(e) => setMedForm({ ...medForm, generic: e.target.value })} 
                      placeholder="e.g. Acetaminophen"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={medForm.category} 
                      onChange={(e) => setMedForm({ ...medForm, category: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-grid-4">
                  <div className="form-group">
                    <label className="form-label">Unit Price (INR)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-input" 
                      value={medForm.unitPrice} 
                      onChange={(e) => setMedForm({ ...medForm, unitPrice: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Qty</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={medForm.stockQty} 
                      onChange={(e) => setMedForm({ ...medForm, stockQty: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch #</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={medForm.batch} 
                      onChange={(e) => setMedForm({ ...medForm, batch: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={medForm.expiry} 
                      onChange={(e) => setMedForm({ ...medForm, expiry: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowAddMedModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-amber">Add to Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
