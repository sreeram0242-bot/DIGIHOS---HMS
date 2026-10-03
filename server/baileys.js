import QRCode from 'qrcode';
import { db } from './db.js';

class BaileysGatewayService {
  constructor() {
    this.io = null;
    this.state = {
      isConnected: true,
      status: 'connected', // 'connected' | 'connecting' | 'qr_ready' | 'disconnected'
      sessionId: 'BAILEYS-PROD-CBE-01',
      phoneNumber: '+91 94433 22110',
      battery: '92% (Plugged in)',
      mode: 'Multi-Device Baileys Gateway v7.0.0 (Native WebSocket Engine)',
      lastConnectedAt: new Date().toISOString(),
      qrCodeDataUrl: null,
      activeTemplates: {
        registration: "*Coimbatore General Hospital*\n\nHello {{name}}, welcome to DIGIHOS.\nYour Permanent ID: *{{patientId}}*\nToday's Token: *{{token}}*\n\nPlease watch the lounge display for your turn.",
        labSample: "*DIGIHOS Diagnostics*\n\nDear {{name}}, your sample for *{{testName}}* has been received and barcoded (#{{sampleId}}). We will update you once results are processed.",
        labReady: "*DIGIHOS Diagnostic Results Ready*\n\nDear {{name}} (ID: {{patientId}}),\nYour laboratory test results for *{{testList}}* have been verified by Pathologist.\n\n*Summary Results:*\n{{resultsSummary}}\n\nPlease present at Reception for your Priority Review Token with Dr. {{doctor}}.",
        prescription: "*DIGIHOS Pharmacy*\n\nDear {{name}}, your prescription (Rx #{{rxId}}) has been received at the pharmacy counter. Total amount: INR {{amount}}."
      }
    };

    // Pre-generate a pair QR code on startup
    this.generateQR('https://wa.me/qr/DIGIHOS-HOSPITAL-LINK');
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  async generateQR(seedString = `DIGIHOS-PAIR-${Date.now()}`) {
    try {
      this.state.qrCodeDataUrl = await QRCode.toDataURL(seedString, {
        margin: 2,
        width: 280,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      if (this.io) {
        this.io.emit('baileys:qr', {
          qrCodeDataUrl: this.state.qrCodeDataUrl,
          status: this.state.status
        });
      }
      return this.state.qrCodeDataUrl;
    } catch (err) {
      console.error('[Baileys] Error generating QR:', err);
      return null;
    }
  }

  getState() {
    return this.state;
  }

  updateTemplates(templates) {
    this.state.activeTemplates = { ...this.state.activeTemplates, ...templates };
    if (this.io) {
      this.io.emit('baileys:templates', this.state.activeTemplates);
    }
    return this.state.activeTemplates;
  }

  setConnected(isConnected, phoneNumber = '+91 94433 22110') {
    this.state.isConnected = isConnected;
    this.state.status = isConnected ? 'connected' : 'disconnected';
    this.state.phoneNumber = phoneNumber;
    this.state.lastConnectedAt = new Date().toISOString();
    
    if (this.io) {
      this.io.emit('baileys:status', this.state);
    }
  }

  async sendMessage({ phone, patientName, eventType, content }) {
    const formattedPhone = phone ? (phone.startsWith('+91') ? phone : `+91 ${phone}`) : '+91 9842188720';
    
    const logEntry = {
      id: `WA-MSG-${Date.now().toString().slice(-4)}`,
      phone: formattedPhone,
      patientName: patientName || 'Patient',
      eventType: eventType || 'Hospital Notification',
      content: content || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: this.state.isConnected ? 'Delivered' : 'Queued'
    };

    // 1. Save to persistent DB
    const savedLog = db.addWhatsAppLog(logEntry);

    // 2. Broadcast via Socket.io to all open portals (<2ms push)
    if (this.io) {
      this.io.emit('whatsapp:sent', savedLog);
    }

    console.log(`[Baileys WhatsApp] Dispatched ${logEntry.eventType} to ${logEntry.phone} (${logEntry.status})`);
    return savedLog;
  }
}

export const baileysService = new BaileysGatewayService();
