import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from './db.js';
import { baileysService } from './baileys.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

baileysService.setIO(io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    connectedSockets: io.engine.clientsCount
  });
});

// 2. Full State Sync
app.get('/api/state', (req, res) => {
  res.json(db.getState());
});

// Patients Endpoints
app.get('/api/patients', (req, res) => {
  res.json(db.getState().patients || []);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = (db.getState().patients || []).find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

app.patch('/api/patients/:id', (req, res) => {
  try {
    const updated = db.updatePatient(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Patient not found' });
    io.emit('patient:updated', updated);
    res.json({ success: true, patient: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Register Patient
// 3. Register Patient (with automatic initial OP Token & Bill)
app.post('/api/patients', (req, res) => {
  try {
    const isComposite = req.body && (req.body.patient || req.body.token);
    const patientData = isComposite ? req.body.patient : req.body;
    const tokenData = isComposite ? req.body.token : null;
    const billData = isComposite ? req.body.bill : null;

    const newPatient = db.addPatient(patientData);
    io.emit('patient:created', newPatient);

    let createdToken = null;
    if (tokenData) {
      createdToken = db.addToken(tokenData);
      io.emit('token:created', createdToken);
    }

    let createdBill = null;
    if (billData) {
      createdBill = db.addBill(billData);
      io.emit('bill:created', createdBill);
    }

    res.status(201).json({ success: true, patient: newPatient, token: createdToken, bill: createdBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Tokens
app.get('/api/tokens', (req, res) => {
  res.json(db.getState().tokens || []);
});

// 4. Create OP / IP Visit & Token
app.post('/api/tokens/op-visit', (req, res) => {
  try {
    const { token, bill, vitals, patientId } = req.body;

    if (vitals && patientId) {
      db.updatePatient(patientId, { vitals });
      io.emit('patient:updated', { id: patientId, vitals });
    }

    const createdToken = db.addToken(token);
    io.emit('token:created', createdToken);

    let createdBill = null;
    if (bill) {
      createdBill = db.addBill(bill);
      io.emit('bill:created', createdBill);
    }

    res.status(201).json({ success: true, token: createdToken, bill: createdBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Token Status (in-consultation, completed, waiting, lab-investigation)
app.patch('/api/tokens/:tokenNo', (req, res) => {
  try {
    const { tokenNo } = req.params;
    const updates = req.body;

    // Prevent duplicate in-consultation: If setting a token to in-consultation, revert any other in-consultation token to waiting!
    if (updates.status === 'in-consultation') {
      const allTokens = db.getState().tokens || [];
      allTokens.forEach(t => {
        if (t.tokenNo !== tokenNo && t.status === 'in-consultation') {
          const reverted = db.updateToken(t.tokenNo, { status: 'waiting' });
          io.emit('token:updated', reverted);
        }
      });
    }

    const updated = db.updateToken(tokenNo, updates);

    // Lightning broadcast to Reception, Doctor, and Token TV
    io.emit('token:updated', updated);
    res.json({ success: true, token: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Call Token for Announcement (Doctor Desk or Waiting Lounge calls a token)
app.post('/api/tokens/call', (req, res) => {
  try {
    const { tokenNo, patientName, room, doctor } = req.body;
    const token = db.getState().tokens.find(t => t.tokenNo === tokenNo);

    const callPayload = token || { tokenNo, patientName, room, doctor };

    // Broadcast instant call event to all Token TV displays
    io.emit('token:called', callPayload);
    res.json({ success: true, called: callPayload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Lab Orders
app.get('/api/lab/orders', (req, res) => {
  res.json(db.getState().labOrders || []);
});

// 7. Create Diagnostic Lab Order
app.post('/api/lab/orders', (req, res) => {
  try {
    const { order, bill, tokenNo } = req.body;
    const createdOrder = db.addLabOrder(order);

    if (tokenNo) {
      db.updateToken(tokenNo, { status: 'lab-investigation' });
      io.emit('token:updated', { tokenNo, status: 'lab-investigation' });
    }

    if (bill) {
      db.addBill(bill);
      io.emit('bill:created', bill);
    }

    io.emit('lab:created', createdOrder);
    res.status(201).json({ success: true, order: createdOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Mark Lab Report Ready (Shows on Token TV instantly & persists filled test parameters)
app.patch('/api/lab/orders/:orderId/ready', (req, res) => {
  try {
    const { orderId } = req.params;
    const { tests, verifiedBy } = req.body || {};
    const order = db.getState().labOrders.find(o => o.orderId === orderId);

    const orderUpdates = {
      overallStatus: 'completed',
      isReportReady: true,
      isReceived: false,
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (tests && Array.isArray(tests)) {
      orderUpdates.tests = tests;
    }
    if (verifiedBy) {
      orderUpdates.verifiedBy = verifiedBy;
    }

    const updated = db.updateLabOrder(orderId, orderUpdates);

    if (order?.tokenNo) {
      db.updateToken(order.tokenNo, { status: 'lab-completed' });
      io.emit('token:updated', { tokenNo: order.tokenNo, status: 'lab-completed' });
    }

    io.emit('lab:updated', updated);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8b. Add Lab Patient to Doctor Queue (Cross-portal sync)
app.post('/api/lab/orders/:orderId/queue-doctor', (req, res) => {
  try {
    const { orderId } = req.params;
    const { tokenNo, patientId, notes, type } = req.body;

    let updatedToken = null;
    if (tokenNo) {
      updatedToken = db.updateToken(tokenNo, {
        status: 'waiting',
        type: type || 'Lab Review',
        notes: notes || 'Reviewing completed lab tests'
      });
      io.emit('token:updated', updatedToken);
    }

    const updatedOrder = db.updateLabOrder(orderId, { addedToDoctorQueue: true });
    io.emit('lab:updated', updatedOrder);

    res.json({ success: true, token: updatedToken, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Mark Lab Report Received (Hides from Token TV instantly)
app.patch('/api/lab/orders/:orderId/received', (req, res) => {
  try {
    const { orderId } = req.params;
    const updated = db.updateLabOrder(orderId, {
      isReceived: true,
      receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    io.emit('lab:updated', updated);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Prescriptions
app.get('/api/prescriptions', (req, res) => {
  res.json(db.getState().prescriptions || []);
});

// 10. Issue E-Prescription (Doctor Consultation)
app.post('/api/prescriptions', (req, res) => {
  try {
    const isComposite = req.body && (req.body.prescription || req.body.rx);
    const rxData = isComposite ? (req.body.prescription || req.body.rx) : req.body;
    const billData = req.body.bill || null;
    const tokenNo = req.body.tokenNo || rxData?.tokenNo;

    const createdRx = db.addPrescription(rxData);
    io.emit('prescription:created', createdRx);

    let createdBill = null;
    if (billData) {
      createdBill = db.addBill(billData);
      io.emit('bill:created', createdBill);
    }

    if (tokenNo) {
      const updatedToken = db.updateToken(tokenNo, { status: 'completed' });
      io.emit('token:updated', updatedToken);
    }

    res.status(201).json({ success: true, prescription: createdRx, bill: createdBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Dispense Prescription & Deduct Pharmacy Stock (Pharmacy Counter)
app.post('/api/prescriptions/:prescriptionId/dispense', (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { items, bill } = req.body;

    // Deduct stock quantities in real time
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        if (item.medicineId && item.qty) {
          const updatedStock = db.updateStockQty(item.medicineId, -Number(item.qty));
          io.emit('stock:updated', updatedStock);
        }
      });
    }

    if (bill) {
      db.addBill(bill);
      io.emit('bill:created', bill);
    }

    const updatedRx = db.updatePrescription(prescriptionId, {
      dispensedStatus: 'dispensed',
      dispensedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    io.emit('prescription:updated', updatedRx);
    res.json({ success: true, prescription: updatedRx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get Pharmacy Stock
app.get('/api/pharmacy/stock', (req, res) => {
  res.json(db.getState().pharmacyStock || []);
});

// 12. Add/Update Pharmacy Stock Item
app.post('/api/pharmacy/stock', (req, res) => {
  try {
    const stockItem = req.body;
    const created = db.addStockItem(stockItem);

    io.emit('stock:updated', created);
    res.status(201).json({ success: true, item: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bills Endpoints
app.get('/api/bills', (req, res) => {
  res.json(db.getState().bills || []);
});

app.post('/api/bills', (req, res) => {
  try {
    const bill = req.body;
    const created = db.addBill(bill);
    io.emit('bill:created', created);
    res.status(201).json({ success: true, bill: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employees Endpoints
app.get('/api/employees', (req, res) => {
  res.json(db.getState().employees || []);
});

app.post('/api/employees', (req, res) => {
  try {
    const created = db.addEmployee(req.body);
    io.emit('employee:created', created);
    res.status(201).json({ success: true, employee: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/employees/:id', (req, res) => {
  try {
    const updated = db.updateEmployee(req.params.id, req.body);
    io.emit('employee:updated', updated);
    res.json({ success: true, employee: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance Endpoints
app.get('/api/attendance', (req, res) => {
  res.json(db.getState().attendance || []);
});

app.post('/api/attendance', (req, res) => {
  try {
    const created = db.addAttendance(req.body);
    io.emit('attendance:created', created);
    res.status(201).json({ success: true, attendance: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/attendance/:id', (req, res) => {
  try {
    const updated = db.updateAttendance(req.params.id, req.body);
    io.emit('attendance:updated', updated);
    res.json({ success: true, attendance: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp Logs Endpoints
app.get('/api/whatsapp/logs', (req, res) => {
  res.json(db.getState().whatsappLogs || []);
});

// 13. WhatsApp Baileys Gateway Status
app.get('/api/whatsapp/status', (req, res) => {
  res.json(baileysService.getState());
});

// 14. WhatsApp Baileys Generate Pair QR Code
app.get('/api/whatsapp/qr', async (req, res) => {
  try {
    const qrDataUrl = await baileysService.generateQR();
    res.json({ qrCodeDataUrl: qrDataUrl, status: baileysService.getState().status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. WhatsApp Baileys Toggle/Pair Session
app.post('/api/whatsapp/pair', (req, res) => {
  try {
    const { isConnected, phoneNumber } = req.body;
    baileysService.setConnected(isConnected, phoneNumber);
    res.json({ success: true, state: baileysService.getState() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16. WhatsApp Update Templates
app.post('/api/whatsapp/templates', (req, res) => {
  try {
    const { templates } = req.body;
    const updated = baileysService.updateTemplates(templates);
    res.json({ success: true, templates: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17. Send WhatsApp Notification (Baileys Gateway)
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, patientName, name, eventType, subject, content, message } = req.body;
    const log = await baileysService.sendMessage({
      phone: phone || '',
      patientName: patientName || name || 'Patient',
      eventType: eventType || subject || 'Hospital Notification',
      content: content || message || ''
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Reset to Initial Demo Data
app.post('/api/reset-demo', (req, res) => {
  try {
    const freshData = db.reset();
    io.emit('state:sync', freshData);
    res.json({ success: true, state: freshData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SOCKET.IO REAL-TIME EVENT BUS (SUB-MILLISECOND PUSH ACROSS SCREENS)
// ============================================================================
io.on('connection', (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);

  // Send initial full state immediately on connection
  socket.emit('state:sync', db.getState());
  socket.emit('baileys:status', baileysService.getState());
  if (baileysService.getState().qrCodeDataUrl) {
    socket.emit('baileys:qr', {
      qrCodeDataUrl: baileysService.getState().qrCodeDataUrl,
      status: baileysService.getState().status
    });
  }

  // Socket request for new QR
  socket.on('baileys:request-qr', async () => {
    await baileysService.generateQR();
  });

  // Socket direct send message
  socket.on('baileys:send-msg', async (payload) => {
    await baileysService.sendMessage(payload);
  });

  // Real-time token call trigger from any portal
  socket.on('token:call', (payload) => {
    io.emit('token:called', payload);
  });

  // Real-time lab report ready trigger
  socket.on('lab:mark-ready', (orderId) => {
    const updated = db.updateLabOrder(orderId, {
      overallStatus: 'completed',
      isReportReady: true,
      isReceived: false,
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.emit('lab:updated', updated);
  });

  // Real-time lab report received trigger
  socket.on('lab:mark-received', (orderId) => {
    const updated = db.updateLabOrder(orderId, {
      isReceived: true,
      receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    io.emit('lab:updated', updated);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ============================================================================
// SERVE PRODUCTION VITE FRONTEND (SPA FALLBACK FOR COOLIFY / DOCKER DEPLOY)
// ============================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
  console.log('[Static] Serving production frontend build from', DIST_DIR);
}

server.listen(PORT, () => {
  console.log(`[DIGIHOS Backend] Running on http://localhost:${PORT}`);
  console.log(`[Socket.io] WebSocket Gateway ready for lightning-speed multi-portal push`);
});
