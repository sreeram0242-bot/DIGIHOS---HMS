import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { postgresStore } from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hospital_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const getInitialData = () => ({
  patients: [
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
  ],

  tokens: [
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
  ],

  pharmacyStock: [
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
      unitPrice: 24.5,
      mrp: 29.0,
      stockQty: 50,
      minStockLevel: 25,
      batch: 'AZ-8812',
      mfgDate: '01/2025',
      expiry: '06/2027',
      shelfRack: 'Rack B - Shelf 02',
      isAvailable: true
    },
    {
      id: 'MED-105',
      name: 'Pan 40mg Tablet',
      generic: 'Pantoprazole Gastro-resistant IP 40mg',
      category: 'Gastrointestinal & Antacids',
      dosageForm: 'Tablet',
      manufacturer: 'Alkem Laboratories',
      unitPrice: 11.5,
      mrp: 14.0,
      stockQty: 120,
      minStockLevel: 40,
      batch: 'PAN-6012',
      mfgDate: '03/2025',
      expiry: '01/2028',
      shelfRack: 'Rack C - Shelf 01',
      isAvailable: true
    }
  ],

  labOrders: [
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
  ],

  prescriptions: [
    {
      prescriptionId: 'RX-901',
      patientId: 'DH-2026-001',
      patientName: 'Senthil Kumar M',
      tokenNo: 'TK-01',
      doctor: 'Dr. Arvind Ramesh',
      date: '2026-03-19',
      items: [
        { medicineId: 'MED-101', name: 'Dolo 650mg', dosage: '1-0-1', duration: '3 Days', timing: 'After Food', qty: 6, unitPrice: 3.5 },
        { medicineId: 'MED-105', name: 'Pan 40mg', dosage: '1-0-0', duration: '5 Days', timing: 'Before Food', qty: 5, unitPrice: 11.5 }
      ],
      dispensedStatus: 'pending',
      billedStatus: 'paid',
      totalAmount: 78.5
    }
  ],

  bills: [
    {
      billId: 'INV-2026-001',
      category: 'doctor_fee',
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
      type: 'Laboratory Diagnostics Fee',
      description: 'Complete Blood Count (CBC) + Random Blood Sugar (RBS)',
      amount: 500,
      mode: 'UPI (GPay / PhonePe)',
      status: 'Paid',
      time: '09:15 AM',
      date: '2026-03-19'
    }
  ],

  employees: [
    {
      id: 'EMP-101',
      name: 'Dr. Arvind Ramesh',
      role: 'Chief Medical Consultant',
      dept: 'General Medicine',
      phone: '9842100111',
      shift: 'Morning (08:00 - 14:00)',
      status: 'On Duty'
    },
    {
      id: 'EMP-102',
      name: 'Kavitha S',
      role: 'Senior Receptionist',
      dept: 'Front Desk & EMR',
      phone: '9842100222',
      shift: 'General (08:00 - 16:30)',
      status: 'On Duty'
    },
    {
      id: 'EMP-103',
      name: 'Prakash M',
      role: 'Chief Pharmacist',
      dept: 'Pharmacy Dispensary',
      phone: '9842100333',
      shift: 'Morning (08:30 - 15:00)',
      status: 'On Duty'
    },
    {
      id: 'EMP-104',
      name: 'Dr. K. Shalini',
      role: 'Consultant Pathologist',
      dept: 'Diagnostic Lab',
      phone: '9842100444',
      shift: 'Morning (09:00 - 16:00)',
      status: 'On Duty'
    }
  ],

  attendance: [
    { id: 'ATT-001', empId: 'EMP-101', name: 'Dr. Arvind Ramesh', time: '07:55 AM', status: 'Present' },
    { id: 'ATT-002', empId: 'EMP-102', name: 'Kavitha S', time: '08:02 AM', status: 'Present' },
    { id: 'ATT-003', empId: 'EMP-103', name: 'Prakash M', time: '08:25 AM', status: 'Present' },
    { id: 'ATT-004', empId: 'EMP-104', name: 'Dr. K. Shalini', time: '08:50 AM', status: 'Present' }
  ],

  historicalVisits: [
    {
      visitId: 'VISIT-2025-NOV-102',
      patientId: 'DH-2026-001',
      tokenNo: 'TK-84',
      date: '2025-11-14',
      time: '10:30 AM',
      doctor: 'Dr. Arvind Ramesh, MD',
      room: 'Consultation Room 102',
      type: 'Routine Health Check',
      status: 'completed',
      complaints: 'Mild recurrent headache, fatigue after work hours.',
      vitals: {
        bp: '130/84',
        weight: '75',
        pulse: '76',
        temp: '98.4',
        spo2: '99',
        rbs: '108'
      },
      diagnosis: 'Tension headache due to ocular fatigue. Advised refraction check & lifestyle changes.',
      prescriptions: [
        {
          rxId: 'RX-2025-NOV-01',
          date: '2025-11-14',
          doctor: 'Dr. Arvind Ramesh',
          dispensedStatus: 'dispensed',
          billedStatus: 'paid',
          totalAmount: 45.0,
          items: [
            { medicineId: 'MED-101', name: 'Dolo 650mg Tablet', dosage: '1-0-1 (SOS)', duration: '3 Days', timing: 'After Food', qty: 6, unitPrice: 3.5 },
            { medicineId: 'MED-112', name: 'Electral ORS Powder', dosage: '1 Sachet in 1L Water', duration: '2 Days', timing: 'Throughout Day', qty: 2, unitPrice: 12.0 }
          ]
        }
      ],
      labOrders: [
        {
          orderId: 'LAB-ORD-2025-NOV',
          date: '2025-11-14',
          overallStatus: 'completed',
          verifiedBy: 'Dr. K. Shalini, MD (Pathology)',
          verifiedAt: '11:45 AM',
          tests: [
            {
              id: 'TEST-CBC-OLD',
              name: 'Complete Blood Count (CBC)',
              sampleType: 'Blood (EDTA)',
              status: 'completed',
              parameters: [
                { name: 'Hemoglobin', value: '14.0', unit: 'g/dL', normal: '13.0 - 17.0', flag: 'normal' },
                { name: 'Total WBC', value: '7,800', unit: '/cu.mm', normal: '4,000 - 11,000', flag: 'normal' }
              ]
            }
          ]
        }
      ],
      bills: [
        {
          billId: 'INV-2025-NOV-001',
          type: 'Consultation Fee',
          category: 'doctor_fee',
          amount: 300,
          mode: 'UPI',
          status: 'Paid',
          date: '2025-11-14',
          time: '10:35 AM'
        },
        {
          billId: 'INV-2025-NOV-002',
          type: 'Pathology Diagnostics',
          category: 'lab_payment',
          amount: 350,
          mode: 'UPI',
          status: 'Paid',
          date: '2025-11-14',
          time: '11:15 AM'
        }
      ]
    }
  ],

  employees: [
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
  ],

  attendance: [
    {
      id: 'ATT-20260319-01',
      employeeId: 'EMP-01',
      name: 'Dr. Arvind Ramesh',
      department: 'General Medicine',
      date: '2026-03-19',
      checkIn: '07:55 AM',
      checkOut: '-',
      status: 'Present'
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
      checkIn: '07:45 AM',
      checkOut: '-',
      status: 'Present'
    },
    {
      id: 'ATT-20260319-04',
      employeeId: 'EMP-04',
      name: 'Rajesh Kannan P',
      department: 'Diagnostic Laboratory',
      date: '2026-03-19',
      checkIn: '08:15 AM',
      checkOut: '-',
      status: 'Late'
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
      checkIn: '07:25 AM',
      checkOut: '-',
      status: 'Present'
    }
  ],

  whatsappLogs: []
});

