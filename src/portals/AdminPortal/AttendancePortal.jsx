import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  X,
  Edit3,
  Fingerprint,
  Calendar,
  ArrowLeft,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const AttendancePortal = () => {
  const { 
    employees, 
    attendance, 
    markAttendance, 
    showToast, 
    setActivePortal 
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-03-19');
  const [viewMode, setViewMode] = useState('muster'); // 'muster' | 'departments'

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState(null);

  // Biometric punch simulation form
  const [simForm, setSimForm] = useState({
    employeeId: employees[0]?.id || 'EMP-01',
    punchType: 'Check-In',
    terminal: 'BioGate-01 (Staff Turnstile)',
    method: 'Biometric Fingerprint Scan',
    timestamp: '08:24 AM'
  });

  // Manual Punch Override Form
  const [overrideForm, setOverrideForm] = useState({
    checkIn: '08:30 AM',
    checkOut: '05:00 PM',
    status: 'Present',
    reason: 'Biometric hardware sensor timeout / Manual supervisor override'
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
    'General (09:00 AM - 05:00 PM)',
    'Evening (02:00 PM - 09:00 PM)',
    'Night (09:00 PM - 07:00 AM)'
  ];

  // Bulletproof array handling
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];

  // Merge employee data with attendance records
  const masterAttendanceList = safeEmployees.map(emp => {
    if (!emp) return null;
    const record = safeAttendance.find(a => a?.employeeId === emp.id);
    const checkIn = record?.checkIn || (emp.id === 'EMP-05' ? '-' : '08:30 AM');
    const checkOut = record?.checkOut || (emp.id === 'EMP-01' ? '02:15 PM' : '-');
    const status = record?.status || (emp.id === 'EMP-05' ? 'Absent' : 'Present');

    // Calculate delay if morning shift
    let punctuality = 'On Time';
    let delayMins = 0;
    if (checkIn !== '-') {
      const isLate = status === 'Late' || String(checkIn).includes('09:') || String(checkIn).includes('08:4');
      if (isLate) {
        punctuality = 'Late Arrival';
        delayMins = 24;
      }
    }

    return {
      ...emp,
      name: emp.name || 'Staff Member',
      designation: emp.designation || 'Staff',
      department: emp.department || 'General Medicine',
      shift: emp.shift || 'General (09:00 AM - 05:00 PM)',
      attendanceId: record?.id || `ATT-${emp.id}`,
      checkIn,
      checkOut,
      status,
      punctuality,
      delayMins,
      device: 'BioGate-01 (Turnstile)',
      effectiveHours: checkIn !== '-' && checkOut !== '-' ? '6 hrs 15 mins' : (checkIn !== '-' ? 'In Progress' : '0 hrs')
    };
  }).filter(Boolean);

  // Filtered List with defensive checks
  const filteredList = masterAttendanceList.filter(item => {
    const name = String(item.name || '').toLowerCase();
    const id = String(item.id || '').toLowerCase();
    const des = String(item.designation || '').toLowerCase();
    const q = String(searchQuery || '').toLowerCase().trim();

    const matchesSearch = !q || name.includes(q) || id.includes(q) || des.includes(q);
    const matchesDept = selectedDept === 'All' || String(item.department || '').toLowerCase() === selectedDept.toLowerCase() || (selectedDept === 'Pathology & Lab' && String(item.department || '').toLowerCase().includes('lab'));
    const shiftStr = String(item.shift || '').toLowerCase();
    const matchesShift = selectedShift === 'All' || shiftStr.includes(selectedShift.split(' ')[0].toLowerCase());
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  // KPI Calculations
  const totalCount = masterAttendanceList.length;
  const presentCount = masterAttendanceList.filter(a => a.status === 'Present').length;
  const lateCount = masterAttendanceList.filter(a => a.status === 'Late').length;
  const leaveCount = masterAttendanceList.filter(a => a.status === 'On Leave' || a.status === 'Half Day').length;
  const absentCount = masterAttendanceList.filter(a => a.status === 'Absent').length;
  const attendanceRate = totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) : '100';

  // Open override modal
  const handleOpenOverride = (item) => {
    setOverrideTarget(item);
    setOverrideForm({
      checkIn: item.checkIn === '-' ? '08:30 AM' : item.checkIn,
      checkOut: item.checkOut === '-' ? '05:00 PM' : item.checkOut,
      status: item.status,
      reason: 'Biometric hardware sensor timeout / Manual supervisor override'
    });
    setShowOverrideModal(true);
  };

  // Submit Override
  const handleSubmitOverride = (e) => {
    e.preventDefault();
    if (!overrideTarget) return;
    markAttendance(overrideTarget.id, overrideForm.status);
    showToast(`Manual attendance override recorded for ${overrideTarget.name} (${overrideForm.status})`);
    setShowOverrideModal(false);
  };

  // Simulate Biometric Punch
  const handleSimulatePunch = (e) => {
    e.preventDefault();
    const targetEmp = employees.find(e => e.id === simForm.employeeId);
    if (!targetEmp) return;

    const newStatus = simForm.punchType === 'Check-In' ? 'Present' : 'Present';
    markAttendance(targetEmp.id, newStatus);
    showToast(`Biometric punch captured for ${targetEmp.name}: ${simForm.punchType} at ${simForm.timestamp}`);
    setShowSimulateModal(false);
  };

  // Auto mark all present
  const handleMarkAllPresent = () => {
    employees.forEach(emp => {
      markAttendance(emp.id, 'Present');
    });
    showToast('All registered staff rostered as PRESENT for today');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Top Breadcrumb & Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button 
              type="button"
              onClick={() => setActivePortal('admin')}
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
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>Staff Attendance Master</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Biometric Attendance & Staff Roster
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
            Live biometric turnstile sync, shift punctuality audit, overtime tracking & daily muster
          </p>
        </div>

        {/* Top Action Buttons & Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Muster Roll Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '5px 10px', borderRadius: '7px', border: '1px solid #cbd5e1' }}>
            <Calendar size={14} color="#64748b" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <button 
            type="button"
            className="btn-secondary-clean"
            onClick={() => setActivePortal('employees')}
            style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={14} />
            <span>Staff Directory</span>
          </button>

          <button 
            type="button"
            className="btn-secondary-clean"
            onClick={() => setShowSimulateModal(true)}
            style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#0284c7', borderColor: '#bfdbfe' }}
          >
            <Fingerprint size={14} />
            <span>Simulate Biometric Punch</span>
          </button>

          <button 
            type="button"
            className="btn-secondary-clean"
            onClick={handleMarkAllPresent}
            style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Mark all staff present for the current shift"
          >
            <CheckCircle2 size={14} color="#059669" />
            <span>Auto-Checkin Roster</span>
          </button>

          <button 
            type="button"
            className="btn-primary-amber"
            onClick={() => window.print()}
            style={{ padding: '7px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={14} />
            <span>Print Muster Roll</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (6 CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TOTAL ROSTER</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {totalCount}
          </div>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>Registered staff</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>PRESENT ON DUTY</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {presentCount}
          </div>
          <span style={{ fontSize: '10.5px', color: '#059669' }}>In hospital shifts</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>LATE ARRIVALS</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {lateCount}
          </div>
          <span style={{ fontSize: '10.5px', color: '#d97706' }}>&gt;15 min grace delay</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>ON APPROVED LEAVE</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {leaveCount}
          </div>
          <span style={{ fontSize: '10.5px', color: '#2563eb' }}>Casual / Sick leave</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>ABSENT / UNMARKED</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {absentCount}
          </div>
          <span style={{ fontSize: '10.5px', color: '#dc2626' }}>No punch recorded</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>PUNCTUALITY RATE</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
            {attendanceRate}%
          </div>
          <span style={{ fontSize: '10.5px', color: '#059669' }}>Roster compliance</span>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH */}
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', width: '320px' }}>
            <Search size={15} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search staff by name, ID or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', width: '100%' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Present', 'Late', 'On Leave', 'Absent'].map(st => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#0284c7' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Shift Filter Dropdown */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            {shifts.map(sh => (
              <option key={sh} value={sh}>Shift: {sh}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('muster')}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: '5px',
                background: viewMode === 'muster' ? '#ffffff' : 'transparent',
                fontWeight: viewMode === 'muster' ? 700 : 500,
                fontSize: '11.5px',
                color: viewMode === 'muster' ? '#0f172a' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Muster Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('departments')}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: '5px',
                background: viewMode === 'departments' ? '#ffffff' : 'transparent',
                fontWeight: viewMode === 'departments' ? 700 : 500,
                fontSize: '11.5px',
                color: viewMode === 'departments' ? '#0f172a' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Dept Summary
            </button>
          </div>
        </div>

        {/* Department Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {departments.map(dept => {
            const isSelected = selectedDept === dept;
            const count = dept === 'All' 
              ? masterAttendanceList.length 
              : masterAttendanceList.filter(d => d.department === dept).length;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0d2847' : '1px solid #e2e8f0',
                  background: isSelected ? '#0d2847' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  whiteSpace: 'nowrap'
                }}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: MUSTER TABLE (VERY VERY DETAILED) */}
      {viewMode === 'muster' && (
        <div className="modern-table-container printable-area" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          {/* Header visible on print */}
          <div className="print-only" style={{ padding: '16px 20px', borderBottom: '2px solid #0f172a' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>COIMBATORE GENERAL HOSPITAL</h2>
            <div style={{ fontSize: '12px', color: '#475569' }}>Official Daily Biometric Attendance Muster Roll — Date: {selectedDate}</div>
          </div>

          <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Staff Attendance Register ({filteredList.length} of {totalCount} records)
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Showing real-time biometric timestamp logs
            </div>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Employee Name & Role</th>
                <th>Department</th>
                <th>Assigned Shift</th>
                <th>In Punch</th>
                <th>Out Punch</th>
                <th>Work Hours</th>
                <th>Punctuality</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(item => (
                <tr key={item.id}>
                  {/* Staff ID */}
                  <td>
                    <span className="patient-id-badge" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {item.id}
                    </span>
                  </td>

                  {/* Employee Name & Role */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {item.designation}
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <span style={{ fontSize: '11.5px', color: '#0284c7', background: '#e0f2fe', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                      {item.department}
                    </span>
                  </td>

                  {/* Shift */}
                  <td>
                    <div style={{ fontSize: '11.5px', color: '#334155' }}>
                      {item.shift}
                    </div>
                  </td>

                  {/* Check In */}
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: item.checkIn === '-' ? '#94a3b8' : '#0f172a' }}>
                      {item.checkIn}
                    </div>
                    {item.checkIn !== '-' && (
                      <div style={{ fontSize: '10px', color: '#64748b' }}>BioGate-01</div>
                    )}
                  </td>

                  {/* Check Out */}
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: item.checkOut === '-' ? '#94a3b8' : '#0f172a' }}>
                      {item.checkOut}
                    </div>
                  </td>

                  {/* Effective Work Hours */}
                  <td>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>
                      {item.effectiveHours}
                    </span>
                  </td>

                  {/* Punctuality */}
                  <td>
                    {item.punctuality === 'Late Arrival' ? (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        +{item.delayMins} min Late
                      </span>
                    ) : item.status === 'Absent' ? (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span>
                    ) : (
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        On Time
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => markAttendance(item.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: 
                          item.status === 'Present' ? '1.5px solid #10b981' :
                          item.status === 'Late' ? '1.5px solid #f59e0b' :
                          item.status === 'Absent' ? '1.5px solid #ef4444' : '1.5px solid #6366f1',
                        background: 
                          item.status === 'Present' ? '#ecfdf5' :
                          item.status === 'Late' ? '#fffbeb' :
                          item.status === 'Absent' ? '#fef2f2' : '#eef2ff',
                        color: 
                          item.status === 'Present' ? '#065f46' :
                          item.status === 'Late' ? '#92400e' :
                          item.status === 'Absent' ? '#991b1b' : '#3730a3'
                      }}
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenOverride(item)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Adjust punch timing or audit log"
                    >
                      <Edit3 size={11} />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>
                    No staff records match the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: DEPARTMENT COMPLIANCE BREAKDOWN */}
      {viewMode === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {departments.filter(d => d !== 'All').map(dept => {
            const inDept = masterAttendanceList.filter(e => e.department === dept);
            const deptTotal = inDept.length;
            const deptPresent = inDept.filter(e => e.status === 'Present' || e.status === 'Late').length;
            const pct = deptTotal > 0 ? Math.round((deptPresent / deptTotal) * 100) : 100;

            return (
              <div key={dept} style={{ background: '#ffffff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>{dept}</h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {deptPresent} of {deptTotal} staff on duty today
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: pct >= 80 ? '#059669' : '#d97706' }}>
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#059669' : '#d97706', transition: 'width 0.4s ease' }} />
                </div>

                {/* Staff avatars in this dept */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {inDept.map(emp => (
                    <div 
                      key={emp.id}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: emp.status === 'Present' ? '#ecfdf5' : emp.status === 'Late' ? '#fffbeb' : '#fef2f2',
                        border: emp.status === 'Present' ? '1px solid #a7f3d0' : emp.status === 'Late' ? '1px solid #fde68a' : '1px solid #fecaca',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: emp.status === 'Present' ? '#065f46' : emp.status === 'Late' ? '#92400e' : '#991b1b'
                      }}
                    >
                      {emp.name} ({emp.status})
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: SIMULATE BIOMETRIC PUNCH */}
      {showSimulateModal && (
        <div className="modal-backdrop" onClick={() => setShowSimulateModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Fingerprint size={18} color="#0284c7" />
                <h3 className="modal-title">Simulate Biometric Hardware Punch</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSimulateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSimulatePunch}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Select Staff Employee *</label>
                  <select 
                    className="form-select"
                    value={simForm.employeeId}
                    onChange={(e) => setSimForm({ ...simForm, employeeId: e.target.value })}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.id} - {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Punch Direction</label>
                    <select 
                      className="form-select"
                      value={simForm.punchType}
                      onChange={(e) => setSimForm({ ...simForm, punchType: e.target.value })}
                    >
                      <option value="Check-In">Check-In (Duty Start)</option>
                      <option value="Check-Out">Check-Out (Shift End)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Punch Timestamp</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={simForm.timestamp}
                      onChange={(e) => setSimForm({ ...simForm, timestamp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Terminal Device</label>
                  <select 
                    className="form-select"
                    value={simForm.terminal}
                    onChange={(e) => setSimForm({ ...simForm, terminal: e.target.value })}
                  >
                    <option value="BioGate-01 (Staff Turnstile)">BioGate-01 (Main Staff Turnstile)</option>
                    <option value="BioGate-02 (OPD Emergency Gate)">BioGate-02 (Emergency & OPD Entry)</option>
                    <option value="BioGate-03 (Pathology Lab Desk)">BioGate-03 (Diagnostic Lab Door)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sensor Modality</label>
                  <select 
                    className="form-select"
                    value={simForm.method}
                    onChange={(e) => setSimForm({ ...simForm, method: e.target.value })}
                  >
                    <option value="Biometric Fingerprint Scan">Optical Fingerprint Sensor (500 DPI)</option>
                    <option value="RFID NFC Card Swipe">13.56MHz RFID / NFC Employee Badge</option>
                    <option value="AI Face Recognition">3D Infrared Facial Scan</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowSimulateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-amber" style={{ background: '#0284c7', borderColor: '#0369a1' }}>
                  Register Biometric Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL PUNCH ADJUSTMENT */}
      {showOverrideModal && overrideTarget && (
        <div className="modal-backdrop" onClick={() => setShowOverrideModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#059669" />
                <h3 className="modal-title">Manual Attendance Override</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowOverrideModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{overrideTarget.name} ({overrideTarget.id})</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    {overrideTarget.designation} &bull; {overrideTarget.department}
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Adjust In-Time</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={overrideForm.checkIn}
                      onChange={(e) => setOverrideForm({ ...overrideForm, checkIn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adjust Out-Time</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={overrideForm.checkOut}
                      onChange={(e) => setOverrideForm({ ...overrideForm, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Set Official Status</label>
                  <select 
                    className="form-select"
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                  >
                    <option value="Present">Present (Full Day)</option>
                    <option value="Late">Late Arrival (Grace Applied)</option>
                    <option value="Half Day">Half Day (4 Hours)</option>
                    <option value="On Leave">On Approved Leave (Paid)</option>
                    <option value="Absent">Absent (Loss of Pay)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Supervisor Audit Reason *</label>
                  <textarea 
                    rows="2"
                    className="form-textarea"
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowOverrideModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-amber" style={{ background: '#059669', borderColor: '#047857' }}>
                  Save Adjusted Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
