import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  Barcode, 
  Radio, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  FileText, 
  Activity, 
  Calendar, 
  CreditCard, 
  FlaskConical, 
  Pill, 
  Plus, 
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  Droplet,
  List,
  Columns,
  ClipboardList,
  Heart,
  LayoutGrid,
  Clock,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
  Info,
  Sparkles,
  UserCheck,
  Layers,
  Receipt
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const PatientDirectoryView = () => {
  const { 
    patients, 
    tokens, 
    labOrders, 
    prescriptions, 
    bills,
    getPatientFullHistory,
    openPatientDossier,
    setSelectedPatientForSticker, 
    setIsLabelModalOpen, 
    setIsScannerOpen,
    setSelectedLabReport,
    setIsLabReportModalOpen,
    setSelectedRxForInvoice,
    setIsPharmacyInvoiceModalOpen,
    setSelectedBillForReceipt,
    setIsReceiptModalOpen,
    setActiveReceptionTab,
    setActivePortal,
    showToast,
    openPrescriptionPrint,
    openBillReceipt
  } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active-today' | 'has-labs' | 'has-rx' | 'vitals-alert' | 'elderly'
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [selectedPatientId, setSelectedPatientId] = useState(() => (patients?.[0]?.id || null));
  const [activePersonTab, setActivePersonTab] = useState('overview'); // 'overview' | 'vitals' | 'today' | 'labs' | 'rx' | 'billing' | 'timeline'
  const [viewLayout, setViewLayout] = useState('split'); // 'split' | 'cards' | 'table'
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());

  // Blood Pressure clinical evaluation
  const getBpStatus = (bpStr) => {
    if (!bpStr || !bpStr.includes('/')) return { label: 'Not Recorded', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', isAlert: false };
    const parts = bpStr.split('/');
    const systolic = parseInt(parts[0], 10);
    const diastolic = parseInt(parts[1], 10);
    if (isNaN(systolic) || isNaN(diastolic)) return { label: 'Normal', color: '#334155', bg: '#f1f5f9', border: '#e2e8f0', isAlert: false };
    
    if (systolic >= 160 || diastolic >= 100) {
      return { label: 'Stage 2 HTN (High)', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', isAlert: true };
    }
    if (systolic >= 140 || diastolic >= 90) {
      return { label: 'Stage 1 HTN', color: '#b45309', bg: '#fffbeb', border: '#fde68a', isAlert: true };
    }
    if (systolic >= 120 || diastolic >= 80) {
      return { label: 'Pre-Hypertension', color: '#475569', bg: '#f8fafc', border: '#cbd5e1', isAlert: false };
    }
    return { label: 'Optimal Normal', color: '#334155', bg: '#f1f5f9', border: '#e2e8f0', isAlert: false };
  };

  // Helper to aggregate comprehensive patient records
  const getPatientRecords = (pat) => {
    if (!pat || !pat.id) {
      return {
        visits: [],
        activeToken: null,
        allLabOrders: [],
        allPrescriptions: [],
        allBills: [],
        totalBilled: 0,
        totalPaid: 0,
        balanceDue: 0,
        stats: {}
      };
    }
    const fullHistory = (getPatientFullHistory ? getPatientFullHistory(pat.id) : null) || { visits: [], stats: {} };
    const visits = fullHistory.visits || [];
    
    const patTokens = (Array.isArray(tokens) ? tokens : []).filter(t => t && typeof t === 'object' && t.tokenNo && t.patientId === pat.id);
    const patLabsDirect = (Array.isArray(labOrders) ? labOrders : []).filter(l => l && l.patientId === pat.id);
    const patRxDirect = (Array.isArray(prescriptions) ? prescriptions : []).filter(r => r && r.patientId === pat.id);
    const patBillsDirect = (Array.isArray(bills) ? bills : []).filter(b => b && b.patientId === pat.id);

    // Merge lab orders without duplicate orderId
    const labOrdersMap = new Map();
    visits.forEach(v => {
      (v?.labOrders || []).forEach(l => {
        if (l?.orderId) labOrdersMap.set(l.orderId, { ...l, visitDate: v.date, doctor: v.doctor });
      });
    });
    patLabsDirect.forEach(l => {
      if (l?.orderId) labOrdersMap.set(l.orderId, { ...l, visitDate: l.orderDate || '2026-03-19', doctor: l.doctor || 'Dr. Arvind Ramesh' });
    });
    const allLabOrders = Array.from(labOrdersMap.values());

    // Merge prescriptions without duplicate rxId
    const rxMap = new Map();
    visits.forEach(v => {
      (v?.prescriptions || []).forEach(r => {
        const id = r?.rxId || r?.prescriptionId;
        if (id) rxMap.set(id, { ...r, rxId: id, visitDate: v.date, doctor: v.doctor });
      });
    });
    patRxDirect.forEach(r => {
      const id = r?.prescriptionId || r?.rxId;
      if (id) rxMap.set(id, { ...r, rxId: id, visitDate: r.date || '2026-03-19', doctor: r.doctor || 'Dr. Arvind Ramesh' });
    });
    const allPrescriptions = Array.from(rxMap.values());

    // Merge bills
    const billsMap = new Map();
    visits.forEach(v => {
      (v?.bills || []).forEach(b => {
        if (b?.billId) billsMap.set(b.billId, { ...b, visitDate: v.date });
      });
    });
    patBillsDirect.forEach(b => {
      if (b?.billId) billsMap.set(b.billId, { ...b, visitDate: b.date || '2026-03-19' });
    });
    const allBills = Array.from(billsMap.values());

    // Active token today
    const activeToken = patTokens.find(t => t && (t.status === 'in-consultation' || t.status === 'waiting' || t.status === 'lab-investigation')) || patTokens[0] || null;

    // Financial totals
    const totalBilled = allBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalPaid = allBills.filter(b => (b.status || '').toLowerCase() === 'paid').reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const balanceDue = Math.max(0, totalBilled - totalPaid);

    return {
      visits,
      activeToken,
      allLabOrders,
      allPrescriptions,
      allBills,
      totalBilled,
      totalPaid,
      balanceDue,
      stats: fullHistory.stats || {}
    };
  };

  // Open Lab Report in foreground
  const handleOpenLabReport = (order, patient) => {
    const reportObj = {
      orderId: order.orderId || `LAB-${order.id || '2026-001'}`,
      patientId: patient.id,
      patientName: patient.fullName,
      tokenNo: order.tokenNo || 'TK-01',
      doctor: order.doctor || 'Dr. Arvind Ramesh, MD (Gen Med)',
      orderDate: order.date || order.orderDate || '2026-03-19',
      paymentStatus: 'paid',
      amount: order.price || order.amount || 500,
      overallStatus: order.overallStatus || 'completed',
      verifiedBy: order.verifiedBy || 'Dr. K. Shalini, MD (Pathology)',
      verifiedAt: order.verifiedAt || '09:45 AM',
      tests: order.tests && order.tests.length > 0 ? order.tests : [
        {
          name: order.testName || 'Comprehensive Clinical Pathology Profile',
          sampleType: 'Whole Blood (EDTA) / Serum',
          status: 'completed',
          parameters: [
            { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', normal: '13.0 - 17.0', flag: 'normal' },
            { name: 'Total Leukocyte Count (WBC)', value: '7,400', unit: 'cells/cumm', normal: '4,000 - 11,000', flag: 'normal' },
            { name: 'Platelet Count', value: '245,000', unit: '/cumm', normal: '150,000 - 450,000', flag: 'normal' },
            { name: 'Random Blood Glucose (RBS)', value: patient.vitals?.rbs || '118', unit: 'mg/dL', normal: '70 - 140', flag: 'normal' },
            { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', normal: '0.7 - 1.3', flag: 'normal' }
          ]
        }
      ]
    };
    setSelectedLabReport(reportObj);
    setIsLabReportModalOpen(true);
  };

  // Open Pharmacy Invoice in foreground
  const handleOpenRxInvoice = (rx, patient) => {
    const invoiceObj = {
      prescriptionId: rx.rxId || rx.prescriptionId || 'RX-901',
      patientId: patient.id,
      patientName: patient.fullName,
      tokenNo: rx.tokenNo || 'TK-01',
      doctor: rx.doctor || 'Dr. Arvind Ramesh, MD',
      date: rx.date || rx.visitDate || '2026-03-19',
      dispensedStatus: rx.dispensedStatus || 'dispensed',
      billedStatus: rx.billedStatus || 'paid',
      totalAmount: rx.totalAmount || 78.5,
      items: rx.items || [
        { medicineId: 'MED-101', name: 'Dolo 650mg', dosage: '1-0-1', duration: '3 Days', timing: 'After Food', qty: 6, unitPrice: 3.5 },
        { medicineId: 'MED-103', name: 'Pan 40mg', dosage: '1-0-0', duration: '5 Days', timing: 'Before Food', qty: 5, unitPrice: 11.5 }
      ]
    };
    setSelectedRxForInvoice(invoiceObj);
    setIsPharmacyInvoiceModalOpen(true);
  };

  // Open Bill Receipt in foreground
  const handleOpenBillReceipt = (bill, patient) => {
    const receiptObj = {
      billId: bill.billId || `INV-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.fullName,
      type: bill.type || 'Hospital Consultation Fee',
      category: bill.category || 'doctor_fee',
      amount: bill.amount || 300,
      mode: bill.mode || 'UPI (GPay / PhonePe)',
      status: bill.status || 'Paid',
      date: bill.date || bill.visitDate || '2026-03-19',
      time: bill.time || '10:00 AM',
      description: bill.description || `${bill.type || 'Hospital Service'} - Official Cashier Receipt`
    };
    setSelectedBillForReceipt(receiptObj);
    setIsReceiptModalOpen(true);
  };

  // Print barcode sticker label
  const handlePrintLabel = (patient, e) => {
    e?.stopPropagation();
    setSelectedPatientForSticker(patient);
    setIsLabelModalOpen(true);
  };

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        p.fullName?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.barcode?.includes(q) ||
        p.nfcUid?.toLowerCase().includes(q) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (bloodGroupFilter !== 'all' && p.bloodGroup !== bloodGroupFilter) {
        return false;
      }

      if (activeFilter === 'active-today') {
        return tokens.some(t => t.patientId === p.id);
      }
      if (activeFilter === 'has-labs') {
        const records = getPatientRecords(p);
        return records.allLabOrders.length > 0;
      }
      if (activeFilter === 'has-rx') {
        const records = getPatientRecords(p);
        return records.allPrescriptions.length > 0;
      }
      if (activeFilter === 'vitals-alert') {
        const bpStatus = getBpStatus(p.vitals?.bp);
        return bpStatus.isAlert;
      }
      if (activeFilter === 'elderly') {
        return (p.age || 0) >= 60;
      }

      return true;
    });
  }, [patients, searchTerm, activeFilter, bloodGroupFilter, tokens, labOrders, prescriptions, bills]);

  // Selected patient object
  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || filteredPatients[0] || patients[0];
  }, [patients, selectedPatientId, filteredPatients]);

  const activePatientRecords = useMemo(() => {
    if (!activePatient) return null;
    return getPatientRecords(activePatient);
  }, [activePatient, tokens, labOrders, prescriptions, bills]);

  // Aggregate Metrics for Header
  const activeTodayCount = tokens.length;
  const totalLabsCount = labOrders.length;
  const totalRxCount = prescriptions.length;
  const alertVitalsCount = patients.filter(p => getBpStatus(p.vitals?.bp).isAlert).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & HEALTH METRICS PULSE                                      */}
      {/* ========================================================================= */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        padding: '16px 20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: '#0d2847', 
              color: '#ffffff', 
              padding: '6px', 
              borderRadius: '8px', 
              display: 'inline-flex' 
            }}>
              <ClipboardList size={18} />
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Hospital Master Patient Directory & Clinical EMR Records
            </h2>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
            Comprehensive longitudinal electronic health records, active vitals, verified pathology reports, and e-prescriptions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className="btn-secondary-clean" 
            style={{ padding: '7px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }} 
            onClick={() => setIsScannerOpen(true)}
            title="Scan 1D Barcode or 13.56MHz NFC Mifare Tag"
          >
            <Barcode size={15} color="#0284c7" />
            <span>Scan UHID Tag</span>
          </button>

          <button 
            type="button"
            className="btn-navy" 
            style={{ padding: '7px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }} 
            onClick={() => {
              setActivePortal('reception');
              setActiveReceptionTab('register');
            }}
            title="Register a brand new patient"
          >
            <Plus size={15} />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Clean, Professional Clinical Palette */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f2b48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total Patients</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{patients.length} <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#64748b' }}>Registered</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f2b48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Active Today (OPD)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{activeTodayCount} <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#64748b' }}>Encounters</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f2b48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Diagnostic Labs</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{totalLabsCount} <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#64748b' }}>Verified</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f2b48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Prescriptions</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{totalRxCount} <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#64748b' }}>Issued</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: alertVitalsCount > 0 ? '#fef2f2' : '#f8fafc', border: alertVitalsCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0', color: alertVitalsCount > 0 ? '#b91c1c' : '#0f2b48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Vitals Watchlist</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {alertVitalsCount} <span style={{ fontSize: '11.5px', fontWeight: 500, color: alertVitalsCount > 0 ? '#b91c1c' : '#64748b' }}>Elevated BP</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH, CATEGORY FILTERS & VIEW MODE CONTROLS                          */}
      {/* ========================================================================= */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '10px', 
        border: '1px solid #e2e8f0', 
        padding: '12px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input"
              placeholder="Search by Patient Name, UHID (DH-2026-xxx), Mobile, Barcode, NFC UID, or Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '13px' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '9px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Blood Group Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplet size={14} color="#64748b" />
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="form-input"
              style={{ width: '130px', padding: '6px 8px', fontSize: '12px', fontWeight: 600 }}
            >
              <option value="all">All Blood Groups</option>
              <option value="A+">A+ Rh Positive</option>
              <option value="A-">A- Rh Negative</option>
              <option value="B+">B+ Rh Positive</option>
              <option value="B-">B- Rh Negative</option>
              <option value="O+">O+ Rh Positive</option>
              <option value="O-">O- Rh Negative</option>
              <option value="AB+">AB+ Rh Positive</option>
              <option value="AB-">AB- Rh Negative</option>
            </select>
          </div>

          {/* Layout Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '7px', padding: '3px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewLayout('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                background: viewLayout === 'split' ? '#0d2847' : 'transparent',
                color: viewLayout === 'split' ? '#ffffff' : '#64748b'
              }}
              title="Split View: Patient roster on left, ultra-detailed interactive tab on right"
            >
              <Columns size={13} />
              <span>Person Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                background: viewLayout === 'cards' ? '#0d2847' : 'transparent',
                color: viewLayout === 'cards' ? '#ffffff' : '#64748b'
              }}
              title="Card Grid: Expandable patient dossier cards"
            >
              <LayoutGrid size={13} />
              <span>Dossier Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewLayout('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                background: viewLayout === 'table' ? '#0d2847' : 'transparent',
                color: viewLayout === 'table' ? '#ffffff' : '#64748b'
              }}
              title="Table View: High-density clinical table"
            >
              <List size={13} />
              <span>EMR Table</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Filter by:</span>
          {[
            { id: 'all', label: `All Patients (${patients.length})` },
            { id: 'active-today', label: `Active in OPD Today (${activeTodayCount})` },
            { id: 'has-labs', label: 'Has Pathology Labs' },
            { id: 'has-rx', label: 'Has Prescriptions' },
            { id: 'vitals-alert', label: `Elevated BP Watchlist (${alertVitalsCount})` },
            { id: 'elderly', label: 'Senior Citizens (60+ Yrs)' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: activeFilter === f.id ? 700 : 500,
                border: activeFilter === f.id ? '1.5px solid #0d2847' : '1px solid #cbd5e1',
                background: activeFilter === f.id ? '#0d2847' : '#ffffff',
                color: activeFilter === f.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: SPLIT WORKSPACE / DOSSIER CARDS / TABLE                  */}
      {/* ========================================================================= */}
      {viewLayout === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '16px', alignItems: 'start' }}>
          
          {/* LEFT: Master Patient Roster */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0', 
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 230px)',
            position: 'sticky',
            top: '80px'
          }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Patients Roster ({filteredPatients.length})
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Select to inspect tab</span>
            </div>

            <div style={{ overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredPatients.map(pat => {
                const isSelected = activePatient?.id === pat.id;
                const patRecords = getPatientRecords(pat);
                const bpStatus = getBpStatus(pat.vitals?.bp);
                const hasActiveToken = Boolean(patRecords.activeToken);

                return (
                  <div 
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatientId(pat.id);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '8px', 
                          background: isSelected ? '#0f2b48' : '#f1f5f9', 
                          border: isSelected ? 'none' : '1px solid #e2e8f0',
                          color: isSelected ? '#ffffff' : '#0f2b48', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {pat.fullName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', lineHeight: 1.2 }}>
                            {pat.fullName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>
                              {pat.id}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              &bull; {pat.age}Y / {pat.gender === 'Female' ? 'F' : 'M'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span style={{ 
                        fontSize: '10.5px', 
                        fontWeight: 700, 
                        background: '#f1f5f9', 
                        color: '#334155', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap'
                      }}>
                        {pat.bloodGroup}
                      </span>
                    </div>

                    {/* Secondary Status Strip */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={11} color={bpStatus.isAlert ? '#dc2626' : '#64748b'} />
                        <span style={{ color: bpStatus.isAlert ? '#dc2626' : '#475569', fontWeight: 600 }}>
                          BP: {pat.vitals?.bp || '120/80'}
                        </span>
                      </div>

                      {hasActiveToken && patRecords.activeToken?.tokenNo ? (
                        <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap' }}>
                          Today: {patRecords.activeToken.tokenNo}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                          {patRecords.visits.length} Visit(s) on File
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                  No patients match the search or filter query.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detailed Person Tabbed Workspace */}
          {activePatient && activePatientRecords ? (
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              overflow: 'hidden'
            }}>
              
              {/* Person Identity Banner (Clean White Background) */}
              <div style={{ 
                background: '#ffffff', 
                color: '#0f172a', 
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  
                  {/* Avatar + Main Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '52px', 
                      height: '52px', 
                      borderRadius: '10px', 
                      background: '#f1f5f9', 
                      border: '1px solid #cbd5e1',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '20px', 
                      fontWeight: 800,
                      color: '#0f2b48'
                    }}>
                      {activePatient.fullName ? activePatient.fullName[0] : 'P'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.3px' }}>
                          {activePatient.fullName}
                        </h3>
                        <span style={{ 
                          background: '#f1f5f9', 
                          color: '#334155', 
                          border: '1px solid #cbd5e1',
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          {activePatient.bloodGroup || 'O+'}
                        </span>
                        {activePatientRecords.activeToken?.tokenNo && (
                          <span style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            ACTIVE TODAY &bull; {activePatientRecords.activeToken.tokenNo}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12.5px', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          UHID: {activePatient.id}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>&bull;</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{activePatient.age} Years Old</span>
                        <span style={{ color: '#cbd5e1' }}>&bull;</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{activePatient.gender}</span>
                        <span style={{ color: '#cbd5e1' }}>&bull;</span>
                        <span style={{ color: '#475569' }}>DOB: {activePatient.dob || '1984-06-15'}</span>
                        <span style={{ color: '#cbd5e1' }}>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 600 }}>
                          <Phone size={12} /> {activePatient.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons for This Person */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-navy"
                      style={{ padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => openPatientDossier(activePatient)}
                      title="Open 360° Comprehensive Fullscreen Medical Dossier"
                    >
                      <FileText size={14} />
                      <span>360° Dossier</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary-clean"
                      style={{ 
                        padding: '7px 11px', 
                        fontSize: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        background: '#ffffff', 
                        color: '#334155', 
                        border: '1px solid #cbd5e1' 
                      }}
                      onClick={(e) => handlePrintLabel(activePatient, e)}
                      title="Print Barcode and NFC 13.56MHz Sticker"
                    >
                      <Printer size={13} />
                      <span>Print Tag</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary-clean"
                      style={{ 
                        padding: '7px 12px', 
                        fontSize: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        fontWeight: 700
                      }}
                      onClick={() => {
                        setActivePortal('reception');
                        setActiveReceptionTab('op-visit');
                        showToast(`Creating new OP encounter for ${activePatient.fullName}`);
                      }}
                      title="Create new OPD Visit / Token"
                    >
                      <Plus size={13} />
                      <span>New Visit</span>
                    </button>
                  </div>

                </div>

                {/* Hardware Tags Barcode / NFC Chips */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  marginTop: '14px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #f1f5f9', 
                  fontSize: '11px', 
                  flexWrap: 'wrap' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    padding: '3px 8px', 
                    borderRadius: '5px', 
                    fontFamily: 'var(--font-mono)' 
                  }}>
                    <Barcode size={13} color="#64748b" />
                    <span style={{ color: '#64748b' }}>Barcode:</span>
                    <strong style={{ color: '#0f172a' }}>{activePatient.barcode}</strong>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    padding: '3px 8px', 
                    borderRadius: '5px', 
                    fontFamily: 'var(--font-mono)' 
                  }}>
                    <Radio size={13} color="#64748b" />
                    <span style={{ color: '#64748b' }}>NFC UID:</span>
                    <strong style={{ color: '#0f172a' }}>{activePatient.nfcUid}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                    <Clock size={12} color="#94a3b8" />
                    <span>Registered: {activePatient.registeredAt || '2026-03-19 08:30'}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Inside This Person */}
              <div style={{ 
                background: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0', 
                padding: '0 16px', 
                display: 'flex', 
                gap: '4px',
                overflowX: 'auto'
              }}>
                {[
                  { id: 'overview', label: 'Overview & Demographics', icon: User },
                  { id: 'vitals', label: 'Vitals & Triaging', icon: Activity, badge: activePatient.vitals?.bp },
                  { id: 'today', label: "Today's OPD Visit", icon: Clock, badge: activePatientRecords.activeToken ? 'Live' : null, badgeColor: '#0f2b48' },
                  { id: 'labs', label: 'Pathology & Lab Reports', icon: FlaskConical, badge: activePatientRecords.allLabOrders.length },
                  { id: 'rx', label: 'Active Prescriptions', icon: Pill, badge: activePatientRecords.allPrescriptions.length },
                  { id: 'billing', label: 'Billing & Ledger', icon: CreditCard, badge: `INR ${activePatientRecords.totalPaid}` },
                  { id: 'timeline', label: 'Longitudinal Encounters', icon: ClipboardList, badge: activePatientRecords.visits.length }
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = activePersonTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActivePersonTab(t.id)}
                      style={{
                        padding: '12px 14px',
                        border: 'none',
                        borderBottom: isActive ? '3px solid #0f2b48' : '3px solid transparent',
                        background: 'transparent',
                        color: isActive ? '#0f2b48' : '#64748b',
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        wordBreak: 'keep-all',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                      {t.badge !== undefined && t.badge !== null && (
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          padding: '1px 6px', 
                          borderRadius: '999px',
                          background: isActive ? '#0f2b48' : '#e2e8f0',
                          color: isActive ? '#ffffff' : '#475569',
                          whiteSpace: 'nowrap',
                          wordBreak: 'keep-all'
                        }}>
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Body Content */}
              <div style={{ padding: '20px 24px', minHeight: '380px' }}>
                
                {/* --------------------------------------------------------------- */}
                {/* TAB 1: OVERVIEW & DEMOGRAPHICS                                   */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Clinical Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Visits</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {activePatientRecords.visits.length}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Diagnostic Labs</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {activePatientRecords.allLabOrders.length} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Completed</span>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Prescriptions</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {activePatientRecords.allPrescriptions.length} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Regimens</span>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Lifetime Billed</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          INR {activePatientRecords.totalPaid.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Demographics & Contact Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      
                      {/* Contact & Residential Details */}
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#0f2b48" />
                          <span>Contact & Residential Details</span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Primary Mobile Number</span>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>+91 {activePatient.phone}</span>
                              <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#15803d', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                WhatsApp Enabled
                              </span>
                            </div>
                          </div>

                          {activePatient.altPhone && (
                            <div>
                              <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Alternate Contact / Landline</span>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{activePatient.altPhone}</div>
                            </div>
                          )}

                          <div>
                            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Permanent Residential Address</span>
                            <div style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '5px', marginTop: '2px' }}>
                              <MapPin size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{activePatient.address || 'Address not recorded during intake.'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency & Family Contact Card */}
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={14} color="#475569" />
                          <span>Emergency Contact & Attendant</span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Emergency Contact Name</span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                              {activePatient.emergencyName || 'Not designated'}
                            </strong>
                          </div>

                          <div>
                            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Relationship to Patient</span>
                            <span style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                              {activePatient.emergencyRelation || 'Family Member'}
                            </span>
                          </div>

                          <div>
                            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Emergency Helpline / Phone</span>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>+91 {activePatient.emergencyPhone || activePatient.phone}</span>
                              <a 
                                href={`tel:${activePatient.emergencyPhone || activePatient.phone}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#0f2b48', textDecoration: 'none', fontWeight: 700 }}
                              >
                                <PhoneCall size={12} /> Call Now
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 2: VITALS & CLINICAL TRIAGING                               */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'vitals' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Clinical Vitals & Nursing Triage Signs
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          Last Recorded: {activePatient.vitals?.recordedAt || 'Today 08:35 AM'} &bull; Nurse Triage Station
                        </p>
                      </div>

                      {getBpStatus(activePatient.vitals?.bp).isAlert && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 700 }}>
                          <AlertTriangle size={14} />
                          <span>Clinical Alert: Elevated Blood Pressure</span>
                        </div>
                      )}
                    </div>

                    {/* Vitals Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      
                      {/* Blood Pressure */}
                      <div style={{ 
                        background: '#ffffff', 
                        border: `1.5px solid ${getBpStatus(activePatient.vitals?.bp).border || '#e2e8f0'}`, 
                        borderRadius: '10px', 
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Blood Pressure</span>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            background: getBpStatus(activePatient.vitals?.bp).bg,
                            color: getBpStatus(activePatient.vitals?.bp).color
                          }}>
                            {getBpStatus(activePatient.vitals?.bp).label}
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.bp || '120/80'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>mmHg</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Target: &lt; 120/80 mmHg &bull; Omron Digital Cuff
                        </div>
                      </div>                      {/* Heart Rate / Pulse */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Heart Rate / Pulse</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            Normal Sinus
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.pulse || '76'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>bpm</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Reference: 60 - 100 bpm &bull; Radial Pulse
                        </div>
                      </div>

                      {/* Body Temperature */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Body Temperature</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            Normothermic
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.temp || '98.6'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>&deg;F</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Normal Range: 97.8 - 99.1 &deg;F &bull; Infrared Tympanic
                        </div>
                      </div>

                      {/* Oxygen Saturation (SpO2) */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SpO2 Saturation</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            Adequate
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.spo2 || '99'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>%</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Reference: 95 - 100% on Room Air
                        </div>
                      </div>

                      {/* Body Weight */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Weight & Est. BMI</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            BMI ~24.5
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.weight || '72'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>kg</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Calibrated Digital Platform Scale
                        </div>
                      </div>

                      {/* Random Blood Glucose (RBS) */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Random Glucose (RBS)</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            Euglycemic
                          </span>
                        </div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {activePatient.vitals?.rbs || '118'} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>mg/dL</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Normal Range: 70 - 140 mg/dL
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 3: ACTIVE OPD VISIT (TODAY)                                 */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'today' && (
                  <div>
                    {activePatientRecords.activeToken?.tokenNo ? (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                background: '#0f2b48', 
                                color: '#ffffff', 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontFamily: 'var(--font-mono)', 
                                fontWeight: 800, 
                                fontSize: '15px',
                                whiteSpace: 'nowrap',
                                wordBreak: 'keep-all'
                              }}>
                                Token: {activePatientRecords.activeToken.tokenNo}
                              </span>
                              <span style={{ 
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                fontWeight: 700,
                                fontSize: '12px',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                wordBreak: 'keep-all'
                              }}>
                                {activePatientRecords.activeToken.status === 'in-consultation' ? 'Currently in Doctor Cabin' : 'Waiting in Queue'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                              Encounter Created: Today at {activePatientRecords.activeToken.createdAt || '08:48 AM'} &bull; Department of General Medicine
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn-navy"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => {
                              setActivePortal('doctor');
                              showToast(`Switched to Doctor OPD Cabin for ${activePatient.fullName}`);
                            }}
                          >
                            <Stethoscope size={14} />
                            <span>Go to Doctor OPD</span>
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Consulting Physician</span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                              {activePatientRecords.activeToken.doctor || 'Dr. Arvind Ramesh, MD (Gen Med)'}
                            </strong>
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                              Room: {activePatientRecords.activeToken.room || 'Consultation Room 102'}
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Chief Symptoms & Presenting Complaints</span>
                            <p style={{ margin: '4px 0 0 0', color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>
                              {activePatientRecords.activeToken.notes || 'Routine follow-up clinical assessment.'}
                            </p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        <Clock size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>
                          No Active OPD Token for Today
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '420px', margin: '6px auto 16px auto' }}>
                          {activePatient.fullName} does not have an active queue token for today's OPD consultation.
                        </p>
                        <button
                          type="button"
                          className="btn-navy"
                          style={{ padding: '8px 16px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            setActivePortal('reception');
                            setActiveReceptionTab('op-visit');
                          }}
                        >
                          <Plus size={14} />
                          <span>Generate OPD Visit Token Now</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 4: DIAGNOSTIC PATHOLOGY & LAB REPORTS                       */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'labs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Verified Diagnostic Pathology Orders & Test Results
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          Official computerized test values authorized by Chief Clinical Pathologist
                        </p>
                      </div>

                      <span style={{ fontSize: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                        {activePatientRecords.allLabOrders.length} Order(s) Recorded
                      </span>
                    </div>

                    {activePatientRecords.allLabOrders.length > 0 ? (
                      activePatientRecords.allLabOrders.map((order, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          {/* Order Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FlaskConical size={16} color="#0f2b48" />
                                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                                  Order #{order.orderId}
                                </strong>
                                <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                                  Verified & Released
                                </span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                                Date: {order.visitDate || order.orderDate || '2026-03-19'} &bull; Authorized by {order.verifiedBy || 'Dr. K. Shalini, MD'}
                              </div>
                            </div>

                            {/* FOREGROUND "VIEW REPORT" BUTTON */}
                            <button
                              type="button"
                              className="btn-navy"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px'
                              }}
                              onClick={() => handleOpenLabReport(order, activePatient)}
                              title="Open official diagnostic pathology report directly in foreground modal"
                            >
                              <FileText size={13} />
                              <span>View Diagnostic Report</span>
                            </button>
                          </div>

                          {/* Tests / Parameters Table Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(order.tests && order.tests.length > 0 ? order.tests : [
                              {
                                name: order.testName || 'Routine Clinical Pathology Investigation',
                                parameters: [
                                  { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', normal: '13.0 - 17.0', flag: 'normal' },
                                  { name: 'Platelet Count', value: '245,000', unit: '/cumm', normal: '150,000 - 450,000', flag: 'normal' },
                                  { name: 'Random Blood Glucose', value: activePatient.vitals?.rbs || '118', unit: 'mg/dL', normal: '70 - 140', flag: 'normal' }
                                ]
                              }
                            ]).map((t, tIdx) => (
                              <div key={tIdx} style={{ background: '#f8fafc', borderRadius: '6px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                                  {t.name}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                                  {(t.parameters || []).slice(0, 4).map((p, pIdx) => (
                                    <div key={pIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '6px 10px', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ color: '#475569' }}>{p.name}:</span>
                                      <strong style={{ color: p.flag === 'high' ? '#dc2626' : '#0f172a' }}>
                                        {p.value} {p.unit}
                                      </strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '10px', color: '#94a3b8', fontSize: '13px' }}>
                        No diagnostic pathology orders on file for this patient.
                      </div>
                    )}

                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 5: ACTIVE PRESCRIPTIONS & MEDICATIONS                       */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'rx' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Doctor Electronic Prescriptions & Medication Regimens
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          Standard dosage regimens with mandatory food timing indicators
                        </p>
                      </div>

                      <span style={{ fontSize: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                        {activePatientRecords.allPrescriptions.length} Prescription(s)
                      </span>
                    </div>

                    {activePatientRecords.allPrescriptions.length > 0 ? (
                      activePatientRecords.allPrescriptions.map((rx, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          {/* Rx Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Pill size={16} color="#0f2b48" />
                                <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                                  Rx #{rx.rxId || rx.prescriptionId}
                                </strong>
                                <span style={{ 
                                  background: '#f1f5f9', 
                                  color: '#334155', 
                                  border: '1px solid #e2e8f0',
                                  fontSize: '11px', 
                                  fontWeight: 600, 
                                  padding: '2px 8px', 
                                  borderRadius: '4px' 
                                }}>
                                  {rx.dispensedStatus === 'dispensed' ? 'Dispensed at Pharmacy Counter' : 'Ready for Dispensing'}
                                </span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                                Prescribed by {rx.doctor || 'Dr. Arvind Ramesh, MD'} &bull; Date: {rx.visitDate || rx.date || '2026-03-19'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn-secondary-clean"
                                style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => openPrescriptionPrint(rx)}
                                title="Print Official Medical Prescription (A4)"
                              >
                                <Stethoscope size={12} />
                                <span>Print Rx (A4)</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary-clean"
                                style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleOpenRxInvoice(rx, activePatient)}
                              >
                                <FileText size={12} />
                                <span>View Pharmacy Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* Medicines Items Table */}
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Medicine / Formulation</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Dosage Pattern</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Meal Timing</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Duration</th>
                                <th style={{ textAlign: 'right', padding: '8px' }}>Qty Dispensed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(rx.items || []).map((item, itIdx) => (
                                <tr key={itIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px', fontWeight: 600, color: '#0f172a' }}>
                                    {item.name}
                                    {item.generic && <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 400 }}>{item.generic}</div>}
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '8px' }}>
                                    <span style={{ 
                                      fontFamily: 'var(--font-mono)', 
                                      background: '#f1f5f9', 
                                      color: '#0f172a', 
                                      padding: '2px 8px', 
                                      borderRadius: '4px', 
                                      fontWeight: 800, 
                                      fontSize: '11.5px',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {item.dosage}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '8px' }}>
                                    <span style={{ 
                                      fontSize: '11px', 
                                      fontWeight: 600, 
                                      padding: '2px 8px', 
                                      borderRadius: '4px',
                                      background: '#f1f5f9',
                                      color: '#334155',
                                      border: '1px solid #e2e8f0'
                                    }}>
                                      {item.timing || 'After Food'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '8px', color: '#475569' }}>
                                    {item.duration || '5 Days'}
                                  </td>
                                  <td style={{ textAlign: 'right', padding: '8px', fontWeight: 700, color: '#0f172a' }}>
                                    {item.qty} Tabs
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '10px', color: '#94a3b8', fontSize: '13px' }}>
                        No prescriptions currently on file for this patient.
                      </div>
                    )}

                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 6: BILLING & FINANCIAL LEDGER                               */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'billing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Financial KPI Banner */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Invoiced</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          INR {activePatientRecords.totalBilled.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Settled / Paid</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          INR {activePatientRecords.totalPaid.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Outstanding Balance</span>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: activePatientRecords.balanceDue > 0 ? '#dc2626' : '#0f172a', marginTop: '2px' }}>
                          INR {activePatientRecords.balanceDue.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Bills Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Invoice ID & Type</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Service Description</th>
                            <th style={{ textAlign: 'center', padding: '10px 12px' }}>Payment Mode</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px' }}>Amount</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px' }}>Receipt Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activePatientRecords.allBills.map((b, bIdx) => (
                            <tr key={bIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 12px' }}>
                                <strong style={{ color: '#0f172a' }}>{b.type}</strong>
                                <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{b.billId}</div>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {b.description || `${b.type} Clinical Service`}
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                  {b.mode || 'Cash / UPI'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                                INR {Number(b.amount || 0).toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'right', padding: '10px 12px' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    className="btn-secondary-clean"
                                    style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                    onClick={() => openBillReceipt(b)}
                                    title="Print Consultation / Service Bill Receipt"
                                  >
                                    <Receipt size={11} color="#475569" />
                                    <span>Print Bill</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary-clean"
                                    style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                    onClick={() => handleOpenBillReceipt(b, activePatient)}
                                  >
                                    <FileText size={11} />
                                    <span>Slip</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {activePatientRecords.allBills.length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                No financial billing records for this patient.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB 7: LONGITUDINAL ENCOUNTER TIMELINE                          */}
                {/* --------------------------------------------------------------- */}
                {activePersonTab === 'timeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Complete Longitudinal Encounter History ({activePatientRecords.visits.length} Encounters)
                    </h4>

                    {activePatientRecords.visits.map((v, vIdx) => (
                      <div 
                        key={vIdx}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          background: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{v?.type || 'General OPD Consultation'}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                              Encounter #{v?.visitId || v?.tokenNo || 'OPD'} &bull; {v?.date} at {v?.time || '10:00 AM'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            {v.status === 'completed' ? 'Concluded' : v.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#334155' }}>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>Consulting Physician:</span> {v.doctor} ({v.room})
                        </div>

                        <div style={{ fontSize: '12px', color: '#334155' }}>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>Presenting Complaints:</span> {v.complaints}
                        </div>

                        {v.diagnosis && (
                          <div style={{ fontSize: '12px', color: '#0f172a', background: '#f1f5f9', padding: '6px 10px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                            <strong>Clinical Assessment:</strong> {v.diagnosis}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              Select a patient from the roster on the left to view comprehensive clinical tabs.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: EXPANDED DOSSIER CARDS (GRID)                                */}
      {/* ========================================================================= */}
      {viewLayout === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPatients.map(pat => {
            const patRecords = getPatientRecords(pat);
            const bpStatus = getBpStatus(pat.vitals?.bp);
            const isExpanded = expandedCardIds.has(pat.id);

            const toggleExpand = () => {
              setExpandedCardIds(prev => {
                const next = new Set(prev);
                if (next.has(pat.id)) next.delete(pat.id);
                else next.add(pat.id);
                return next;
              });
            };

            return (
              <div 
                key={pat.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  overflow: 'hidden'
                }}
              >
                {/* Card Primary Header */}
                <div 
                  onClick={toggleExpand}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '8px', 
                      background: '#f1f5f9', 
                      color: '#0f2b48', 
                      border: '1px solid #e2e8f0',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 800, 
                      fontSize: '16px' 
                    }}>
                      {pat.fullName[0]}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{pat.fullName}</strong>
                        <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '1px 7px', borderRadius: '4px', fontWeight: 700 }}>
                          {pat.bloodGroup}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                          {pat.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                        {pat.age} Yrs &bull; {pat.gender} &bull; Phone: {pat.phone} &bull; Barcode: {pat.barcode} &bull; NFC: {pat.nfcUid}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Vitals preview */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: bpStatus.color }}>
                        BP: {pat.vitals?.bp || '120/80'} ({bpStatus.label})
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {patRecords.allLabOrders.length} Labs &bull; {patRecords.allPrescriptions.length} Rx
                      </span>
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openPatientDossier(pat);
                      }}
                      title="Open full 360° Medical Dossier"
                    >
                      <FileText size={12} />
                      <span>360° Dossier</span>
                    </button>

                    <ChevronRight size={18} color="#64748b" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </div>
                </div>

                {/* Card Expanded Detail Body */}
                {isExpanded && (
                  <div style={{ padding: '18px 20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Vitals Strip */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>BLOOD PRESSURE</span>
                        <strong style={{ color: bpStatus.color, fontSize: '14px' }}>{pat.vitals?.bp || '120/80'} mmHg</strong>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>PULSE</span>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{pat.vitals?.pulse || '76'} bpm</strong>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>TEMP</span>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{pat.vitals?.temp || '98.6'} &deg;F</strong>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>SpO2</span>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{pat.vitals?.spo2 || '99'}%</strong>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>WEIGHT</span>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{pat.vitals?.weight || '70'} kg</strong>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 600 }}>RBS</span>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>{pat.vitals?.rbs || '110'} mg/dL</strong>
                      </div>
                    </div>

                    {/* Labs with View Report Buttons */}
                    {patRecords.allLabOrders.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FlaskConical size={14} color="#0f2b48" />
                          <span>Diagnostic Pathology Tests</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {patRecords.allLabOrders.map((l, lIdx) => (
                            <div key={lIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Order #{l.orderId}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                                  Verified by {l.verifiedBy || 'Dr. K. Shalini'} &bull; Date: {l.visitDate || '2026-03-19'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn-secondary-clean"
                                style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleOpenLabReport(l, pat)}
                              >
                                <FileText size={12} />
                                <span>View Report</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {patRecords.allPrescriptions.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Pill size={14} color="#0f2b48" />
                          <span>Prescribed Medications</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {patRecords.allPrescriptions.map((r, rIdx) => (
                            <div key={rIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Rx #{r.rxId || r.prescriptionId}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                                  {r.items?.length || 1} item(s) &bull; {r.dispensedStatus === 'dispensed' ? 'Dispensed' : 'Ready'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn-secondary-clean"
                                style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleOpenRxInvoice(r, pat)}
                              >
                                <FileText size={12} />
                                <span>View Invoice</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: HIGH-DENSITY EMR TABLE                                       */}
      {/* ========================================================================= */}
      {viewLayout === 'table' && (
        <div className="modern-table-container">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
              Showing {filteredPatients.length} of {patients.length} Registered Patients
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Click row to inspect complete medical record
            </span>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Patient UHID & Name</th>
                <th>Demographics</th>
                <th>Contact & Emergency</th>
                <th>Baseline Vitals</th>
                <th>Hardware Tag</th>
                <th>Diagnostic Labs</th>
                <th>Active Rx</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(pat => {
                const patRecords = getPatientRecords(pat);
                const bpStatus = getBpStatus(pat.vitals?.bp);

                return (
                  <tr 
                    key={pat.id} 
                    onClick={() => {
                      setSelectedPatientId(pat.id);
                      setViewLayout('split');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '6px', 
                          background: '#f1f5f9', 
                          color: '#0f2b48', 
                          border: '1px solid #e2e8f0',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          fontSize: '13px' 
                        }}>
                          {pat.fullName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            {pat.fullName}
                          </div>
                          <span className="patient-id-badge" style={{ fontSize: '10.5px' }}>
                            {pat.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{pat.age} Yrs &bull; {pat.gender}</div>
                      <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '10px', marginTop: '2px' }}>
                        {pat.bloodGroup}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{pat.phone}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        Emerg: {pat.emergencyName} ({pat.emergencyRelation})
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: bpStatus.color }}>
                        BP: {pat.vitals?.bp || '120/80'}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        Pulse: {pat.vitals?.pulse || '-'} &bull; SpO2: {pat.vitals?.spo2 || '-'}%
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
                        <span style={{ color: '#475569' }}>Bar: {pat.barcode}</span>
                        <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Radio size={10} /> {pat.nfcUid}
                        </span>
                      </div>
                    </td>

                    <td>
                      {patRecords.allLabOrders.length > 0 ? (
                        <button
                          type="button"
                          className="btn-secondary-clean"
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLabReport(patRecords.allLabOrders[0], pat);
                          }}
                        >
                          <FlaskConical size={11} />
                          <span>View ({patRecords.allLabOrders.length})</span>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>None</span>
                      )}
                    </td>

                    <td>
                      {patRecords.allPrescriptions.length > 0 ? (
                        <button
                          type="button"
                          className="btn-secondary-clean"
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRxInvoice(patRecords.allPrescriptions[0], pat);
                          }}
                        >
                          <Pill size={11} />
                          <span>Rx ({patRecords.allPrescriptions.length})</span>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>None</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button"
                          className="btn-navy" 
                          style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => openPatientDossier(pat)}
                          title="Open 360° Medical Record"
                        >
                          <FileText size={11} />
                          <span>Dossier</span>
                        </button>

                        <button 
                          type="button"
                          className="btn-secondary-clean" 
                          style={{ padding: '4px 6px', fontSize: '11px' }}
                          onClick={(e) => handlePrintLabel(pat, e)}
                          title="Print Barcode & NFC Sticker"
                        >
                          <Printer size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
