import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Barcode, 
  Radio, 
  CheckCircle, 
  Printer, 
  Sparkles,
  QrCode,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const calculateAgeFromDOB = (dobString) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

export const RegisterPatientView = () => {
  const { 
    registerPatient, 
    setSelectedPatientForSticker, 
    setSelectedTokenForSlip,
    setIsLabelModalOpen, 
    showToast, 
    setActiveReceptionTab, 
    patients,
    tokens 
  } = useHospital();

  const DEFAULT_DOB = '2005-08-22';
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: DEFAULT_DOB,
    age: calculateAgeFromDOB(DEFAULT_DOB),
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    altPhone: '',
    // Vitals check at reception
    bp: '120/80',
    weight: '68',
    pulse: '74',
    temp: '98.6',
    spo2: '99',
    complaint: 'Fever and body aches for 2 days'
  });

  const nextNum = (patients || []).length + 1;
  const previewId = `DH-2026-${String(nextNum).padStart(3, '0')}`;

  const maxTokenNum = (tokens || []).reduce((max, t) => {
    if (!t || !t.tokenNo) return max;
    const match = String(t.tokenNo).match(/\d+/);
    const n = match ? parseInt(match[0], 10) : 0;
    return n > max ? n : max;
  }, 0);
  const previewToken = `TK-${String(maxTokenNum + 1).padStart(2, '0')}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dob') {
      const computedAge = calculateAgeFromDOB(value);
      setFormData(prev => ({
        ...prev,
        dob: value,
        age: computedAge !== '' ? computedAge : prev.age
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      phone: '',
      dob: DEFAULT_DOB,
      age: calculateAgeFromDOB(DEFAULT_DOB),
      gender: 'Male',
      bloodGroup: 'A+',
      address: '',
      emergencyName: '',
      emergencyRelation: 'Spouse',
      emergencyPhone: '',
      altPhone: '',
      bp: '120/80',
      weight: '68',
      pulse: '74',
      temp: '98.6',
      spo2: '99',
      complaint: ''
    });
    showToast('Form cleared');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in required fields (Full name and Phone number)');
      return;
    }

    const { newPatient, newToken } = registerPatient(formData);
    setSelectedPatientForSticker(newPatient);
    if (setSelectedTokenForSlip) {
      setSelectedTokenForSlip(newToken);
    }
    showToast(`Patient ${newPatient.fullName} registered! Token ${newToken.tokenNo} issued and placed in OPD Queue.`);
    handleClear();
    // Trigger thermal label modal (which auto-redirects to dashboard upon print or close)
    setIsLabelModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Page Title & Subtitle matching Screenshot 3 */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
          Register new patient
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>
          First time only — creates a permanent Patient ID with 2D/3D Barcode & NFC Tag
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Patient details matching Screenshot 3 */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <User size={18} />
            </div>
            <h3 className="form-card-title">Patient details</h3>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label">
                Full name <span className="required-asterisk">*</span>
              </label>
              <input 
                type="text"
                name="fullName"
                required
                className="form-input"
                placeholder="Patient's full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone number <span className="required-asterisk">*</span>
              </label>
              <input 
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="Mobile number (WhatsApp enabled)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-4" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Date of birth <span className="required-asterisk">*</span></span>
                <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>Calendar</span>
              </label>
              <input 
                type="date"
                name="dob"
                required
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Age (Years) <span className="required-asterisk">*</span></span>
                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '1px 5px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>
                  Auto from DOB
                </span>
              </label>
              <input 
                type="number"
                name="age"
                required
                min="0"
                max="125"
                className="form-input"
                placeholder="Age in years"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Gender <span className="required-asterisk">*</span>
              </label>
              <select 
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood group</label>
              <select 
                name="bloodGroup"
                className="form-select"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input 
              type="text"
              name="address"
              className="form-input"
              placeholder="Street, area, district, pincode"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 2: Emergency contact matching Screenshot 3 */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <ShieldAlert size={18} />
            </div>
            <h3 className="form-card-title">Emergency contact</h3>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '18px' }}>
            <div className="form-group">
              <label className="form-label">
                Contact name <span className="required-asterisk">*</span>
              </label>
              <input 
                type="text"
                name="emergencyName"
                className="form-input"
                placeholder="Emergency contact person"
                value={formData.emergencyName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select 
                name="emergencyRelation"
                className="form-select"
                value={formData.emergencyRelation}
                onChange={handleChange}
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent / Father / Mother</option>
                <option value="Child">Son / Daughter</option>
                <option value="Sibling">Brother / Sister</option>
                <option value="Friend">Friend / Relative</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Contact phone <span className="required-asterisk">*</span>
              </label>
              <input 
                type="tel"
                name="emergencyPhone"
                className="form-input"
                placeholder="Emergency phone number"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate phone</label>
              <input 
                type="tel"
                name="altPhone"
                className="form-input"
                placeholder="Optional landline or second number"
                value={formData.altPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Reception Vitals & BP Check */}
        <div className="form-card" style={{ borderColor: '#e2e8f0', background: '#fafbfc' }}>
          <div className="form-card-header">
            <div className="form-card-icon" style={{ color: '#0284c7' }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 className="form-card-title" style={{ color: '#0284c7' }}>
                Reception Vitals Check & Triage
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Recorded at registration desk to show immediately in the doctor's portal
              </p>
            </div>
          </div>

          <div className="form-grid-4" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">BP Check (mmHg)</label>
              <input 
                type="text"
                name="bp"
                className="form-input"
                placeholder="e.g. 120/80"
                value={formData.bp}
                onChange={handleChange}
                style={{ fontWeight: 600 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input 
                type="text"
                name="weight"
                className="form-input"
                placeholder="e.g. 68"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pulse (bpm)</label>
              <input 
                type="text"
                name="pulse"
                className="form-input"
                placeholder="e.g. 74"
                value={formData.pulse}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temperature (°F)</label>
              <input 
                type="text"
                name="temp"
                className="form-input"
                placeholder="e.g. 98.6"
                value={formData.temp}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Complaint / Reason for Visit</label>
            <input 
              type="text"
              name="complaint"
              className="form-input"
              placeholder="e.g. High fever, headache, body aches"
              value={formData.complaint}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 4: Automated Patient ID & OPD Queue Assignment */}
        <div className="form-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1', marginTop: '16px' }}>
          <div className="form-card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="form-card-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
                <QrCode size={18} />
              </div>
              <div>
                <h3 className="form-card-title" style={{ color: '#0f172a', fontSize: '14.5px' }}>
                  Automated ID & OPD Token Assignment
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Permanent UHID allocation, scannable barcode generation, and doctor consultation routing
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                background: '#ecfdf5', 
                color: '#047857', 
                border: '1px solid #a7f3d0', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '11.5px', 
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                <MessageSquare size={12} />
                <span>WhatsApp Notification Active</span>
              </span>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '12px', 
            background: '#ffffff', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Permanent UHID
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                {previewId}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Assigned OPD Token
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                {previewToken} (OPD Queue)
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Consulting Doctor
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                Dr. Arvind Ramesh (102)
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Physical Tag Print
              </span>
              <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={13} color="#10b981" />
                Thermal Sticker & NFC
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn-primary-amber" style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={15} />
              <span>Save & Register Patient</span>
            </button>

            <button type="button" className="btn-secondary-clean" onClick={handleClear} style={{ padding: '8px 14px', fontSize: '13px' }}>
              <span>Clear Form</span>
            </button>

            <button type="button" className="btn-secondary-clean" onClick={() => setActiveReceptionTab('dashboard')} style={{ padding: '8px 14px', fontSize: '13px' }}>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
