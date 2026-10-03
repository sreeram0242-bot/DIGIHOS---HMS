import React, { useState } from 'react';
import { 
  Pill, 
  Barcode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Receipt, 
  TrendingDown, 
  Printer,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  X,
  LayoutGrid,
  List,
  Coins,
  Stethoscope,
  FileText,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const PharmacyPortal = () => {
  const { 
    prescriptions, 
    pharmacyStock, 
    dispensePrescription, 
    updatePharmacyStockQty,
    addPharmacyItem,
    setIsScannerOpen, 
    patients, 
    showToast,
    activePharmacyTab,
    setActivePharmacyTab,
    setIsPharmacyInvoiceModalOpen,
    setSelectedRxForInvoice,
    openPatientDossier,
    openPrescriptionPrint,
    openBillReceipt,
    isPharmacySidebarOpen,
    setIsPharmacySidebarOpen
  } = useHospital();

  // Top tabs: 'dispense' (Prescription Dispense Queue) or 'stocks' (Live Pharmacy Stock Master)
  const activeTab = activePharmacyTab || 'dispense';
  const setActiveTab = setActivePharmacyTab || (() => {});
  const [selectedRxId, setSelectedRxId] = useState(prescriptions[0]?.prescriptionId || null);

  // Stock Master Filters & View Mode
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockViewMode, setStockViewMode] = useState('categories'); // 'categories' | 'table'
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // Add Medicine Form
  const [newMed, setNewMed] = useState({
    name: '',
    generic: '',
    category: 'Analgesics & Pain Relief',
    dosageForm: 'Tablet',
    manufacturer: '',
    unitPrice: 5.0,
    mrp: 6.5,
    stockQty: 100,
    minStockLevel: 30,
    batch: 'BT-900',
    expiry: '12/2028',
    shelfRack: 'Rack A - Shelf 01'
  });

  const currentRx = prescriptions.find(p => p.prescriptionId === selectedRxId) || prescriptions[0];
  const patient = currentRx 
    ? (patients.find(p => p.id === currentRx.patientId) || {
        id: currentRx.patientId,
        fullName: currentRx.patientName || 'Patient',
        age: 35,
        gender: 'Male',
        phone: '9842188720',
        barcode: '2026001',
        nfcUid: 'NFC-A18F90C2'
      })
    : null;

  // Categories list
  const categories = [
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

  // Live Stock KPIs (Always calculated in real-time)
  const totalSKUs = pharmacyStock.length;
  const totalUnitsInStock = pharmacyStock.reduce((sum, m) => sum + m.stockQty, 0);
  const totalValuation = pharmacyStock.reduce((sum, m) => sum + (m.stockQty * (m.unitPrice || 10)), 0);
  const lowStockCount = pharmacyStock.filter(m => m.stockQty > 0 && m.stockQty <= (m.minStockLevel || 30)).length;
  const outOfStockCount = pharmacyStock.filter(m => m.stockQty === 0).length;

  // Filtered medicines in Stock Master
  const filteredStock = pharmacyStock.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const q = stockSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      m.name.toLowerCase().includes(q) ||
      m.generic.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.batch && m.batch.toLowerCase().includes(q)) ||
      (m.shelfRack && m.shelfRack.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleDispense = () => {
    if (!currentRx) return;
    dispensePrescription(currentRx.prescriptionId);
  };

  const handlePrintPharmacyInvoice = () => {
    if (!currentRx) return;
    setSelectedRxForInvoice(currentRx);
    setIsPharmacyInvoiceModalOpen(true);
  };

  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name) return;
    addPharmacyItem(newMed);
    setShowAddMedModal(false);
    setNewMed({
      name: '',
      generic: '',
      category: 'Analgesics & Pain Relief',
      dosageForm: 'Tablet',
      manufacturer: '',
      unitPrice: 5.0,
      mrp: 6.5,
      stockQty: 100,
      minStockLevel: 30,
      batch: 'BT-900',
      expiry: '12/2028',
      shelfRack: 'Rack A - Shelf 01'
    });
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* ALWAYS-VISIBLE LIVE STOCK SUMMARY RIBBON */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Medicines</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {totalSKUs} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Formulations</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }}></div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Live Stock Count</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              {totalUnitsInStock.toLocaleString()} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Total Units</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }}></div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Inventory Value</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>
              INR {totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }}></div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Low Stock Alert</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
              {lowStockCount} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Reorder Needed</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }}></div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Out of Stock</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
              {outOfStockCount} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>Critical</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <CheckCircle2 size={13} /> Live Stock Synchronized
          </span>
          <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => setIsScannerOpen(true)}>
            <Barcode size={14} />
            <span>Scan Tag</span>
          </button>
        </div>
      </div>

      {/* Top Header with Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            Pharmacy Dispensing & Inventory Master
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Category-wise medicine ledger, batch tracking, shelf racks & real-time stock deduction
          </p>
        </div>

        {/* Controls: Sidebar Toggle Button & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary-clean"
            onClick={() => setIsPharmacySidebarOpen(prev => !prev)}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isPharmacySidebarOpen ? '#0d2847' : '#ffffff',
              color: isPharmacySidebarOpen ? '#ffffff' : '#0d2847',
              borderColor: '#0d2847',
              cursor: 'pointer'
            }}
            title={isPharmacySidebarOpen ? "Hide Navigation Sidebar" : "Open Navigation Sidebar"}
          >
            {isPharmacySidebarOpen ? (
              <>
                <PanelLeftClose size={15} color="#ffffff" />
                <span>Hide Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen size={15} color="#e59500" />
                <span>Open Sidebar</span>
              </>
            )}
          </button>

          {/* Tab Switcher: Dispensing vs Stocks Master */}
          <div className="tab-pills-row">
            <button 
              className={`tab-pill-btn ${activeTab === 'dispense' ? 'active' : ''}`}
              onClick={() => setActiveTab('dispense')}
            >
              <Pill size={14} />
              <span>Prescription Queue ({prescriptions.filter(p => p.dispensedStatus === 'pending').length})</span>
            </button>

            <button 
              className={`tab-pill-btn ${activeTab === 'stocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('stocks')}
            >
              <Package size={14} />
              <span>Live Stock Master ({pharmacyStock.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRESCRIPTION DISPENSING COUNTER */}
      {/* ========================================================================= */}
      {activeTab === 'dispense' && (
        <div style={{ display: 'grid', gridTemplateColumns: '275px minmax(0, 1fr)', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Left: Rx Queue */}
          <div style={{ minWidth: 0 }}>
            <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Doctor Prescriptions Queue ({prescriptions.length})
              </div>

              <div style={{ maxHeight: '560px', overflowY: 'auto', padding: '10px' }}>
                {prescriptions.map(rx => {
                  const isSelected = currentRx?.prescriptionId === rx.prescriptionId;
                  const isDispensed = rx.dispensedStatus === 'dispensed';

                  return (
                    <div
                      key={rx.prescriptionId}
                      onClick={() => setSelectedRxId(rx.prescriptionId)}
                      style={{
                        padding: '12px',
                        borderRadius: '7px',
                        border: isSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11.5px', color: '#0f172a' }}>
                          {rx.prescriptionId}
                        </span>
                        <span className="token-chip" style={{ fontSize: '10.5px', padding: '2px 5px' }}>
                          {rx.tokenNo}
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                        {rx.patientName}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        ID: {rx.patientId} &bull; Dr: {rx.doctor}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                        Items: {(rx.items || []).map(i => i.name).join(', ')}
                      </div>

                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                          INR {Number(rx.totalAmount || 0).toFixed(2)}
                        </span>
                        {isDispensed ? (
                          <span className="status-pill completed" style={{ fontSize: '10.5px' }}>
                            <CheckCircle2 size={11} /> Dispensed
                          </span>
                        ) : (
                          <span className="status-pill waiting" style={{ fontSize: '10.5px' }}>
                            Pending Dispense
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-secondary-clean"
                          style={{ flex: 1, padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPrescriptionPrint(rx);
                          }}
                          title="Print Official Doctor's Prescription"
                        >
                          <Stethoscope size={12} />
                          <span>Print Rx</span>
                        </button>
                        <button
                          type="button"
                          className="btn-secondary-clean"
                          style={{ flex: 1, padding: '3px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openBillReceipt(rx);
                          }}
                          title="Print Hospital Billing Receipt"
                        >
                          <Receipt size={12} />
                          <span>Print Bill</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Prescribed Items Picklist with Shelf Location & Batch */}
          <div style={{ minWidth: 0, width: '100%' }}>
            {currentRx && patient ? (
              <div>
                {/* Patient Banner */}
                <div style={{ background: '#0a1f36', color: '#ffffff', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="token-chip" style={{ background: '#10b981', color: '#ffffff', padding: '3px 8px' }}>
                        {currentRx.tokenNo}
                      </span>
                      <h3 
                        style={{ fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => openPatientDossier(patient)}
                        title="Click to view complete 360° medical history dossier"
                      >
                        <span>{currentRx.patientName}</span>
                      </h3>
                      <span className="patient-id-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#bae6fd', fontSize: '11px' }}>
                        {currentRx.patientId}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#92a9bf', marginTop: '3px' }}>
                      {patient.age}Y &bull; {patient.gender} &bull; Phone: {patient.phone} &bull; Prescribed by: {currentRx.doctor}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', color: '#92a9bf' }}>Billing Clearance</div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                      <CheckCircle2 size={13} /> Pre-Paid at Reception
                    </span>
                  </div>
                </div>

                {/* Medicine Pick List with Shelf Rack & Batch details */}
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="form-card-icon" style={{ color: '#10b981' }}>
                        <Pill size={16} />
                      </div>
                      <div>
                        <h3 className="form-card-title">Medicine Verification & Packing List</h3>
                        <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Locate items by Shelf Rack and verify batch numbers before dispensing
                        </p>
                      </div>
                    </div>

                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Total Bill: INR {Number(currentRx.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="modern-table-container" style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="modern-table" style={{ width: '100%', minWidth: '680px' }}>
                      <thead>
                        <tr>
                          <th>Medicine & Category</th>
                          <th>Shelf / Rack</th>
                          <th>Batch & Expiry</th>
                          <th>Dosage & Timing</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th>Stock Status</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(currentRx.items || []).map((item, idx) => {
                          const stockMatch = pharmacyStock.find(m => m.id === item.medicineId);
                          const hasEnoughStock = stockMatch ? stockMatch.stockQty >= item.qty : false;

                          return (
                            <tr key={idx}>
                              <td>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {stockMatch ? stockMatch.category : 'General Pharmacy'}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '11.5px', background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 7px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                  <MapPin size={11} /> {stockMatch?.shelfRack || 'Rack A'}
                                </span>
                              </td>
                              <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                                {stockMatch ? `${stockMatch.batch} (${stockMatch.expiry})` : 'N/A'}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.dosage} &bull; {item.duration}</div>
                                <div style={{ fontSize: '11px', color: '#0284c7' }}>{item.timing}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                  {item.qty} tabs
                                </span>
                              </td>
                              <td>
                                <span style={{ color: hasEnoughStock ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                  {hasEnoughStock ? (
                                    <>
                                      <CheckCircle2 size={12} /> {stockMatch?.stockQty} in stock
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle size={12} /> Low/Empty ({stockMatch?.stockQty || 0})
                                    </>
                                  )}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                INR {(item.qty * item.unitPrice).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                        Ready to Hand Over Medicines?
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Dispensing will automatically deduct exact quantities from live pharmacy inventory.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-secondary-clean" 
                        style={{ padding: '6px 12px', fontSize: '12.5px', color: '#059669', borderColor: '#a7f3d0', background: '#ffffff' }} 
                        onClick={() => openPrescriptionPrint(currentRx)}
                        title="Print Official Medical Prescription (A4)"
                      >
                        <Stethoscope size={14} color="#059669" />
                        <span>Print Doctor's Rx</span>
                      </button>

                      <button 
                        className="btn-secondary-clean" 
                        style={{ padding: '6px 12px', fontSize: '12.5px', color: '#0284c7', borderColor: '#bae6fd', background: '#ffffff' }} 
                        onClick={() => openBillReceipt(currentRx)}
                        title="Print Official Consultation / Hospital Bill Receipt"
                      >
                        <Receipt size={14} color="#0284c7" />
                        <span>Print Bill Receipt</span>
                      </button>

                      <button className="btn-secondary-clean" style={{ padding: '6px 12px', fontSize: '12.5px' }} onClick={handlePrintPharmacyInvoice}>
                        <Printer size={14} />
                        <span>Print Medicine Slip</span>
                      </button>

                      {currentRx.dispensedStatus !== 'dispensed' ? (
                        <button className="btn-primary-amber" style={{ padding: '7px 14px', fontSize: '13px' }} onClick={handleDispense}>
                          <CheckCircle2 size={15} />
                          <span>Confirm & Dispense Medicines</span>
                        </button>
                      ) : (
                        <span className="status-pill completed" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          <CheckCircle2 size={14} /> Successfully Dispensed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <Pill size={38} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                <h4>No Prescription Selected</h4>
                <p style={{ fontSize: '12.5px' }}>Please pick a prescription from the queue on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE PHARMACY STOCK MASTER (CATEGORY-WISE & BATCH DETAILS) */}
      {/* ========================================================================= */}
      {activeTab === 'stocks' && (
        <div>
          {/* Category Filter Pills (Modern HMS Classification) */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px' }}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              const countInCat = cat === 'All' 
                ? pharmacyStock.length 
                : pharmacyStock.filter(m => m.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: isSelected ? '1.5px solid #0d2847' : '1px solid #cbd5e1',
                    background: isSelected ? '#0d2847' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                    padding: '1px 5px', 
                    borderRadius: '10px' 
                  }}>
                    {countInCat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '440px' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Search Brand Name, Generic Salt, Batch #, or Shelf Rack..."
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '13px' }}
              />
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Modern HMS View Mode Switcher: Category Groups vs Table */}
              <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '7px', padding: '2px' }}>
                <button
                  type="button"
                  onClick={() => setStockViewMode('categories')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '5px',
                    border: 'none',
                    background: stockViewMode === 'categories' ? '#ffffff' : 'transparent',
                    color: stockViewMode === 'categories' ? '#0f172a' : '#64748b',
                    fontWeight: stockViewMode === 'categories' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: stockViewMode === 'categories' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title="Organize medicines category-wise with batch & rack cards"
                >
                  <LayoutGrid size={13} />
                  <span>Category Groups</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '5px',
                    border: 'none',
                    background: stockViewMode === 'table' ? '#ffffff' : 'transparent',
                    color: stockViewMode === 'table' ? '#0f172a' : '#64748b',
                    fontWeight: stockViewMode === 'table' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: stockViewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title="Dense full inventory table"
                >
                  <List size={13} />
                  <span>Inventory Table</span>
                </button>
              </div>

              <button 
                className="btn-primary-amber" 
                style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowAddMedModal(true)}
              >
                <Plus size={14} />
                <span>Add Medicine & Batch</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: MODERN HMS CATEGORY-WISE GROUPS VIEW */}
          {stockViewMode === 'categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {categories.filter(c => c !== 'All').map(cat => {
                if (selectedCategory !== 'All' && selectedCategory !== cat) return null;
                const itemsInCat = filteredStock.filter(m => m.category === cat);
                if (itemsInCat.length === 0) return null;

                const catTotalUnits = itemsInCat.reduce((sum, m) => sum + m.stockQty, 0);
                const catLowStock = itemsInCat.filter(m => m.stockQty > 0 && m.stockQty <= (m.minStockLevel || 30)).length;
                const catOutStock = itemsInCat.filter(m => m.stockQty === 0).length;

                return (
                  <div key={cat} className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Category Header */}
                    <div style={{ background: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '18px', background: '#e59500', borderRadius: '2px' }}></div>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {cat}
                        </h3>
                        <span style={{ fontSize: '11px', background: '#0a1f36', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                          {itemsInCat.length} {itemsInCat.length === 1 ? 'Formulation' : 'Formulations'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                        <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> {catTotalUnits.toLocaleString()} Units Live
                        </span>
                        {catLowStock > 0 && (
                          <span style={{ color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangle size={12} /> {catLowStock} Low
                          </span>
                        )}
                        {catOutStock > 0 && (
                          <span style={{ color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <XCircle size={12} /> {catOutStock} Out
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Items Grid */}
                    <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                      {itemsInCat.map(med => {
                        const isLow = med.stockQty > 0 && med.stockQty <= (med.minStockLevel || 30);
                        const isOut = med.stockQty === 0;

                        return (
                          <div 
                            key={med.id}
                            style={{
                              border: isOut ? '1.5px solid #fecaca' : isLow ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              background: isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#ffffff',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div>
                                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                                    {med.name}
                                  </span>
                                  <span style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic' }}>
                                    {med.generic}
                                  </span>
                                </div>
                                <span className={`status-pill ${isOut ? 'cancelled' : isLow ? 'waiting' : 'completed'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                </span>
                              </div>

                              {/* Batch Number & Shelf Rack Info (Modern HMS standard) */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '10px 0', background: 'rgba(0,0,0,0.02)', padding: '7px 8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                <div>
                                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Batch No</span>
                                  <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                                    {med.batch || 'BT-001'}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Expiry</span>
                                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isOut ? '#dc2626' : '#334155' }}>
                                    {med.expiry || '12/2027'}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Shelf / Rack</span>
                                  <span style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={10} /> {med.shelfRack || 'Rack A'}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>MRP / Unit</span>
                                  <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                                    INR {med.mrp ? med.mrp.toFixed(2) : med.unitPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Live Stock Count & Instant Restock Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                              <div>
                                <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Live Inventory</span>
                                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669' }}>
                                  {med.stockQty} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>units</span>
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', marginRight: '2px' }}>Restock:</span>
                                <button 
                                  className="btn-secondary-clean" 
                                  style={{ padding: '3px 7px', fontSize: '11px', fontWeight: 700 }}
                                  onClick={() => updatePharmacyStockQty(med.id, 50)}
                                  title="Add +50 units"
                                >
                                  +50
                                </button>
                                <button 
                                  className="btn-secondary-clean" 
                                  style={{ padding: '3px 7px', fontSize: '11px', fontWeight: 700 }}
                                  onClick={() => updatePharmacyStockQty(med.id, 100)}
                                  title="Add +100 units"
                                >
                                  +100
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredStock.length === 0 && (
                <div className="form-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                  <h4>No Medicines Found</h4>
                  <p style={{ fontSize: '12.5px' }}>No inventory matches your search criteria or category filter.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: DENSE INVENTORY MASTER TABLE */}
          {stockViewMode === 'table' && (
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Item Code & Medicine Name</th>
                    <th>Generic Salt Formula</th>
                    <th>Category</th>
                    <th>Batch # & Expiry</th>
                    <th>Shelf / Rack</th>
                    <th>Min Level</th>
                    <th>Live Stock</th>
                    <th>MRP</th>
                    <th>Availability</th>
                    <th style={{ textAlign: 'right' }}>Restock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map(med => {
                    const isLow = med.stockQty > 0 && med.stockQty <= (med.minStockLevel || 30);
                    const isOut = med.stockQty === 0;

                    return (
                      <tr key={med.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{med.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {med.id} &bull; {med.manufacturer || 'Standard'}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: '#334155' }}>
                          {med.generic}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                            {med.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 600, color: '#0f172a' }}>
                            {med.batch || 'BT-001'}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            Exp: {med.expiry}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11.5px', color: '#0369a1', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} /> {med.shelfRack || 'Shelf A-01'}
                          </span>
                        </td>
                        <td style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {med.minStockLevel || 30} tabs
                        </td>
                        <td>
                          <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isOut ? '#ef4444' : isLow ? '#d97706' : '#059669' }}>
                            {med.stockQty} tabs
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          INR {med.mrp ? med.mrp.toFixed(2) : med.unitPrice.toFixed(2)}
                        </td>
                        <td>
                          {isOut && (
                            <span className="status-pill cancelled" style={{ fontSize: '10.5px' }}>
                              Out of Stock
                            </span>
                          )}
                          {isLow && (
                            <span className="status-pill waiting" style={{ fontSize: '10.5px' }}>
                              Low Stock
                            </span>
                          )}
                          {!isOut && !isLow && (
                            <span className="status-pill completed" style={{ fontSize: '10.5px' }}>
                              In Stock
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button 
                              className="btn-secondary-clean" 
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                              onClick={() => updatePharmacyStockQty(med.id, 50)}
                              title="Add +50 units"
                            >
                              +50
                            </button>
                            <button 
                              className="btn-secondary-clean" 
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                              onClick={() => updatePharmacyStockQty(med.id, 100)}
                              title="Add +100 units"
                            >
                              +100
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStock.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No medicines found matching this category or search term.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div className="modal-backdrop" onClick={() => setShowAddMedModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register Medicine in Pharmacy Master</h3>
              <button className="modal-close-btn" onClick={() => setShowAddMedModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddMedicineSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Medicine Brand Name & Strength *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={newMed.name} 
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} 
                    placeholder="e.g. Dolo 650mg Tablet"
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Generic Salt Formula</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={newMed.generic} 
                      onChange={(e) => setNewMed({ ...newMed, generic: e.target.value })} 
                      placeholder="e.g. Paracetamol IP 650mg"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Therapeutic Category</label>
                    <select 
                      className="form-select"
                      value={newMed.category} 
                      onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer / Pharma Brand</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newMed.manufacturer} 
                      onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })} 
                      placeholder="e.g. Micro Labs Ltd"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shelf / Rack Storage</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newMed.shelfRack} 
                      onChange={(e) => setNewMed({ ...newMed, shelfRack: e.target.value })} 
                      placeholder="e.g. Rack A - Shelf 02"
                    />
                  </div>
                </div>

                <div className="form-grid-4">
                  <div className="form-group">
                    <label className="form-label">Stock Qty</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={newMed.stockQty} 
                      onChange={(e) => setNewMed({ ...newMed, stockQty: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP (INR)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-input" 
                      value={newMed.mrp} 
                      onChange={(e) => setNewMed({ ...newMed, mrp: Number(e.target.value), unitPrice: Number(e.target.value) * 0.8 })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch #</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newMed.batch} 
                      onChange={(e) => setNewMed({ ...newMed, batch: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newMed.expiry} 
                      onChange={(e) => setNewMed({ ...newMed, expiry: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary-clean" onClick={() => setShowAddMedModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-amber">Add to Master</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
