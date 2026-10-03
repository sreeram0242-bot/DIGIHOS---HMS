import React, { useState } from 'react';
import { 
  FlaskConical, 
  Barcode, 
  Printer, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Search, 
  FileText,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const LabPortal = () => {
  const { 
    labOrders, 
    completeLabOrder, 
    markLabReportReady,
    markLabReportReceived,
    setSelectedPatientForSticker, 
    setIsLabelModalOpen, 
    setSelectedLabReport, 
    setIsLabReportModalOpen, 
    setIsScannerOpen,
    patients, 
    openPatientDossier,
    showToast 
  } = useHospital();

  const [selectedOrderId, setSelectedOrderId] = useState(labOrders[0]?.orderId || null);
  const [testValues, setTestValues] = useState({});

  const currentOrder = labOrders.find(o => o.orderId === selectedOrderId) || labOrders[0];
  const patient = currentOrder 
    ? (patients.find(p => p.id === currentOrder.patientId) || {
        id: currentOrder.patientId,
        fullName: currentOrder.patientName || 'Patient',
        age: 40,
        gender: 'Male',
        phone: '9842188720',
        barcode: '2026001',
        nfcUid: 'NFC-A18F90C2'
      })
    : null;

  const handlePrintSampleSticker = () => {
    if (patient) {
      setSelectedPatientForSticker(patient);
      setIsLabelModalOpen(true);
    }
  };

  const handleValueChange = (testId, paramName, value) => {
    let flag = 'normal';
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (paramName.includes('Hemoglobin') && num < 13.0) flag = 'low';
      if (paramName.includes('Hemoglobin') && num > 17.0) flag = 'high';
      if (paramName.includes('Glucose') && num > 140) flag = 'high';
      if (paramName.includes('ESR') && num > 15) flag = 'high';
    }

    setTestValues(prev => ({
      ...prev,
      [`${testId}_${paramName}`]: { value, flag }
    }));
  };

  const handleVerifyAndRelease = () => {
    if (!currentOrder) return;

    const updatedTests = (currentOrder.tests || []).map(test => {
      const updatedParams = (test.parameters || []).map(p => {
        const recorded = testValues[`${test.id}_${p.name}`];
        return {
          ...p,
          value: recorded ? recorded.value : (p.value || '13.5'),
          flag: recorded ? recorded.flag : (p.flag || 'normal')
        };
      });
      return {
        ...test,
        status: 'completed',
        parameters: updatedParams
      };
    });

    completeLabOrder(currentOrder.orderId, updatedTests);
  };

  const handleOpenPrintReport = () => {
    if (currentOrder) {
      setSelectedLabReport(currentOrder);
      setIsLabReportModalOpen(true);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            Diagnostic Pathology & Lab Desk
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Phlebotomy accessioning, specimen barcoding, result entry & WhatsApp dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12.5px' }} onClick={() => setIsScannerOpen(true)}>
            <Barcode size={15} />
            <span>Scan Sample / Patient ID</span>
          </button>

          <button className="btn-secondary-clean" style={{ padding: '6px 12px', fontSize: '12.5px' }} onClick={handlePrintSampleSticker}>
            <Printer size={15} />
            <span>Print Specimen Barcode</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left Column: Doctor Orders Queue */}
        <div>
          <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
              Pending Lab Requests ({labOrders.length})
            </div>

            <div style={{ maxHeight: '560px', overflowY: 'auto', padding: '10px' }}>
              {labOrders.map(order => {
                const isSelected = currentOrder?.orderId === order.orderId;
                const isDone = order.overallStatus === 'completed';
                return (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrderId(order.orderId)}
                    style={{
                      padding: '12px',
                      borderRadius: '7px',
                      border: isSelected ? '1.5px solid #8b5cf6' : '1px solid #e2e8f0',
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11.5px', color: '#0f172a' }}>
                        {order.orderId}
                      </span>
                      <span className="token-chip" style={{ fontSize: '10.5px', padding: '2px 5px' }}>
                        {order.tokenNo}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                      {order.patientName}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      ID: {order.patientId} &bull; Ref: {order.doctor}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                      Tests: {order.tests.map(t => t.name).join(', ')}
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: order.paymentStatus === 'paid' ? '#166534' : '#b45309' }}>
                        {order.paymentStatus === 'paid' ? `Bill Paid (INR ${order.amount})` : 'Unpaid'}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {isDone || order.isReportReady ? (
                          order.isReceived ? (
                            <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                              Received
                            </span>
                          ) : (
                            <>
                              <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                                Ready on TV
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markLabReportReceived(order.orderId);
                                }}
                                style={{
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Click when patient receives report (hides from Token TV)"
                              >
                                Received
                              </button>
                            </>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markLabReportReady(order.orderId);
                            }}
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Mark report ready (shows on Token TV)"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Specimen Entry, Verification & WhatsApp Dispatch */}
        <div>
          {currentOrder && patient ? (
            <div>
              {/* Order Patient Card */}
              <div style={{ background: '#0a1f36', color: '#ffffff', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="token-chip" style={{ background: '#8b5cf6', color: '#ffffff', padding: '3px 8px' }}>
                      {currentOrder.tokenNo}
                    </span>
                    <h3 
                      style={{ fontSize: '16.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => openPatientDossier(patient)}
                      title="Click to view complete 360° medical history dossier"
                    >
                      <span>{currentOrder.patientName}</span>
                    </h3>
                    <span className="patient-id-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#bae6fd', fontSize: '11px' }}>
                      {currentOrder.patientId}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#92a9bf', marginTop: '3px' }}>
                    {patient.age}Y &bull; {patient.gender} &bull; Phone: {patient.phone} &bull; Ref: {currentOrder.doctor}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-navy" style={{ background: '#1e3a5f', padding: '5px 10px', fontSize: '12px' }} onClick={handlePrintSampleSticker}>
                    <Barcode size={14} />
                    <span>Print Specimen Barcode</span>
                  </button>

                  {/* Ready on TV / Received Controls */}
                  {currentOrder.overallStatus !== 'completed' && !currentOrder.isReportReady ? (
                    <button 
                      type="button"
                      className="btn-primary-amber" 
                      style={{ padding: '5px 12px', fontSize: '12px', background: '#0284c7', color: '#ffffff' }} 
                      onClick={() => markLabReportReady(currentOrder.orderId)}
                      title="Mark report ready to display on Token TV"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Ready (Show on TV)</span>
                    </button>
                  ) : !currentOrder.isReceived ? (
                    <button 
                      type="button"
                      className="btn-primary-amber" 
                      style={{ padding: '5px 12px', fontSize: '12px', background: '#16a34a', color: '#ffffff' }} 
                      onClick={() => markLabReportReceived(currentOrder.orderId)}
                      title="Patient received report - will hide from Token TV"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Received (Hide from TV)</span>
                    </button>
                  ) : (
                    <span style={{ background: 'rgba(22, 163, 74, 0.25)', color: '#4ade80', padding: '5px 11px', borderRadius: '5px', fontSize: '11.5px', fontWeight: 700 }}>
                      Handed Over &bull; Received
                    </span>
                  )}

                  {currentOrder.overallStatus === 'completed' && (
                    <button className="btn-secondary-clean" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={handleOpenPrintReport}>
                      <Printer size={14} />
                      <span>Print Official Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lab Test Parameters & Reference Ranges Entry */}
              {currentOrder.tests.map((test) => (
                <div className="form-card" key={test.id} style={{ marginBottom: '16px' }}>
                  <div className="form-card-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="form-card-icon" style={{ color: '#8b5cf6' }}>
                        <FlaskConical size={16} />
                      </div>
                      <div>
                        <h3 className="form-card-title">{test.name}</h3>
                        <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Specimen Container: <strong>{test.sampleType}</strong>
                        </p>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#6d28d9', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                      Price: INR {test.price || 350}
                    </span>
                  </div>

                  <div className="modern-table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Recorded Value</th>
                          <th>Unit</th>
                          <th>Standard Reference Range</th>
                          <th>Flag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {test.parameters.map((param, pIdx) => {
                          const recorded = testValues[`${test.id}_${param.name}`];
                          const curVal = recorded ? recorded.value : (param.value || '');
                          const curFlag = recorded ? recorded.flag : (param.flag || 'normal');

                          return (
                            <tr key={pIdx}>
                              <td style={{ fontWeight: 600 }}>{param.name}</td>
                              <td>
                                <input 
                                  type="text"
                                  className="form-input"
                                  style={{ width: '120px', padding: '5px 8px', fontWeight: 700 }}
                                  defaultValue={curVal}
                                  placeholder="Enter value"
                                  onChange={(e) => handleValueChange(test.id, param.name, e.target.value)}
                                />
                              </td>
                              <td style={{ color: '#64748b', fontSize: '12px' }}>{param.unit || '-'}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                                {param.normal}
                              </td>
                              <td>
                                {curFlag === 'high' && (
                                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                                    HIGH
                                  </span>
                                )}
                                {curFlag === 'low' && (
                                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                                    LOW
                                  </span>
                                )}
                                {curFlag === 'normal' && (
                                  <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                                    NORMAL
                                  </span>
                                )}
                                {curFlag === 'pending' && (
                                  <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>Pending</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Pathologist Verification & WhatsApp Notification Trigger */}
              <div className="form-card" style={{ background: '#fafbfc', borderColor: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700, fontSize: '14px' }}>
                      <ShieldCheck size={16} color="#059669" />
                      <span>Pathologist Verification & WhatsApp Dispatch</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                      Releasing the report will digitally sign results, update the patient record, and send direct summary to <strong>{patient.phone}</strong>.
                    </p>
                  </div>

                  <button 
                    className="btn-primary-amber" 
                    onClick={handleVerifyAndRelease}
                    style={{ padding: '9px 18px', fontSize: '13px' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Authorize & Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="form-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <FlaskConical size={38} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <h4>No Lab Order Selected</h4>
              <p style={{ fontSize: '12.5px' }}>Please pick a pending test order from the queue on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
