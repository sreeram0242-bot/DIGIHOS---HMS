import React, { useState } from 'react';
import { 
  PlusSquare, 
  Search, 
  Barcode, 
  Radio, 
  User, 
  Activity, 
  Clock, 
  CheckCircle2,
  Building,
  Bed,
  HeartPulse,
  Thermometer,
  Droplets,
  AlertTriangle,
  Printer,
  CreditCard,
  Calendar,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Phone,
  Stethoscope,
  Layers,
  MapPin,
  Heart,
  Users,
  FlaskConical,
  X,
  Plus,
  Receipt
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const OpVisitView = () => {
  const { 
    patients, 
    tokens, 
    prescriptions,
    labOrders,
    createOpVisit, 
    addLabPatientToDoctorQueue,
    setSelectedLabReport,
    setIsLabReportModalOpen,
    setIsScannerOpen, 
    setIsLabelModalOpen,
    setSelectedPatientForSticker,
    setIsTokenSlipModalOpen,
    setSelectedTokenForSlip,
    setActiveReceptionTab, 
    showToast,
    openPrescriptionPrint,
    openBillReceipt
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState('all'); // 'all' | 'recent' | 'urgent'
  const [selectedPatient, setSelectedPatient] = useState(() => (patients?.[0] || null));

  // Visit Classification: 'OP' (Outpatient OPD) or 'IP' (Inpatient Admission)
  const [visitType, setVisitType] = useState('OP');

  // OP Details
  const [consultationType, setConsultationType] = useState('Regular OPD Consultation');
  const [department, setDepartment] = useState('General Medicine');
  const [doctor, setDoctor] = useState('Dr. Arvind Ramesh, MD (Gen Med)');
  const [room, setRoom] = useState('Consultation Room 102');
  const [priority, setPriority] = useState('Normal');

  // IP Details
  const [wardType, setWardType] = useState('General Ward');
  const [bedNumber, setBedNumber] = useState('Ward Bed W-04');
  const [admissionPurpose, setAdmissionPurpose] = useState('Medical Observation & IV Therapy');
  const [admissionDeposit, setAdmissionDeposit] = useState(1500);

  // Billing
  const [fee, setFee] = useState(300);
  const [paymentMode, setPaymentMode] = useState('Cash Counter');

  // Clinical Vitals & Complaint
  const [complaint, setComplaint] = useState('Follow-up consultation for recurring fever & headache');
  const [vitals, setVitals] = useState({
    bp: '120/80',
    weight: '70',
    pulse: '76',
    temp: '98.6',
    spo2: '99',
    rbs: '110',
    painScore: '2',
    fastingStatus: 'Random / 2h Post-Meal'
  });

  const safePatients = Array.isArray(patients) ? patients : [];
  const safeTokens = Array.isArray(tokens) ? tokens : [];

  // Filter patients
  const filteredPatients = safePatients.filter(p => {
    if (!p) return false;
    const q = searchQuery.toLowerCase().trim();
    const name = String(p.fullName || '').toLowerCase();
    const id = String(p.id || '').toLowerCase();
    const phone = String(p.phone || '');
    const barcode = String(p.barcode || '');

    const matchesSearch = !q || 
      name.includes(q) ||
      id.includes(q) ||
      phone.includes(q) ||
      barcode.includes(q);

    if (!matchesSearch) return false;

    if (patientFilter === 'recent') {
      return safeTokens.some(t => t.patientId === p.id);
    }
    if (patientFilter === 'urgent') {
      return p.vitals && (parseInt(p.vitals.bp || '0') > 140 || parseFloat(p.vitals.temp || '0') > 100);
    }
    return true;
  });

  // Calculate BMI if weight available
  const weightNum = parseFloat(vitals.weight) || 70;
  const bmiEst = (weightNum / (1.7 * 1.7)).toFixed(1);

  const handleSelect = (pat) => {
    setSelectedPatient(pat);
    if (pat.vitals) {
      setVitals({
        bp: pat.vitals.bp || '120/80',
        weight: pat.vitals.weight || '70',
        pulse: pat.vitals.pulse || '76',
        temp: pat.vitals.temp || '98.6',
        spo2: pat.vitals.spo2 || '99',
        rbs: '110',
        painScore: '2',
        fastingStatus: 'Random / 2h Post-Meal'
      });
    }
  };

  const handleAddSymptom = (sym) => {
    setComplaint(prev => prev ? `${prev}, ${sym}` : sym);
  };

  const handleVisitTypeSwitch = (type) => {
    setVisitType(type);
    if (type === 'OP') {
      setFee(consultationType.includes('Free') ? 0 : 300);
      setRoom('Consultation Room 102');
    } else {
      setFee(admissionDeposit);
      setRoom(bedNumber);
    }
  };

  const handleConsultationTypeChange = (cType) => {
    setConsultationType(cType);
    if (cType.includes('Free')) {
      setFee(0);
    } else if (cType.includes('Emergency')) {
      setFee(500);
    } else {
      setFee(300);
    }
  };

  const handleWardChange = (wType) => {
    setWardType(wType);
    if (wType === 'General Ward') {
      setBedNumber('Ward Bed W-04');
      setAdmissionDeposit(1500);
      setFee(1500);
      setRoom('Ward Bed W-04');
    } else if (wType === 'Semi-Private AC') {
      setBedNumber('Room S-202 (Bed B)');
      setAdmissionDeposit(2500);
      setFee(2500);
      setRoom('Room S-202 (Bed B)');
    } else if (wType === 'Deluxe Room') {
      setBedNumber('Private Deluxe Room 301');
      setAdmissionDeposit(4000);
      setFee(4000);
      setRoom('Private Deluxe Room 301');
    } else if (wType === 'ICU') {
      setBedNumber('ICU Bed 03');
      setAdmissionDeposit(6000);
      setFee(6000);
      setRoom('ICU Bed 03');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a registered patient first');
      return;
    }

    const createdToken = createOpVisit(selectedPatient.id, {
      visitType,
      complaint,
      vitals,
      department,
      doctor,
      room: visitType === 'IP' ? bedNumber : room,
      fee,
      paymentMode,
      consultationCategory: visitType === 'IP' ? `IP Admission (${bedNumber})` : consultationType
    });

    if (createdToken) {
      setSelectedTokenForSlip(createdToken);
      setIsTokenSlipModalOpen(true);
    }

    setActiveReceptionTab('dashboard');
  };

  // Find previous prescriptions and lab orders for the selected patient
  const patientPrescriptions = selectedPatient ? prescriptions.filter(p => p.patientId === selectedPatient.id) : [];
  const patientLabOrders = selectedPatient ? labOrders.filter(l => l.patientId === selectedPatient.id) : [];

  // Diagnostic Lab Tracking state
  const [showLabTrackerModal, setShowLabTrackerModal] = useState(false);
  const inLabOrders = labOrders.filter(l => l.overallStatus !== 'completed');
  const readyLabOrders = labOrders.filter(l => l.overallStatus === 'completed' && !l.addedToDoctorQueue);
  const previouslyAddedOrders = labOrders.filter(l => l.overallStatus === 'completed' && l.addedToDoctorQueue);

  const handleSelectFromLab = (order) => {
    const pat = patients.find(p => p.id === order.patientId);
    if (pat) {
      setSelectedPatient(pat);
      setVisitType('OP');
      setConsultationType('Follow-up Consultation / Lab Review');
      setFee(0);
      setPaymentMode('Exempt / Hospital Free');
      setComplaint(`Lab report review: ${order.tests?.map(t => t.name).join(', ') || 'Diagnostic Tests'}`);
      if (pat.vitals) {
        setVitals({
          bp: pat.vitals.bp || '120/80',
          weight: pat.vitals.weight || '70',
          pulse: pat.vitals.pulse || '76',
          temp: pat.vitals.temp || '98.6',
          spo2: pat.vitals.spo2 || '99',
          rbs: '110',
          painScore: '1',
          fastingStatus: 'Random'
        });
      }
      setShowLabTrackerModal(false);
      showToast(`Selected ${pat.fullName} for Lab Review consultation`);
    }
  };

  const handleQuickAddLabToQueue = (order) => {
    addLabPatientToDoctorQueue(order.patientId, order.orderId);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* 1. Diagnostic Lab Status & Completed Reports Access Banner */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '10px', 
        border: readyLabOrders.length > 0 ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0', 
        padding: '12px 18px', 
        marginBottom: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: readyLabOrders.length > 0 ? '0 2px 6px rgba(16, 185, 129, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '8px', 
            background: readyLabOrders.length > 0 ? '#ecfdf5' : '#f5f3ff', 
            color: readyLabOrders.length > 0 ? '#059669' : '#7c3aed', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FlaskConical size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                Diagnostic Pathology Tracker & Verified Reports
              </h3>
              {readyLabOrders.length > 0 ? (
                <span style={{ 
                  background: '#ecfdf5', 
                  color: '#065f46', 
                  border: '1px solid #a7f3d0', 
                  borderRadius: '12px', 
                  padding: '2px 8px', 
                  fontSize: '11px', 
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} color="#059669" />
                  {readyLabOrders.length} Finished Report{readyLabOrders.length > 1 ? 's' : ''} Ready to Queue
                </span>
              ) : (
                <span style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  borderRadius: '12px', 
                  padding: '2px 8px', 
                  fontSize: '11px', 
                  fontWeight: 600
                }}>
                  All Reports Queued
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {inLabOrders.length} patient(s) undergoing testing in lab &bull; {readyLabOrders.length} verified report(s) ready to manually add to doctor queue (no priority)
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-navy" 
          style={{ 
            background: readyLabOrders.length > 0 ? '#059669' : '#1e293b', 
            borderColor: readyLabOrders.length > 0 ? '#047857' : '#334155', 
            padding: '8px 16px', 
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => setShowLabTrackerModal(true)}
        >
          <FlaskConical size={14} />
          <span>View Lab Patients & Finished Reports ({readyLabOrders.length + inLabOrders.length})</span>
        </button>
      </div>
      
      {/* 1. Operational Capacity & Bed Availability Ribbon */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '10px', 
        border: '1px solid #e2e8f0', 
        padding: '12px 18px', 
        marginBottom: '18px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Registered Directory</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {patients.length} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Patients</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }}></div>

          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active OPD Queue</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>
              {tokens.filter(t => t.status !== 'completed').length} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Waiting/In-Consult</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }}></div>

          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>IP Bed Occupancy</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              18 / 25 <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>(7 Beds Vacant)</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }}></div>

          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>On-Duty Doctors</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
              4 <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Clinicians OPD/IP</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '11.5px', 
            color: '#0284c7', 
            fontWeight: 600, 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            padding: '4px 9px', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px' 
          }}>
            <Radio size={13} color="#0284c7" /> NFC & Barcode Ready
          </span>
          <button 
            type="button" 
            className="btn-navy" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setIsScannerOpen(true)}
          >
            <Barcode size={14} />
            <span>Scan Tag</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Workflow Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Patient Directory & Clinical History Snapshot */}
        {/* ========================================================================= */}
        <div>
          {/* Card 1: Patient Directory & Filter Search */}
          <div className="form-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  Select Registered Patient
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  {filteredPatients.length} of {patients.length}
                </span>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Search Name, UHID, Phone, Barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '12.5px' }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              </div>

              {/* Sub-Filters */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPatientFilter('all')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: patientFilter === 'all' ? '#0d2847' : '#e2e8f0',
                    color: patientFilter === 'all' ? '#ffffff' : '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  All ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilter('recent')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: patientFilter === 'recent' ? '#0d2847' : '#e2e8f0',
                    color: patientFilter === 'recent' ? '#ffffff' : '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Recent Visits
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilter('urgent')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: patientFilter === 'urgent' ? '#0d2847' : '#e2e8f0',
                    color: patientFilter === 'urgent' ? '#ffffff' : '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  High Vitals
                </button>
              </div>
            </div>

            {/* Patient Cards List */}
            <div style={{ maxHeight: '310px', overflowY: 'auto', padding: '8px' }}>
              {filteredPatients.map(pat => {
                const isSelected = selectedPatient?.id === pat.id;
                return (
                  <div
                    key={pat.id}
                    onClick={() => handleSelect(pat)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '7px',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        {pat.fullName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {readyLabOrders.some(o => o.patientId === pat.id) && (
                          <span style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            border: '1px solid #a7f3d0', 
                            padding: '1px 5px', 
                            borderRadius: '4px', 
                            fontWeight: 700, 
                            fontSize: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <CheckCircle2 size={10} color="#059669" /> Lab Ready
                          </span>
                        )}
                        <span className="patient-id-badge" style={{ fontSize: '10.5px' }}>
                          {pat.id}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                      <span>{pat.age}Y &bull; {pat.gender}</span>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, fontSize: '10px' }}>
                        {pat.bloodGroup}
                      </span>
                      <span>Ph: {pat.phone}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', fontSize: '10.5px', color: '#94a3b8' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>Tag: {pat.barcode}</span>
                      <span style={{ color: '#0284c7', fontWeight: 600 }}>Select &rarr;</span>
                    </div>
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
                  No matching patients found.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Selected Patient Clinical History & Profile Snapshot */}
          {selectedPatient && (
            <div className="form-card" style={{ padding: '14px', background: '#ffffff', borderColor: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Active Medical Record
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedPatient.fullName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Registered: {selectedPatient.registeredAt || 'Today'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn-secondary-clean"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', borderColor: '#a7f3d0' }}
                    onClick={() => openPrescriptionPrint(selectedPatient)}
                    title="Print Doctor's Official Prescription"
                  >
                    <Stethoscope size={12} color="#059669" />
                    <span>Rx</span>
                  </button>

                  <button 
                    type="button"
                    className="btn-secondary-clean"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', borderColor: '#bae6fd' }}
                    onClick={() => openBillReceipt(selectedPatient)}
                    title="Print OPD Consultation / Hospital Bill Receipt"
                  >
                    <Receipt size={12} color="#0284c7" />
                    <span>Bill</span>
                  </button>

                  <button 
                    type="button"
                    className="btn-secondary-clean"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      const existingTok = tokens.find(t => t.patientId === selectedPatient.id);
                      setSelectedTokenForSlip(existingTok || {
                        tokenNo: 'TK-OPD',
                        patientId: selectedPatient.id,
                        patientName: selectedPatient.fullName,
                        doctor: 'Dr. Arvind Ramesh, MD',
                        room: 'Consultation Room 102',
                        type: 'General OPD',
                        age: selectedPatient.age,
                        gender: selectedPatient.gender,
                        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      });
                      setIsTokenSlipModalOpen(true);
                    }}
                    title="Print OPD Consultation Token Slip"
                  >
                    <Clock size={12} />
                    <span>Slip</span>
                  </button>

                  <button 
                    type="button"
                    className="btn-secondary-clean"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setSelectedPatientForSticker(selectedPatient);
                      setIsLabelModalOpen(true);
                    }}
                    title="Print barcode wristband/sticker"
                  >
                    <Printer size={12} />
                    <span>Sticker</span>
                  </button>
                </div>
              </div>

              {/* Key Medical Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Emergency Contact</span>
                  <strong style={{ fontSize: '11.5px', color: '#0f172a' }}>
                    {selectedPatient.emergencyName || 'Deepa (Spouse)'}
                  </strong>
                  <div style={{ fontSize: '10px', color: '#0284c7' }}>
                    {selectedPatient.emergencyPhone || selectedPatient.phone}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Allergies / Flags</span>
                  <strong style={{ fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} /> No Known Allergies
                  </strong>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    General Medical Clear
                  </div>
                </div>
              </div>

              {/* Previous Consultations & Lab Activity */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} />
                  <span>Past Clinical Activity</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '5px', fontSize: '11px', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Prescription History: </span>
                      {patientPrescriptions.length > 0 && (
                        <button
                          type="button"
                          className="btn-secondary-clean"
                          style={{ padding: '2px 6px', fontSize: '10.5px', color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          onClick={() => openPrescriptionPrint(patientPrescriptions[patientPrescriptions.length - 1])}
                        >
                          <Stethoscope size={10} />
                          <span>Print Rx</span>
                        </button>
                      )}
                    </div>
                    {patientPrescriptions.length > 0 ? (
                      patientPrescriptions.map((p, idx) => (
                        <div key={idx} style={{ marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{p.items.map(i => i.name).join(', ')}</span>
                          <button
                            type="button"
                            onClick={() => openPrescriptionPrint(p)}
                            style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: '10.5px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Print &rarr;
                          </button>
                        </div>
                      ))
                    ) : (
                      'Dolo 650mg, Pan 40mg (Prior OP Visit)'
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '5px', fontSize: '11px', color: '#334155' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Diagnostic Lab Tests: </span>
                    {patientLabOrders.length > 0 ? (
                      patientLabOrders.map(l => l.tests.map(t => t.name).join(', ')).join(' | ')
                    ) : (
                      'CBC, RBS Blood Sugar (Verified)'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Visit Creator, Bed/Room Allocation & Triage Vitals */}
        {/* ========================================================================= */}
        <div>
          {selectedPatient ? (
            <form onSubmit={handleSubmit}>
              
              {/* SECTION 1: VISIT CLASSIFICATION & DEPARTMENT ROUTING */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="form-card-icon" style={{ color: '#0284c7' }}>
                      <Building size={17} />
                    </div>
                    <div>
                      <h3 className="form-card-title">Visit Classification & Department</h3>
                      <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Configure consultation channel, specialty routing, or inpatient admission
                      </p>
                    </div>
                  </div>

                  {/* Visit Mode Switcher (OP vs IP) */}
                  <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleVisitTypeSwitch('OP')}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: visitType === 'OP' ? '#0d2847' : 'transparent',
                        color: visitType === 'OP' ? '#ffffff' : '#475569',
                        fontWeight: visitType === 'OP' ? 700 : 500,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Stethoscope size={13} />
                      <span>Outpatient (OP Visit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVisitTypeSwitch('IP')}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: visitType === 'IP' ? '#0d2847' : 'transparent',
                        color: visitType === 'IP' ? '#ffffff' : '#475569',
                        fontWeight: visitType === 'IP' ? 700 : 500,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Bed size={13} />
                      <span>Inpatient (IP Admission)</span>
                    </button>
                  </div>
                </div>

                {/* Sub-form A: Outpatient OPD Fields */}
                {visitType === 'OP' && (
                  <div>
                    <div className="form-grid-3" style={{ marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Consultation Category</label>
                        <select 
                          className="form-select"
                          value={consultationType}
                          onChange={(e) => handleConsultationTypeChange(e.target.value)}
                        >
                          <option value="Regular OPD Consultation">Regular OPD Consultation (₹300)</option>
                          <option value="7-Day Free Follow-Up">7-Day Free Follow-Up (₹0)</option>
                          <option value="Senior Citizen / Priority OPD">Senior Citizen / Priority OPD (₹300)</option>
                          <option value="Emergency Fast-Track Consultation">Emergency Fast-Track (₹500)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Clinical Specialty</label>
                        <select 
                          className="form-select"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          <option value="General Medicine">General Medicine</option>
                          <option value="Cardiology">Cardiology & Heart Care</option>
                          <option value="Orthopedics">Orthopedics & Joint Care</option>
                          <option value="Pediatrics">Pediatrics & Child Care</option>
                          <option value="General Surgery">General Surgery</option>
                          <option value="ENT">ENT & Head-Neck</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Consulting Doctor & Room</label>
                        <select 
                          className="form-select"
                          value={doctor}
                          onChange={(e) => setDoctor(e.target.value)}
                        >
                          <option value="Dr. Arvind Ramesh, MD (Gen Med)">Dr. Arvind Ramesh, MD - Room 102</option>
                          <option value="Dr. Priya Natarajan, MS (Gen Surg)">Dr. Priya Natarajan, MS - Room 105</option>
                          <option value="Dr. K. Mohan, MD (Cardiology)">Dr. K. Mohan, MD - Room 108</option>
                          <option value="Dr. Shalini K, DCH (Pediatrics)">Dr. Shalini K, DCH - Room 110</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form B: Inpatient Admission Fields */}
                {visitType === 'IP' && (
                  <div>
                    <div className="form-grid-3" style={{ marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Ward Category</label>
                        <select 
                          className="form-select"
                          value={wardType}
                          onChange={(e) => handleWardChange(e.target.value)}
                        >
                          <option value="General Ward">General Ward (₹1,500 Deposit)</option>
                          <option value="Semi-Private AC">Semi-Private AC Room (₹2,500 Deposit)</option>
                          <option value="Deluxe Room">Private Deluxe Room (₹4,000 Deposit)</option>
                          <option value="ICU">Intensive Care Unit - ICU (₹6,000 Deposit)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Allocated Bed Number</label>
                        <select 
                          className="form-select"
                          value={bedNumber}
                          onChange={(e) => {
                            setBedNumber(e.target.value);
                            setRoom(e.target.value);
                          }}
                        >
                          {wardType === 'General Ward' && (
                            <>
                              <option value="Ward Bed W-04">Ward Bed W-04 (Available)</option>
                              <option value="Ward Bed W-08">Ward Bed W-08 (Available)</option>
                              <option value="Ward Bed W-12">Ward Bed W-12 (Available)</option>
                            </>
                          )}
                          {wardType === 'Semi-Private AC' && (
                            <>
                              <option value="Room S-202 (Bed B)">Room S-202 (Bed B - Available)</option>
                              <option value="Room S-205 (Bed A)">Room S-205 (Bed A - Available)</option>
                            </>
                          )}
                          {wardType === 'Deluxe Room' && (
                            <>
                              <option value="Private Deluxe Room 301">Private Deluxe Room 301 (Available)</option>
                              <option value="Private Deluxe Room 304">Private Deluxe Room 304 (Available)</option>
                            </>
                          )}
                          {wardType === 'ICU' && (
                            <>
                              <option value="ICU Bed 03">ICU Bed 03 (Available - Ventilator)</option>
                              <option value="ICU Bed 05">ICU Bed 05 (Available - Stepdown)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Admission Purpose</label>
                        <select 
                          className="form-select"
                          value={admissionPurpose}
                          onChange={(e) => setAdmissionPurpose(e.target.value)}
                        >
                          <option value="Medical Observation & IV Therapy">Medical Observation & IV Therapy</option>
                          <option value="Pre-Operative Preparation">Pre-Operative Preparation</option>
                          <option value="Post-Surgical Care & Recovery">Post-Surgical Care & Recovery</option>
                          <option value="Emergency Trauma & Monitoring">Emergency Trauma & Monitoring</option>
                          <option value="Daycare Chemotherapy / Dialysis">Daycare Chemotherapy / Dialysis</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: COMPREHENSIVE TRIAGE VITALS CHECK (6 METRICS + PAIN SCORE) */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="form-card-icon" style={{ color: '#10b981' }}>
                      <Activity size={17} />
                    </div>
                    <div>
                      <h3 className="form-card-title">Reception Triage Vitals Check</h3>
                      <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Recorded by front-desk nurse to immediately synchronize with doctor's clinical screen
                      </p>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    BMI: {bmiEst} (Healthy Range)
                  </span>
                </div>

                {/* 6 Core Vitals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">BP (mmHg)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      placeholder="120/80"
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pulse (bpm)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="76"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temp (°F)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      placeholder="98.6"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SpO2 (%)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      placeholder="99"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">RBS (mg/dL)</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={vitals.rbs}
                      onChange={(e) => setVitals({ ...vitals, rbs: e.target.value })}
                      placeholder="110"
                    />
                  </div>
                </div>

                {/* Sub-vitals: Pain Score & Fasting Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>
                      Patient Pain Rating (0 to 10 Scale)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { val: '0', label: '0 None' },
                        { val: '2', label: '1-3 Mild' },
                        { val: '5', label: '4-6 Moderate' },
                        { val: '8', label: '7-10 Severe' }
                      ].map(p => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setVitals({ ...vitals, painScore: p.val })}
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            borderRadius: '4px',
                            border: vitals.painScore === p.val ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: vitals.painScore === p.val ? '#eff6ff' : '#ffffff',
                            color: vitals.painScore === p.val ? '#0284c7' : '#475569',
                            fontWeight: vitals.painScore === p.val ? 700 : 500,
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>
                      Meal / Fasting Status
                    </label>
                    <select 
                      className="form-select"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      value={vitals.fastingStatus}
                      onChange={(e) => setVitals({ ...vitals, fastingStatus: e.target.value })}
                    >
                      <option value="Random / 2h Post-Meal">Random / 2h Post-Meal</option>
                      <option value="Fasting (8+ Hours)">Fasting (8+ Hours)</option>
                      <option value="Non-Fasting / Immediate Post-Prandial">Non-Fasting / Post-Prandial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CHIEF COMPLAINTS & QUICK SYMPTOMS TAGS */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>
                    Reason for Visit / Clinical Symptoms
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Click tags below to append quickly
                  </span>
                </div>

                {/* Quick tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    '+ High Fever',
                    '+ Dry Cough',
                    '+ Severe Headache',
                    '+ Chest Tightness',
                    '+ Abdominal Pain',
                    '+ Body Fatigue',
                    '+ BP Review',
                    '+ Diabetic Follow-Up',
                    '+ Post-Op Checkup'
                  ].map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleAddSymptom(sym.replace('+ ', ''))}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                <textarea 
                  className="form-textarea"
                  rows="2"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Describe patient symptoms, reason for consultation, or special nursing notes..."
                />
              </div>

              {/* SECTION 4: BILLING SUMMARY & ACTION BUTTON */}
              <div className="form-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  
                  {/* Fee Breakdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                        {visitType === 'IP' ? 'Admission Deposit' : 'Consultation Fee'}
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        INR {fee.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                        Counter Payment Mode
                      </label>
                      <select 
                        className="form-select"
                        style={{ fontSize: '12px', padding: '4px 8px', minWidth: '150px' }}
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="Cash Counter">Cash Counter</option>
                        <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe)</option>
                        <option value="Card (Debit/Credit)">Card (Debit/Credit)</option>
                        <option value="TPA Insurance / Corporate">TPA Insurance / Corporate</option>
                        <option value="Exempt / Hospital Free">Exempt / Free</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="submit" 
                      className="btn-primary-amber" 
                      style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {visitType === 'IP' ? <Bed size={15} /> : <Clock size={15} />}
                      <span>{visitType === 'IP' ? 'Confirm IP Admission & Allocate Bed' : 'Issue OPD Token & Notify via WhatsApp'}</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn-secondary-clean" 
                      onClick={() => setActiveReceptionTab('dashboard')}
                      style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

            </form>
          ) : (
            <div className="form-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <User size={46} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#0f172a', fontWeight: 700 }}>No Patient Selected</h3>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Please select a registered patient from the directory on the left or scan their barcode/NFC tag.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Diagnostic Lab Tracker & Completed Reports Modal */}
      {showLabTrackerModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 41, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowLabTrackerModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: '#0a1f36',
              color: '#ffffff',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Diagnostic Lab Tracker & Completed Reports
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    View who is in lab and add finished reports to doctor queue manually (with no priority)
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowLabTrackerModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SECTION 1: Reports Finished & Verified - Ready to Add to Doctor Queue */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#059669" />
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                      Verified Reports Finished ({readyLabOrders.length})
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    Manual Add to Queue (Standard Waiting Turn, No Priority)
                  </span>
                </div>

                {readyLabOrders.length === 0 ? (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '18px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                    <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>No pending verified lab reports waiting for queue check-in.</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      When pathology completes and verifies an order, it will appear here for you to manually add to the doctor queue.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {readyLabOrders.map(order => (
                      <div 
                        key={order.orderId}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #a7f3d0',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{order.patientName}</strong>
                              <span className="patient-id-badge" style={{ fontSize: '11px' }}>{order.patientId}</span>
                              <span className="token-chip" style={{ fontSize: '10.5px', padding: '1px 6px' }}>{order.tokenNo}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                              Order ID: {order.orderId} &bull; Ordered at {order.orderDate} &bull; Verified: {order.verifiedAt || '09:45 AM'} by {order.verifiedBy || 'Dr. K. Shalini'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-secondary-clean"
                              style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                setSelectedLabReport(order);
                                setIsLabReportModalOpen(true);
                              }}
                            >
                              <FileText size={12} /> View Report
                            </button>

                            <button
                              type="button"
                              className="btn-secondary-clean"
                              style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleSelectFromLab(order)}
                              title="Fill patient into OP Visit form"
                            >
                              <span>Fill OP Form</span>
                            </button>

                            <button
                              type="button"
                              className="btn-primary-amber"
                              style={{ padding: '5px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#059669', borderColor: '#047857' }}
                              onClick={() => handleQuickAddLabToQueue(order)}
                              title="Add directly to Doctor Queue with regular waiting turn"
                            >
                              <Plus size={13} />
                              <span>+ Add to Doctor Queue</span>
                            </button>
                          </div>
                        </div>

                        {/* Test badges list */}
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {order.tests?.map((t, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                background: '#ecfdf5', 
                                color: '#065f46', 
                                border: '1px solid #bbf7d0', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                padding: '2px 7px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={11} color="#10b981" />
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: Patients Currently in Lab (Testing in Progress) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FlaskConical size={18} color="#7c3aed" />
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                      Patients Currently in Lab ({inLabOrders.length})
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    Specimen Processing at Pathology Counter
                  </span>
                </div>

                {inLabOrders.length === 0 ? (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                    No patients are currently undergoing tests at the diagnostic laboratory.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {inLabOrders.map(order => (
                      <div 
                        key={order.orderId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{order.patientName}</strong>
                              <span className="patient-id-badge" style={{ fontSize: '11px' }}>{order.patientId}</span>
                              <span className="token-chip" style={{ fontSize: '10.5px', padding: '1px 6px' }}>{order.tokenNo}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                              Order ID: {order.orderId} &bull; Ordered by {order.doctor} &bull; Time: {order.orderDate}
                            </div>
                          </div>

                          <span style={{ 
                            background: '#f5f3ff', 
                            color: '#7c3aed', 
                            border: '1px solid #ddd6fe', 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={11} /> Sample Testing in Progress
                          </span>
                        </div>

                        {/* Test badges list */}
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {order.tests?.map((t, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                background: '#f8fafc', 
                                color: '#475569', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                padding: '2px 7px',
                                fontWeight: 500
                              }}
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previously Added Lab Returnees Reference */}
              {previouslyAddedOrders.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                    Recently Added to Doctor Queue from Lab ({previouslyAddedOrders.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {previouslyAddedOrders.map(order => (
                      <div 
                        key={order.orderId} 
                        style={{ 
                          fontSize: '11.5px', 
                          background: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '6px', 
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={12} color="#10b981" />
                        <span><strong>{order.patientName}</strong> ({order.patientId}) - In Regular Queue</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Note: Patients added from completed lab reports join the queue with standard waiting priority.
              </span>
              <button
                type="button"
                className="btn-navy"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => setShowLabTrackerModal(false)}
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
