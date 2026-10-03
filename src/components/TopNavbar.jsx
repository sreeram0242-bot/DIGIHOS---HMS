import React, { useState, useEffect } from 'react';
import { 
  Barcode, 
  Radio, 
  Clock, 
  Printer, 
  CheckCircle2, 
  ShieldCheck,
  Search,
  Sparkles,
  Users,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const TopNavbar = () => {
  const { 
    activePortal, 
    setActivePortal,
    activeReceptionTab, 
    activeAdminTab,
    setIsScannerOpen, 
    setIsLabelModalOpen, 
    baileysState,
    tokens,
    isBackendConnected,
    isPharmacySidebarOpen,
    setIsPharmacySidebarOpen
  } = useHospital();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activePortal) {
      case 'reception':
        if (activeReceptionTab === 'register') return 'Register patient';
        if (activeReceptionTab === 'op-visit') return 'Create OP / IP visit';
        if (activeReceptionTab === 'directory') return 'Patient directory';
        return 'Reception Dashboard';
      case 'admin':
        if (activeAdminTab === 'revenue') return 'Combined Revenue Ledger';
        if (activeAdminTab === 'pharmacy') return 'Pharmacy Stock Master';
        if (activeAdminTab === 'employees') return 'Staff & Employees Directory';
        if (activeAdminTab === 'attendance') return 'Staff Attendance Tracking';
        return 'Hospital Administration';
      case 'employees':
        return 'Staff & Employees 360° Management';
      case 'attendance':
        return 'Staff Biometric Attendance & Muster Roll';
      case 'doctor':
        return 'OPD Doctor Consultation Desk';
      case 'lab':
        return 'Laboratory Diagnostics & Pathology';
      case 'pharmacy':
        return 'Pharmacy Dispensing & Inventory';
      case 'queue':
        return 'Live Waiting Room Token Display';
      case 'communication':
        return 'WhatsApp Automation & Gateway';
      case 'directory':
        return 'Master Patient Directory & EMR Records';
      default:
        return 'Reception Dashboard';
    }
  };

  const getGreetingPortal = () => {
    switch (activePortal) {
      case 'reception': return 'Reception';
      case 'admin': return 'Hospital Administrator';
      case 'employees': return 'HR & Workforce Master';
      case 'attendance': return 'Biometric Attendance Desk';
      case 'doctor': return 'Dr. Arvind Ramesh';
      case 'lab': return 'Diagnostics & Lab';
      case 'pharmacy': return 'Pharmacy Counter';
      case 'queue': return 'Waiting Lounge';
      case 'communication': return 'Communications Desk';
      case 'directory': return 'Patient Records & Directory';
      default: return 'Reception';
    }
  };

  const activeTokensToday = (tokens || []).length;

  return (
    <>
      <header className="top-navbar">
        {/* Left: Breadcrumbs & Pharmacy Sidebar Toggle Button */}
        <div className="top-nav-left" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {activePortal === 'pharmacy' && (
            <button
              type="button"
              className="btn-pharmacy-nav-sidebar"
              onClick={() => setIsPharmacySidebarOpen(prev => !prev)}
              title={isPharmacySidebarOpen ? "Hide Navigation Sidebar" : "Open Navigation Sidebar"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '7px',
                border: '1.5px solid #0d2847',
                background: isPharmacySidebarOpen ? '#f1f5f9' : '#0d2847',
                color: isPharmacySidebarOpen ? '#0d2847' : '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                transition: 'all 0.15s ease'
              }}
            >
              {isPharmacySidebarOpen ? (
                <>
                  <PanelLeftClose size={15} color="#0d2847" />
                  <span>Hide Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen size={15} color="#fbbf24" />
                  <span>Sidebar</span>
                </>
              )}
            </button>
          )}

          <div className="breadcrumb-location">
            <span className="breadcrumb-page">{getBreadcrumbTitle()}</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-hospital">Coimbatore General Hospital</span>
          </div>
        </div>

        {/* Right: Hardware Scanners & Status */}
        <div className="top-nav-right">
          {/* Global Patient Directory Button (Accessible from ANY portal) */}
          <button 
            type="button"
            className={`btn-secondary-clean ${activePortal === 'directory' ? 'active' : ''}`}
            onClick={() => setActivePortal('directory')}
            style={{ 
              padding: '5px 11px', 
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: activePortal === 'directory' ? '#0d2847' : '#ffffff',
              color: activePortal === 'directory' ? '#ffffff' : '#0f172a',
              borderColor: activePortal === 'directory' ? '#0d2847' : '#cbd5e1',
              fontWeight: 600
            }}
            title="Open Master Patient Directory and EMR History from any portal"
          >
            <Users size={13} />
            <span>Patient Directory</span>
          </button>

          {/* Quick Thermal Sticker Button */}
          <button 
            className="btn-secondary-clean" 
            onClick={() => setIsLabelModalOpen(true)}
            style={{ padding: '5px 10px', fontSize: '12px' }}
            title="Print Patient/Sample Barcode Sticker"
          >
            <Printer size={13} />
            <span>Print Label</span>
          </button>

          {/* Rapid Barcode & NFC Scanner Simulator */}
          <button 
            className="btn-quick-scan"
            onClick={() => setIsScannerOpen(true)}
            title="Scan Patient Barcode or Tap NFC Card"
          >
            <Barcode size={15} />
            <Radio size={13} style={{ color: '#fbbf24' }} />
            <span>Scan Tag</span>
          </button>

          {/* Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 600, color: '#334155', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
            <Clock size={14} color="#64748b" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Greeting Sub-Banner matching Screenshot 2 */}
      <div className="sub-header-banner">
        <h1 className="greeting-title">Good morning, {getGreetingPortal()}</h1>
        <p className="greeting-subtitle">
          Thursday, 19 March 2026 - Token counter starts at 1 today &nbsp;|&nbsp; 
          <strong style={{ color: '#0d2540', marginLeft: '6px' }}>{activeTokensToday} tokens issued today</strong>
        </p>
      </div>
    </>
  );
};
