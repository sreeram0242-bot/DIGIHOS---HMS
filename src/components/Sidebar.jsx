import React from 'react';
import { 
  Activity, 
  LayoutGrid, 
  UserPlus, 
  PlusSquare, 
  Search, 
  CreditCard, 
  MessageCircle, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Tv, 
  Barcode,
  Radio,
  ShieldCheck,
  DollarSign,
  Package,
  Users,
  CalendarCheck,
  Zap,
  PanelLeftClose
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const Sidebar = () => {
  const { 
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
    tokens,
    labOrders,
    prescriptions,
    pharmacyStock,
    employees,
    patients
  } = useHospital();

  const waitingTokensCount = (tokens || []).filter(t => t.status === 'waiting').length;
  const pendingLabCount = (labOrders || []).filter(o => o.overallStatus !== 'completed').length;
  const pendingRxCount = (prescriptions || []).filter(p => p.dispensedStatus === 'pending').length;

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    if (activePortal === 'pharmacy') {
      setIsPharmacySidebarOpen(false);
    }
  };

  const getPortalLabel = () => {
    switch (activePortal) {
      case 'reception': return 'Reception Desk';
      case 'doctor': return 'Doctor OPD';
      case 'lab': return 'Diagnostics / Lab';
      case 'pharmacy': return 'Pharmacy Desk';
      case 'admin': return 'Hospital Admin';
      case 'employees': return 'Staff & Employees';
      case 'attendance': return 'Staff Attendance';
      case 'queue': return 'Waiting TV';
      case 'communication': return 'WhatsApp / Baileys';
      case 'directory': return 'Patient Records & EMR';
      default: return 'Reception Desk';
    }
  };

  // PHARMACY PORTAL ONLY: Sidebar is hidden by default and opens only on button click
  if (activePortal === 'pharmacy' && !isPharmacySidebarOpen) {
    return null;
  }

  const isPharmacyOverlay = activePortal === 'pharmacy';

  return (
    <aside 
      className={`sidebar ${isPharmacyOverlay ? 'pharmacy-sidebar-overlay' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Brand Header matching Screenshot 1 */}
      <div className="sidebar-brand-box" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon-badge">
            <Activity size={22} strokeWidth={2.6} />
          </div>
          <div className="brand-info">
            <span className="brand-title">DIGIHOS</span>
            <span className="brand-portal-tag">{getPortalLabel()}</span>
          </div>
        </div>

        {/* Dedicated Hide Sidebar button for Pharmacy Portal */}
        {activePortal === 'pharmacy' && (
          <button 
            type="button"
            className="btn-hide-pharmacy-sidebar"
            onClick={() => setIsPharmacySidebarOpen(false)}
            title="Hide Sidebar"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <PanelLeftClose size={13} />
            <span>Hide</span>
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {/* Reception Navigation */}
        {activePortal === 'reception' && (
          <>
            <div className="sidebar-category-group">
              <span className="sidebar-category-header">Main</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeReceptionTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveReceptionTab('dashboard')}
                  >
                    <LayoutGrid size={16} />
                    <span>Dashboard</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="sidebar-category-group">
              <span className="sidebar-category-header">Patients</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeReceptionTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveReceptionTab('register')}
                  >
                    <UserPlus size={16} />
                    <span>Register patient</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeReceptionTab === 'op-visit' ? 'active' : ''}`}
                    onClick={() => setActiveReceptionTab('op-visit')}
                  >
                    <PlusSquare size={16} />
                    <span>Create OP / IP visit</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeReceptionTab === 'directory' ? 'active' : ''}`}
                    onClick={() => setActiveReceptionTab('directory')}
                  >
                    <Search size={16} />
                    <span>Patient directory</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="sidebar-category-group">
              <span className="sidebar-category-header">Front Office</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeReceptionTab === 'billing' ? 'active' : ''}`}
                    onClick={() => {
                      setActivePortal('reception');
                      setActiveReceptionTab('billing');
                    }}
                  >
                    <CreditCard size={16} />
                    <span>Billing & Invoices</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="sidebar-item-btn"
                    onClick={() => setActivePortal('admin')}
                  >
                    <DollarSign size={16} />
                    <span>Admin & Financials</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="sidebar-item-btn"
                    onClick={() => setActivePortal('communication')}
                  >
                    <MessageCircle size={16} />
                    <span>Send notification</span>
                    <span className="sidebar-item-badge">Baileys</span>
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Admin, Staff & Attendance Navigation */}
        {(activePortal === 'admin' || activePortal === 'employees' || activePortal === 'attendance') && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Hospital Administration</span>
            <ul className="sidebar-menu-list">
              <li>
                <button 
                  className={`sidebar-item-btn ${activePortal === 'admin' && activeAdminTab === 'revenue' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePortal('admin');
                    setActiveAdminTab('revenue');
                  }}
                >
                  <DollarSign size={16} />
                  <span>Combined Revenue</span>
                </button>
              </li>
              <li>
                <button 
                  className={`sidebar-item-btn ${activePortal === 'admin' && activeAdminTab === 'pharmacy' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePortal('admin');
                    setActiveAdminTab('pharmacy');
                  }}
                >
                  <Package size={16} />
                  <span>Pharmacy Inventory</span>
                </button>
              </li>
              <li>
                <button 
                  className={`sidebar-item-btn ${activePortal === 'employees' ? 'active' : ''}`}
                  onClick={() => setActivePortal('employees')}
                >
                  <Users size={16} />
                  <span>Staff & Employees</span>
                  <span className="sidebar-item-badge">{employees.length}</span>
                </button>
              </li>
              <li>
                <button 
                  className={`sidebar-item-btn ${activePortal === 'attendance' ? 'active' : ''}`}
                  onClick={() => setActivePortal('attendance')}
                >
                  <CalendarCheck size={16} />
                  <span>Staff Attendance</span>
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => setActivePortal('directory')}
                >
                  <Users size={16} />
                  <span>Patient Directory & EMR</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Doctor Portal */}
        {activePortal === 'doctor' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Clinical OPD</span>
            <ul className="sidebar-menu-list">
              <li>
                <button className="sidebar-item-btn active">
                  <Stethoscope size={16} />
                  <span>OPD Consultation Desk</span>
                  {waitingTokensCount > 0 && (
                    <span className="sidebar-item-badge">{waitingTokensCount} waiting</span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => setActivePortal('directory')}
                >
                  <Users size={16} />
                  <span>Patient Directory & EMR</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Lab Portal */}
        {activePortal === 'lab' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Pathology & Tests</span>
            <ul className="sidebar-menu-list">
              <li>
                <button className="sidebar-item-btn active">
                  <FlaskConical size={16} />
                  <span>Diagnostic Lab Desk</span>
                  {pendingLabCount > 0 && (
                    <span className="sidebar-item-badge">{pendingLabCount} pending</span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => setActivePortal('directory')}
                >
                  <Users size={16} />
                  <span>Patient Directory & EMR</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Pharmacy Portal */}
        {activePortal === 'pharmacy' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Pharmacy Counter</span>
            <ul className="sidebar-menu-list">
              <li>
                <button 
                  className={`sidebar-item-btn ${activePharmacyTab === 'dispense' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePharmacyTab('dispense');
                    setIsPharmacySidebarOpen(false);
                  }}
                >
                  <Pill size={16} />
                  <span>Prescription Dispense</span>
                  {pendingRxCount > 0 && (
                    <span className="sidebar-item-badge">{pendingRxCount} queue</span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  className={`sidebar-item-btn ${activePharmacyTab === 'stocks' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePharmacyTab('stocks');
                    setIsPharmacySidebarOpen(false);
                  }}
                >
                  <Package size={16} />
                  <span>Live Stock Master</span>
                  <span className="sidebar-item-badge">{pharmacyStock.length} SKUs</span>
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => {
                    setActivePortal('directory');
                    setIsPharmacySidebarOpen(false);
                  }}
                >
                  <Users size={16} />
                  <span>Patient Directory & EMR</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Communication Portal */}
        {activePortal === 'communication' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">WhatsApp Gateway</span>
            <ul className="sidebar-menu-list">
              <li>
                <button className="sidebar-item-btn active">
                  <MessageCircle size={16} />
                  <span>Baileys Live Gateway</span>
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => setActivePortal('directory')}
                >
                  <Users size={16} />
                  <span>Patient Directory & EMR</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Master Directory Portal */}
        {activePortal === 'directory' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Medical Records</span>
            <ul className="sidebar-menu-list">
              <li>
                <button className="sidebar-item-btn active">
                  <Users size={16} />
                  <span>Master Patient Directory</span>
                  <span className="sidebar-item-badge">{patients.length}</span>
                </button>
              </li>
              <li>
                <button 
                  className="sidebar-item-btn"
                  onClick={() => {
                    setActivePortal('reception');
                    setActiveReceptionTab('register');
                  }}
                >
                  <UserPlus size={16} />
                  <span>Register New Patient</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Waiting Room TV */}
        {activePortal === 'queue' && (
          <div className="sidebar-category-group">
            <span className="sidebar-category-header">Lounge Display</span>
            <ul className="sidebar-menu-list">
              <li>
                <button className="sidebar-item-btn active">
                  <Tv size={16} />
                  <span>Waiting Room Screen</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Instant Portal Switcher (Zero Latency - Compact) */}
      <div className="sidebar-footer">
        <div className="portal-switch-label">
          <span>Switch Portal</span>
          <span style={{ color: '#fbbf24', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Zap size={10} /> 0ms Latency
          </span>
        </div>
        <div className="portal-pills-grid">
          <button 
            className={`portal-pill-btn ${activePortal === 'reception' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('reception')}
            title="Reception Desk"
          >
            <UserPlus size={13} />
            <span>Reception</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'doctor' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('doctor')}
            title="Doctor Consultation Portal"
          >
            <Stethoscope size={13} />
            <span>Doctor</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'lab' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('lab')}
            title="Diagnostics & Pathology Lab"
          >
            <FlaskConical size={13} />
            <span>Lab</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'pharmacy' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('pharmacy')}
            title="Pharmacy & Medicine Stock"
          >
            <Pill size={13} />
            <span>Pharmacy</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'admin' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('admin')}
            title="Admin & Consolidated Revenue"
          >
            <ShieldCheck size={13} />
            <span>Admin</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'queue' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('queue')}
            title="Waiting Room TV Display"
          >
            <Tv size={13} />
            <span>Token TV</span>
          </button>

          <button 
            className={`portal-pill-btn ${activePortal === 'communication' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('communication')}
            title="Baileys WhatsApp Gateway"
            style={{ gridColumn: 'span 2' }}
          >
            <MessageCircle size={13} />
            <span>WhatsApp (Baileys)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
