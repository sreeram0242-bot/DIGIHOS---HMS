import React from 'react';
import { 
  Users, 
  Clock, 
  FlaskConical, 
  Pill, 
  CreditCard, 
  UserPlus, 
  Printer, 
  Barcode, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Activity,
  Receipt,
  Stethoscope
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const ReceptionDashboard = () => {
  const { 
    patients, 
    tokens, 
    labOrders, 
    prescriptions, 
    bills, 
    setActiveReceptionTab, 
    setIsScannerOpen, 
    setIsLabelModalOpen,
    setSelectedPatientForSticker,
    setIsTokenSlipModalOpen,
    setSelectedTokenForSlip,
    openPatientDossier,
    openPrescriptionPrint,
    openBillReceipt
  } = useHospital();

  const safePatients = Array.isArray(patients) ? patients : [];
  const safeTokens = (Array.isArray(tokens) ? tokens : []).filter(t => t && typeof t === 'object' && t.tokenNo);
  const safeLabOrders = (Array.isArray(labOrders) ? labOrders : []).filter(l => l && typeof l === 'object');
  const safeBills = (Array.isArray(bills) ? bills : []).filter(b => b && typeof b === 'object');

  const totalPatients = safePatients.length;
  const waitingTokens = safeTokens.filter(t => t?.status === 'waiting').length;
  const inConsultationTokens = safeTokens.filter(t => t?.status === 'in-consultation').length;
  const labTestsPending = safeLabOrders.filter(l => l?.overallStatus !== 'completed').length;
  const totalRevenue = safeBills.reduce((sum, b) => sum + (Number(b?.amount) || 0), 0);

  // Live OPD Queue:
  // Exclude patients undergoing lab testing ('lab-investigation') and completed lab reports awaiting manual queue entry ('lab-completed').
  // Finished consultation patients sink to the bottom. Active patients ordered by arrival with NO priority jumping.
  const sortedTokens = safeTokens
    .filter(t => t && t.status !== 'lab-investigation' && t.status !== 'lab-completed')
    .sort((a, b) => {
      const isACompleted = a?.status === 'completed';
      const isBCompleted = b?.status === 'completed';

      if (isACompleted && !isBCompleted) return 1;  // Completed patients go down
      if (!isACompleted && isBCompleted) return -1; // Active patients stay on top

      return (a?.tokenNo || '').localeCompare(b?.tokenNo || '');
    });

  // Identify the single patient whose turn it is right now (in consultation, or 1st waiting token)
  const currentTurnToken = sortedTokens.find(t => t?.status === 'in-consultation') || sortedTokens.find(t => t?.status === 'waiting');

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Patients</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
            {totalPatients}
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <TrendingUp size={13} /> +3 registered today
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Waiting in Queue</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#fffbeb', color: '#e59500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
            {waitingTokens} <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#64748b' }}>Tokens</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#d97706', marginTop: '3px' }}>
            {inConsultationTokens} active with doctor
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Lab Orders</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
            {labOrders.length}
          </div>
          <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '3px' }}>
            {labTestsPending} pending sample collection
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Daily Collections</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
            INR {totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '3px' }}>
            Settled via Cash / UPI
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ background: '#0a1f36', borderRadius: '12px', padding: '18px 22px', color: '#ffffff', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15.5px', fontWeight: 700 }}>
              Front Desk Shortcuts
            </h3>
            <p style={{ fontSize: '12px', color: '#92a9bf', marginTop: '2px' }}>
              Common operations for instant patient processing
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <button 
            className="btn-primary-amber" 
            style={{ justifyContent: 'center', padding: '9px 12px', fontSize: '12.5px' }}
            onClick={() => setActiveReceptionTab('register')}
          >
            <UserPlus size={14} />
            <span>New Patient Registration</span>
          </button>

          <button 
            className="btn-navy" 
            style={{ justifyContent: 'center', background: '#13355b', padding: '9px 12px', fontSize: '12.5px' }}
            onClick={() => setActiveReceptionTab('op-visit')}
          >
            <Activity size={14} color="#fbbf24" />
            <span>Issue OPD Visit Token</span>
          </button>

          <button 
            className="btn-navy" 
            style={{ justifyContent: 'center', background: '#13355b', padding: '9px 12px', fontSize: '12.5px' }}
            onClick={() => setIsScannerOpen(true)}
          >
            <Barcode size={14} color="#38bdf8" />
            <span>Scan Tag / Barcode</span>
          </button>

          <button 
            className="btn-navy" 
            style={{ justifyContent: 'center', background: '#13355b', padding: '9px 12px', fontSize: '12.5px' }}
            onClick={() => setIsLabelModalOpen(true)}
          >
            <Printer size={14} color="#a7f3d0" />
            <span>Print Thermal Label</span>
          </button>
        </div>
      </div>

      {/* Today's Active Tokens Queue Table */}
      <div className="modern-table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Today's Live OPD Consultation Queue
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Synchronized in real-time with Dr. Arvind Ramesh's portal
            </p>
          </div>
          <button 
            className="btn-secondary-clean"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => setActiveReceptionTab('op-visit')}
          >
            + New Token
          </button>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Patient Details</th>
              <th>Time</th>
              <th>Doctor & Room</th>
              <th>Type / Purpose</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map(token => (
              <tr key={token.tokenNo}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span className="token-chip" style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0 }}>{token.tokenNo}</span>
                </td>
                <td>
                  <div 
                    style={{ fontWeight: 700, color: '#0f2b48', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => openPatientDossier(token.patientId)}
                    title="Click to view complete 360° medical history dossier"
                  >
                    <span>{token.patientName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    <span 
                      style={{ cursor: 'pointer', color: '#0284c7' }} 
                      onClick={() => openPatientDossier(token.patientId)}
                    >
                      {token.patientId}
                    </span> &bull; {token.age}Y / {token.gender}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {token.createdAt}
                </td>
                <td>
                  <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{token.doctor}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{token.room}</div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>{token.type}</span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {token.status === 'completed' ? (
                    <span className="status-pill completed" style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0 }}>Completed</span>
                  ) : token.tokenNo === currentTurnToken?.tokenNo ? (
                    <span className="status-pill in-progress" style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      background: '#dcfce7', 
                      color: '#15803d', 
                      border: '1px solid #86efac', 
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      wordBreak: 'keep-all',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={12} />
                      <span style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>Current Turn</span>
                    </span>
                  ) : (
                    <span className="status-pill waiting" style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      whiteSpace: 'nowrap',
                      wordBreak: 'keep-all',
                      flexShrink: 0
                    }}>
                      <Clock size={12} />
                      <span style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>Waiting in Queue</span>
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '5px' }}>
                    <button 
                      className="btn-secondary-clean"
                      style={{ padding: '3px 8px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#059669', borderColor: '#a7f3d0' }}
                      onClick={() => openPrescriptionPrint(token)}
                      title="Print Official Doctor's Prescription (Rx)"
                    >
                      <Stethoscope size={12} color="#059669" /> Rx
                    </button>

                    <button 
                      className="btn-secondary-clean"
                      style={{ padding: '3px 8px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0284c7', borderColor: '#bae6fd' }}
                      onClick={() => openBillReceipt(token)}
                      title="Print Consultation Billing Receipt"
                    >
                      <Receipt size={12} color="#0284c7" /> Bill
                    </button>

                    <button 
                      className="btn-secondary-clean"
                      style={{ padding: '3px 8px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => {
                        setSelectedTokenForSlip(token);
                        setIsTokenSlipModalOpen(true);
                      }}
                      title="Print Official OPD Token Slip"
                    >
                      <Clock size={12} /> Slip
                    </button>

                    <button 
                      className="btn-secondary-clean"
                      style={{ padding: '3px 8px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      onClick={() => {
                        const pat = patients.find(p => p.id === token.patientId);
                        if (pat) setSelectedPatientForSticker(pat);
                        setIsLabelModalOpen(true);
                      }}
                      title="Print Barcode / NFC Label"
                    >
                      <Printer size={12} /> Label
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
