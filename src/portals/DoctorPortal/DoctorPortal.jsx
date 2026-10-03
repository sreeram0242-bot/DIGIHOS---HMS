import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  FlaskConical, 
  Pill, 
  AlertCircle, 
  FileText, 
  Send, 
  Activity, 
  User, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Volume2, 
  X, 
  Search, 
  Check, 
  Layers, 
  Utensils,
  Printer,
  Receipt,
  Edit3,
  Eye,
  RotateCcw,
  AlertTriangle,
  PanelLeftOpen,
  PanelLeftClose,
  Maximize2,
  Users,
  Zap
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const DoctorPortal = () => {
  const { 
    tokens, 
    patients, 
    pharmacyStock, 
    labOrders, 
    prescriptions,
    createLabOrder, 
    createPrescription, 
    concludeDoctorVisit,
    setCurrentConsultationToken,
    setSelectedLabReport, 
    setIsLabReportModalOpen, 
    openPatientDossier,
    openPrescriptionPrint,
    openBillReceipt,
    callTokenLive,
    showToast 
  } = useHospital();

  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting' | 'finished'
  
  // Find active waiting or in-consultation token
  const firstWaiting = tokens.find(t => t.status === 'in-consultation' || t.status === 'waiting');
  const [selectedTokenNo, setSelectedTokenNo] = useState(firstWaiting ? firstWaiting.tokenNo : null);

  // Clinical input states
  const [clinicalNotes, setClinicalNotes] = useState('Patient presents with moderate fever, body fatigue, and mild pharyngitis.');
  const [diagnosis, setDiagnosis] = useState('Viral Pyrexia / Acute Upper Respiratory Infection');
  const [selectedTests, setSelectedTests] = useState(['CBC', 'RBS']);
  
  // Prescription items state
  const [rxItems, setRxItems] = useState([
    {
      medicineId: 'MED-101',
      name: 'Dolo 650mg Tablet',
      generic: 'Paracetamol 650mg',
      dosage: '1-0-1',
      duration: '3 Days',
      timing: 'After Food',
      instructions: 'Take after food with warm water',
      qty: 6,
      unitPrice: 3.5
    },
    {
      medicineId: 'MED-105',
      name: 'Pan 40mg Tablet',
      generic: 'Pantoprazole 40mg',
      dosage: '1-0-0',
      duration: '5 Days',
      timing: 'Before Food',
      instructions: 'Take 30 mins before morning breakfast',
      qty: 5,
      unitPrice: 11.5
    }
  ]);

  // Flexible Dosage Builder States
  const [activeDosage, setActiveDosage] = useState('1-0-1');
  const [doseDuration, setDoseDuration] = useState('5 Days');
  const [doseTiming, setDoseTiming] = useState('After Food');
  const [doseQty, setDoseQty] = useState(10);
  const [doseInstructions, setDoseInstructions] = useState('Take with warm water after food');

  // Custom non-inventory medicine toggle & inputs
  const [isCustomMed, setIsCustomMed] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedGeneric, setCustomMedGeneric] = useState('');

  // Search & Filter Dropdown States
  const [medCategory, setMedCategory] = useState('All');
  const [selectedMedToAdd, setSelectedMedToAdd] = useState('MED-101');
  const [isPharmacyDropdownOpen, setIsPharmacyDropdownOpen] = useState(false);
  const [pharmacySearchQuery, setPharmacySearchQuery] = useState('');
  const pharmacyDropdownRef = useRef(null);

  // Full Screen Consultation Desk near Sidebar (Toggleable side queue panel)
  const [isQueueVisible, setIsQueueVisible] = useState(false);

  // One-Click Quick-Pick Frequent Medicines List
  const quickPickMedicines = [
    { id: 'MED-101', name: 'Dolo 650mg Tab', generic: 'Paracetamol 650mg', category: 'Analgesics & Pain Relief', dosage: '1-0-1', timing: 'After Food', duration: '3 Days', unitPrice: 3.5, instructions: 'Take with warm water after food' },
    { id: 'MED-105', name: 'Pan 40mg Tab', generic: 'Pantoprazole 40mg', category: 'Gastrointestinal & Antacids', dosage: '1-0-0', timing: 'Before Food', duration: '5 Days', unitPrice: 11.5, instructions: 'Take 30 mins before morning breakfast' },
    { id: 'MED-102', name: 'Augmentin 625mg', generic: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics & Anti-infectives', dosage: '1-0-1', timing: 'After Food', duration: '5 Days', unitPrice: 24.0, instructions: 'Complete full course of antibiotics' },
    { id: 'MED-104', name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', category: 'Antihistamines & Allergy', dosage: '0-0-1', timing: 'At Bedtime', duration: '5 Days', unitPrice: 4.2, instructions: 'Take at night before sleep' },
    { id: 'MED-103', name: 'Azithral 500mg', generic: 'Azithromycin 500mg', category: 'Antibiotics & Anti-infectives', dosage: '1-0-0', timing: 'After Food', duration: '3 Days', unitPrice: 22.5, instructions: 'Take once daily at the same hour' },
    { id: 'MED-108', name: 'Metformin 500mg', generic: 'Metformin HCl', category: 'Diabetic Care & Insulin', dosage: '1-0-1', timing: 'After Food', duration: '14 Days', unitPrice: 6.0, instructions: 'Monitor fasting blood glucose regularly' },
    { id: 'MED-109', name: 'Telma 40mg Tab', generic: 'Telmisartan 40mg', category: 'Cardiovascular & BP', dosage: '1-0-0', timing: 'After Food', duration: '14 Days', unitPrice: 14.5, instructions: 'Take daily morning; check BP regularly' },
    { id: 'MED-110', name: 'Electral ORS', generic: 'Oral Rehydration Salts', category: 'IV Fluids & Electrolytes', dosage: '1-1-1', timing: 'With Food', duration: '3 Days', unitPrice: 21.0, instructions: 'Dissolve in 1 Litre boiled & cooled water' }
  ];

  // Standard Clinical Dosage Presets
  const dosagePresets = [
    { label: '1-0-1', title: 'Morning & Night (BD)' },
    { label: '1-1-1', title: 'Three times daily (TDS)' },
    { label: '1-0-0', title: 'Morning only (OD)' },
    { label: '0-0-1', title: 'Night / Bedtime (HS)' },
    { label: '1-1-1-1', title: 'Four times daily (QID)' },
    { label: '0-1-0', title: 'Afternoon only' },
    { label: 'SOS', title: 'As needed (If fever / pain)' },
    { label: 'STAT', title: 'Immediately (Single Dose)' },
    { label: '5ml BD', title: 'Syrup 5ml twice daily' }
  ];

  // Calculate recommended quantity based on dosage & duration
  const calculateAutoQty = (dosageStr, durationStr) => {
    let days = 5;
    const dayMatch = (durationStr || '').match(/\d+/);
    if (dayMatch) days = parseInt(dayMatch[0], 10);
    else if ((durationStr || '').toLowerCase().includes('week')) days = 7;
    else if ((durationStr || '').toLowerCase().includes('month')) days = 30;

    let dosesPerDay = 2;
    if (dosageStr === '1-0-1') dosesPerDay = 2;
    else if (dosageStr === '1-1-1') dosesPerDay = 3;
    else if (dosageStr === '1-0-0' || dosageStr === '0-0-1' || dosageStr === '0-1-0') dosesPerDay = 1;
    else if (dosageStr === '1-1-1-1') dosesPerDay = 4;
    else if ((dosageStr || '').toLowerCase() === 'sos') return 6;
    else if ((dosageStr || '').toLowerCase() === 'stat') return 1;
    else {
      const parts = (dosageStr || '').split('-');
      if (parts.length >= 2) {
        dosesPerDay = parts.reduce((sum, p) => sum + (parseFloat(p) || 0), 0) || 2;
      }
    }
    return Math.max(1, Math.ceil(dosesPerDay * days));
  };

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pharmacyDropdownRef.current && !pharmacyDropdownRef.current.contains(event.target)) {
        setIsPharmacyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const medCategories = [
    'All',
    'Analgesics & Pain Relief',
    'Antibiotics & Anti-infectives',
    'Gastrointestinal & Antacids',
    'Antihistamines & Allergy',
    'Diabetic Care & Insulin',
    'Cardiovascular & BP',
    'Respiratory & Cough',
    'IV Fluids & Electrolytes'
  ];

  const safePharmacyStock = Array.isArray(pharmacyStock) ? pharmacyStock : [];
  const selectedMedObj = safePharmacyStock.find(m => m.id === selectedMedToAdd) || safePharmacyStock[0] || null;

  // Auto-sync medicine selection when category filter changes
  useEffect(() => {
    if (medCategory !== 'All') {
      const inCat = safePharmacyStock.filter(m => m.category === medCategory);
      if (inCat.length > 0 && !inCat.some(m => m.id === selectedMedToAdd)) {
        setSelectedMedToAdd(inCat[0].id);
      }
    }
  }, [medCategory, safePharmacyStock]);

  // Filter Tokens:
  // Active waiting / in-consultation tokens are at the TOP.
  // Tokens in lab (status === 'lab-investigation') go to the LAST.
  // Tokens with lab completed (status === 'lab-completed') do NOT show until reception adds them!
  const safeTokens = (Array.isArray(tokens) ? tokens : []).filter(t => t && typeof t === 'object' && t.tokenNo);
  const waitingTokens = safeTokens
    .filter(t => t && t.status !== 'completed' && t.status !== 'lab-completed')
    .sort((a, b) => {
      const isALab = a?.status === 'lab-investigation';
      const isBLab = b?.status === 'lab-investigation';
      if (isALab && !isBLab) return 1;
      if (!isALab && isBLab) return -1;
      return (a?.tokenNo || '').localeCompare(b?.tokenNo || '');
    });

  const finishedTokens = safeTokens.filter(t => t && t.status === 'completed');

  // Candidates for active doctor consultation (in lounge or in consultation)
  const activeOpdTokens = waitingTokens.filter(t => t && t.status !== 'lab-investigation');

  // Find currently selected token:
  const currentToken = activeTab === 'waiting'
    ? (
        selectedTokenNo === null
          ? null
          : (activeOpdTokens.find(t => t?.tokenNo === selectedTokenNo) || activeOpdTokens[0] || null)
      )
    : (
        selectedTokenNo === null
          ? null
          : (finishedTokens.find(t => t?.tokenNo === selectedTokenNo) || finishedTokens[0] || null)
      );

  const matchedPatient = currentToken ? (patients || []).find(p => p.id === currentToken.patientId) : null;
  const currentPatient = matchedPatient || (currentToken ? {
    id: currentToken.patientId || 'DH-OPD',
    fullName: currentToken.patientName || 'Consultation Patient',
    age: currentToken.age || 35,
    gender: currentToken.gender || 'Unknown',
    phone: currentToken.phone || '-',
    bloodGroup: 'Unknown',
    vitals: currentToken.vitals || {}
  } : null);
  const currentPatientLabOrder = currentPatient ? (labOrders || []).find(l => l.patientId === currentPatient.id) : null;

  // Sync token to 'in-consultation' when selected and load existing Rx if available
  useEffect(() => {
    if (currentToken) {
      if (selectedTokenNo !== currentToken.tokenNo) {
        setSelectedTokenNo(currentToken.tokenNo);
      }
      // Ensure token status is synchronized to in-consultation
      if (currentToken.status !== 'in-consultation' && currentToken.status !== 'completed' && currentToken.status !== 'lab-investigation') {
        if (setCurrentConsultationToken) {
          setCurrentConsultationToken(currentToken.tokenNo);
        }
      }
      setClinicalNotes(currentToken.notes || 'Patient assessment in progress.');
      setSelectedTests([]);

      // Check if an existing prescription was issued for this patient/token
      const existingRx = (prescriptions || []).find(p => 
        p.tokenNo === currentToken.tokenNo || 
        (currentToken.status === 'completed' && p.patientId === currentToken.patientId)
      );

      if (existingRx && Array.isArray(existingRx.items) && existingRx.items.length > 0) {
        setRxItems(existingRx.items);
        if (existingRx.diagnosis) setDiagnosis(existingRx.diagnosis);
        if (existingRx.clinicalNotes) setClinicalNotes(existingRx.clinicalNotes);
      } else {
        // Standard starter prescription items
        setRxItems([
          {
            medicineId: 'MED-101',
            name: 'Dolo 650mg Tablet',
            generic: 'Paracetamol 650mg',
            dosage: '1-0-1',
            duration: '3 Days',
            timing: 'After Food',
            instructions: 'Take after food with warm water',
            qty: 6,
            unitPrice: 3.5
          },
          {
            medicineId: 'MED-105',
            name: 'Pan 40mg Tablet',
            generic: 'Pantoprazole 40mg',
            dosage: '1-0-0',
            duration: '5 Days',
            timing: 'Before Food',
            instructions: 'Take 30 mins before morning breakfast',
            qty: 5,
            unitPrice: 11.5
          }
        ]);
        setDiagnosis('Viral Pyrexia / Acute Upper Respiratory Infection');
      }
    } else {
      setSelectedTokenNo(null);
      setClinicalNotes('');
      setSelectedTests([]);
      setRxItems([]);
    }
  }, [currentToken?.tokenNo]);

  // Advance to next patient in queue
  const advanceToNextPatient = (finishedTokenNo) => {
    const nextAvailable = tokens.find(t => 
      t.tokenNo !== finishedTokenNo && 
      (t.status === 'waiting' || t.status === 'in-consultation')
    );

    if (nextAvailable) {
      setSelectedTokenNo(nextAvailable.tokenNo);
      if (setCurrentConsultationToken) {
        setCurrentConsultationToken(nextAvailable.tokenNo);
      }
      setClinicalNotes(nextAvailable.notes || 'Patient examination in progress.');
      if (callTokenLive) {
        callTokenLive({
          tokenNo: nextAvailable.tokenNo,
          patientName: nextAvailable.patientName,
          room: 'Consultation Room 102'
        });
      }
      showToast(`Current Turn assigned to ${nextAvailable.tokenNo} (${nextAvailable.patientName})`);
    } else {
      setSelectedTokenNo(null);
      setClinicalNotes('');
      showToast('All waiting patients have been completed. Desk idle.');
    }

    setSelectedTests([]);
  };

  const handleSelectToken = (tok) => {
    setSelectedTokenNo(tok.tokenNo);
    if (tok.status !== 'completed' && tok.status !== 'lab-investigation') {
      if (setCurrentConsultationToken) {
        setCurrentConsultationToken(tok.tokenNo);
      }
    }
    setClinicalNotes(tok.notes || 'Patient assessment in progress.');
    setSelectedTests([]);
    
    // Check if prescription exists for this token
    const existingRx = (prescriptions || []).find(p => 
      p.tokenNo === tok.tokenNo || (tok.status === 'completed' && p.patientId === tok.patientId)
    );
    if (existingRx && Array.isArray(existingRx.items) && existingRx.items.length > 0) {
      setRxItems(existingRx.items);
      if (existingRx.diagnosis) setDiagnosis(existingRx.diagnosis);
      if (existingRx.clinicalNotes) setClinicalNotes(existingRx.clinicalNotes);
    }
  };

  const handleTestToggle = (testCode) => {
    setSelectedTests(prev => 
      prev.includes(testCode) ? prev.filter(t => t !== testCode) : [...prev, testCode]
    );
  };

  // Send Lab Order
  const handleSendLabOrder = () => {
    if (!currentToken || selectedTests.length === 0) {
      alert('Please select at least one lab test to send to the Pathology Lab.');
      return;
    }
    const tokenNo = currentToken.tokenNo;
    createLabOrder(currentToken.patientId, tokenNo, selectedTests, clinicalNotes);
    showToast(`Order for ${selectedTests.join(', ')} sent to lab. Token ${tokenNo} moved to Lab queue.`);
    advanceToNextPatient(tokenNo);
  };

  // Conclude visit manually
  const handleConcludeVisit = () => {
    if (!currentToken) return;
    const tokenNo = currentToken.tokenNo;
    concludeDoctorVisit(tokenNo);
    advanceToNextPatient(tokenNo);
  };

  // One-click populate from Quick-Pick Frequent list
  const handleQuickPick = (quickMed) => {
    setSelectedMedToAdd(quickMed.id);
    setIsCustomMed(false);
    setActiveDosage(quickMed.dosage || '1-0-1');
    setDoseTiming(quickMed.timing || 'After Food');
    setDoseDuration(quickMed.duration || '5 Days');
    setDoseInstructions(quickMed.instructions || 'Take with water after food');
    const autoQty = calculateAutoQty(quickMed.dosage || '1-0-1', quickMed.duration || '5 Days');
    setDoseQty(autoQty);
    showToast(`Loaded ${quickMed.name} & dosage presets. Click 'Add to Rx' or customize below.`);
  };

  // Add Medication from UI
  const handleAddMed = () => {
    if (isCustomMed) {
      if (!customMedName.trim()) {
        alert('Please enter a medicine name');
        return;
      }
      const newItem = {
        medicineId: `CUSTOM-${Date.now().toString().slice(-4)}`,
        name: customMedName.trim(),
        generic: customMedGeneric.trim() || 'Clinical Formulation',
        dosage: activeDosage || '1-0-1',
        duration: doseDuration || '5 Days',
        timing: doseTiming || 'After Food',
        instructions: doseInstructions || '',
        qty: Number(doseQty) || 10,
        unitPrice: 5.0
      };
      setRxItems(prev => [...prev, newItem]);
      showToast(`Added Custom Rx: ${customMedName.trim()} (${activeDosage})`);
      setCustomMedName('');
      setCustomMedGeneric('');
      setIsCustomMed(false);
      return;
    }

    const med = pharmacyStock.find(m => m.id === selectedMedToAdd);
    if (!med) return;

    const newItem = {
      medicineId: med.id,
      name: med.name,
      generic: med.generic || '',
      dosage: activeDosage || '1-0-1',
      duration: doseDuration || '5 Days',
      timing: doseTiming || 'After Food',
      instructions: doseInstructions || '',
      qty: Number(doseQty) || 10,
      unitPrice: med.unitPrice || 5.0
    };

    setRxItems(prev => [...prev, newItem]);
    showToast(`Added ${med.name} (${activeDosage}, ${doseTiming})`);
  };

  // Update Item Dosage in prescribed table row
  const updateItemDosage = (idx, newDosage) => {
    setRxItems(prev => prev.map((it, i) => i === idx ? { ...it, dosage: newDosage } : it));
  };

  // Update specific item field in prescribed table row
  const updateItemField = (idx, field, value) => {
    setRxItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleRemoveMed = (index) => {
    setRxItems(prev => prev.filter((_, i) => i !== index));
  };

  // Preview & Print Official Prescription
  const handlePrintCurrentPrescription = () => {
    if (!currentToken) {
      showToast('Please select a patient to print prescription');
      return;
    }
    
    // Check if an issued prescription already exists for this token
    const existingRx = (prescriptions || []).find(p => 
      p.tokenNo === currentToken.tokenNo || 
      (currentToken.status === 'completed' && p.patientId === currentToken.patientId)
    );
    
    if (rxItems.length > 0) {
      const rxToPrint = {
        prescriptionId: existingRx?.prescriptionId || `RX-${currentToken.tokenNo || Math.floor(100 + Math.random() * 900)}`,
        patientId: currentToken.patientId,
        patientName: currentPatient?.fullName || currentToken.patientName,
        age: currentPatient?.age || currentToken.age || 35,
        gender: currentPatient?.gender || currentToken.gender || 'Unknown',
        phone: currentPatient?.phone || currentToken.phone || '-',
        tokenNo: currentToken.tokenNo,
        doctor: 'Dr. Arvind Ramesh, MD (Gen Med)',
        date: existingRx?.date || new Date().toISOString().split('T')[0],
        vitals: currentPatient?.vitals || currentToken.vitals || {},
        clinicalNotes: clinicalNotes || 'Follow-up clinical assessment and symptom evaluation.',
        diagnosis: diagnosis || 'Clinical evaluation and prescription.',
        items: rxItems,
        totalAmount: rxItems.reduce((sum, it) => sum + (Number(it.qty || 1) * Number(it.unitPrice || 0)), 0)
      };
      openPrescriptionPrint(rxToPrint);
    } else if (existingRx) {
      openPrescriptionPrint(existingRx);
    } else {
      alert('Please add at least one medication before printing prescription.');
    }
  };

  // Print OPD Consultation Bill / Cash Receipt
  const handlePrintConsultationBill = () => {
    if (!currentToken) return;
    openBillReceipt(currentToken);
  };

  // Issue e-Prescription & Forward to Pharmacy
  const handleIssuePrescription = () => {
    if (!currentToken || rxItems.length === 0) {
      alert('Please add at least one medication');
      return;
    }
    const tokenNo = currentToken.tokenNo;
    createPrescription(currentToken.patientId, tokenNo, rxItems, clinicalNotes, diagnosis);
    advanceToNextPatient(tokenNo);
  };

  const openLabReport = () => {
    if (currentPatientLabOrder) {
      setSelectedLabReport(currentPatientLabOrder);
      setIsLabReportModalOpen(true);
    }
  };

  // Filtered medicines for custom UI dropdown
  const filteredDropdownMeds = pharmacyStock.filter(m => {
    const matchesCategory = medCategory === 'All' || m.category === medCategory;
    const matchesQuery = !pharmacySearchQuery || 
      m.name.toLowerCase().includes(pharmacySearchQuery.toLowerCase()) ||
      m.generic.toLowerCase().includes(pharmacySearchQuery.toLowerCase()) ||
      (m.shelfRack && m.shelfRack.toLowerCase().includes(pharmacySearchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isQueueVisible ? '280px minmax(0, 1fr)' : '1fr', gap: '16px', width: '100%' }}>
        
        {/* Left Column: Queue List (Collapsible to give full screen near sidebar) */}
        {isQueueVisible && (
          <div style={{ minWidth: '280px', maxWidth: '300px' }}>
            <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', alignItems: 'center' }}>
                <button 
                  onClick={() => setActiveTab('waiting')}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: activeTab === 'waiting' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'waiting' ? '2.5px solid #059669' : 'none',
                    fontWeight: activeTab === 'waiting' ? 700 : 500,
                    color: activeTab === 'waiting' ? '#0f172a' : '#64748b',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Clock size={14} />
                  <span>Queue ({waitingTokens.length})</span>
                </button>

                <button 
                  onClick={() => setActiveTab('finished')}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: activeTab === 'finished' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'finished' ? '2.5px solid #0284c7' : 'none',
                    fontWeight: activeTab === 'finished' ? 700 : 500,
                    color: activeTab === 'finished' ? '#0f172a' : '#64748b',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Finished ({finishedTokens.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQueueVisible(false)}
                  style={{
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Collapse queue panel to full screen"
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '10px' }}>
              {(activeTab === 'waiting' ? waitingTokens : finishedTokens).map((tok) => {
                // Determine if this patient is currently active in the consultation desk
                const isCurrentTurn = activeTab === 'waiting' && currentToken?.tokenNo === tok.tokenNo;
                
                // Calculate queue rank for other waiting patients
                const otherWaitingList = activeOpdTokens.filter(t => t.tokenNo !== currentToken?.tokenNo);
                const waitIndex = otherWaitingList.findIndex(t => t.tokenNo === tok.tokenNo);

                return (
                  <div
                    key={tok.tokenNo}
                    onClick={() => handleSelectToken(tok)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      border: isCurrentTurn 
                        ? '2px solid #059669' 
                        : '1px solid #e2e8f0',
                      borderLeft: isCurrentTurn 
                        ? '5px solid #059669' 
                        : '1px solid #e2e8f0',
                      background: isCurrentTurn ? '#f0fdf4' : '#ffffff',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isCurrentTurn ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span 
                          className="token-chip" 
                          style={{ 
                            fontSize: '11px', 
                            padding: '2px 7px',
                            background: isCurrentTurn ? '#059669' : '#0d2847',
                            color: '#ffffff',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            wordBreak: 'keep-all',
                            flexShrink: 0,
                            display: 'inline-block'
                          }}
                        >
                          {tok.tokenNo}
                        </span>

                        {/* Explicit Current Turn Badge */}
                        {isCurrentTurn && (
                          <span style={{ 
                            background: '#059669', 
                            color: '#ffffff', 
                            borderRadius: '4px', 
                            padding: '2px 7px', 
                            fontSize: '10.5px', 
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            letterSpacing: '0.3px'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a7f3d0' }} />
                            CURRENT TURN
                          </span>
                        )}

                        {/* Special Lab Tags */}
                        {tok.status === 'lab-investigation' && (
                          <span style={{ 
                            background: '#f3e8ff', 
                            color: '#7c3aed', 
                            border: '1px solid #d8b4fe', 
                            borderRadius: '4px', 
                            padding: '1px 6px', 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '3px' 
                          }}>
                            <FlaskConical size={10} /> Lab
                          </span>
                        )}
                        {tok.type === 'Lab Review' && (
                          <span style={{ 
                            background: '#eff6ff', 
                            color: '#1d4ed8', 
                            border: '1px solid #bfdbfe', 
                            borderRadius: '4px', 
                            padding: '1px 6px', 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '3px' 
                          }}>
                            <FileText size={10} /> Lab Return
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {tok.createdAt}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                      {tok.patientName}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {tok.age}Y &bull; {tok.gender} &bull; {tok.patientId}
                    </div>

                    {/* Queue Status Details (Clear queue order instead of waiting for all) */}
                    <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {isCurrentTurn ? (
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> In Cabin (Consulting)
                        </span>
                      ) : tok.status === 'lab-investigation' ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed' }}>
                          Testing at Pathology Lab
                        </span>
                      ) : activeTab === 'finished' ? (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>
                          Visit Completed
                        </span>
                      ) : waitIndex === 0 ? (
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: '#b45309',
                          background: '#fef3c7',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          Next in Line (Wait #1)
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          Waiting in Lounge (Wait #{waitIndex + 1})
                        </span>
                      )}
                      <ChevronRight size={13} color={isCurrentTurn ? '#059669' : '#94a3b8'} />
                    </div>
                  </div>
                );
              })}

              {(activeTab === 'waiting' ? waitingTokens : finishedTokens).length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8', fontSize: '12px' }}>
                  No tokens in this queue
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Right Main Column: Consultation Desk (Full Screen near Sidebar) */}
        <div style={{ minWidth: 0, width: '100%' }}>
          {currentToken && currentPatient ? (
            <div>
              {/* Minimal Top Queue Ribbon (Provides instant patient switching & queue toggle) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 12px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                    <Users size={13} color="#0284c7" />
                    <span>Patient Queue:</span>
                  </div>

                  {/* Token Switcher Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                    {waitingTokens.map(tok => {
                      const isCurrent = currentToken?.tokenNo === tok.tokenNo;
                      return (
                        <button
                          key={tok.tokenNo}
                          type="button"
                          onClick={() => handleSelectToken(tok)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '5px',
                            background: isCurrent ? '#059669' : '#f8fafc',
                            color: isCurrent ? '#ffffff' : '#334155',
                            border: isCurrent ? '1px solid #059669' : '1px solid #e2e8f0',
                            fontSize: '11px',
                            fontWeight: isCurrent ? 700 : 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{tok.tokenNo}</span>
                          <span>{tok.patientName}</span>
                          {isCurrent && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a7f3d0' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQueueVisible(!isQueueVisible)}
                  style={{
                    background: isQueueVisible ? '#eff6ff' : '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '3px 9px',
                    color: '#0284c7',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                  title={isQueueVisible ? "Collapse queue panel to full screen" : "Show side queue panel"}
                >
                  {isQueueVisible ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
                  <span>{isQueueVisible ? 'Collapse to Full Screen' : `Show Queue Panel (${waitingTokens.length})`}</span>
                </button>
              </div>

              {/* Patient Banner with Explicit Current Turn Status & Vitals (Clean White Background) */}
              <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="token-chip" style={{ background: '#059669', color: '#ffffff', padding: '3px 8px', fontWeight: 800, whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0 }}>
                        {currentToken.tokenNo}
                      </span>
                      <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {currentPatient.fullName}
                      </h2>
                      <span className="patient-id-badge" style={{ background: '#f1f5f9', color: '#0284c7', borderColor: '#cbd5e1', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0 }}>
                        {currentPatient.id}
                      </span>
                      <span style={{ 
                        background: '#ecfdf5', 
                        color: '#065f46', 
                        border: '1px solid #a7f3d0',
                        borderRadius: '4px', 
                        padding: '2px 8px', 
                        fontSize: '10.5px', 
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        wordBreak: 'keep-all',
                        flexShrink: 0
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                        CURRENT TURN
                      </span>
                      <button
                        type="button"
                        onClick={() => openPatientDossier(currentPatient)}
                        style={{
                          background: '#ffffff',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="View complete 360° medical history, past visits, vitals, and reports"
                      >
                        <FileText size={11} />
                        <span>All Visits Dossier</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <strong style={{ color: '#334155' }}>{currentPatient.age} Years</strong> &bull; {currentPatient.gender} &bull; Blood: <strong style={{ color: '#dc2626' }}>{currentPatient.bloodGroup || 'O+'}</strong> &bull; Phone: {currentPatient.phone}
                    </div>
                  </div>

                  {/* Vitals Ribbon & Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      <div style={{ textAlign: 'center', minWidth: '65px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>BP (mmHg)</span>
                        <strong style={{ fontSize: '12.5px', color: '#0284c7', whiteSpace: 'nowrap' }}>{currentPatient.vitals?.bp || '-'}</strong>
                      </div>
                      <div style={{ width: '1px', height: '22px', background: '#e2e8f0' }}></div>
                      <div style={{ textAlign: 'center', minWidth: '55px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>Weight</span>
                        <strong style={{ fontSize: '12.5px', color: '#0284c7', whiteSpace: 'nowrap' }}>{currentPatient.vitals?.weight} kg</strong>
                      </div>
                      <div style={{ width: '1px', height: '22px', background: '#e2e8f0' }}></div>
                      <div style={{ textAlign: 'center', minWidth: '55px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>Pulse</span>
                        <strong style={{ fontSize: '12.5px', color: '#0284c7', whiteSpace: 'nowrap' }}>{currentPatient.vitals?.pulse} bpm</strong>
                      </div>
                      <div style={{ width: '1px', height: '22px', background: '#e2e8f0' }}></div>
                      <div style={{ textAlign: 'center', minWidth: '50px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>SpO2</span>
                        <strong style={{ fontSize: '12.5px', color: '#0284c7', whiteSpace: 'nowrap' }}>{currentPatient.vitals?.spo2}%</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Quick Print Prescription Button */}
                      <button 
                        type="button"
                        className="btn-secondary-clean" 
                        style={{ padding: '7px 11px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', whiteSpace: 'nowrap', fontWeight: 700 }}
                        onClick={handlePrintCurrentPrescription}
                        title="Preview & Print Official Medical Prescription (A4 Slip)"
                      >
                        <Printer size={14} color="#059669" />
                        <span>Print Rx</span>
                      </button>

                      {/* Quick Print Consultation Bill Button */}
                      <button 
                        type="button"
                        className="btn-secondary-clean" 
                        style={{ padding: '7px 11px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd', whiteSpace: 'nowrap', fontWeight: 700 }}
                        onClick={handlePrintConsultationBill}
                        title="Print Official OPD Consultation Fee Bill / Cashier Receipt"
                      >
                        <Receipt size={14} color="#0284c7" />
                        <span>Print Bill</span>
                      </button>

                      {/* Live Call to Waiting Room Token TV */}
                      <button 
                        type="button"
                        className="btn-secondary-clean" 
                        style={{ padding: '7px 11px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7', whiteSpace: 'nowrap', fontWeight: 600 }}
                        onClick={() => {
                          if (callTokenLive && currentToken) {
                            callTokenLive({
                              tokenNo: currentToken.tokenNo,
                              patientName: currentToken.patientName,
                              room: 'Consultation Room 102'
                            });
                            showToast(`Calling Token ${currentToken.tokenNo} on Waiting Lounge TV`);
                          }
                        }}
                        title="Broadcast patient call with harmonic chime and voice announcement to Waiting Room TV"
                      >
                        <Volume2 size={13} />
                        <span>Call on TV</span>
                      </button>

                      {/* Conclude Patient & Call Next Button */}
                      <button 
                        className="btn-primary-amber" 
                        style={{ padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', background: '#059669', borderColor: '#047857' }}
                        onClick={handleConcludeVisit}
                        title="Conclude current consultation and advance to next waiting patient"
                      >
                        <UserCheck size={14} />
                        <span>Finish & Call Next</span>
                      </button>

                      {/* Space Mode / Queue Toggle */}
                      <button 
                        type="button"
                        className="btn-secondary-clean" 
                        style={{ 
                          padding: '7px 11px', 
                          fontSize: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          background: isQueueVisible ? '#eff6ff' : '#f8fafc', 
                          color: isQueueVisible ? '#0284c7' : '#475569', 
                          border: isQueueVisible ? '1px solid #bfdbfe' : '1px solid #cbd5e1', 
                          whiteSpace: 'nowrap', 
                          fontWeight: 600 
                        }}
                        onClick={() => setIsQueueVisible(!isQueueVisible)}
                        title={isQueueVisible ? "Collapse Queue for Maximum Full Screen Workspace" : "Show Side Queue Panel"}
                      >
                        {isQueueVisible ? <Maximize2 size={13} color="#0284c7" /> : <PanelLeftOpen size={13} />}
                        <span>{isQueueVisible ? 'Full Screen (Max Space)' : 'Show Queue'}</span>
                      </button>

                      <button 
                        type="button"
                        className="btn-secondary-clean" 
                        style={{ padding: '7px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          setSelectedTokenNo(null);
                          showToast('Consultation desk closed.');
                        }}
                        title="Close consultation tab"
                      >
                        <X size={13} />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lab Investigation Active State Alert */}
              {currentToken.status === 'lab-investigation' && (
                <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(124, 58, 237, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FlaskConical size={20} color="#7c3aed" />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#5b21b6' }}>
                        Patient Forwarded to Laboratory for Blood/Urine Tests
                      </strong>
                      <div style={{ fontSize: '12px', color: '#6d28d9', marginTop: '2px' }}>
                        Specimen collection in progress at Pathology Lab. You can finish this consultation and call the next patient.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-primary-amber" 
                      style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', borderColor: '#047857' }}
                      onClick={handleConcludeVisit}
                    >
                      <UserCheck size={14} />
                      <span>Finish & Call Next Patient</span>
                    </button>
                    <button 
                      className="btn-navy" 
                      style={{ background: '#7c3aed', borderColor: '#6d28d9', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => advanceToNextPatient(currentToken.tokenNo)}
                    >
                      <span>Skip / Next</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Lab Order / Lab Report Verification Alert */}
              {currentPatientLabOrder && currentPatientLabOrder.overallStatus === 'completed' && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#10b981" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#065f46' }}>
                        Diagnostic Lab Report Ready and Verified
                      </strong>
                      <div style={{ fontSize: '11.5px', color: '#047857' }}>
                        Verified by Dr. K. Shalini (Pathologist) &bull; Summary dispatched via WhatsApp
                      </div>
                    </div>
                  </div>
                  <button className="btn-navy" style={{ background: '#065f46', borderColor: '#059669', padding: '4px 10px', fontSize: '12px' }} onClick={openLabReport}>
                    <FileText size={13} />
                    <span>View Lab Report</span>
                  </button>
                </div>
              )}

              {/* Section 1: Clinical Symptoms & Notes */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div className="form-card-header">
                  <div className="form-card-icon">
                    <FileText size={16} />
                  </div>
                  <h3 className="form-card-title">Clinical Findings & Diagnosis</h3>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Provisional / Clinical Diagnosis:
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={diagnosis} 
                    onChange={(e) => setDiagnosis(e.target.value)} 
                    placeholder="e.g. Acute Viral Pyrexia, URTI, Hypertension..."
                    style={{ fontSize: '13px', fontWeight: 600, padding: '7px 10px', color: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {['Viral Pyrexia', 'Acute URTI', 'Type 2 Diabetes', 'Essential Hypertension', 'Acute Gastritis / GERD', 'Allergic Bronchitis', 'Migraine'].map(diag => (
                      <span
                        key={diag}
                        onClick={() => setDiagnosis(diag)}
                        style={{
                          fontSize: '10.5px',
                          background: diagnosis === diag ? '#0284c7' : '#f1f5f9',
                          color: diagnosis === diag ? '#ffffff' : '#475569',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          border: '1px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Clinical Assessment & Examination Notes:
                  </label>
                  <textarea 
                    className="form-textarea" 
                    rows="2"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Enter clinical assessment, physical findings, complaints..."
                  />
                </div>
              </div>

              {/* Section 2: Laboratory Test Order */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div className="form-card-header">
                  <div className="form-card-icon" style={{ color: '#8b5cf6' }}>
                    <FlaskConical size={16} />
                  </div>
                  <div>
                    <h3 className="form-card-title">Order Diagnostic Lab Tests</h3>
                    <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Orders immediately sync with the Diagnostic Lab desk
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { code: 'CBC', name: 'Complete Blood Count (CBC)', tube: 'Purple EDTA' },
                    { code: 'RBS', name: 'Random Blood Sugar (RBS)', tube: 'Grey Fluoride' },
                    { code: 'URINE', name: 'Urine Routine', tube: 'Sterile Cup' },
                    { code: 'LIPID', name: 'Lipid Profile', tube: 'Yellow SST' }
                  ].map(t => {
                    const isChecked = selectedTests.includes(t.code);
                    return (
                      <div 
                        key={t.code}
                        onClick={() => handleTestToggle(t.code)}
                        style={{
                          border: isChecked ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1',
                          background: isChecked ? '#f5f3ff' : '#ffffff',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                        <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px' }}>{t.tube}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Selected Diagnostic Tests ({selectedTests.length}): <strong style={{ color: '#0f172a' }}>{selectedTests.length > 0 ? selectedTests.join(', ') : 'None'}</strong>
                  </div>
                  <button 
                    type="button"
                    className="btn-primary-amber" 
                    style={{ padding: '8px 16px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }} 
                    onClick={handleSendLabOrder}
                  >
                    <FlaskConical size={15} />
                    <span>Send Request to Lab & Call Next Patient</span>
                  </button>
                </div>
              </div>
              {/* Section 3: Smart e-Prescription Studio & Medicine Dispensary */}
              <div className="form-card" style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                
                {/* 1. Sleek Minimal Studio Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#059669', background: '#ecfdf5', padding: '6px', borderRadius: '7px' }}>
                      <Pill size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        e-Prescription & Medicine Studio
                      </h3>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0 0 0' }}>
                        Quick-pick medicines, custom formulation, dosage calculator & pharmacy dispatch
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary-clean"
                      style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 600, borderRadius: '6px' }}
                      onClick={handlePrintCurrentPrescription}
                      title="Preview & print official legal prescription sheet"
                    >
                      <Printer size={13} color="#059669" />
                      <span>Preview / Print Rx</span>
                    </button>
                    <span style={{ fontSize: '11px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Pharmacy Sync Live
                    </span>
                  </div>
                </div>

                {/* 2. Sleek Tab Bar: Category Filters & Custom Drug Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {!isCustomMed ? (
                    <div 
                      className="dark-thin-scrollbar" 
                      style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1, paddingBottom: '9px', marginBottom: '2px' }}
                    >
                      {medCategories.map(cat => {
                        const isSelected = medCategory === cat;
                        const count = cat === 'All' 
                          ? pharmacyStock.length 
                          : pharmacyStock.filter(m => m.category === cat).length;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setMedCategory(cat);
                              setIsCustomMed(false);
                            }}
                            style={{
                              padding: '3px 9px',
                              fontSize: '11px',
                              fontWeight: isSelected ? 600 : 500,
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                              background: isSelected ? '#0f172a' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{cat}</span>
                            <span style={{ 
                              fontSize: '9.5px', 
                              padding: '0 4px', 
                              borderRadius: '4px', 
                              background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#64748b'
                            }}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Edit3 size={13} /> Custom / Special Brand Medication Formulation Mode
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCustomMed(!isCustomMed)}
                    style={{
                      background: isCustomMed ? '#fef3c7' : '#ffffff',
                      color: isCustomMed ? '#b45309' : '#0284c7',
                      border: isCustomMed ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isCustomMed ? <X size={12} /> : <Plus size={12} />}
                    <span>{isCustomMed ? 'Back to In-Stock Catalog' : '+ Custom Drug / Brand'}</span>
                  </button>
                </div>

                {/* 3. Frequently Prescribed (1-Click Quick Pick) - Slim Horizontal Strip */}
                <div 
                  className="dark-thin-scrollbar"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    overflowX: 'auto', 
                    padding: '6px 0 8px 0', 
                    borderTop: '1px solid #f1f5f9', 
                    borderBottom: '1px solid #f1f5f9', 
                    marginBottom: '12px' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                    <Sparkles size={12} color="#f59e0b" />
                    <span>QUICK:</span>
                  </div>
                  {quickPickMedicines.map(qm => {
                    const isPicked = selectedMedToAdd === qm.id && !isCustomMed;
                    return (
                      <button
                        key={qm.id}
                        type="button"
                        onClick={() => handleQuickPick(qm)}
                        style={{
                          background: isPicked ? '#eff6ff' : '#ffffff',
                          color: isPicked ? '#0284c7' : '#334155',
                          border: isPicked ? '1px solid #38bdf8' : '1px solid #e2e8f0',
                          borderRadius: '5px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: isPicked ? 700 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Click to load ${qm.name} (${qm.dosage}, ${qm.timing})`}
                      >
                        <span>{qm.name}</span>
                        <span style={{
                          fontSize: '9.5px',
                          padding: '0 4px',
                          borderRadius: '3px',
                          background: isPicked ? '#dbeafe' : '#f1f5f9',
                          color: isPicked ? '#0369a1' : '#64748b'
                        }}>
                          {qm.dosage}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 4. Unified Medicine Composer (Tier A: Search/Custom + Tier B: Dosage/Duration/Timing/Qty/Notes) */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' }}>
                  
                  {isCustomMed ? (
                    /* Custom formulation inputs */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Brand Name & Strength:
                        </label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Meftal Spas Tablet, Calpol 250mg Syrup"
                          value={customMedName}
                          onChange={(e) => setCustomMedName(e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 10px', height: '34px', background: '#ffffff' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Generic / Active Composition:
                        </label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Mefenamic Acid + Dicyclomine"
                          value={customMedGeneric}
                          onChange={(e) => setCustomMedGeneric(e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 10px', height: '34px', background: '#ffffff' }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* In-Stock Search and Selected Medicine Badge */
                    <div style={{ position: 'relative', marginBottom: '12px' }} ref={pharmacyDropdownRef}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#ffffff',
                          border: isPharmacyDropdownOpen ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          height: '34px',
                          boxSizing: 'border-box'
                        }}>
                          <Search size={14} color="#64748b" />
                          <input 
                            type="text" 
                            placeholder="Search medicine by brand name, generic salt (e.g. Paracetamol, Pantoprazole), or rack..."
                            value={pharmacySearchQuery}
                            onFocus={() => setIsPharmacyDropdownOpen(true)}
                            onChange={(e) => {
                              setPharmacySearchQuery(e.target.value);
                              setIsPharmacyDropdownOpen(true);
                            }}
                            style={{
                              flex: 1,
                              border: 'none',
                              outline: 'none',
                              fontSize: '12px',
                              color: '#0f172a',
                              background: 'transparent'
                            }}
                          />
                          {pharmacySearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPharmacySearchQuery('')}
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {/* Selected Medicine Pill Display */}
                        {selectedMedObj && (
                          <div 
                            onClick={() => setIsPharmacyDropdownOpen(!isPharmacyDropdownOpen)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bae6fd',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxSizing: 'border-box'
                            }}
                            title="Click to view/change selection"
                          >
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                              {selectedMedObj.name}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#0284c7' }}>
                              (₹{selectedMedObj.unitPrice?.toFixed(2)})
                            </span>
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: 600,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: selectedMedObj.isAvailable ? '#ecfdf5' : '#fef2f2',
                              color: selectedMedObj.isAvailable ? '#059669' : '#dc2626'
                            }}>
                              {selectedMedObj.isAvailable ? `${selectedMedObj.stockQty} in stock` : 'Out of Stock'}
                            </span>
                            <ChevronDown size={13} color="#0284c7" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown Options List */}
                      {isPharmacyDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          zIndex: 1000,
                          maxHeight: '250px',
                          overflowY: 'auto'
                        }}>
                          {filteredDropdownMeds.length > 0 ? (
                            filteredDropdownMeds.map(m => {
                              const isSelected = m.id === selectedMedToAdd;
                              return (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setSelectedMedToAdd(m.id);
                                    setIsPharmacyDropdownOpen(false);
                                    setPharmacySearchQuery('');
                                    if (m.category.includes('Analgesic')) {
                                      setActiveDosage('1-0-1');
                                      setDoseTiming('After Food');
                                      setDoseDuration('3 Days');
                                      setDoseQty(6);
                                    } else if (m.category.includes('Gastro')) {
                                      setActiveDosage('1-0-0');
                                      setDoseTiming('Before Food');
                                      setDoseDuration('5 Days');
                                      setDoseQty(5);
                                    } else if (m.category.includes('Allergy')) {
                                      setActiveDosage('0-0-1');
                                      setDoseTiming('At Bedtime');
                                      setDoseDuration('5 Days');
                                      setDoseQty(5);
                                    }
                                    showToast(`Selected ${m.name}`);
                                  }}
                                  style={{
                                    padding: '7px 12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: isSelected ? '#eff6ff' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = '#ffffff';
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{m.name}</strong>
                                      <span style={{ fontSize: '10px', color: '#0284c7', background: '#e0f2fe', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                                        {m.dosageForm || 'Tablet'}
                                      </span>
                                      <span style={{ fontSize: '10px', color: '#475569', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px' }}>
                                        {m.category}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                                      Salt: <em>{m.generic}</em> &bull; Shelf: <strong>{m.shelfRack || 'A1'}</strong>
                                    </div>
                                  </div>

                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                      fontSize: '11px', 
                                      fontWeight: 600,
                                      color: m.isAvailable ? '#059669' : '#dc2626'
                                    }}>
                                      {m.isAvailable ? `In Stock (${m.stockQty})` : 'Out of Stock'}
                                    </div>
                                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', marginTop: '1px' }}>
                                      ₹{m.unitPrice?.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                              No medicines match "{pharmacySearchQuery}". Click "+ Custom Drug / Brand" above to prescribe it.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tier B: Dosage, Duration, Timing, Qty, Instructions & Add Button */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(190px, 1.3fr) minmax(120px, 0.9fr) minmax(130px, 1fr) minmax(60px, 0.4fr) minmax(180px, 1.5fr) auto',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    
                    {/* Dosage */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          Dosage (M-A-N):
                        </label>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {['1-0-1', '1-1-1', '1-0-0', '0-0-1', 'SOS'].map(preset => (
                            <span 
                              key={preset}
                              onClick={() => {
                                setActiveDosage(preset);
                                setDoseQty(calculateAutoQty(preset, doseDuration));
                              }}
                              style={{ 
                                fontSize: '8.5px', 
                                padding: '1px 4px', 
                                background: activeDosage === preset ? '#0f172a' : '#ffffff', 
                                color: activeDosage === preset ? '#ffffff' : '#64748b', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '3px', 
                                cursor: 'pointer', 
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }}
                              title={`Set dosage to ${preset}`}
                            >
                              {preset}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="text" 
                          value={activeDosage}
                          onChange={(e) => {
                            setActiveDosage(e.target.value);
                            setDoseQty(calculateAutoQty(e.target.value, doseDuration));
                          }}
                          placeholder="e.g. 1-0-1"
                          className="form-input"
                          style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', padding: '5px 8px', height: '34px', background: '#ffffff' }}
                        />
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              setActiveDosage(e.target.value);
                              setDoseQty(calculateAutoQty(e.target.value, doseDuration));
                            }
                          }}
                          style={{
                            width: '26px',
                            padding: '0',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            background: '#ffffff',
                            cursor: 'pointer',
                            height: '34px'
                          }}
                          title="Choose standard clinical dosage preset"
                        >
                          <option value="">▼</option>
                          {dosagePresets.map(dp => (
                            <option key={dp.label} value={dp.label}>{dp.label} - {dp.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          Duration:
                        </label>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {['3d', '5d', '7d', '14d'].map(d => (
                            <span 
                              key={d}
                              onClick={() => {
                                const val = d === '3d' ? '3 Days' : d === '5d' ? '5 Days' : d === '7d' ? '7 Days' : '14 Days';
                                setDoseDuration(val);
                                setDoseQty(calculateAutoQty(activeDosage, val));
                              }}
                              style={{ 
                                fontSize: '8.5px', 
                                padding: '1px 4px', 
                                background: doseDuration.includes(d.replace('d', '')) ? '#0f172a' : '#ffffff', 
                                color: doseDuration.includes(d.replace('d', '')) ? '#ffffff' : '#64748b', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '3px', 
                                cursor: 'pointer', 
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={doseDuration} 
                        onChange={(e) => {
                          setDoseDuration(e.target.value);
                          setDoseQty(calculateAutoQty(activeDosage, e.target.value));
                        }}
                        placeholder="e.g. 5 Days"
                        className="form-input"
                        style={{ padding: '5px 8px', fontSize: '12px', height: '34px', background: '#ffffff' }}
                      />
                    </div>

                    {/* Food Timing */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Food Timing:
                      </label>
                      <select 
                        value={doseTiming} 
                        onChange={(e) => setDoseTiming(e.target.value)}
                        className="form-select"
                        style={{ 
                          padding: '5px 8px', 
                          fontSize: '11.5px',
                          fontWeight: 600,
                          height: '34px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="With Food">With Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                        <option value="At Bedtime">At Bedtime</option>
                      </select>
                    </div>

                    {/* Qty */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Qty:
                      </label>
                      <input 
                        type="number" 
                        value={doseQty} 
                        min="1"
                        onChange={(e) => setDoseQty(e.target.value)}
                        className="form-input"
                        style={{ padding: '5px 6px', fontSize: '12px', textAlign: 'center', fontWeight: 700, height: '34px', background: '#ffffff' }}
                      />
                    </div>

                    {/* Doctor Instructions */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Doctor Instructions:
                      </label>
                      <input 
                        type="text" 
                        value={doseInstructions} 
                        onChange={(e) => setDoseInstructions(e.target.value)}
                        placeholder="e.g. With warm water after food"
                        className="form-input"
                        style={{ padding: '5px 8px', fontSize: '11.5px', height: '34px', background: '#ffffff' }}
                      />
                    </div>

                    {/* Add to Rx Button */}
                    <div>
                      <label style={{ fontSize: '11px', color: 'transparent', display: 'block', marginBottom: '3px' }}>Add</label>
                      <button 
                        type="button" 
                        onClick={handleAddMed}
                        style={{ 
                          padding: '0 14px', 
                          fontSize: '12px', 
                          fontWeight: 700,
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          height: '34px', 
                          whiteSpace: 'nowrap',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        <Plus size={14} />
                        <span>Add to Rx</span>
                      </button>
                    </div>

                  </div>

                </div>

                {/* PRESCRIBED ITEMS TABLE WITH INLINE EDITING */}
                <div className="modern-table-container" style={{ marginBottom: '14px' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35px', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Medicine & Formulation</th>
                        <th style={{ width: '160px', whiteSpace: 'nowrap' }}>Dosage (M-A-N / Edit)</th>
                        <th style={{ width: '90px', whiteSpace: 'nowrap' }}>Duration</th>
                        <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Food Timing</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Doctor Instructions</th>
                        <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Qty</th>
                        <th style={{ textAlign: 'right', width: '50px', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rxItems.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                              {item.name}
                            </div>
                            {item.generic && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Salt: {item.generic}
                              </div>
                            )}
                          </td>

                          {/* Editable Dosage Input with inline preset dropdown */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input 
                                type="text"
                                value={item.dosage || '1-0-1'}
                                onChange={(e) => updateItemDosage(idx, e.target.value)}
                                style={{
                                  width: '75px',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #93c5fd',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: '#0369a1',
                                  background: '#f0f9ff'
                                }}
                                title="Type custom dosage (e.g. 1-0-1, SOS, 1 tab OD)"
                              />
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateItemDosage(idx, e.target.value);
                                  }
                                }}
                                style={{
                                  padding: '2px',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '3px',
                                  background: '#f8fafc',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                                title="Choose dosage preset"
                              >
                                <option value="">▼</option>
                                <option value="1-0-1">1-0-1 (BD)</option>
                                <option value="1-1-1">1-1-1 (TDS)</option>
                                <option value="1-0-0">1-0-0 (OD-M)</option>
                                <option value="0-0-1">0-0-1 (Night)</option>
                                <option value="1-1-1-1">1-1-1-1 (QID)</option>
                                <option value="0-1-0">0-1-0 (Noon)</option>
                                <option value="SOS">SOS (If needed)</option>
                                <option value="STAT">STAT (Immediate)</option>
                                <option value="5ml BD">5ml BD</option>
                              </select>
                            </div>
                          </td>

                          {/* Editable Duration */}
                          <td>
                            <input 
                              type="text" 
                              value={item.duration} 
                              onChange={(e) => updateItemField(idx, 'duration', e.target.value)}
                              style={{ width: '75px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px' }}
                            />
                          </td>

                          {/* Editable Food Timing */}
                          <td>
                            <select 
                              value={item.timing || 'After Food'}
                              onChange={(e) => updateItemField(idx, 'timing', e.target.value)}
                              style={{ 
                                padding: '3px 6px', 
                                borderRadius: '5px', 
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: item.timing === 'Before Food' ? '1px solid #f59e0b' : item.timing === 'Empty Stomach' ? '1px solid #a855f7' : '1px solid #10b981',
                                background: item.timing === 'Before Food' ? '#fffbeb' : item.timing === 'Empty Stomach' ? '#faf5ff' : '#f0fdf4',
                                color: item.timing === 'Before Food' ? '#b45309' : item.timing === 'Empty Stomach' ? '#7e22ce' : '#15803d'
                              }}
                            >
                              <option value="After Food">After Food</option>
                              <option value="Before Food">Before Food</option>
                              <option value="With Food">With Food</option>
                              <option value="Empty Stomach">Empty Stomach</option>
                              <option value="At Bedtime">At Bedtime</option>
                            </select>
                          </td>

                          {/* Editable Doctor Instructions */}
                          <td>
                            <input 
                              type="text" 
                              value={item.instructions || ''} 
                              placeholder="e.g. With warm water"
                              onChange={(e) => updateItemField(idx, 'instructions', e.target.value)}
                              style={{ width: '100%', minWidth: '130px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                            />
                          </td>

                          {/* Editable Qty */}
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={item.qty} 
                              min="1"
                              onChange={(e) => updateItemField(idx, 'qty', Number(e.target.value))}
                              style={{ width: '45px', padding: '3px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', textAlign: 'center', fontWeight: 800 }}
                            />
                          </td>

                          {/* Action Delete */}
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveMed(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="Remove medication"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {rxItems.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12.5px' }}>
                            No medications added yet. Pick from the frequent chips above or search medicine catalogue.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM PRESCRIPTION ACTIONS ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Official Prescription Print Button */}
                    <button 
                      type="button" 
                      className="btn-secondary-clean" 
                      onClick={handlePrintCurrentPrescription}
                      style={{ 
                        padding: '8px 14px', 
                        fontSize: '12.5px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: '#ecfdf5', 
                        color: '#065f46', 
                        border: '1.5px solid #a7f3d0', 
                        fontWeight: 700 
                      }}
                      title="Preview and print official legal doctor prescription"
                    >
                      <Printer size={15} color="#059669" />
                      <span>Preview & Print Prescription (Rx)</span>
                    </button>

                    {/* Official Consultation Bill Print Button */}
                    <button 
                      type="button" 
                      className="btn-secondary-clean" 
                      onClick={handlePrintConsultationBill}
                      style={{ 
                        padding: '8px 14px', 
                        fontSize: '12.5px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: '#f0f9ff', 
                        color: '#0369a1', 
                        border: '1.5px solid #bae6fd', 
                        fontWeight: 700 
                      }}
                      title="Print official OPD Consultation receipt"
                    >
                      <Receipt size={15} color="#0284c7" />
                      <span>Print Consultation Bill (Receipt)</span>
                    </button>
                  </div>

                  {/* Primary Issue e-Prescription Button */}
                  <button 
                    type="button" 
                    className="btn-primary-amber" 
                    onClick={handleIssuePrescription} 
                    style={{ 
                      background: '#059669', 
                      borderColor: '#047857', 
                      padding: '9px 18px', 
                      fontSize: '13px', 
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={15} />
                    <span>Issue e-Prescription & Forward to Pharmacy (Call Next Patient)</span>
                  </button>
              </div>
              </div>
            </div>
          ) : (
            <div className="form-card" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <Stethoscope size={42} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#0f172a', fontWeight: 700 }}>All Waiting Patients Completed</h3>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                There are currently no more pending tokens in your queue. When reception registers a new patient or a lab test completes, their token will appear on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
