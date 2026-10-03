import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { NfcBarcodeScannerModal } from './components/NfcBarcodeScannerModal';
import { LabelPrintModal } from './components/LabelPrintModal';
import { LabReportModal } from './components/LabReportModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { PharmacyInvoiceModal } from './components/PharmacyInvoiceModal';
import { TokenSlipModal } from './components/TokenSlipModal';
import { PatientDossierModal } from './components/PatientDossierModal';
import { PrescriptionPrintModal } from './components/PrescriptionPrintModal';

// Reception Views
import { ReceptionDashboard } from './portals/ReceptionPortal/ReceptionDashboard';
import { RegisterPatientView } from './portals/ReceptionPortal/RegisterPatientView';
import { OpVisitView } from './portals/ReceptionPortal/OpVisitView';
import { PatientDirectoryView } from './portals/ReceptionPortal/PatientDirectoryView';
import { BillingView } from './portals/ReceptionPortal/BillingView';

// Clinical, Diagnostics, Admin & Pharmacy Portals
import { DoctorPortal } from './portals/DoctorPortal/DoctorPortal';
import { LabPortal } from './portals/LabPortal/LabPortal';
import { PharmacyPortal } from './portals/PharmacyPortal/PharmacyPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { EmployeePortal } from './portals/AdminPortal/EmployeePortal';
import { AttendancePortal } from './portals/AdminPortal/AttendancePortal';
import { CommunicationPortal } from './portals/CommunicationPortal/CommunicationPortal';
import { QueueDisplay } from './portals/QueueDisplayPortal/QueueDisplay';
import { Zap, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    // Automatically sanitize corrupted localStorage on error
    try {
      ['tokens', 'patients', 'labOrders', 'prescriptions', 'bills'].forEach(key => {
        const item = localStorage.getItem(`digihos_${key}`);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(x => x && typeof x === 'object');
            localStorage.setItem(`digihos_${key}`, JSON.stringify(cleaned));
          }
        }
      });
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
            <AlertCircle size={24} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Component Render Error</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            A temporary issue occurred while rendering this page:
          </p>
          <pre style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: '12px 0' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-primary-amber"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                try {
                  ['tokens', 'patients', 'labOrders', 'prescriptions', 'bills'].forEach(k => {
                    const raw = localStorage.getItem(`digihos_${k}`);
                    if (raw) {
                      const arr = JSON.parse(raw);
                      if (Array.isArray(arr)) {
                        localStorage.setItem(`digihos_${k}`, JSON.stringify(arr.filter(x => x && typeof x === 'object')));
                      }
                    }
                  });
                } catch {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Auto-Repair & Reload
            </button>
            <button
              type="button"
              style={{ padding: '8px 16px', fontSize: '13px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Reset to Fresh State
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { activePortal, activeReceptionTab, toastMessage, isPharmacySidebarOpen, setIsPharmacySidebarOpen } = useHospital();

  const renderActiveView = () => {
    switch (activePortal) {
      case 'reception':
        switch (activeReceptionTab) {
          case 'dashboard':
            return <ReceptionDashboard />;
          case 'register':
            return <RegisterPatientView />;
          case 'op-visit':
            return <OpVisitView />;
          case 'directory':
            return <PatientDirectoryView />;
          case 'billing':
            return <BillingView />;
          default:
            return <RegisterPatientView />;
        }
      case 'directory':
        return <PatientDirectoryView />;
      case 'billing':
        return <BillingView />;
      case 'admin':
        return <AdminPortal />;
      case 'employees':
        return <EmployeePortal />;
      case 'attendance':
        return <AttendancePortal />;
      case 'doctor':
        return <DoctorPortal />;
      case 'lab':
        return <LabPortal />;
      case 'pharmacy':
        return <PharmacyPortal />;
      case 'communication':
        return <CommunicationPortal />;
      case 'queue':
        return <QueueDisplay />;
      default:
        return <RegisterPatientView />;
    }
  };

  return (
    <div className="app-container">
      {/* Pharmacy Portal Click-Screen Backdrop to Hide Sidebar */}
      {activePortal === 'pharmacy' && isPharmacySidebarOpen && (
        <div 
          className="pharmacy-sidebar-backdrop"
          onClick={() => setIsPharmacySidebarOpen(false)}
          title="Click screen to hide sidebar"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 41, 0.45)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 1040,
            cursor: 'pointer'
          }}
        />
      )}

      {/* Sidebar with Dark Navy Aesthetic matching Screenshot 1 */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="main-layout">
        <TopNavbar />
        
        <main className="content-body">
          <ErrorBoundary>
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <PatientDossierModal />
      <NfcBarcodeScannerModal />
      <TokenSlipModal />
      <LabelPrintModal />
      <ReceiptPrintModal />
      <PharmacyInvoiceModal />
      <PrescriptionPrintModal />
      <LabReportModal />

      {/* Real-time Toast Notifications without Emojis */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '24px',
            background: '#0d2847',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 9999,
            animation: 'slideUp 0.15s ease-out'
          }}
        >
          <Zap size={14} color="#fbbf24" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <HospitalProvider>
        <AppContent />
      </HospitalProvider>
    </ErrorBoundary>
  );
}
