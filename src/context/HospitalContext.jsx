import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = typeof window !== 'undefined'
  ? (window.location.port !== '5000' && window.location.port !== ''
      ? `http://${window.location.hostname}:5000`
      : window.location.origin)
  : 'http://localhost:5000';

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  // Real-time Backend & Socket State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const socketRef = useRef(null);

  // Navigation State
  const [activePortal, setActivePortal] = useState('reception'); // 'reception' | 'doctor' | 'lab' | 'pharmacy' | 'admin' | 'queue' | 'communication'
  const [activeReceptionTab, setActiveReceptionTab] = useState('register'); // 'dashboard' | 'register' | 'op-visit' | 'directory'
  const [activeAdminTab, setActiveAdminTab] = useState('revenue'); // 'revenue' | 'pharmacy' | 'employees' | 'attendance'
  const [activePharmacyTab, setActivePharmacyTab] = useState('dispense'); // 'dispense' | 'stocks'
  const [isPharmacySidebarOpen, setIsPharmacySidebarOpen] = useState(false);

  useEffect(() => {
    if (activePortal !== 'pharmacy') {
      setIsPharmacySidebarOpen(false);
    }
  }, [activePortal]);

  // Scanner & Modal States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);
  const [isPharmacyInvoiceModalOpen, setIsPharmacyInvoiceModalOpen] = useState(false);
  const [selectedRxForInvoice, setSelectedRxForInvoice] = useState(null);
  const [isTokenSlipModalOpen, setIsTokenSlipModalOpen] = useState(false);
  const [selectedTokenForSlip, setSelectedTokenForSlip] = useState(null);
  const [selectedPatientForSticker, setSelectedPatientForSticker] = useState(null);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [isPatientDossierModalOpen, setIsPatientDossierModalOpen] = useState(false);
  const [selectedPatientForDossier, setSelectedPatientForDossier] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to load from LocalStorage with fallback and defensive sanitization
  const getInitial = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`digihos_${key}`);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      if (key === 'tokens' && Array.isArray(parsed)) {
        const cleaned = parsed.filter(t => t && typeof t === 'object' && t.tokenNo);
        return cleaned.length > 0 ? cleaned : fallback;
      }
      if (key === 'patients' && Array.isArray(parsed)) {
        const cleaned = parsed.filter(p => p && typeof p === 'object' && p.id);
        return cleaned.length > 0 ? cleaned : fallback;
      }
      return parsed;
    } catch {
      return fallback;
    }
  };

  // Pre-populated Patients (No Emojis)
  const [patients, setPatients] = useState(() => getInitial('patients', [
    {
      id: 'DH-2026-001',
      barcode: '2026001',
      nfcUid: 'NFC-A18F90C2',
      fullName: 'Senthil Kumar M',
      phone: '9842188720',
      age: 42,
      dob: '1984-06-15',
      gender: 'Male',
      bloodGroup: 'B+',
      address: '42, Cross Cut Road, Gandhipuram, Coimbatore - 641012',
      emergencyName: 'Deepa Senthil',
      emergencyRelation: 'Spouse',
      emergencyPhone: '9842188721',
      altPhone: '04222451000',
      registeredAt: '2026-03-19 08:30',
      vitals: {
        bp: '138/88',
        weight: '76',
        pulse: '78',
        temp: '98.6',
        spo2: '99',
        recordedAt: '08:35 AM'
      }
    },
    {
      id: 'DH-2026-002',
      barcode: '2026002',
      nfcUid: 'NFC-B73D44E1',
      fullName: 'Ananya Raghavan',
      phone: '9443211099',
      age: 28,
      dob: '1998-02-10',
      gender: 'Female',
      bloodGroup: 'O+',
      address: '15, Race Course Road, Coimbatore - 641018',
      emergencyName: 'Karthik Raghavan',
      emergencyRelation: 'Father',
      emergencyPhone: '9443211088',
      altPhone: '',
      registeredAt: '2026-03-19 08:45',
      vitals: {
        bp: '118/74',
        weight: '54',
        pulse: '72',
        temp: '98.4',
        spo2: '98',
        recordedAt: '08:48 AM'
      }
    },
    {
      id: 'DH-2026-003',
      barcode: '2026003',
      nfcUid: 'NFC-F99C1204',
      fullName: 'Murugesan V',
      phone: '9789055432',
      age: 63,
      dob: '1963-11-04',
      gender: 'Male',
      bloodGroup: 'A+',
      address: '88, Mettupalayam Road, RS Puram, Coimbatore - 641002',
      emergencyName: 'Selvi M',
      emergencyRelation: 'Spouse',
      emergencyPhone: '9789055433',
      altPhone: '',
      registeredAt: '2026-03-19 09:05',
      vitals: {
        bp: '145/92',
        weight: '81',
        pulse: '84',
        temp: '99.1',
        spo2: '97',
        recordedAt: '09:10 AM'
      }
    },
    {
      id: 'DH-2026-004',
      barcode: '2026004',
      nfcUid: 'NFC-C44D8891',
      fullName: 'Gokul R',
      phone: '8899881772',
      age: 26,
      dob: '2000-05-18',
      gender: 'Male',
      bloodGroup: 'A+',
      address: '12, Bharathi Park Road, Saibaba Colony, Coimbatore - 641011',
      emergencyName: 'Ramesh G',
      emergencyRelation: 'Father',
      emergencyPhone: '8899881771',
      altPhone: '',
      registeredAt: '2026-03-19 09:20',
      vitals: {
        bp: '120/80',
        weight: '68',
        pulse: '74',
        temp: '98.6',
        spo2: '99',
        recordedAt: '09:22 AM'
      }
    }
  ]));

  // Active Tokens Queue
  const [tokens, setTokens] = useState(() => getInitial('tokens', [
    {
      tokenNo: 'TK-01',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      age: 42,
      gender: 'Male',
      phone: '9842188720',
      type: 'Lab Review',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      status: 'lab-completed',
      createdAt: '08:35 AM',
      notes: 'Diagnostic CBC & RBS completed. Awaiting reception queue check-in.'
    },
    {
      tokenNo: 'TK-02',
      patientId: 'DH-2026-002',
      patientName: 'Ananya Raghavan',
      age: 28,
      gender: 'Female',
      phone: '9443211099',
      type: 'General OPD',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      status: 'in-consultation',
      createdAt: '08:48 AM',
      notes: 'Throat irritation, dry cough for 3 days.'
    },
    {
      tokenNo: 'TK-03',
      patientId: 'DH-2026-003',
      patientName: 'Murugesan V',
      age: 63,
      gender: 'Male',
      phone: '9789055432',
      type: 'Diagnostic Tests',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      status: 'lab-investigation',
      createdAt: '09:10 AM',
      notes: 'Undergoing Lipid Profile and RBS tests at Diagnostic Desk.'
    },
    {
      tokenNo: 'TK-04',
      patientId: 'DH-2026-004',
      patientName: 'Gokul R',
      age: 26,
      gender: 'Male',
      phone: '8899881772',
      type: 'General OPD',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      status: 'waiting',
      createdAt: '09:22 AM',
      notes: 'Follow-up consultation for mild fever.'
    }
  ]));

  // Live Pharmacy Stock Master (Organized Category-wise with Batch & Location)
  const [pharmacyStock, setPharmacyStock] = useState(() => getInitial('pharmacyStock', [
    {
      id: 'MED-101',
      name: 'Dolo 650mg Tablet',
      generic: 'Paracetamol IP 650mg',
      category: 'Analgesics & Pain Relief',
      dosageForm: 'Tablet',
      manufacturer: 'Micro Labs Ltd',
      unitPrice: 3.5,
      mrp: 4.0,
      stockQty: 340,
      minStockLevel: 50,
      batch: 'DL-9021',
      mfgDate: '01/2025',
      expiry: '12/2027',
      shelfRack: 'Rack A - Shelf 02',
      isAvailable: true
    },
    {
      id: 'MED-102',
      name: 'Combiflam Tablet',
      generic: 'Ibuprofen 400mg + Paracetamol 325mg',
      category: 'Analgesics & Pain Relief',
      dosageForm: 'Tablet',
      manufacturer: 'Sanofi India Ltd',
      unitPrice: 4.2,
      mrp: 5.5,
      stockQty: 180,
      minStockLevel: 40,
      batch: 'CBF-1102',
      mfgDate: '03/2025',
      expiry: '02/2028',
      shelfRack: 'Rack A - Shelf 03',
      isAvailable: true
    },
    {
      id: 'MED-103',
      name: 'Augmentin 625 Duo',
      generic: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
      category: 'Antibiotics & Anti-infectives',
      dosageForm: 'Tablet',
      manufacturer: 'GlaxoSmithKline',
      unitPrice: 22.0,
      mrp: 26.5,
      stockQty: 65,
      minStockLevel: 30,
      batch: 'AUG-4410',
      mfgDate: '02/2025',
      expiry: '09/2026',
      shelfRack: 'Rack B - Shelf 01',
      isAvailable: true
    },
    {
      id: 'MED-104',
      name: 'Azee 500mg Tablet',
      generic: 'Azithromycin Tablet IP 500mg',
      category: 'Antibiotics & Anti-infectives',
      dosageForm: 'Tablet',
      manufacturer: 'Cipla Ltd',
      unitPrice: 24.0,
      mrp: 28.0,
      stockQty: 0,
      minStockLevel: 25,
      batch: 'AZE-901',
      mfgDate: '10/2024',
      expiry: 'Out of Stock',
      shelfRack: 'Rack B - Shelf 02',
      isAvailable: false,
      genericAlternative: 'Augmentin 625 Duo'
    },
    {
      id: 'MED-105',
      name: 'Pan 40mg Tablet',
      generic: 'Pantoprazole Gastro-resistant 40mg',
      category: 'Gastrointestinal & Antacids',
      dosageForm: 'Tablet',
      manufacturer: 'Alkem Laboratories',
      unitPrice: 11.5,
      mrp: 14.0,
      stockQty: 180,
      minStockLevel: 50,
      batch: 'PAN-789',
      mfgDate: '01/2025',
      expiry: '04/2027',
      shelfRack: 'Rack C - Shelf 01',
      isAvailable: true
    },
    {
      id: 'MED-106',
      name: 'Digene Gel 200ml (Mint)',
      generic: 'Magnesium Hydroxide + Aluminium Hydroxide',
      category: 'Gastrointestinal & Antacids',
      dosageForm: 'Liquid Suspension',
      manufacturer: 'Abbott Healthcare',
      unitPrice: 135.0,
      mrp: 155.0,
      stockQty: 24,
      minStockLevel: 10,
      batch: 'DIG-204',
      mfgDate: '04/2025',
      expiry: '03/2027',
      shelfRack: 'Rack C - Shelf 04',
      isAvailable: true
    },
    {
      id: 'MED-107',
      name: 'Cetriz 10mg Tablet',
      generic: 'Cetirizine Hydrochloride IP 10mg',
      category: 'Antihistamines & Allergy',
      dosageForm: 'Tablet',
      manufacturer: 'Alkem Pharma',
      unitPrice: 4.0,
      mrp: 5.2,
      stockQty: 95,
      minStockLevel: 30,
      batch: 'CET-8801',
      mfgDate: '05/2025',
      expiry: '08/2027',
      shelfRack: 'Rack D - Shelf 01',
      isAvailable: true
    },
    {
      id: 'MED-108',
      name: 'Allegra 120mg Tablet',
      generic: 'Fexofenadine Hydrochloride 120mg',
      category: 'Antihistamines & Allergy',
      dosageForm: 'Tablet',
      manufacturer: 'Sanofi Healthcare',
      unitPrice: 18.5,
      mrp: 22.0,
      stockQty: 42,
      minStockLevel: 20,
      batch: 'ALG-303',
      mfgDate: '02/2025',
      expiry: '01/2028',
      shelfRack: 'Rack D - Shelf 02',
      isAvailable: true
    },
    {
      id: 'MED-109',
      name: 'Glycomet 500mg SR',
      generic: 'Metformin Hydrochloride SR 500mg',
      category: 'Diabetic Care & Insulin',
      dosageForm: 'Tablet',
      manufacturer: 'USV Private Ltd',
      unitPrice: 5.0,
      mrp: 6.5,
      stockQty: 220,
      minStockLevel: 60,
      batch: 'GLY-7019',
      mfgDate: '03/2025',
      expiry: '11/2027',
      shelfRack: 'Rack E - Shelf 01',
      isAvailable: true
    },
    {
      id: 'MED-110',
      name: 'Telma 40mg Tablet',
      generic: 'Telmisartan IP 40mg',
      category: 'Cardiovascular & BP',
      dosageForm: 'Tablet',
      manufacturer: 'Glenmark Pharmaceuticals',
      unitPrice: 9.5,
      mrp: 12.0,
      stockQty: 140,
      minStockLevel: 40,
      batch: 'TEL-3320',
      mfgDate: '01/2025',
      expiry: '05/2027',
      shelfRack: 'Rack E - Shelf 03',
      isAvailable: true
    },
    {
      id: 'MED-111',
      name: 'Ascoril-D Plus Cough Syrup',
      generic: 'Dextromethorphan + Chlorpheniramine',
      category: 'Respiratory & Cough',
      dosageForm: 'Liquid 100ml',
      manufacturer: 'Glenmark Pharma',
      unitPrice: 115.0,
      mrp: 130.0,
      stockQty: 18,
      minStockLevel: 15,
      batch: 'ASC-5120',
      mfgDate: '02/2025',
      expiry: '03/2027',
      shelfRack: 'Rack F - Shelf 01',
      isAvailable: true
    },
    {
      id: 'MED-112',
      name: 'Electral ORS Powder 21.8g',
      generic: 'Oral Rehydration Salts IP (WHO Formula)',
      category: 'IV Fluids & Electrolytes',
      dosageForm: 'Sachet Powder',
      manufacturer: 'FDC Limited',
      unitPrice: 21.5,
      mrp: 24.0,
      stockQty: 85,
      minStockLevel: 30,
      batch: 'ORS-9912',
      mfgDate: '01/2025',
      expiry: '01/2028',
      shelfRack: 'Rack G - Shelf 01',
      isAvailable: true
    }
  ]));

  // Lab Orders
  const [labOrders, setLabOrders] = useState(() => getInitial('labOrders', [
    {
      orderId: 'LAB-ORD-8801',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      tokenNo: 'TK-01',
      doctor: 'Dr. Arvind Ramesh, MD',
      orderDate: '2026-03-19 09:15 AM',
      paymentStatus: 'paid',
      amount: 500,
      tests: [
        {
          id: 'TEST-CBC',
          name: 'Complete Blood Count (CBC)',
          sampleType: 'Blood (EDTA Lavender Tube)',
          status: 'completed',
          parameters: [
            { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normal: '13.0 - 17.0', flag: 'normal' },
            { name: 'Total WBC Count', value: '8,600', unit: 'cells/cu.mm', normal: '4,000 - 11,000', flag: 'normal' },
            { name: 'Platelet Count', value: '280,000', unit: '/mcL', normal: '150,000 - 450,000', flag: 'normal' },
            { name: 'ESR (1st Hour)', value: '18', unit: 'mm/hr', normal: '0 - 15', flag: 'high' }
          ]
        },
        {
          id: 'TEST-RBS',
          name: 'Random Blood Sugar (RBS)',
          sampleType: 'Blood (Fluoride Grey Tube)',
          status: 'completed',
          parameters: [
            { name: 'Blood Glucose (Random)', value: '142', unit: 'mg/dL', normal: '70 - 140', flag: 'high' }
          ]
        }
      ],
      overallStatus: 'completed',
      isReportReady: true,
      isReceived: false,
      verifiedBy: 'Dr. K. Shalini, MD (Pathology)',
      verifiedAt: '09:45 AM',
      whatsappSent: true,
      addedToDoctorQueue: false
    },
    {
      orderId: 'LAB-ORD-8802',
      patientId: 'DH-2026-003',
      patientName: 'Murugesan V',
      tokenNo: 'TK-03',
      doctor: 'Dr. Arvind Ramesh, MD',
      orderDate: '2026-03-19 09:12 AM',
      paymentStatus: 'paid',
      amount: 850,
      tests: [
        {
          id: 'TEST-LIPID',
          name: 'Lipid Profile (Cholesterol)',
          sampleType: 'Blood (SST Yellow Tube)',
          status: 'sample_collected',
          parameters: [
            { name: 'Total Cholesterol', value: '', unit: 'mg/dL', normal: '< 200', flag: 'pending' },
            { name: 'Triglycerides', value: '', unit: 'mg/dL', normal: '< 150', flag: 'pending' },
            { name: 'HDL Good Cholesterol', value: '', unit: 'mg/dL', normal: '> 40', flag: 'pending' }
          ]
        },
        {
          id: 'TEST-RBS',
          name: 'Random Blood Sugar (RBS)',
          sampleType: 'Blood (Fluoride Grey Tube)',
          status: 'sample_collected',
          parameters: [
            { name: 'Blood Glucose (Random)', value: '', unit: 'mg/dL', normal: '70 - 140', flag: 'pending' }
          ]
        }
      ],
      overallStatus: 'ordered',
      isReportReady: false,
      isReceived: false,
      verifiedBy: '',
      verifiedAt: '',
      whatsappSent: false,
      addedToDoctorQueue: false
    }
  ]));

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState(() => getInitial('prescriptions', [
    {
      prescriptionId: 'RX-901',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      tokenNo: 'TK-01',
      doctor: 'Dr. Arvind Ramesh',
      date: '2026-03-19',
      items: [
        { medicineId: 'MED-101', name: 'Dolo 650mg', dosage: '1-0-1', duration: '3 Days', timing: 'After Food', qty: 6, unitPrice: 3.5 },
        { medicineId: 'MED-103', name: 'Pan 40mg', dosage: '1-0-0', duration: '5 Days', timing: 'Before Food', qty: 5, unitPrice: 11.5 }
      ],
      dispensedStatus: 'pending',
      billedStatus: 'paid',
      totalAmount: 78.5
    }
  ]));

  // Consolidated Financial Ledger / All Revenue List (Combined: Doctor Fees, Lab Payments, Medical Payments)
  const [bills, setBills] = useState(() => getInitial('bills', [
    {
      billId: 'INV-2026-001',
      category: 'doctor_fee', // 'doctor_fee' | 'lab_payment' | 'medical_payment'
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      type: 'Doctor Consultation Fee',
      description: 'General Medicine OPD Consultation - Dr. Arvind Ramesh',
      amount: 300,
      mode: 'UPI (GPay / PhonePe)',
      status: 'Paid',
      time: '08:35 AM',
      date: '2026-03-19'
    },
    {
      billId: 'INV-2026-002',
      category: 'doctor_fee',
      patientId: 'DH-2026-002',
      patientName: 'Ananya Raghavan',
      type: 'Doctor Consultation Fee',
      description: 'General Medicine OPD Consultation - Dr. Arvind Ramesh',
      amount: 300,
      mode: 'Cash Counter',
      status: 'Paid',
      time: '08:48 AM',
      date: '2026-03-19'
    },
    {
      billId: 'INV-2026-003',
      category: 'lab_payment',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      type: 'Lab Investigation Payment',
      description: 'Complete Blood Count (CBC) + Random Blood Sugar (RBS)',
      amount: 500,
      mode: 'UPI (GPay / PhonePe)',
      status: 'Paid',
      time: '09:12 AM',
      date: '2026-03-19'
    },
    {
      billId: 'INV-2026-004',
      category: 'medical_payment',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      type: 'Pharmacy Medical Payment',
      description: 'Dolo 650mg (6 tabs) + Pan 40mg (5 tabs)',
      amount: 78.5,
      mode: 'Cash Counter',
      status: 'Paid',
      time: '10:05 AM',
      date: '2026-03-19'
    }
  ]));

  // Employees Roster (Visible in Admin Portal)
  const [employees, setEmployees] = useState(() => getInitial('employees', [
    {
      id: 'EMP-01',
      name: 'Dr. Arvind Ramesh',
      designation: 'Senior Consultant Physician',
      department: 'General Medicine',
      phone: '+91 94431 22880',
      email: 'arvind.ramesh@digihos.in',
      shift: 'Morning (08:00 AM - 02:00 PM)',
      salary: 120000,
      status: 'Active'
    },
    {
      id: 'EMP-02',
      name: 'Dr. K. Shalini',
      designation: 'Chief Clinical Pathologist',
      department: 'Pathology & Lab',
      phone: '+91 98422 77110',
      email: 'shalini.k@digihos.in',
      shift: 'General (09:00 AM - 05:00 PM)',
      salary: 110000,
      status: 'Active'
    },
    {
      id: 'EMP-03',
      name: 'Divya Bharathi M',
      designation: 'Senior Receptionist',
      department: 'Front Desk & Triage',
      phone: '+91 97890 33410',
      email: 'divya.b@digihos.in',
      shift: 'Morning (08:00 AM - 04:00 PM)',
      salary: 28000,
      status: 'Active'
    },
    {
      id: 'EMP-04',
      name: 'Rajesh Kannan P',
      designation: 'Senior Lab Technician',
      department: 'Diagnostic Laboratory',
      phone: '+91 96555 44210',
      email: 'rajesh.k@digihos.in',
      shift: 'Morning (08:00 AM - 04:00 PM)',
      salary: 32000,
      status: 'Active'
    },
    {
      id: 'EMP-05',
      name: 'Vigneshwaran S',
      designation: 'Chief Pharmacist',
      department: 'Pharmacy Dispensary',
      phone: '+91 99420 55190',
      email: 'vignesh.s@digihos.in',
      shift: 'General (09:00 AM - 06:00 PM)',
      salary: 35000,
      status: 'Active'
    },
    {
      id: 'EMP-06',
      name: 'Priya Sundaram',
      designation: 'Staff Nurse & Vitals Assessor',
      department: 'Nursing & Triage',
      phone: '+91 94888 66200',
      email: 'priya.s@digihos.in',
      shift: 'Morning (07:30 AM - 03:30 PM)',
      salary: 26000,
      status: 'Active'
    }
  ]));

  // Attendance Records (Visible in Admin Portal)
  const [attendance, setAttendance] = useState(() => getInitial('attendance', [
    {
      id: 'ATT-20260319-01',
      employeeId: 'EMP-01',
      name: 'Dr. Arvind Ramesh',
      department: 'General Medicine',
      date: '2026-03-19',
      checkIn: '07:55 AM',
      checkOut: '-',
      status: 'Present' // 'Present' | 'Late' | 'Absent' | 'On Leave'
    },
    {
      id: 'ATT-20260319-02',
      employeeId: 'EMP-02',
      name: 'Dr. K. Shalini',
      department: 'Pathology & Lab',
      date: '2026-03-19',
      checkIn: '08:50 AM',
      checkOut: '-',
      status: 'Present'
    },
    {
      id: 'ATT-20260319-03',
      employeeId: 'EMP-03',
      name: 'Divya Bharathi M',
      department: 'Front Desk & Triage',
      date: '2026-03-19',
      checkIn: '07:50 AM',
      checkOut: '-',
      status: 'Present'
    },
    {
      id: 'ATT-20260319-04',
      employeeId: 'EMP-04',
      name: 'Rajesh Kannan P',
      department: 'Diagnostic Laboratory',
      date: '2026-03-19',
      checkIn: '08:05 AM',
      checkOut: '-',
      status: 'Present'
    },
    {
      id: 'ATT-20260319-05',
      employeeId: 'EMP-05',
      name: 'Vigneshwaran S',
      department: 'Pharmacy Dispensary',
      date: '2026-03-19',
      checkIn: '08:58 AM',
      checkOut: '-',
      status: 'Present'
    },
    {
      id: 'ATT-20260319-06',
      employeeId: 'EMP-06',
      name: 'Priya Sundaram',
      department: 'Nursing & Triage',
      date: '2026-03-19',
      checkIn: '07:32 AM',
      checkOut: '-',
      status: 'Present'
    }
  ]));

  // Historical Visits Log for Comprehensive Longitudinal Patient Dossier
  const [historicalVisits] = useState(() => getInitial('historicalVisits', [
    {
      visitId: 'VISIT-2026-HIST-001',
      tokenNo: 'TK-HIST-101',
      patientId: 'DH-2026-001',
      date: '2026-02-14',
      time: '10:30 AM',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      type: 'Initial OPD Health Assessment',
      status: 'completed',
      complaints: 'Patient presented with chronic daytime fatigue, occasional evening tension headaches, and elevated blood pressure.',
      diagnosis: 'Stage-1 Essential Hypertension with generalized fatigue. Advised dietary sodium restriction and prescribed initial cardioprotective regimen.',
      vitals: {
        bp: '142/94',
        weight: '78',
        pulse: '82',
        temp: '98.4',
        spo2: '98',
        rbs: '130',
        painScore: '1'
      },
      prescriptions: [
        {
          rxId: 'RX-PREV-812',
          date: '2026-02-14',
          doctor: 'Dr. Arvind Ramesh, MD',
          dispensedStatus: 'dispensed',
          billedStatus: 'paid',
          totalAmount: 120.0,
          items: [
            { medicineId: 'MED-108', name: 'Telma 40mg Tablet', generic: 'Telmisartan 40mg', dosage: '1-0-0', duration: '30 Days', timing: 'Morning Before Food', qty: 30, unitPrice: 4.0 }
          ]
        }
      ],
      labOrders: [
        {
          orderId: 'LAB-ORD-7402',
          date: '2026-02-14 11:00 AM',
          overallStatus: 'completed',
          verifiedBy: 'Dr. K. Shalini, MD (Pathology)',
          verifiedAt: '11:45 AM',
          tests: [
            {
              id: 'TEST-LIPID',
              name: 'Lipid Profile (Cholesterol)',
              sampleType: 'Blood (SST Yellow Tube)',
              price: 650,
              parameters: [
                { name: 'Total Cholesterol', value: '185', unit: 'mg/dL', normal: '< 200', flag: 'normal' },
                { name: 'Triglycerides', value: '140', unit: 'mg/dL', normal: '< 150', flag: 'normal' },
                { name: 'HDL Good Cholesterol', value: '44', unit: 'mg/dL', normal: '> 40', flag: 'normal' }
              ]
            }
          ]
        }
      ],
      bills: [
        {
          billId: 'INV-2026-PREV-01',
          type: 'Doctor Consultation Fee',
          category: 'doctor_fee',
          amount: 300,
          mode: 'Cash Counter',
          status: 'Paid',
          date: '2026-02-14',
          time: '10:35 AM'
        },
        {
          billId: 'INV-2026-PREV-02',
          type: 'Lipid Profile Lab Payment',
          category: 'lab_payment',
          amount: 650,
          mode: 'UPI (GPay / PhonePe)',
          status: 'Paid',
          date: '2026-02-14',
          time: '11:00 AM'
        },
        {
          billId: 'INV-2026-PREV-03',
          type: 'Pharmacy Dispensing Bill',
          category: 'medical_payment',
          amount: 120,
          mode: 'Cash Counter',
          status: 'Paid',
          date: '2026-02-14',
          time: '11:30 AM'
        }
      ]
    },
    {
      visitId: 'VISIT-2026-HIST-002',
      tokenNo: 'TK-HIST-102',
      patientId: 'DH-2026-002',
      date: '2026-01-20',
      time: '11:15 AM',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      type: 'Annual Preventative Health Check',
      status: 'completed',
      complaints: 'Routine annual corporate pre-employment physical checkup.',
      diagnosis: 'Clinically healthy. All vital parameters within normal ranges. Advised daily hydration and regular exercise.',
      vitals: {
        bp: '116/72',
        weight: '53',
        pulse: '70',
        temp: '98.2',
        spo2: '99',
        rbs: '95',
        painScore: '0'
      },
      prescriptions: [
        {
          rxId: 'RX-PREV-750',
          date: '2026-01-20',
          doctor: 'Dr. Arvind Ramesh, MD',
          dispensedStatus: 'dispensed',
          billedStatus: 'paid',
          totalAmount: 150.0,
          items: [
            { medicineId: 'MED-110', name: 'Becosules Z Capsules', generic: 'B-Complex + Zinc + Vitamin C', dosage: '0-1-0', duration: '30 Days', timing: 'After Lunch', qty: 30, unitPrice: 5.0 }
          ]
        }
      ],
      labOrders: [
        {
          orderId: 'LAB-ORD-6910',
          date: '2026-01-20 11:30 AM',
          overallStatus: 'completed',
          verifiedBy: 'Dr. K. Shalini, MD (Pathology)',
          verifiedAt: '12:15 PM',
          tests: [
            {
              id: 'TEST-CBC',
              name: 'Complete Blood Count (CBC)',
              sampleType: 'Blood (EDTA Lavender Tube)',
              price: 350,
              parameters: [
                { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', normal: '12.0 - 15.5', flag: 'normal' },
                { name: 'Total WBC Count', value: '7,200', unit: 'cells/cu.mm', normal: '4,000 - 11,000', flag: 'normal' }
              ]
            }
          ]
        }
      ],
      bills: [
        {
          billId: 'INV-2026-PREV-10',
          type: 'Doctor Consultation Fee',
          category: 'doctor_fee',
          amount: 300,
          mode: 'Card (Debit/Credit)',
          status: 'Paid',
          date: '2026-01-20',
          time: '11:20 AM'
        },
        {
          billId: 'INV-2026-PREV-11',
          type: 'Preventative CBC Lab Test',
          category: 'lab_payment',
          amount: 350,
          mode: 'Card (Debit/Credit)',
          status: 'Paid',
          date: '2026-01-20',
          time: '11:45 AM'
        }
      ]
    }
  ]));

  // Baileys WhatsApp Engine Status & Message Log (No Emojis in Text)
  const [baileysState, setBaileysState] = useState({
    isConnected: true,
    sessionId: 'BAILEYS-PROD-CBE-01',
    phoneNumber: '+91 94433 22110',
    battery: '88% (Plugged in)',
    mode: 'Multi-Device Baileys Gateway v6.7.8 (Modular Adapter)',
    activeTemplates: {
      registration: "*Coimbatore General Hospital*\n\nHello {{name}}, welcome to DIGIHOS.\nYour Permanent ID: *{{patientId}}*\nToday's Token: *{{token}}*\n\nPlease watch the lounge display for your turn.",
      labSample: "*DIGIHOS Diagnostics*\n\nDear {{name}}, your sample for *{{testName}}* has been received and barcoded (#{{sampleId}}). We will update you once results are processed.",
      labReady: "*DIGIHOS Diagnostic Results Ready*\n\nDear {{name}} (ID: {{patientId}}),\nYour laboratory test results for *{{testList}}* have been verified by Pathologist.\n\n*Summary Results:*\n{{resultsSummary}}\n\nPlease present at Reception for your Priority Review Token with Dr. {{doctor}}.",
      prescription: "*DIGIHOS Pharmacy*\n\nDear {{name}}, your prescription (Rx #{{rxId}}) has been received at the pharmacy counter. Total amount: INR {{amount}}."
    }
  });

  const [whatsappLogs, setWhatsappLogs] = useState(() => getInitial('whatsappLogs', [
    {
      id: 'WA-MSG-001',
      phone: '+91 9842188720',
      patientName: 'Senthil Kumar M',
      eventType: 'Patient Registration & Token',
      content: "*Coimbatore General Hospital*\nHello Senthil Kumar M, welcome to DIGIHOS.\nYour Permanent ID: *DH-2026-001*\nToday's Token: *TK-01*\nPlease watch the lounge display for your turn.",
      timestamp: '08:36 AM',
      status: 'Delivered'
    },
    {
      id: 'WA-MSG-002',
      phone: '+91 9842188720',
      patientName: 'Senthil Kumar M',
      eventType: 'Lab Result Summary',
      content: "*DIGIHOS Diagnostic Results Ready*\nDear Senthil Kumar M (ID: DH-2026-001),\nYour laboratory test results for *CBC + RBS* have been verified.\n\nHemoglobin: 14.2 g/dL (Normal)\nBlood Glucose Random: 142 mg/dL (Mild High)\n\nPlease visit Reception for your Priority Review Token.",
      timestamp: '09:46 AM',
      status: 'Delivered'
    }
  ]));

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('digihos_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('digihos_tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('digihos_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('digihos_pharmacyStock', JSON.stringify(pharmacyStock));
  }, [pharmacyStock]);

  useEffect(() => {
    localStorage.setItem('digihos_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('digihos_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Socket.io Real-Time Synchronization Bus (Sub-millisecond push across portals)
  useEffect(() => {
    let socket;
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 20,
        reconnectionDelay: 1000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsBackendConnected(true);
        console.log('[Socket.io] Connected to Hospital Backend at', BACKEND_URL);
      });

      socket.on('disconnect', () => {
        setIsBackendConnected(false);
      });

      // 1. Initial State Sync (Merges local and server state to prevent data loss)
      socket.on('state:sync', (fullState) => {
        if (fullState) {
          if (Array.isArray(fullState.patients)) {
            const cleanServerPatients = fullState.patients.filter(p => p && typeof p === 'object' && p.id);
            setPatients(prev => {
              const serverIds = new Set(cleanServerPatients.map(p => p.id));
              const localOnly = (prev || []).filter(p => p && typeof p === 'object' && p.id && !serverIds.has(p.id));
              return [...cleanServerPatients, ...localOnly];
            });
          }
          if (Array.isArray(fullState.tokens)) {
            const cleanServerTokens = fullState.tokens.filter(t => t && typeof t === 'object' && t.tokenNo);
            setTokens(prev => {
              const serverNos = new Set(cleanServerTokens.map(t => t.tokenNo));
              const localOnly = (prev || []).filter(t => t && typeof t === 'object' && t.tokenNo && !serverNos.has(t.tokenNo));
              return [...cleanServerTokens, ...localOnly];
            });
          }
          if (Array.isArray(fullState.pharmacyStock)) setPharmacyStock(fullState.pharmacyStock);
          if (Array.isArray(fullState.labOrders)) setLabOrders(fullState.labOrders);
          if (Array.isArray(fullState.prescriptions)) setPrescriptions(fullState.prescriptions);
          if (Array.isArray(fullState.bills)) {
            setBills(prev => {
              const serverBillIds = new Set((fullState.bills || []).filter(b => b && b.billId).map(b => b.billId));
              const localOnly = (prev || []).filter(b => b && b.billId && !serverBillIds.has(b.billId));
              return [...fullState.bills.filter(b => b && b.billId), ...localOnly];
            });
          }
          if (Array.isArray(fullState.employees)) setEmployees(fullState.employees);
          if (Array.isArray(fullState.attendance)) setAttendance(fullState.attendance);
        }
      });

      // 2. Real-time patient events
      socket.on('patient:created', (newPatient) => {
        if (!newPatient || !newPatient.id) return;
        setPatients(prev => [newPatient, ...(prev || []).filter(p => p && p.id && p.id !== newPatient.id)]);
      });

      socket.on('patient:updated', ({ id, vitals } = {}) => {
        if (!id) return;
        setPatients(prev => (prev || []).filter(p => p && p.id).map(p => p.id === id ? { ...p, vitals: { ...p.vitals, ...vitals } } : p));
      });

      // 3. Real-time token events
      socket.on('token:created', (newToken) => {
        if (!newToken || !newToken.tokenNo) return;
        setTokens(prev => [...(prev || []).filter(t => t && t.tokenNo && t.tokenNo !== newToken.tokenNo), newToken]);
      });

      socket.on('token:updated', (updatedToken) => {
        if (!updatedToken || !updatedToken.tokenNo) return;
        setTokens(prev => (prev || []).filter(t => t && t.tokenNo).map(t => t.tokenNo === updatedToken.tokenNo ? { ...t, ...updatedToken } : t));
      });

      socket.on('token:called', (payload) => {
        window.dispatchEvent(new CustomEvent('hospital:token-called', { detail: payload }));
      });

      // 4. Real-time lab events
      socket.on('lab:created', (newOrder) => {
        setLabOrders(prev => [newOrder, ...prev.filter(o => o.orderId !== newOrder.orderId)]);
      });

      socket.on('lab:updated', (updatedOrder) => {
        setLabOrders(prev => prev.map(o => o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o));
      });

      // 5. Real-time prescription & stock events
      socket.on('prescription:created', (newRx) => {
        setPrescriptions(prev => [newRx, ...prev.filter(p => p.prescriptionId !== newRx.prescriptionId)]);
      });

      socket.on('prescription:updated', (updatedRx) => {
        setPrescriptions(prev => prev.map(p => p.prescriptionId === updatedRx.prescriptionId ? { ...p, ...updatedRx } : p));
      });

      socket.on('stock:updated', (updatedStock) => {
        setPharmacyStock(prev => prev.map(m => m.id === updatedStock.id ? { ...m, ...updatedStock } : m));
      });

      // 6. Real-time billing
      socket.on('bill:created', (newBill) => {
        setBills(prev => [newBill, ...prev.filter(b => b.billId !== newBill.billId)]);
      });

      // 7. Real-time WhatsApp
      socket.on('whatsapp:sent', (log) => {
        setWhatsappLogs(prev => [log, ...prev.filter(l => l.id !== log.id)]);
      });

      // 8. Baileys Engine Status & QR
      socket.on('baileys:status', (serverBaileysState) => {
        if (serverBaileysState) {
          setBaileysState(prev => ({ ...prev, ...serverBaileysState }));
        }
      });

      socket.on('baileys:qr', ({ qrCodeDataUrl, status }) => {
        setBaileysState(prev => ({ ...prev, qrCodeDataUrl, status }));
      });

      socket.on('baileys:templates', (templates) => {
        setBaileysState(prev => ({ ...prev, activeTemplates: templates }));
      });

    } catch (err) {
      console.warn('Socket.io connection error:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const callTokenLive = (tokenPayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('token:call', tokenPayload);
    }
    fetch(`${BACKEND_URL}/api/tokens/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenPayload)
    }).catch(() => {});
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dispatch WhatsApp Message via Baileys Multi-Device Gateway
  const sendBaileysMessage = (phone, patientName, eventType, content) => {
    const formattedPhone = phone ? (phone.startsWith('+91') ? phone : `+91 ${phone}`) : '+91 9842188720';
    const newLog = {
      id: `WA-MSG-${Date.now().toString().slice(-4)}`,
      phone: formattedPhone,
      patientName: patientName || 'Patient',
      eventType: eventType || 'Hospital Notification',
      content: content || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered'
    };

    // Optimistic UI update for 0ms lag
    setWhatsappLogs(prev => [newLog, ...prev]);
    showToast(`WhatsApp dispatched to ${patientName} via Baileys`);

    // Asynchronously dispatch to Node.js Baileys Backend Engine
    fetch(`${BACKEND_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formattedPhone,
        patientName,
        eventType,
        content
      })
    }).catch(() => {});
  };

  const requestBaileysQR = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('baileys:request-qr');
    }
    fetch(`${BACKEND_URL}/api/whatsapp/qr`)
      .then(r => r.json())
      .then(data => {
        if (data?.qrCodeDataUrl) {
          setBaileysState(prev => ({ ...prev, qrCodeDataUrl: data.qrCodeDataUrl }));
        }
      })
      .catch(() => {});
  };

  const toggleBaileysPair = (isConnected, phoneNumber) => {
    fetch(`${BACKEND_URL}/api/whatsapp/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isConnected, phoneNumber })
    }).catch(() => {});
    setBaileysState(prev => ({
      ...prev,
      isConnected,
      status: isConnected ? 'connected' : 'disconnected',
      phoneNumber: phoneNumber || prev.phoneNumber
    }));
  };

  const saveBaileysTemplates = (templates) => {
    fetch(`${BACKEND_URL}/api/whatsapp/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates })
    }).catch(() => {});
    setBaileysState(prev => ({ ...prev, activeTemplates: templates }));
  };

  // Register New Patient
  const registerPatient = (formData) => {
    const nextNum = patients.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    const newId = `DH-2026-${padded}`;
    const newBarcode = `2026${padded}`;
    const newNfc = `NFC-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    // Auto-calculate age from DOB if not explicitly provided
    let calculatedAge = formData.age ? Number(formData.age) : 0;
    if (!calculatedAge && formData.dob) {
      const birthDate = new Date(formData.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let a = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) a--;
        calculatedAge = a >= 0 ? a : 0;
      }
    }
    if (!calculatedAge) calculatedAge = 25;

    const newPatient = {
      id: newId,
      barcode: newBarcode,
      nfcUid: newNfc,
      fullName: formData.fullName,
      phone: formData.phone,
      age: calculatedAge,
      dob: formData.dob || '1995-01-01',
      gender: formData.gender || 'Male',
      bloodGroup: formData.bloodGroup || 'O+',
      address: formData.address || '',
      emergencyName: formData.emergencyName || '',
      emergencyRelation: formData.emergencyRelation || 'Family',
      emergencyPhone: formData.emergencyPhone || '',
      altPhone: formData.altPhone || '',
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      vitals: {
        bp: formData.bp || '120/80',
        weight: formData.weight || '65',
        pulse: formData.pulse || '72',
        temp: formData.temp || '98.6',
        spo2: formData.spo2 || '99',
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    setPatients(prev => [newPatient, ...prev]);

    // Create Token (Sequentially increment from highest token number)
    const maxTokenNum = (tokens || []).reduce((max, t) => {
      if (!t || !t.tokenNo) return max;
      const match = String(t.tokenNo).match(/\d+/);
      const n = match ? parseInt(match[0], 10) : 0;
      return n > max ? n : max;
    }, 0);
    const tokenNo = `TK-${String(maxTokenNum + 1).padStart(2, '0')}`;

    const newToken = {
      tokenNo,
      patientId: newId,
      patientName: formData.fullName,
      age: newPatient.age,
      gender: newPatient.gender,
      phone: formData.phone,
      type: 'General OPD',
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      room: 'Consultation Room 102',
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: formData.complaint || 'Initial consultation'
    };

    setTokens(prev => [...prev, newToken]);

    // Record Doctor Consultation Fee in Revenue List
    const doctorBill = {
      billId: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      category: 'doctor_fee',
      patientId: newId,
      patientName: formData.fullName,
      type: 'Doctor Consultation Fee',
      description: 'General OPD Consultation - Dr. Arvind Ramesh',
      amount: 300,
      mode: 'Cash Counter',
      status: 'Paid',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };
    setBills(prev => [doctorBill, ...prev]);

    // WhatsApp
    const welcomeMsg = baileysState.activeTemplates.registration
      .replace('{{name}}', newPatient.fullName)
      .replace('{{patientId}}', newPatient.id)
      .replace('{{token}}', tokenNo);

    sendBaileysMessage(newPatient.phone, newPatient.fullName, 'Patient Registration', welcomeMsg);

    showToast(`Patient ${newPatient.fullName} registered. Token: ${tokenNo}`);

    // Sync full composite patient + token + bill to backend server & emit token:created
    fetch(`${BACKEND_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient: newPatient, token: newToken, bill: doctorBill })
    }).catch(() => {});

    return { newPatient, newToken };
  };

  // Create OP / IP Visit for existing patient
  const createOpVisit = (patientId, visitData = 'Regular Consultation') => {
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;

    const isObject = typeof visitData === 'object' && visitData !== null;
    const complaint = isObject ? (visitData.complaint || 'Regular Consultation') : visitData;
    const visitType = isObject ? (visitData.visitType || 'OP') : 'OP';
    const doctor = isObject ? (visitData.doctor || 'Dr. Arvind Ramesh, MD (Gen Med)') : 'Dr. Arvind Ramesh, MD (Gen Med)';
    const room = isObject ? (visitData.room || 'Consultation Room 102') : 'Consultation Room 102';
    const fee = isObject ? (Number(visitData.fee) >= 0 ? Number(visitData.fee) : (visitType === 'IP' ? 1500 : 300)) : 300;
    const paymentMode = isObject ? (visitData.paymentMode || 'Cash Counter') : 'Cash Counter';
    const vitals = isObject ? visitData.vitals : null;

    // Update patient vitals if provided
    if (vitals) {
      setPatients(prev => prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            vitals: {
              ...p.vitals,
              ...vitals,
              recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
        }
        return p;
      }));
    }

    const maxTokenNum = (tokens || []).reduce((max, t) => {
      if (!t || !t.tokenNo) return max;
      const match = String(t.tokenNo).match(/\d+/);
      const n = match ? parseInt(match[0], 10) : 0;
      return n > max ? n : max;
    }, 0);
    const nextTokenNum = String(maxTokenNum + 1).padStart(2, '0');
    const tokenNo = visitType === 'IP' ? `IP-${nextTokenNum}` : `TK-${nextTokenNum}`;

    const newToken = {
      tokenNo,
      patientId: pat.id,
      patientName: pat.fullName,
      age: pat.age,
      gender: pat.gender,
      phone: pat.phone,
      type: visitType === 'IP' ? `IP Admission (${room})` : (visitData.consultationCategory || 'OP Visit'),
      doctor,
      room,
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: complaint
    };

    setTokens(prev => [...prev, newToken]);

    // Record Billing in Revenue Ledger (Scoped properly at outer function scope)
    let billItem = null;
    if (fee > 0) {
      billItem = {
        billId: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
        category: 'doctor_fee',
        patientId: pat.id,
        patientName: pat.fullName,
        type: visitType === 'IP' ? 'IP Ward Admission Deposit' : 'Doctor Consultation Fee',
        description: `${visitType === 'IP' ? 'IP Admission' : 'OP Visit'} - ${doctor} (${room})`,
        amount: fee,
        mode: paymentMode,
        status: 'Paid',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
      };
      setBills(prev => [billItem, ...prev]);
    }

    const msg = visitType === 'IP'
      ? `*Coimbatore General Hospital*\nDear ${pat.fullName}, your Inpatient (IP) Admission #${tokenNo} has been confirmed for ${room} under ${doctor}. Nursing staff will guide you to your room.`
      : `*Coimbatore General Hospital*\nHello ${pat.fullName}, your OPD visit token is *${tokenNo}* for ${doctor} at ${room}. Please wait in the lounge.`;

    sendBaileysMessage(pat.phone, pat.fullName, `${visitType} Visit Scheduled`, msg);

    showToast(`${visitType} Visit ${tokenNo} created for ${pat.fullName}`);

    fetch(`${BACKEND_URL}/api/tokens/op-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: newToken, bill: billItem, vitals, patientId })
    }).catch(() => {});

    return newToken;
  };

  // Add Lab Order from Doctor
  const createLabOrder = (patientId, tokenNo, testNames, notes) => {
    const pat = patients.find(p => p.id === patientId);
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LAB-ORD-${orderNum}`;

    const testCatalog = {
      'CBC': {
        id: 'TEST-CBC',
        name: 'Complete Blood Count (CBC)',
        sampleType: 'Blood (EDTA Lavender Tube)',
        price: 350,
        parameters: [
          { name: 'Hemoglobin', value: '', unit: 'g/dL', normal: '13.0 - 17.0', flag: 'pending' },
          { name: 'Total WBC', value: '', unit: '/cu.mm', normal: '4,000 - 11,000', flag: 'pending' },
          { name: 'Platelets', value: '', unit: '/mcL', normal: '150,000 - 450,000', flag: 'pending' }
        ]
      },
      'RBS': {
        id: 'TEST-RBS',
        name: 'Random Blood Sugar (RBS)',
        sampleType: 'Blood (Fluoride Grey Tube)',
        price: 150,
        parameters: [
          { name: 'Blood Glucose (Random)', value: '', unit: 'mg/dL', normal: '70 - 140', flag: 'pending' }
        ]
      },
      'URINE': {
        id: 'TEST-URINE',
        name: 'Urine Routine & Microscopic',
        sampleType: 'Sterile Urine Container',
        price: 200,
        parameters: [
          { name: 'Color / Appearance', value: '', unit: '', normal: 'Pale Yellow / Clear', flag: 'pending' },
          { name: 'Sugar', value: '', unit: '', normal: 'Nil', flag: 'pending' },
          { name: 'Pus Cells', value: '', unit: '/HPF', normal: '0 - 5', flag: 'pending' }
        ]
      },
      'LIPID': {
        id: 'TEST-LIPID',
        name: 'Lipid Profile (Cholesterol)',
        sampleType: 'Blood (SST Yellow Tube)',
        price: 650,
        parameters: [
          { name: 'Total Cholesterol', value: '', unit: 'mg/dL', normal: '< 200', flag: 'pending' },
          { name: 'Triglycerides', value: '', unit: 'mg/dL', normal: '< 150', flag: 'pending' },
          { name: 'HDL Good Cholesterol', value: '', unit: 'mg/dL', normal: '> 40', flag: 'pending' }
        ]
      }
    };

    const tests = testNames.map(key => testCatalog[key]).filter(Boolean);
    const totalAmount = tests.reduce((sum, t) => sum + t.price, 0);

    const newOrder = {
      orderId,
      patientId: pat.id,
      patientName: pat.fullName,
      tokenNo,
      doctor: 'Dr. Arvind Ramesh, MD',
      orderDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentStatus: 'paid',
      amount: totalAmount,
      tests,
      overallStatus: 'ordered',
      verifiedBy: '',
      verifiedAt: '',
      whatsappSent: false
    };

    setLabOrders(prev => [newOrder, ...prev]);

    // Record Lab Payment in Revenue Ledger
    const labBill = {
      billId: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      category: 'lab_payment',
      patientId: pat.id,
      patientName: pat.fullName,
      type: 'Lab Investigation Payment',
      description: tests.map(t => t.name).join(' + '),
      amount: totalAmount,
      mode: 'UPI (GPay / PhonePe)',
      status: 'Paid',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };
    setBills(prev => [labBill, ...prev]);

    // Update Token Status to 'lab-investigation'
    setTokens(prev => prev.map(t => t.tokenNo === tokenNo ? { ...t, status: 'lab-investigation' } : t));

    showToast(`Lab order ${orderId} sent to Diagnostic Portal`);

    fetch(`${BACKEND_URL}/api/lab/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder, bill: labBill, tokenNo })
    }).catch(() => {});
  };

  // Complete Lab Order
  const completeLabOrder = (orderId, filledTests) => {
    setLabOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const pat = patients.find(p => p.id === order.patientId);

        const testListNames = filledTests.map(t => t.name).join(', ');
        let summaryLines = [];
        filledTests.forEach(t => {
          t.parameters.forEach(p => {
            summaryLines.push(`- ${p.name}: ${p.value} ${p.unit} (${p.flag === 'high' ? 'High' : p.flag === 'low' ? 'Low' : 'Normal'})`);
          });
        });

        const waText = `*DIGIHOS Lab Report Ready*\n\nDear ${order.patientName} (ID: ${order.patientId}),\nYour test results for *${testListNames}* have been verified.\n\n*Key Parameters:*\n${summaryLines.join('\n')}\n\nReport is printed at the lab counter. Please proceed to Reception for your Doctor Review Token.`;

        if (pat) {
          sendBaileysMessage(pat.phone, pat.fullName, 'Diagnostic Results Ready', waText);
        }

        // Keep token in lab-completed state instead of jumping to queue automatically
        setTokens(toks => toks.map(t => t.tokenNo === order.tokenNo ? { ...t, status: 'lab-completed' } : t));

        return {
          ...order,
          tests: filledTests,
          overallStatus: 'completed',
          isReportReady: true,
          isReceived: false,
          verifiedBy: 'Dr. K. Shalini, MD (Pathology)',
          verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          whatsappSent: true,
          addedToDoctorQueue: false
        };
      }
      return order;
    }));

    showToast(`Lab results verified and sent via WhatsApp`);

    fetch(`${BACKEND_URL}/api/lab/orders/${orderId}/ready`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tests: filledTests, verifiedBy: 'Dr. K. Shalini, MD (Pathology)' })
    }).catch(() => {});
  };

  // Mark Lab Report as Ready (shows on Token TV)
  const markLabReportReady = (orderId) => {
    setLabOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        setTokens(toks => toks.map(t => t.tokenNo === order.tokenNo ? { ...t, status: 'lab-completed' } : t));
        return {
          ...order,
          overallStatus: 'completed',
          isReportReady: true,
          isReceived: false,
          verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return order;
    }));
    showToast(`Lab Report ${orderId} marked READY - now visible on Token TV`);

    fetch(`${BACKEND_URL}/api/lab/orders/${orderId}/ready`, {
      method: 'PATCH'
    }).catch(() => {});
  };

  // Mark Lab Report as Received by patient (hides from Token TV)
  const markLabReportReceived = (orderId) => {
    setLabOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        return {
          ...order,
          isReceived: true,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return order;
    }));
    showToast(`Lab Report ${orderId} marked as RECEIVED - hidden from Token TV`);

    fetch(`${BACKEND_URL}/api/lab/orders/${orderId}/received`, {
      method: 'PATCH'
    }).catch(() => {});
  };

  // Add patient with completed lab report to Doctor queue (regular queue, no priority!)
  const addLabPatientToDoctorQueue = (patientId, labOrderId) => {
    const pat = patients.find(p => p.id === patientId);
    const order = labOrders.find(o => o.orderId === labOrderId);
    if (!pat) return;

    // Check if token already exists for this visit or create a new token
    const existingToken = tokens.find(t => t.patientId === patientId && (t.status === 'lab-investigation' || t.status === 'lab-completed'));

    let activeTokenNo = '';
    if (existingToken) {
      activeTokenNo = existingToken.tokenNo;
      setTokens(prev => prev.map(t => t.tokenNo === existingToken.tokenNo ? {
        ...t,
        status: 'waiting', // Regular queue, no priority!
        type: 'Lab Review',
        notes: `Reviewing completed lab tests: ${order?.tests?.map(t => t.name).join(', ') || 'Diagnostic Report'}`
      } : t));
    } else {
      const maxTokenNum = (tokens || []).reduce((max, t) => {
        const match = (t.tokenNo || '').match(/\d+/);
        const n = match ? parseInt(match[0], 10) : 0;
        return n > max ? n : max;
      }, 0);
      const tokenNo = `TK-${String(maxTokenNum + 1).padStart(2, '0')}`;
      activeTokenNo = tokenNo;
      const newToken = {
        tokenNo,
        patientId: pat.id,
        patientName: pat.fullName,
        age: pat.age,
        gender: pat.gender,
        phone: pat.phone,
        type: 'Lab Review',
        doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
        room: 'Consultation Room 102',
        status: 'waiting', // Regular queue, no priority!
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: `Reviewing lab reports: ${order?.tests?.map(t => t.name).join(', ') || 'Diagnostic Tests'}`
      };
      setTokens(prev => [...prev, newToken]);
    }

    // Mark order as addedToDoctorQueue
    setLabOrders(prev => prev.map(o => o.orderId === labOrderId ? { ...o, addedToDoctorQueue: true } : o));

    showToast(`${pat.fullName} added to Doctor Queue (Regular, No Priority)`);

    // Sync to backend so doctor desk and waiting display see the patient immediately
    fetch(`${BACKEND_URL}/api/lab/orders/${labOrderId}/queue-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenNo: activeTokenNo,
        patientId,
        notes: `Reviewing completed lab tests: ${order?.tests?.map(t => t.name).join(', ') || 'Diagnostic Report'}`,
        type: 'Lab Review'
      })
    }).catch(() => {});
  };

  // Create Prescription
  const createPrescription = (patientId, tokenNo, items, clinicalNotes = '', diagnosis = '') => {
    const pat = patients.find(p => p.id === patientId);
    const rxId = `RX-${Math.floor(100 + Math.random() * 900)}`;

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.unitPrice || 0)), 0);

    const newRx = {
      prescriptionId: rxId,
      patientId,
      patientName: pat ? pat.fullName : 'Patient',
      age: pat ? pat.age : 35,
      gender: pat ? pat.gender : 'Unknown',
      phone: pat ? pat.phone : '-',
      tokenNo,
      doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
      date: new Date().toISOString().split('T')[0],
      items,
      vitals: pat?.vitals || {},
      clinicalNotes: clinicalNotes || 'Follow-up clinical assessment and symptom evaluation.',
      diagnosis: diagnosis || 'Clinical evaluation and therapeutic management.',
      dispensedStatus: 'pending',
      billedStatus: 'paid',
      totalAmount
    };

    setPrescriptions(prev => [newRx, ...prev]);

    // Record Pharmacy Payment in Revenue Ledger
    const pharmacyBill = {
      billId: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      category: 'medical_payment',
      patientId,
      patientName: pat ? pat.fullName : 'Patient',
      type: 'Pharmacy Medical Payment',
      description: items.map(i => `${i.name} (${i.qty})`).join(', '),
      amount: totalAmount,
      mode: 'Cash Counter',
      status: 'Paid',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };
    setBills(prev => [pharmacyBill, ...prev]);

    setTokens(prev => prev.map(t => t.tokenNo === tokenNo ? { ...t, status: 'completed' } : t));

    if (pat) {
      const waMsg = `*DIGIHOS e-Prescription Issued*\n\nHello ${pat.fullName},\nDr. Arvind Ramesh has issued Prescription #${rxId} with ${items.length} items.\nYour prescription has been forwarded to the in-house Pharmacy. Please pick it up at Counter 3.`;
      sendBaileysMessage(pat.phone, pat.fullName, 'e-Prescription Issued', waMsg);
    }

    showToast(`Prescription ${rxId} created and sent to Pharmacy`);

    // Sync prescription, billing, and token completion to backend
    fetch(`${BACKEND_URL}/api/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescription: newRx, bill: pharmacyBill, tokenNo })
    }).catch(() => {});

    return newRx;
  };

  // Dispense Medicine from Pharmacy
  const dispensePrescription = (prescriptionId) => {
    const rx = prescriptions.find(p => p.prescriptionId === prescriptionId);
    if (!rx) return;

    setPharmacyStock(prevStock => {
      return prevStock.map(stockItem => {
        const prescribed = rx.items.find(i => i.medicineId === stockItem.id);
        if (prescribed) {
          const newQty = Math.max(0, stockItem.stockQty - prescribed.qty);
          return {
            ...stockItem,
            stockQty: newQty,
            isAvailable: newQty > 0
          };
        }
        return stockItem;
      });
    });

    setPrescriptions(prev => prev.map(p => p.prescriptionId === prescriptionId ? { ...p, dispensedStatus: 'dispensed' } : p));

    showToast(`Prescription ${prescriptionId} dispensed. Live stock updated.`);

    fetch(`${BACKEND_URL}/api/prescriptions/${prescriptionId}/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: rx.items })
    }).catch(() => {});
  };

  // Add Employee (Admin Portal)
  const addEmployee = (newEmpData) => {
    const nextId = `EMP-${String(employees.length + 1).padStart(2, '0')}`;
    const newEmp = {
      id: nextId,
      name: newEmpData.name,
      designation: newEmpData.designation,
      department: newEmpData.department,
      phone: newEmpData.phone,
      email: newEmpData.email,
      shift: newEmpData.shift || 'General (09:00 AM - 05:00 PM)',
      salary: Number(newEmpData.salary) || 30000,
      status: 'Active'
    };

    setEmployees(prev => [...prev, newEmp]);

    // Also create initial attendance record
    const newAtt = {
      id: `ATT-20260319-${nextId}`,
      employeeId: nextId,
      name: newEmp.name,
      department: newEmp.department,
      date: '2026-03-19',
      checkIn: '08:30 AM',
      checkOut: '-',
      status: 'Present'
    };
    setAttendance(prev => [...prev, newAtt]);

    showToast(`Employee ${newEmp.name} added to staff directory`);

    fetch(`${BACKEND_URL}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    }).catch(() => {});

    fetch(`${BACKEND_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAtt)
    }).catch(() => {});
  };

  // Update Attendance Status (Admin Portal)
  const markAttendance = (empId, newStatus) => {
    setAttendance(prev => prev.map(att => {
      if (att.employeeId === empId) {
        return {
          ...att,
          status: newStatus,
          checkIn: newStatus === 'Absent' ? '-' : (att.checkIn === '-' ? '08:30 AM' : att.checkIn)
        };
      }
      return att;
    }));
    showToast(`Attendance updated for employee ${empId}`);

    fetch(`${BACKEND_URL}/api/attendance/${empId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  // Add / Edit Pharmacy Item (Admin Portal)
  const addPharmacyItem = (itemData) => {
    const nextId = `MED-${Math.floor(100 + Math.random() * 900)}`;
    const newItem = {
      id: nextId,
      name: itemData.name,
      generic: itemData.generic,
      category: itemData.category,
      unitPrice: Number(itemData.unitPrice) || 10,
      stockQty: Number(itemData.stockQty) || 100,
      batch: itemData.batch || 'BT-100',
      expiry: itemData.expiry || '12/2028',
      isAvailable: Number(itemData.stockQty) > 0
    };
    setPharmacyStock(prev => [newItem, ...prev]);
    showToast(`Medicine ${newItem.name} added to pharmacy inventory`);

    fetch(`${BACKEND_URL}/api/pharmacy/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(() => {});
  };

  const updatePharmacyStockQty = (id, delta) => {
    setPharmacyStock(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.stockQty + delta);
        return {
          ...item,
          stockQty: newQty,
          isAvailable: newQty > 0
        };
      }
      return item;
    }));
    showToast(`Stock updated for ${id}`);
  };

  // Universal Scanner
  const handleUniversalScan = (inputCode, shouldClose = false) => {
    const code = (inputCode || '').trim().toUpperCase();
    const foundPatient = patients.find(p => 
      p.id.toUpperCase() === code || 
      p.barcode === code || 
      p.nfcUid.toUpperCase() === code ||
      p.phone.includes(code)
    );

    if (foundPatient) {
      setSelectedPatientForSticker(foundPatient);
      showToast(`Scanned: ${foundPatient.id} (${foundPatient.fullName})`);
      if (shouldClose) {
        setIsScannerOpen(false);
      }
      return foundPatient;
    } else {
      showToast(`No patient found matching '${code}'`);
      return null;
    }
  };

  // Set Token as Current in Consultation (Cabin)
  const setCurrentConsultationToken = (tokenNo) => {
    setTokens(prev => prev.map(t => {
      if (t.tokenNo === tokenNo) {
        return { ...t, status: 'in-consultation' };
      }
      if (t.status === 'in-consultation') {
        return { ...t, status: 'waiting' };
      }
      return t;
    }));

    fetch(`${BACKEND_URL}/api/tokens/${tokenNo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-consultation' })
    }).catch(() => {});
  };

  // Conclude Doctor Visit & Mark Token Completed
  const concludeDoctorVisit = (tokenNo) => {
    setTokens(prev => prev.map(t => t.tokenNo === tokenNo ? { ...t, status: 'completed' } : t));
    showToast(`Token ${tokenNo} consultation finished`);

    fetch(`${BACKEND_URL}/api/tokens/${tokenNo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    }).catch(() => {});
  };

  // Open Comprehensive 360 Patient Dossier from anywhere
  const openPatientDossier = (patientOrId) => {
    let pat = null;
    if (typeof patientOrId === 'string') {
      pat = patients.find(p => p.id === patientOrId || p.barcode === patientOrId);
    } else {
      pat = patientOrId;
    }
    if (pat) {
      setSelectedPatientForDossier(pat);
      setIsPatientDossierModalOpen(true);
    }
  };

  // Universal Open Prescription Print Dialog
  const openPrescriptionPrint = (rxOrTokenOrData) => {
    if (!rxOrTokenOrData) return;
    let rxToPrint = null;
    
    // If it's already a full prescription object with items
    if (rxOrTokenOrData.items && Array.isArray(rxOrTokenOrData.items) && rxOrTokenOrData.items.length > 0) {
      rxToPrint = rxOrTokenOrData;
    } else if (typeof rxOrTokenOrData === 'string') {
      // It might be an rxId or tokenNo or patientId
      rxToPrint = prescriptions.find(p => p.prescriptionId === rxOrTokenOrData || p.tokenNo === rxOrTokenOrData || p.patientId === rxOrTokenOrData);
    } else if (rxOrTokenOrData.prescriptionId || rxOrTokenOrData.rxId) {
      const rxId = rxOrTokenOrData.prescriptionId || rxOrTokenOrData.rxId;
      rxToPrint = prescriptions.find(p => p.prescriptionId === rxId) || rxOrTokenOrData;
    } else if (rxOrTokenOrData.tokenNo) {
      rxToPrint = prescriptions.find(p => p.tokenNo === rxOrTokenOrData.tokenNo || p.patientId === rxOrTokenOrData.patientId);
    } else if (rxOrTokenOrData.id) {
      rxToPrint = prescriptions.find(p => p.patientId === rxOrTokenOrData.id);
    }

    if (!rxToPrint) {
      // Create a fallback preview prescription for this patient / token
      const patientId = rxOrTokenOrData.patientId || rxOrTokenOrData.id || 'DH-OPD';
      const pat = patients.find(p => p.id === patientId);
      rxToPrint = {
        prescriptionId: `RX-OPD-${Math.floor(100 + Math.random() * 900)}`,
        patientId,
        patientName: pat?.fullName || rxOrTokenOrData.patientName || 'Consultation Patient',
        age: pat?.age || rxOrTokenOrData.age || 35,
        gender: pat?.gender || rxOrTokenOrData.gender || 'Unknown',
        phone: pat?.phone || rxOrTokenOrData.phone || '-',
        tokenNo: rxOrTokenOrData.tokenNo || 'TK-01',
        doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
        date: new Date().toISOString().split('T')[0],
        vitals: pat?.vitals || rxOrTokenOrData.vitals || {},
        clinicalNotes: rxOrTokenOrData.notes || 'Follow-up clinical assessment and symptom evaluation.',
        diagnosis: 'Upper Respiratory Viral Syndrome / Symptomatic relief',
        items: [
          { medicineId: 'MED-101', name: 'Dolo 650mg Tablet', dosage: '1-0-1', duration: '3 Days', timing: 'After Food', qty: 6, unitPrice: 3.5 },
          { medicineId: 'MED-105', name: 'Pan 40mg Tablet', dosage: '1-0-0', duration: '5 Days', timing: 'Before Food', qty: 5, unitPrice: 11.5 }
        ]
      };
    }
    
    setSelectedPrescriptionForPrint(rxToPrint);
    setIsPrescriptionModalOpen(true);
  };

  // Universal Open Bill / Receipt Dialog
  const openBillReceipt = (billOrTokenOrPatient) => {
    if (!billOrTokenOrPatient) return;
    let billObj = null;

    if (billOrTokenOrPatient.billId && billOrTokenOrPatient.amount !== undefined) {
      billObj = billOrTokenOrPatient;
    } else if (typeof billOrTokenOrPatient === 'string') {
      billObj = bills.find(b => b.billId === billOrTokenOrPatient || b.patientId === billOrTokenOrPatient);
    } else if (billOrTokenOrPatient.tokenNo) {
      // Find matching bill for this token / patient
      billObj = bills.find(b => b.patientId === billOrTokenOrPatient.patientId);
      if (!billObj) {
        billObj = {
          billId: `INV-2026-${String(billOrTokenOrPatient.tokenNo || '').replace(/[^0-9]/g, '').padStart(3, '0') || '099'}`,
          patientId: billOrTokenOrPatient.patientId,
          patientName: billOrTokenOrPatient.patientName,
          type: 'OPD Doctor Consultation Fee',
          category: 'doctor_fee',
          amount: 300,
          mode: 'Cash Counter',
          status: 'Paid',
          date: new Date().toISOString().split('T')[0],
          time: billOrTokenOrPatient.createdAt || '10:00 AM',
          description: `OPD Consultation with Dr. Arvind Ramesh (${billOrTokenOrPatient.room || 'Room 102'})`
        };
      }
    } else if (billOrTokenOrPatient.id) {
      billObj = bills.find(b => b.patientId === billOrTokenOrPatient.id);
      if (!billObj) {
        billObj = {
          billId: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
          patientId: billOrTokenOrPatient.id,
          patientName: billOrTokenOrPatient.fullName,
          type: 'Hospital OPD Consultation Fee',
          category: 'doctor_fee',
          amount: 300,
          mode: 'Cash Counter',
          status: 'Paid',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          description: 'Official OPD Consultation Fee & Healthcare Services'
        };
      }
    }

    if (!billObj) {
      billObj = {
        billId: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        patientId: 'DH-OPD',
        patientName: 'Patient',
        type: 'OPD Doctor Consultation Fee',
        category: 'doctor_fee',
        amount: 300,
        mode: 'Cash Counter',
        status: 'Paid',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        description: 'Official Healthcare Services & Consultation'
      };
    }

    setSelectedBillForReceipt(billObj);
    setIsReceiptModalOpen(true);
  };

  // Compile Comprehensive Patient Longitudinal Visit History
  const getPatientFullHistory = (patientId) => {
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return { patient: null, visits: [], stats: {} };

    // Previous historical visits
    const past = historicalVisits.filter(h => h.patientId === patientId);

    // Current today's visit(s) from tokens
    const todayTokens = tokens.filter(t => t.patientId === patientId);
    const todayVisits = todayTokens.map(tok => {
      const relatedRx = prescriptions.filter(p => p.patientId === patientId && (p.tokenNo === tok.tokenNo || !p.tokenNo));
      const relatedLab = labOrders.filter(l => l.patientId === patientId && (l.tokenNo === tok.tokenNo || !l.tokenNo));
      const relatedBills = bills.filter(b => b.patientId === patientId);

      return {
        visitId: `VISIT-2026-TODAY-${tok.tokenNo}`,
        tokenNo: tok.tokenNo,
        patientId: pat.id,
        date: '2026-03-19',
        time: tok.createdAt,
        doctor: tok.doctor,
        room: tok.room,
        type: tok.type,
        status: tok.status,
        complaints: tok.notes || 'Routine follow-up consultation',
        vitals: pat.vitals || { bp: '120/80', weight: '70', pulse: '76', temp: '98.6', spo2: '99', rbs: '110' },
        diagnosis: tok.status === 'completed' || tok.status === 'in-consultation' || tok.status === 'lab-completed'
          ? 'Upper respiratory tract irritation and mild viral pyrexia. Baseline investigations completed and verified.'
          : 'Clinical examination in progress.',
        prescriptions: relatedRx.map(r => ({
          rxId: r.prescriptionId,
          date: r.date,
          doctor: r.doctor,
          dispensedStatus: r.dispensedStatus,
          billedStatus: r.billedStatus,
          totalAmount: r.totalAmount,
          items: r.items
        })),
        labOrders: relatedLab.map(l => ({
          orderId: l.orderId,
          date: l.orderDate,
          overallStatus: l.overallStatus,
          verifiedBy: l.verifiedBy,
          verifiedAt: l.verifiedAt,
          tests: l.tests
        })),
        bills: relatedBills.map(b => ({
          billId: b.billId,
          type: b.type,
          category: b.category,
          amount: b.amount,
          mode: b.mode,
          status: b.status,
          date: b.date,
          time: b.time
        }))
      };
    });

    const allVisits = [...todayVisits, ...past];

    // Aggregate stats with billId deduplication to avoid double counting
    const uniqueBillIds = new Set();
    let totalBilled = 0;
    allVisits.forEach(v => {
      v.bills?.forEach(b => {
        if (!uniqueBillIds.has(b.billId)) {
          uniqueBillIds.add(b.billId);
          totalBilled += (b.amount || 0);
        }
      });
    });
    const totalRx = allVisits.reduce((sum, v) => sum + (v.prescriptions?.length || 0), 0);
    const totalLabs = allVisits.reduce((sum, v) => sum + (v.labOrders?.reduce((s, l) => s + (l.tests?.length || 1), 0) || 0), 0);

    return {
      patient: pat,
      visits: allVisits,
      stats: {
        totalVisits: allVisits.length,
        totalBilled,
        totalRx,
        totalLabs
      }
    };
  };

  return (
    <HospitalContext.Provider
      value={{
        activePortal,
        setActivePortal,
        activeReceptionTab,
        setActiveReceptionTab,
        activeAdminTab,
        setActiveAdminTab,
        activePharmacyTab,
        setActivePharmacyTab,
        isPharmacySidebarOpen,
        setIsPharmacySidebarOpen,
        isScannerOpen,
        setIsScannerOpen,
        isLabelModalOpen,
        setIsLabelModalOpen,
        isLabReportModalOpen,
        setIsLabReportModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        selectedBillForReceipt,
        setSelectedBillForReceipt,
        isPharmacyInvoiceModalOpen,
        setIsPharmacyInvoiceModalOpen,
        selectedRxForInvoice,
        setSelectedRxForInvoice,
        isTokenSlipModalOpen,
        setIsTokenSlipModalOpen,
        selectedTokenForSlip,
        setSelectedTokenForSlip,
        selectedPatientForSticker,
        setSelectedPatientForSticker,
        selectedLabReport,
        setSelectedLabReport,
        isPatientDossierModalOpen,
        setIsPatientDossierModalOpen,
        selectedPatientForDossier,
        setSelectedPatientForDossier,
        isPrescriptionModalOpen,
        setIsPrescriptionModalOpen,
        selectedPrescriptionForPrint,
        setSelectedPrescriptionForPrint,
        openPrescriptionPrint,
        openBillReceipt,
        openPatientDossier,
        getPatientFullHistory,
        historicalVisits,
        toastMessage,
        showToast,
        patients,
        tokens,
        pharmacyStock,
        labOrders,
        prescriptions,
        bills,
        employees,
        attendance,
        baileysState,
        setBaileysState,
        whatsappLogs,
        sendBaileysMessage,
        registerPatient,
        createOpVisit,
        createLabOrder,
        completeLabOrder,
        markLabReportReady,
        markLabReportReceived,
        addLabPatientToDoctorQueue,
        createPrescription,
        dispensePrescription,
        concludeDoctorVisit,
        addEmployee,
        markAttendance,
        addPharmacyItem,
        updatePharmacyStockQty,
        handleUniversalScan,
        isBackendConnected,
        BACKEND_URL,
        callTokenLive,
        setCurrentConsultationToken,
        requestBaileysQR,
        toggleBaileysPair,
        saveBaileysTemplates
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
