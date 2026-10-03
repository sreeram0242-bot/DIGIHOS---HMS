import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  Radio, 
  Printer, 
  X, 
  Edit3, 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  FileText,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  FlaskConical,
  Pill,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const EmployeePortal = () => {
  const { employees = [], addEmployee, showToast, setActivePortal } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmpForDetails, setSelectedEmpForDetails] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // New Employee Form State
  const [form, setForm] = useState({
    name: '',
    designation: '',
    department: 'General Medicine',
    qualifications: 'MBBS, MD',
    councilRegNo: 'TNM-88491',
    phone: '',
    email: '',
    shift: 'Morning (08:00 AM - 02:00 PM)',
    salary: 45000,
    bankAccount: '918273645102',
    ifscCode: 'HDFC0001824',
    biometricCardId: 'RFID-' + Math.floor(1000 + Math.random() * 9000),
    joiningDate: '2025-06-01',
    emergencyContact: '',
    emergencyRelation: 'Spouse',
    address: 'Coimbatore, Tamil Nadu',
    status: 'Active'
  });

  const departments = [
    'All',
    'General Medicine',
    'Pathology & Lab',
    'Pharmacy Dispensary',
    'Nursing & Triage',
    'Front Desk & Triage',
    'Administration & Billing'
  ];

  const shifts = [
    'All',
    'Morning (08:00 AM - 02:00 PM)',
    'Morning (08:00 AM - 04:00 PM)',
    'General (09:00 AM - 05:00 PM)',
    'General (09:00 AM - 06:00 PM)',
    'Evening (02:00 PM - 09:00 PM)',
    'Night (09:00 PM - 07:00 AM)'
  ];

  // Bulletproof array handling
  const safeEmployees = Array.isArray(employees) ? employees : [];

  // Filtered employees list with full defensive checks
  const filteredEmployees = safeEmployees.filter(emp => {
    if (!emp) return false;
    const name = String(emp.name || '').toLowerCase();
    const id = String(emp.id || '').toLowerCase();
    const phone = String(emp.phone || '').toLowerCase();
    const designation = String(emp.designation || '').toLowerCase();
    const q = String(searchQuery || '').toLowerCase().trim();
    
    const matchesSearch = !q || 
      name.includes(q) ||
      id.includes(q) ||
      phone.includes(q) ||
      designation.includes(q);
    
    const dept = String(emp.department || '');
    const shift = String(emp.shift || '');
    const status = String(emp.status || 'Active');

    const matchesDept = selectedDept === 'All' || dept.toLowerCase() === selectedDept.toLowerCase() || (selectedDept === 'Pathology & Lab' && dept.toLowerCase().includes('lab'));
    const matchesShift = selectedShift === 'All' || shift.toLowerCase().includes(selectedShift.split(' ')[0].toLowerCase());
    const matchesStatus = selectedStatus === 'All' || status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  // KPI Metrics calculation
  const totalStaff = safeEmployees.length;
  const doctorsCount = safeEmployees.filter(e => {
    const des = String(e?.designation || '').toLowerCase();
    const nm = String(e?.name || '').toLowerCase();
    return des.includes('consultant') || des.includes('physician') || des.includes('pathologist') || des.includes('dr.') || nm.includes('dr.');
  }).length;
  const nursingCount = safeEmployees.filter(e => String(e?.department || '').toLowerCase().includes('nursing')).length;
  const labPharmCount = safeEmployees.filter(e => {
    const dept = String(e?.department || '').toLowerCase();
    return dept.includes('lab') || dept.includes('pharmacy') || dept.includes('pathology');
  }).length;
  const totalPayroll = safeEmployees.reduce((acc, e) => acc + (Number(e?.salary) || 0), 0);

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Please fill in employee name and phone number');
      return;
    }

    const nextId = `EMP-0${safeEmployees.length + 1}`;
    const newEmp = {
      id: nextId,
      name: form.name,
      designation: form.designation || 'Staff Officer',
      department: form.department,
      qualifications: form.qualifications || 'Certified Professional',
      councilRegNo: form.councilRegNo || 'REG-2026',
      phone: form.phone.startsWith('+91') ? form.phone : `+91 ${form.phone}`,
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '.')}@digihos.in`,
      shift: form.shift,
      salary: Number(form.salary) || 35000,
      bankAccount: form.bankAccount || '987654321012',
      ifscCode: form.ifscCode || 'HDFC0001824',
      biometricCardId: form.biometricCardId || `RFID-${Math.floor(1000 + Math.random() * 9000)}`,
      joiningDate: form.joiningDate || '2026-03-19',
      emergencyContact: form.emergencyContact || '',
      status: form.status || 'Active'
    };

    if (addEmployee) {
      addEmployee(newEmp);
    }
    if (showToast) {
      showToast(`Registered new staff member: ${newEmp.name} (${newEmp.id})`);
    }
    setShowAddModal(false);
    setForm({
      name: '',
      designation: '',
      department: 'General Medicine',
      qualifications: 'MBBS, MD',
      councilRegNo: 'TNM-88491',
      phone: '',
      email: '',
      shift: 'Morning (08:00 AM - 02:00 PM)',
      salary: 45000,
      bankAccount: '918273645102',
      ifscCode: 'HDFC0001824',
      biometricCardId: 'RFID-' + Math.floor(1000 + Math.random() * 9000),
      joiningDate: '2025-06-01',
      emergencyContact: '',
      emergencyRelation: 'Spouse',
      address: 'Coimbatore, Tamil Nadu',
      status: 'Active'
    });
  };

  const getDepartmentIcon = (dept) => {
    const d = String(dept || '').toLowerCase();
    if (d.includes('medicine')) return <Stethoscope size={16} color="#0284c7" />;
    if (d.includes('lab') || d.includes('pathology')) return <FlaskConical size={16} color="#7c3aed" />;
    if (d.includes('pharmacy')) return <Pill size={16} color="#16a34a" />;
    if (d.includes('nursing')) return <HeartHandshake size={16} color="#e11d48" />;
    return <Building2 size={16} color="#64748b" />;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button 
              type="button"
              onClick={() => setActivePortal && setActivePortal('admin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              <ArrowLeft size={13} />
              <span>Admin Center</span>
            </button>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>Staff & Human Resources</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Hospital Staff & Workforce Directory
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
            Complete physician credentials, clinical staff roster, shift schedules & payroll directory
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            className="btn-secondary-clean"
            style={{ padding: '7px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActivePortal && setActivePortal('attendance')}
            title="Switch to Staff Attendance Tracking"
          >
            <Clock size={14} />
            <span>Attendance Log</span>
          </button>

          <button 
            type="button" 
            className="btn-primary-amber" 
            style={{ padding: '7px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={15} />
            <span>Register New Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
            <span>TOTAL WORKFORCE</span>
            <Users size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {totalStaff} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Staff</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            100% Verified Credentials
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
            <span>SENIOR PHYSICIANS</span>
            <Stethoscope size={16} color="#0d9488" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {doctorsCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Doctors</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            OPD & Specialty Consultants
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
            <span>NURSING & PARAMEDIC</span>
            <HeartHandshake size={16} color="#e11d48" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {nursingCount + labPharmCount} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Staff</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Nursing, Lab & Pharmacy Techs
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
            <span>MONTHLY PAYROLL</span>
            <DollarSign size={16} color="#e59500" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            ₹{totalPayroll.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            Direct Bank Transfer Active
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search by staff name, ID, phone, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '12.5px' }}
            />
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          <select 
            className="form-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '7px 10px' }}
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>

          <select 
            className="form-select"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            style={{ width: 'auto', fontSize: '12px', padding: '7px 10px' }}
          >
            {shifts.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Shifts' : s.split(' ')[0] + ' Shift'}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            className={`btn-secondary-clean ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Cards View
          </button>
          <button 
            type="button" 
            className={`btn-secondary-clean ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Data Table
          </button>
        </div>
      </div>

      {/* 4. Main Employees Grid / Table */}
      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredEmployees.map(emp => {
            const des = String(emp?.designation || '').toLowerCase();
            const nm = String(emp?.name || '').toLowerCase();
            const isDoctor = des.includes('physician') || des.includes('pathologist') || des.includes('dr.') || nm.includes('dr.');
            const initials = String(emp?.name || 'Staff')
              .split(' ')
              .filter(Boolean)
              .map(n => n[0])
              .slice(0, 2)
              .join('');
            
            const empId = emp?.id || 'EMP';
            const empName = emp?.name || 'Staff Member';
            const empDesignation = emp?.designation || 'Healthcare Professional';
            const empDepartment = emp?.department || 'General Medicine';
            const empShift = emp?.shift || 'Morning (08:00 AM - 02:00 PM)';
            const empPhone = emp?.phone || '+91 94431 00000';
            const empSalary = Number(emp?.salary) || 35000;
            const empStatus = emp?.status || 'Active';
            const empRfid = emp?.biometricCardId || 'RFID-4102';

            return (
              <div 
                key={empId}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  {/* Top Row: Avatar & Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px', 
                        background: isDoctor ? '#0a1f36' : '#e0f2fe', 
                        color: isDoctor ? '#38bdf8' : '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {empName}
                          </h4>
                          <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                            {empId}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                          {empDesignation}
                        </div>
                      </div>
                    </div>

                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      background: empStatus === 'Active' ? '#ecfdf5' : '#fef2f2',
                      color: empStatus === 'Active' ? '#059669' : '#dc2626',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span className="live-pulse-dot" style={{ width: '6px', height: '6px', background: empStatus === 'Active' ? '#10b981' : '#ef4444' }}></span>
                      {empStatus}
                    </span>
                  </div>

                  {/* Middle Info Chips */}
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', marginBottom: '6px' }}>
                      {getDepartmentIcon(empDepartment)}
                      <strong>{empDepartment}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', marginBottom: '4px' }}>
                      <Clock size={13} color="#94a3b8" />
                      <span>{empShift}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b' }}>
                      <Phone size={13} color="#94a3b8" />
                      <span>{empPhone}</span>
                    </div>
                  </div>

                  {/* Additional Credentials */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', paddingBottom: '10px' }}>
                    <span>Biometric RFID: <strong style={{ color: '#0f172a' }}>{empRfid}</strong></span>
                    <span>Salary: <strong style={{ color: '#059669' }}>₹{empSalary.toLocaleString('en-IN')}/mo</strong></span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <button 
                    type="button"
                    className="btn-secondary-clean"
                    style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setSelectedEmpForDetails(emp);
                      setShowPayslipModal(true);
                    }}
                  >
                    <FileText size={12} />
                    <span>Payslip</span>
                  </button>

                  <button 
                    type="button"
                    className="btn-navy"
                    style={{ padding: '4px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setSelectedEmpForDetails(emp)}
                  >
                    <span>Full Profile</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <Users size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No Staff Found</h4>
              <p style={{ fontSize: '12.5px', marginTop: '2px' }}>No employee records match your filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        /* Data Table View */
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Shift Timings</th>
                <th>Phone</th>
                <th>Monthly Salary</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const empSalary = Number(emp?.salary) || 35000;
                return (
                  <tr key={emp.id || Math.random()}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 600 }}>{emp.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{emp.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {getDepartmentIcon(emp.department)}
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>{emp.designation}</td>
                    <td style={{ fontSize: '11.5px', color: '#64748b' }}>{emp.shift}</td>
                    <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{emp.phone}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>₹{empSalary.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '2px 7px', 
                        borderRadius: '4px',
                        background: emp.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: emp.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className="btn-secondary-clean" 
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                        onClick={() => setSelectedEmpForDetails(emp)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Register New Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#0a1f36', color: '#38bdf8', padding: '6px', borderRadius: '7px' }}>
                  <UserPlus size={18} />
                </div>
                <h3 className="modal-title">Register New Hospital Staff Member</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name & Title *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Dr. Kavitha Balaji, MD"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation / Role *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Senior Pediatrician / Staff Nurse"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select 
                      className="form-select"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    >
                      {departments.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift Schedule *</label>
                    <select 
                      className="form-select"
                      value={form.shift}
                      onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    >
                      {shifts.filter(s => s !== 'All').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Mobile Phone *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="9842100000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Official Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="name@digihos.in"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Gross Salary (INR)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Biometric RFID Badge ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={form.biometricCardId}
                      onChange={(e) => setForm({ ...form, biometricCardId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Medical Council / Degree Reg No.</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="TNM-90218"
                      value={form.councilRegNo}
                      onChange={(e) => setForm({ ...form, councilRegNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employment Status</label>
                    <select 
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active">Active Duty</option>
                      <option value="On Leave">On Approved Leave</option>
                      <option value="Probation">Probationary</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-amber">
                  <UserPlus size={14} />
                  <span>Register Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Employee Full 360 Profile Modal */}
      {selectedEmpForDetails && !showPayslipModal && (
        <div className="modal-backdrop" onClick={() => setSelectedEmpForDetails(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0a1f36', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {String(selectedEmpForDetails.name || 'Staff').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="modal-title">{selectedEmpForDetails.name}</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>Staff ID: {selectedEmpForDetails.id} &bull; {selectedEmpForDetails.designation}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedEmpForDetails(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Department</span>
                    <strong>{selectedEmpForDetails.department || 'General Medicine'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Assigned Shift</span>
                    <strong>{selectedEmpForDetails.shift || 'General Shift'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Mobile Phone</span>
                    <strong>{selectedEmpForDetails.phone || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Official Email</span>
                    <strong>{selectedEmpForDetails.email || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Biometric Smart Card</span>
                    <strong>{selectedEmpForDetails.biometricCardId || 'RFID-9901'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Monthly Gross CTC</span>
                    <strong style={{ color: '#059669' }}>₹{Number(selectedEmpForDetails.salary || 35000).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Clinical & Professional Credentials
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  &bull; Qualifications: <strong>{selectedEmpForDetails.qualifications || 'MBBS, Clinical Certifications'}</strong><br />
                  &bull; Registration Board: <strong>Tamil Nadu Medical / Nursing Council</strong><br />
                  &bull; Duty Room Station: <strong>Consultation Room 102</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary-clean"
                onClick={() => setShowPayslipModal(true)}
              >
                <FileText size={13} />
                <span>Generate Salary Slip</span>
              </button>
              <button 
                type="button" 
                className="btn-navy" 
                onClick={() => setSelectedEmpForDetails(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Salary Slip Modal */}
      {showPayslipModal && selectedEmpForDetails && (
        <div className="modal-backdrop" onClick={() => setShowPayslipModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} color="#0284c7" />
                <h3 className="modal-title">Employee Pay Slip - March 2026</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPayslipModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body printable-area">
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>COIMBATORE GENERAL HOSPITAL</h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>Monthly Salary Disbursal Slip &bull; Confirmed Direct Transfer</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '14px' }}>
                <div><strong>Employee:</strong> {selectedEmpForDetails.name}</div>
                <div><strong>Staff ID:</strong> {selectedEmpForDetails.id}</div>
                <div><strong>Department:</strong> {selectedEmpForDetails.department}</div>
                <div><strong>Designation:</strong> {selectedEmpForDetails.designation}</div>
                <div><strong>Pay Period:</strong> 01 March 2026 - 31 March 2026</div>
                <div><strong>Payment Mode:</strong> NEFT / Direct Account</div>
              </div>

              {(() => {
                const baseSal = Number(selectedEmpForDetails.salary) || 35000;
                const basic = Math.round(baseSal * 0.5);
                const hra = Math.round(baseSal * 0.3);
                const allowances = Math.round(baseSal * 0.2);
                return (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', fontWeight: 700 }}>
                      <span>Earnings Breakdown</span>
                      <span>Amount (INR)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <span>Basic Salary</span>
                      <span>₹{basic.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <span>House Rent Allowance (HRA)</span>
                      <span>₹{hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <span>Special & Medical Allowances</span>
                      <span>₹{allowances.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f1f5f9', borderTop: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                      <span>Net Payable Salary</span>
                      <span style={{ color: '#059669', fontSize: '14px' }}>₹{baseSal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary-clean" onClick={() => setShowPayslipModal(false)}>
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary-amber" 
                onClick={() => {
                  window.print();
                  if (showToast) showToast('Printed salary slip');
                }}
              >
                <Printer size={13} />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