class Database {
  constructor() {
    this.data = this.load();
    this.initPostgres();
  }

  async initPostgres() {
    try {
      const isConnected = await postgresStore.init(this.data);
      if (isConnected) {
        const pgData = await postgresStore.loadAll();
        if (pgData && Object.keys(pgData).length > 0) {
          this.data = { ...this.data, ...pgData };
          this.save();
          console.log('[Database] Loaded and synchronized full state with PostgreSQL.');
        }
      }
    } catch (err) {
      console.error('[Database] Postgres sync initialization error:', err.message);
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.tokens && Array.isArray(parsed.tokens)) {
          parsed.tokens = parsed.tokens.filter(t => t && t.tokenNo);
        }
        if (parsed.patients && Array.isArray(parsed.patients)) {
          parsed.patients = parsed.patients.filter(p => p && p.id);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error loading DB file, fallback to initial seed:', err);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  saveCollection(key) {
    this.save();
    if (postgresStore.isReady && key && this.data[key]) {
      postgresStore.saveCollection(key, this.data[key]).catch(err => {
        console.error(`[PostgreSQL] Async save error for ${key}:`, err.message);
      });
    }
  }

  getState() {
    if (this.data && Array.isArray(this.data.tokens)) {
      this.data.tokens = this.data.tokens.filter(t => t && t.tokenNo);
    }
    if (this.data && Array.isArray(this.data.patients)) {
      this.data.patients = this.data.patients.filter(p => p && p.id);
    }
    return this.data;
  }

  // Patients
  addPatient(patient) {
    if (!patient || !patient.id) return null;
    this.data.patients = [patient, ...(this.data.patients || []).filter(p => p && p.id)];
    this.saveCollection('patients');
    return patient;
  }

  updatePatient(id, updates) {
    if (!id) return null;
    this.data.patients = (this.data.patients || []).filter(p => p && p.id).map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveCollection('patients');
    return this.data.patients.find(p => p && p.id === id);
  }

  // Tokens
  addToken(token) {
    if (!token || !token.tokenNo) return null;
    this.data.tokens = [...(this.data.tokens || []).filter(t => t && t.tokenNo), token];
    this.saveCollection('tokens');
    return token;
  }

  updateToken(tokenNo, updates) {
    if (!tokenNo) return null;
    this.data.tokens = (this.data.tokens || []).filter(t => t && t.tokenNo).map(t => t.tokenNo === tokenNo ? { ...t, ...updates } : t);
    this.saveCollection('tokens');
    return this.data.tokens.find(t => t && t.tokenNo === tokenNo);
  }

  // Lab Orders
  addLabOrder(order) {
    this.data.labOrders = [order, ...this.data.labOrders];
    this.saveCollection('labOrders');
    return order;
  }

  updateLabOrder(orderId, updates) {
    this.data.labOrders = this.data.labOrders.map(o => o.orderId === orderId ? { ...o, ...updates } : o);
    this.saveCollection('labOrders');
    return this.data.labOrders.find(o => o.orderId === orderId);
  }

  // Prescriptions
  addPrescription(rx) {
    this.data.prescriptions = [rx, ...this.data.prescriptions];
    this.saveCollection('prescriptions');
    return rx;
  }

  updatePrescription(rxId, updates) {
    this.data.prescriptions = this.data.prescriptions.map(p => p.prescriptionId === rxId ? { ...p, ...updates } : p);
    this.saveCollection('prescriptions');
    return this.data.prescriptions.find(p => p.prescriptionId === rxId);
  }

  // Pharmacy Stock
  updateStockQty(medId, deltaQty) {
    this.data.pharmacyStock = this.data.pharmacyStock.map(m => {
      if (m.id === medId) {
        const newQty = Math.max(0, m.stockQty + deltaQty);
        return {
          ...m,
          stockQty: newQty,
          isAvailable: newQty > 0
        };
      }
      return m;
    });
    this.saveCollection('pharmacyStock');
    return this.data.pharmacyStock.find(m => m.id === medId);
  }

  addStockItem(item) {
    this.data.pharmacyStock = [...this.data.pharmacyStock, item];
    this.saveCollection('pharmacyStock');
    return item;
  }

  // Bills
  addBill(bill) {
    this.data.bills = [bill, ...this.data.bills];
    this.saveCollection('bills');
    return bill;
  }

  // Employees
  addEmployee(emp) {
    if (!this.data.employees) this.data.employees = [];
    this.data.employees = [...this.data.employees, emp];
    this.saveCollection('employees');
    return emp;
  }

  updateEmployee(id, updates) {
    if (!this.data.employees) this.data.employees = [];
    this.data.employees = this.data.employees.map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveCollection('employees');
    return this.data.employees.find(e => e.id === id);
  }

  // Attendance
  addAttendance(record) {
    if (!this.data.attendance) this.data.attendance = [];
    this.data.attendance = [record, ...this.data.attendance];
    this.saveCollection('attendance');
    return record;
  }

  updateAttendance(id, updates) {
    if (!this.data.attendance) this.data.attendance = [];
    this.data.attendance = this.data.attendance.map(a => a.id === id ? { ...a, ...updates } : a);
    this.saveCollection('attendance');
    return this.data.attendance.find(a => a.id === id);
  }

  // WhatsApp Message
  addWhatsAppLog(log) {
    this.data.whatsappLogs = [log, ...this.data.whatsappLogs];
    this.saveCollection('whatsappLogs');
    return log;
  }

  reset() {
    this.data = getInitialData();
    this.save();
    if (postgresStore.isReady) {
      postgresStore.saveFullState(this.data).catch(() => {});
    }
    return this.data;
  }
}

export const db = new Database();
