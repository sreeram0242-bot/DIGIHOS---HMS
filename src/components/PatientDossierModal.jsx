import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  Activity, 
  Heart, 
  Printer, 
  FileText, 
  Pill, 
  FlaskConical, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  CreditCard, 
  Radio, 
  Barcode, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Building,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const PatientDossierModal = () => {
  const { 
    isPatientDossierModalOpen, 
    setIsPatientDossierModalOpen, 
    selectedPatientForDossier, 
    getPatientFullHistory,
    setSelectedPatientForSticker,
    setIsLabelModalOpen,
    setSelectedLabReport,
    setIsLabReportModalOpen,
    setSelectedRxForInvoice,
    setIsPharmacyInvoiceModalOpen,
    setSelectedBillForReceipt,
    setIsReceiptModalOpen,
    openPrescriptionPrint,
    openBillReceipt
  } = useHospital();

  const [activeVisitFilter, setActiveVisitFilter] = useState('all'); // 'all' | 'today' | 'past'
  const [expandedVisitId, setExpandedVisitId] = useState(null);

  if (!isPatientDossierModalOpen || !selectedPatientForDossier) {
    return null;
  }

  const fullData = (getPatientFullHistory ? getPatientFullHistory(selectedPatientForDossier.id) : null) || {};
  const patient = fullData.patient || selectedPatientForDossier;
  const visits = Array.isArray(fullData.visits) ? fullData.visits : [];
  const stats = fullData.stats || {};
  const pat = patient || selectedPatientForDossier;

  const todayStr = new Date().toISOString().split('T')[0];
  const isVisitToday = (v) => v.date === '2026-03-19' || v.date === todayStr || v.visitId?.includes('TODAY');

  const filteredVisits = visits.filter(v => {
    if (activeVisitFilter === 'today') return isVisitToday(v);
    if (activeVisitFilter === 'past') return !isVisitToday(v);
    return true;
  });

  const handlePrintSticker = () => {
    setSelectedPatientForSticker(pat);
    setIsLabelModalOpen(true);
  };

  const handleOpenLabReport = (order) => {
    // If order has nested tests, construct compliant labReport object
    const reportObj = {
      orderId: order.orderId,
      patientId: pat.id,
      patientName: pat.fullName,
      tokenNo: order.tokenNo || pat.id,
      doctor: order.doctor || 'Dr. Arvind Ramesh, MD',
      orderDate: order.date || '2026-03-19',
      paymentStatus: 'paid',
      amount: order.price || 500,
      overallStatus: order.overallStatus || 'completed',
      verifiedBy: order.verifiedBy || 'Dr. K. Shalini, MD (Pathology)',
      verifiedAt: order.verifiedAt || '09:45 AM',
      tests: order.tests || []
    };
    setSelectedLabReport(reportObj);
    setIsLabReportModalOpen(true);
  };

  const handleOpenRxInvoice = (rx) => {
    const invoiceObj = {
      prescriptionId: rx.rxId,
      patientId: pat.id,
      patientName: pat.fullName,
      tokenNo: rx.tokenNo || 'TK-01',
      doctor: rx.doctor || 'Dr. Arvind Ramesh',
      date: rx.date || '2026-03-19',
      dispensedStatus: rx.dispensedStatus || 'dispensed',
      billedStatus: rx.billedStatus || 'paid',
      totalAmount: rx.totalAmount || 78.5,
      items: rx.items || []
    };
    setSelectedRxForInvoice(invoiceObj);
    setIsPharmacyInvoiceModalOpen(true);
  };

  const handleOpenBillReceipt = (bill) => {
    const receiptObj = {
      billId: bill.billId,
      patientId: pat.id,
      patientName: pat.fullName,
      type: bill.type,
      category: bill.category,
      amount: bill.amount,
      mode: bill.mode,
      status: bill.status || 'Paid',
      date: bill.date || '2026-03-19',
      time: bill.time || '10:00 AM',
      description: bill.description || `${bill.type} - Patient Dossier Record`
    };
    setSelectedBillForReceipt(receiptObj);
    setIsReceiptModalOpen(true);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 23, 41, 0.78)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: '16px'
      }}
      onClick={() => setIsPatientDossierModalOpen(false)}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER: Patient Identity Banner */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Patient Avatar Circle */}
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#0f2b48',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              flexShrink: 0
            }}>
              {pat.fullName ? pat.fullName[0] : 'P'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                  {pat.fullName}
                </h2>
                <span className="patient-id-badge" style={{ background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd', fontSize: '11px', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                  UHID: {pat.id}
                </span>
                <span style={{ 
                  background: '#f1f5f9', 
                  color: '#334155', 
                  fontWeight: 700, 
                  fontSize: '11px', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  Blood: {pat.bloodGroup || 'O+'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span><strong>Age / Sex:</strong> {pat.age} Years &bull; {pat.gender}</span>
                <span>&bull;</span>
                <span><strong>Phone:</strong> {pat.phone}</span>
                <span>&bull;</span>
                <span><strong>Registered:</strong> {pat.registeredAt || '2026-03-19'}</span>
              </div>

              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>Barcode: {pat.barcode}</span>
                <span>&bull;</span>
                <span style={{ fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={11} /> {pat.nfcUid}
                </span>
                <span>&bull;</span>
                <span>Emergency: {pat.emergencyName} ({pat.emergencyRelation}) - {pat.emergencyPhone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn-secondary-clean" 
              style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }}
              onClick={() => openPrescriptionPrint(pat)}
              title="Print Official Medical Prescription (A4)"
            >
              <Stethoscope size={13} />
              <span>Print Rx</span>
            </button>

            <button 
              type="button" 
              className="btn-secondary-clean" 
              style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }}
              onClick={() => openBillReceipt(pat)}
              title="Print Official Consultation / Hospital Bill Receipt"
            >
              <Receipt size={13} />
              <span>Print Bill</span>
            </button>

            <button 
              type="button" 
              className="btn-secondary-clean" 
              style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }}
              onClick={handlePrintSticker}
              title="Print Thermal Barcode & NFC Sticker Label"
            >
              <Printer size={13} />
              <span>Print Sticker</span>
            </button>

            <button 
              type="button" 
              onClick={() => setIsPatientDossierModalOpen(false)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#475569',
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
        </div>

        {/* ========================================================================= */}
        {/* SUMMARY KPI STRIP */}
        {/* ========================================================================= */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px'
        }}>
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Consultations</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {stats.totalVisits} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Visits</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Baseline Blood Pressure</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {pat.vitals?.bp || '120/80'} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>mmHg</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Body Weight & Pulse</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {pat.vitals?.weight || 70} kg &bull; <span style={{ fontSize: '13px', color: '#334155' }}>{pat.vitals?.pulse || 76} bpm</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Diagnostic Labs</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {stats.totalLabs} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Test Orders</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Invoiced</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              INR {stats.totalBilled.toFixed(2)}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY: Chronological Visits Timeline */}
        {/* ========================================================================= */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Visit Filter Sub-Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Activity size={17} color="#0284c7" />
                <span>Complete Longitudinal Visits & Medical History ({visits.length})</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Every clinical encounter with associated vitals, lab reports, e-prescriptions, and billing receipts
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveVisitFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: activeVisitFilter === 'all' ? 700 : 500,
                  border: activeVisitFilter === 'all' ? '1.5px solid #0d2847' : '1px solid #cbd5e1',
                  background: activeVisitFilter === 'all' ? '#0d2847' : '#ffffff',
                  color: activeVisitFilter === 'all' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                All Visits ({visits.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveVisitFilter('today')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: activeVisitFilter === 'today' ? 700 : 500,
                  border: activeVisitFilter === 'today' ? '1.5px solid #0d2847' : '1px solid #cbd5e1',
                  background: activeVisitFilter === 'today' ? '#0d2847' : '#ffffff',
                  color: activeVisitFilter === 'today' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Today's Encounter
              </button>
              <button
                type="button"
                onClick={() => setActiveVisitFilter('past')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: activeVisitFilter === 'past' ? 700 : 500,
                  border: activeVisitFilter === 'past' ? '1.5px solid #0d2847' : '1px solid #cbd5e1',
                  background: activeVisitFilter === 'past' ? '#0d2847' : '#ffffff',
                  color: activeVisitFilter === 'past' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Previous Consultations
              </button>
            </div>
          </div>

          {/* Visits Cards Timeline */}
          {filteredVisits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600 }}>No visits recorded under this filter.</div>
            </div>
          ) : (
            filteredVisits.map((visit, vIdx) => {
              const isToday = visit.date === '2026-03-19';
              return (
                <div 
                  key={visit.visitId || vIdx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: isToday ? '1.5px solid #38bdf8' : '1px solid #e2e8f0',
                    boxShadow: isToday ? '0 4px 12px rgba(2, 132, 199, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Visit Card Header */}
                  <div style={{
                    background: isToday ? 'linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%)' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="token-chip" style={{ background: isToday ? '#e59500' : '#1e293b', color: '#ffffff', fontSize: '11px', padding: '3px 8px' }}>
                        {visit.tokenNo}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{visit.type}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>&bull; {visit.date} at {visit.time}</span>
                          {isToday && (
                            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                              Current Active Visit
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          Physician: <strong style={{ color: '#0f172a' }}>{visit.doctor}</strong> &bull; {visit.room}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-pill ${visit.status === 'completed' ? 'completed' : 'in-progress'}`} style={{ textTransform: 'capitalize' }}>
                        {visit.status === 'lab-completed' ? 'Lab Verified' : visit.status}
                      </span>
                    </div>
                  </div>

                  {/* Visit Clinical Body */}
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* Clinical Complaints & Diagnosis */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Presenting Complaints</span>
                          <div style={{ fontSize: '12.5px', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>
                            {visit.complaints}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Diagnosis / Clinical Assessment</span>
                          <div style={{ fontSize: '12.5px', color: '#0f172a', marginTop: '2px', fontWeight: 600 }}>
                            {visit.diagnosis || 'Clinical evaluation completed.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1. Vitals Recorded in this Visit */}
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Activity size={13} color="#0f2b48" />
                        <span>Vitals Recorded During Encounter:</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>BLOOD PRESSURE</span>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals?.bp || '120/80'} mmHg</strong>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>WEIGHT</span>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals?.weight || 70} kg</strong>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>PULSE</span>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals?.pulse || 76} bpm</strong>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>TEMP</span>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals?.temp || 98.6} &deg;F</strong>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>SpO2</span>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals?.spo2 || 99}%</strong>
                        </div>
                        {visit.vitals?.rbs && (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '6px', fontSize: '12px' }}>
                            <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: 600 }}>RANDOM GLUCOSE</span>
                            <strong style={{ color: '#0f172a', fontSize: '13px' }}>{visit.vitals.rbs} mg/dL</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Diagnostic Lab Tests in this Visit */}
                    {visit.labOrders && visit.labOrders.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FlaskConical size={13} color="#0f2b48" />
                            <span>Diagnostic Laboratory Tests & Verified Report:</span>
                          </div>
                        </div>

                        {visit.labOrders.map((lab, lIdx) => (
                          <div key={lIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                              <div>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Order #{lab.orderId}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                                  Verified by {lab.verifiedBy || 'Dr. K. Shalini (Pathology)'} at {lab.verifiedAt || '09:45 AM'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn-secondary-clean"
                                style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                onClick={() => handleOpenLabReport(lab)}
                              >
                                <FileText size={11} />
                                <span>View Official Lab Report</span>
                              </button>
                            </div>

                            {/* Test parameters table */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {lab.tests?.map((t, tIdx) => (
                                <div key={tIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', minWidth: '220px' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{t.name}</div>
                                  {t.parameters && t.parameters.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      {t.parameters.slice(0, 3).map((p, pIdx) => (
                                        <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                                          <span>{p.name}:</span>
                                          <strong style={{ color: p.flag === 'high' ? '#dc2626' : '#0f172a' }}>
                                            {p.value} {p.unit}
                                          </strong>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ color: '#334155', fontSize: '11px', fontWeight: 600 }}>Report verified normal</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Prescriptions & Medicines Given in this Visit */}
                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Pill size={13} color="#0f2b48" />
                            <span>Prescriptions & Pharmacy Medicines Dispensed:</span>
                          </div>
                        </div>

                        {visit.prescriptions.map((rx, rIdx) => (
                          <div key={rIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Rx #{rx.rxId}</strong>
                                <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  {rx.dispensedStatus === 'dispensed' ? 'Dispensed at Counter' : 'Ready for Dispensing'}
                                </span>
                                <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 700 }}>Total: INR {rx.totalAmount?.toFixed(2)}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="btn-secondary-clean"
                                  style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  onClick={() => openPrescriptionPrint(rx)}
                                  title="Print Official Medical Prescription (A4)"
                                >
                                  <Stethoscope size={11} />
                                  <span>Print Rx (A4)</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary-clean"
                                  style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  onClick={() => handleOpenRxInvoice(rx)}
                                >
                                  <FileText size={11} />
                                  <span>Pharmacy Slip</span>
                                </button>
                              </div>
                            </div>

                            {/* Items list */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {rx.items?.map((item, itIdx) => (
                                <div key={itIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px' }}>
                                  <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                                  <div style={{ color: '#64748b', fontSize: '10.5px', marginTop: '1px' }}>
                                    Dosage: {item.dosage} &bull; {item.duration} &bull; {item.timing} &bull; Qty: {item.qty}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Financial Bills & Payment Receipts for this Visit */}
                    {visit.bills && visit.bills.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CreditCard size={13} color="#0f2b48" />
                          <span>Financial Settlement & Cashier Receipts:</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                          {visit.bills.map((bill, bIdx) => (
                            <div key={bIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{bill.type}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  Invoice: {bill.billId} &bull; Paid via {bill.mode}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                  INR {bill.amount.toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                  <button
                                    type="button"
                                    className="btn-secondary-clean"
                                    onClick={() => openBillReceipt(bill)}
                                    style={{ padding: '2px 7px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <Receipt size={11} color="#475569" />
                                    <span>Print Bill</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBillReceipt(bill)}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                  >
                                    Receipt &rarr;
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <span>
            Digitally certified Medical Record &bull; Coimbatore General Hospital EMR
          </span>
          <button
            type="button"
            className="btn-secondary-clean"
            style={{ padding: '6px 14px', fontSize: '12.5px', background: '#f8fafc' }}
            onClick={() => setIsPatientDossierModalOpen(false)}
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
