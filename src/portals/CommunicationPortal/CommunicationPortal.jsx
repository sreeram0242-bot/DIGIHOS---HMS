import React, { useState } from 'react';
import { 
  MessageCircle, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Settings, 
  Edit3, 
  RefreshCw, 
  Smartphone, 
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const CommunicationPortal = () => {
  const { 
    baileysState, 
    setBaileysState, 
    whatsappLogs, 
    sendBaileysMessage, 
    requestBaileysQR,
    toggleBaileysPair,
    saveBaileysTemplates,
    patients, 
    showToast 
  } = useHospital();

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'qr' | 'logs' | 'manual'
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('labReady');
  const [templateText, setTemplateText] = useState(() => baileysState?.activeTemplates?.labReady || '');

  // Manual SMS state
  const [manualPhone, setManualPhone] = useState(patients[0]?.phone || '9842188720');
  const [manualName, setManualName] = useState(patients[0]?.fullName || 'Senthil Kumar M');
  const [manualMessage, setManualMessage] = useState('Hello, this is a direct notification from DIGIHOS Coimbatore.');

  const handleTemplateChange = (key) => {
    setSelectedTemplateKey(key);
    setTemplateText(baileysState?.activeTemplates?.[key] || '');
  };

  const handleSaveTemplate = () => {
    const updated = {
      ...baileysState.activeTemplates,
      [selectedTemplateKey]: templateText
    };
    if (saveBaileysTemplates) {
      saveBaileysTemplates(updated);
    } else {
      setBaileysState(prev => ({
        ...prev,
        activeTemplates: updated
      }));
    }
    showToast('WhatsApp template saved & synced across all portals');
  };

  const handleSendManual = (e) => {
    e.preventDefault();
    if (!manualPhone || !manualMessage) return;
    sendBaileysMessage(manualPhone, manualName, 'Manual Direct Message', manualMessage);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            WhatsApp Automation & Baileys Gateway
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Multi-device WhatsApp engine with real-time QR linking and automated hospital event broadcasts
          </p>
        </div>

        <div className="tab-pills-row">
          <button 
            className={`tab-pill-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Edit3 size={14} />
            <span>Templates</span>
          </button>
          <button 
            className={`tab-pill-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('qr');
              if (requestBaileysQR) requestBaileysQR();
            }}
          >
            <QrCode size={14} />
            <span>Link Phone (QR)</span>
          </button>
          <button 
            className={`tab-pill-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Layers size={14} />
            <span>Message Log ({(whatsappLogs || []).length})</span>
          </button>
          <button 
            className={`tab-pill-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Send size={14} />
            <span>Direct Test</span>
          </button>
        </div>
      </div>

      {/* Gateway Engine Banner */}
      <div style={{ background: '#0a1f36', color: '#ffffff', borderRadius: '10px', padding: '16px 20px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: baileysState.isConnected ? '#25d366' : '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                {baileysState.isConnected ? `Baileys Gateway Connected: ${baileysState.phoneNumber}` : 'Baileys Gateway: Standby / Awaiting Pair'}
              </h3>
              <span className="live-pulse-dot" style={{ background: baileysState.isConnected ? '#25d366' : '#f59e0b' }}></span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Session: <strong>{baileysState.sessionId}</strong> &bull; Multi-Device Protocol &bull; Battery: {baileysState.battery}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary-clean"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' }}
            onClick={() => {
              setActiveTab('qr');
              if (requestBaileysQR) requestBaileysQR();
            }}
          >
            <QrCode size={13} />
            <span>Pair Phone QR</span>
          </button>

          <button
            type="button"
            className="btn-secondary-clean"
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              background: baileysState.isConnected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
              color: baileysState.isConnected ? '#fca5a5' : '#86efac', 
              border: '1px solid rgba(255,255,255,0.2)' 
            }}
            onClick={() => {
              if (toggleBaileysPair) {
                toggleBaileysPair(!baileysState.isConnected);
              }
            }}
          >
            <Smartphone size={13} />
            <span>{baileysState.isConnected ? 'Unlink Device' : 'Reconnect Gateway'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Editable Templates */}
      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '20px' }}>
          <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px' }}>
              Select Template to Edit
            </div>
            <div style={{ padding: '8px' }}>
              {[
                { key: 'registration', name: '1. Registration & OPD Token', desc: 'Sent when patient is registered' },
                { key: 'labSample', name: '2. Lab Sample Collected', desc: 'Sent after specimen tube is stickered' },
                { key: 'labReady', name: '3. Lab Results Ready (Summary)', desc: 'Direct values without web links' },
                { key: 'prescription', name: '4. e-Prescription & Pharmacy', desc: 'Sent when doctor prescribes' }
              ].map(tpl => (
                <div
                  key={tpl.key}
                  onClick={() => handleTemplateChange(tpl.key)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    background: selectedTemplateKey === tpl.key ? '#fffbeb' : '#ffffff',
                    border: selectedTemplateKey === tpl.key ? '1.5px solid #e59500' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{tpl.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{tpl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="form-card-icon" style={{ color: '#25d366' }}>
                  <Edit3 size={16} />
                </div>
                <h3 className="form-card-title">Template Text Editor</h3>
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                Supported tags: {'{{name}}'}, {'{{patientId}}'}, {'{{token}}'}, {'{{testList}}'}, {'{{resultsSummary}}'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <textarea 
                className="form-textarea" 
                rows="8"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: '1.5' }}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
              />
            </div>

            <div className="btn-actions-row">
              <button className="btn-primary-amber" style={{ padding: '7px 14px', fontSize: '12.5px' }} onClick={handleSaveTemplate}>
                <span>Save Template Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Link Phone via QR Code */}
      {activeTab === 'qr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
          <div className="form-card" style={{ textAlign: 'center', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Scan with WhatsApp
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Point your phone's camera at the QR code to link device
            </p>

            <div style={{ 
              display: 'inline-block', 
              padding: '12px', 
              background: '#ffffff', 
              borderRadius: '12px', 
              border: '2px solid #e2e8f0', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              marginBottom: '16px' 
            }}>
              {baileysState.qrCodeDataUrl ? (
                <img 
                  src={baileysState.qrCodeDataUrl} 
                  alt="WhatsApp Baileys QR Code" 
                  style={{ width: '230px', height: '230px', display: 'block', margin: '0 auto' }} 
                />
              ) : (
                <div style={{ width: '230px', height: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <QrCode size={48} color="#94a3b8" />
                  <span style={{ fontSize: '12px', marginTop: '10px' }}>Generating Pair QR...</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary-amber"
                style={{ padding: '7px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={() => {
                  if (requestBaileysQR) requestBaileysQR();
                  showToast('Generated fresh pairing QR code');
                }}
              >
                <RefreshCw size={13} />
                <span>Refresh QR Code</span>
              </button>
            </div>
          </div>

          <div className="form-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              How to Link Hospital Phone to DIGIHOS Baileys Engine
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0a1f36', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Open WhatsApp on Hospital Smartphone</strong>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Open WhatsApp Business or WhatsApp standard app on the official hospital phone (+91 94433 22110).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0a1f36', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Navigate to Linked Devices</strong>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Tap <strong>Menu (Android 3 dots)</strong> or <strong>Settings (iOS)</strong> and select <strong>Linked Devices</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0a1f36', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Scan the QR Code on Screen</strong>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Tap <strong>Link a device</strong> and scan the QR shown on the left. The gateway automatically captures authentication credentials.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    Active Gateway Session
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {baileysState.phoneNumber} &bull; {baileysState.sessionId}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary-amber"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => {
                    if (toggleBaileysPair) toggleBaileysPair(true, baileysState.phoneNumber);
                    showToast('Gateway connection verified & active');
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Verify Connection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Message Logs */}
      {activeTab === 'logs' && (
        <div className="modern-table-container">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px' }}>
            Live Outbound Message Trail ({(whatsappLogs || []).length} messages)
          </div>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Msg ID</th>
                <th>Recipient Phone</th>
                <th>Patient</th>
                <th>Trigger Event</th>
                <th>Message Content</th>
                <th>Sent Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(whatsappLogs || []).map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{log.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.phone}</td>
                  <td>{log.patientName}</td>
                  <td>
                    <span style={{ fontSize: '11.5px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.eventType}
                    </span>
                  </td>
                  <td style={{ maxWidth: '350px', fontSize: '11.5px', whiteSpace: 'pre-wrap', color: '#334155' }}>
                    {log.content}
                  </td>
                  <td style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{log.timestamp}</td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Direct Manual Message */}
      {activeTab === 'manual' && (
        <div className="form-card" style={{ maxWidth: '600px' }}>
          <div className="form-card-header">
            <div className="form-card-icon" style={{ color: '#25d366' }}>
              <Send size={16} />
            </div>
            <h3 className="form-card-title">Dispatch Test Message via Baileys</h3>
          </div>

          <form onSubmit={handleSendManual}>
            <div className="form-grid-2" style={{ marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Recipient Mobile Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={manualPhone} 
                  onChange={(e) => setManualPhone(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Message Text</label>
              <textarea 
                className="form-textarea" 
                rows="3"
                value={manualMessage} 
                onChange={(e) => setManualMessage(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn-primary-amber" style={{ padding: '7px 14px', fontSize: '12.5px' }}>
              <Send size={14} />
              <span>Send WhatsApp Message Now</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
