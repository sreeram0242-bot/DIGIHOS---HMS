import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Stethoscope, 
  FlaskConical, 
  Activity, 
  Radio, 
  PhoneCall,
  Building2
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const QueueDisplay = () => {
  const { tokens, prescriptions, labOrders, showToast } = useHospital();
  const displayContainerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAutoVoiceOn, setIsAutoVoiceOn] = useState(true); // Toggle for auto-reading current token
  const [currentTime, setCurrentTime] = useState(new Date());

  // Manually selected called token or fallback to active token
  const [manualCalledTokenNo, setManualCalledTokenNo] = useState(null);
  const lastAnnouncedTokenRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const currentCallIdRef = useRef(0);

  // Clean up any pending speech timers on unmount
  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (displayContainerRef.current?.requestFullscreen) {
        displayContainerRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const safeTokens = (Array.isArray(tokens) ? tokens : []).filter(t => t && typeof t === 'object' && t.tokenNo);
  const safePrescriptions = (Array.isArray(prescriptions) ? prescriptions : []).filter(p => p && typeof p === 'object');
  const safeLabOrders = (Array.isArray(labOrders) ? labOrders : []).filter(l => l && typeof l === 'object');

  // Determine active calling token
  const defaultCallingToken = safeTokens.find(t => t?.status === 'in-consultation') || safeTokens.find(t => t?.status === 'waiting') || safeTokens[0] || null;
  const activeCallingToken = (manualCalledTokenNo && safeTokens.find(t => t?.tokenNo === manualCalledTokenNo)) || defaultCallingToken;

  // Upcoming OPD Queue
  const upcomingDoctorTokens = safeTokens.filter(t => t?.status === 'waiting' && t?.tokenNo !== activeCallingToken?.tokenNo);
  const completedTokensCount = safeTokens.filter(t => t?.status === 'completed').length;

  // =========================================================================
  // LAB REPORTS READY QUEUE (MOVED UP):
  // Shows patients whose report is marked READY and NOT yet RECEIVED by patient
  // If lab assistant marks ready -> appears here
  // If lab assistant clicks received -> immediately hides from here
  // =========================================================================
  const labReportsReady = safeLabOrders.filter(l => (l.overallStatus === 'completed' || l.isReportReady) && !l.isReceived);

  // =========================================================================
  // PHARMACY DISPENSARY QUEUE (MOVED DOWN)
  // =========================================================================
  const pharmacyQueue = safePrescriptions.filter(p => p.dispensedStatus === 'pending' || p.dispensedStatus === 'dispensed').slice(0, 4);

  // =========================================================================
  // VOICE ANNOUNCEMENT: ONLY TOKEN NUMBER AND PATIENT NAME, REPEATED 3 TIMES
  // SLOW, CRISP, AND UNHURRIED SPEECH SYNTHESIS (PROTECTED AGAINST RACE CONDITIONS)
  // =========================================================================
  const announceToken = (targetToken) => {
    const tok = targetToken || activeCallingToken;
    if (!tok) return;

    if (isAudioMuted) {
      showToast('Audio is currently muted on this display.');
      return;
    }

    // Cancel any previous pending sequence
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const thisCallId = ++currentCallIdRef.current;

    // 1. Dual-tone pleasant harmonic hospital chime
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const playTone = (freq, startOffset, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
          gain.gain.setValueAtTime(0.22, ctx.currentTime + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + startOffset);
          osc.stop(ctx.currentTime + startOffset + duration);
        };

        // Chime: D5 (587Hz) followed by A5 (880Hz)
        playTone(587.33, 0, 0.42);
        playTone(880.00, 0.25, 0.65);
      }
    } catch {
      // AudioContext fallback
    }

    // 2. Speech Synthesis: Speak ONLY Token Number and Patient Name, EXACTLY 3 TIMES
    if ('speechSynthesis' in window) {
      // Clean token formatting so letters are clearly spelled out: "TK-02" -> "T K 0 2"
      const cleanToken = tok.tokenNo ? tok.tokenNo.replace('-', ' ') : 'Token';
      const cleanName = tok.patientName || 'Patient';
      
      // Strict phrase: ONLY token number and patient name
      const phraseToSpeak = `Token ${cleanToken}, ${cleanName}.`;

      let repetition = 0;
      const speakSequence = () => {
        if (thisCallId !== currentCallIdRef.current) return; // Guard against stale calls
        if (repetition >= 3) return;
        repetition++;

        const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
        // Requirement: "make the voice little slow and clealry"
        utterance.rate = 0.76; // Calm, clear, slow, perfectly intelligible
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        utterance.onend = () => {
          if (thisCallId !== currentCallIdRef.current) return;
          if (repetition < 3) {
            speechTimeoutRef.current = setTimeout(speakSequence, 750); // 750ms natural pause between repetitions
          }
        };

        utterance.onerror = () => {
          if (thisCallId !== currentCallIdRef.current) return;
          if (repetition < 3) {
            speechTimeoutRef.current = setTimeout(speakSequence, 750);
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      // Delay speech slightly to let the harmonic chime ring first
      speechTimeoutRef.current = setTimeout(speakSequence, 800);
    }

    showToast(`Calling Token ${tok.tokenNo}: ${tok.patientName} (Voice x3)`);
  };

  // =========================================================================
  // AUTO-ANNOUNCE TOGGLE EFFECT:
  // When toggle is ON, it automatically reads whenever a token becomes current!
  // =========================================================================
  useEffect(() => {
    if (isAutoVoiceOn && activeCallingToken?.tokenNo) {
      if (lastAnnouncedTokenRef.current !== activeCallingToken.tokenNo) {
        lastAnnouncedTokenRef.current = activeCallingToken.tokenNo;
        announceToken(activeCallingToken);
      }
    }
  }, [activeCallingToken?.tokenNo, isAutoVoiceOn]);

  // =========================================================================
  // REMOTE LIVE AUDIO TRIGGER VIA WEBSOCKETS (DOCTOR CALL NEXT TRIGGER)
  // When Doctor clicks Call Next in their cabin, Token TV announces immediately
  // =========================================================================
  useEffect(() => {
    const handleRemoteCall = (event) => {
      const payload = event.detail;
      if (!payload || !payload.tokenNo) return;
      const matched = tokens.find(t => t.tokenNo === payload.tokenNo) || {
        tokenNo: payload.tokenNo,
        patientName: payload.patientName || 'Patient',
        room: payload.room || 'Consultation Room 102'
      };
      setManualCalledTokenNo(payload.tokenNo);
      lastAnnouncedTokenRef.current = payload.tokenNo;
      announceToken(matched);
    };

    window.addEventListener('hospital:token-called', handleRemoteCall);
    return () => window.removeEventListener('hospital:token-called', handleRemoteCall);
  }, [tokens]);

  const handleToggleAutoVoice = () => {
    const nextVal = !isAutoVoiceOn;
    setIsAutoVoiceOn(nextVal);
    if (nextVal && activeCallingToken) {
      announceToken(activeCallingToken);
    }
    showToast(`Auto-Read Token Calls: ${nextVal ? 'ACTIVATED (ON)' : 'DEACTIVATED (OFF)'}`);
  };

  const handleSelectTokenToCall = (tok) => {
    setManualCalledTokenNo(tok.tokenNo);
    lastAnnouncedTokenRef.current = tok.tokenNo;
    announceToken(tok);
  };

  const handleCallNextWaiting = () => {
    if (upcomingDoctorTokens.length > 0) {
      const nextTok = upcomingDoctorTokens[0];
      setManualCalledTokenNo(nextTok.tokenNo);
      lastAnnouncedTokenRef.current = nextTok.tokenNo;
      announceToken(nextTok);
    } else {
      announceToken(activeCallingToken);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div 
      ref={displayContainerRef}
      style={{ 
        width: '100%', 
        maxWidth: isFullscreen ? '100vw' : '1280px', 
        minHeight: isFullscreen ? '100vh' : 'auto',
        margin: '0 auto',
        backgroundColor: '#ffffff', // Clean Pure White Background requested by User
        color: '#0f172a',
        borderRadius: isFullscreen ? '0' : '14px',
        border: isFullscreen ? 'none' : '1px solid #cbd5e1',
        boxShadow: isFullscreen ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* 1. TOP HEADER: Professional Hospital White & Navy Theme */}
      <div style={{
        background: '#ffffff',
        borderBottom: '3px solid #0f2b48',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Hospital Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#0f2b48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(15, 43, 72, 0.25)',
            flexShrink: 0
          }}>
            <Activity size={26} strokeWidth={2.8} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '22px', 
                fontWeight: 900, 
                color: '#0f2b48', 
                letterSpacing: '0.5px',
                lineHeight: 1.1,
                margin: 0
              }}>
                COIMBATORE GENERAL HOSPITAL
              </h1>
              <span style={{ 
                background: '#e0f2fe', 
                color: '#0369a1', 
                border: '1px solid #bae6fd', 
                fontSize: '11px', 
                fontWeight: 800, 
                padding: '2px 8px', 
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Token Display
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', fontWeight: 500 }}>
              OPD Consultation, Diagnostics & Pharmacy Calling System &bull; Ground Floor Concourse
            </div>
          </div>
        </div>

        {/* Live Clock & Action Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Digital Clock */}
          <div style={{ 
            background: '#f8fafc', 
            padding: '6px 16px', 
            borderRadius: '8px', 
            border: '1.5px solid #e2e8f0',
            textAlign: 'right'
          }}>
            <div style={{ 
              fontSize: '19px', 
              fontWeight: 800, 
              color: '#0f2b48', 
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px'
            }}>
              {formattedTime}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {formattedDate}
            </div>
          </div>

          {/* AUTO-VOICE READ TOGGLE SWITCH (User requirement: reads for all current tokens when on) */}
          <button 
            type="button"
            onClick={handleToggleAutoVoice}
            style={{ 
              padding: '8px 14px', 
              fontSize: '12.5px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '7px',
              background: isAutoVoiceOn ? '#ecfdf5' : '#f8fafc',
              color: isAutoVoiceOn ? '#059669' : '#64748b',
              border: `1.5px solid ${isAutoVoiceOn ? '#a7f3d0' : '#e2e8f0'}`,
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: isAutoVoiceOn ? '0 2px 8px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
            title={isAutoVoiceOn ? 'Auto-reading of current token is active' : 'Turn on auto-voice reading for current token'}
          >
            <Radio size={14} color={isAutoVoiceOn ? '#059669' : '#94a3b8'} />
            <span>Auto-Announce: {isAutoVoiceOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button 
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            style={{ 
              padding: '8px 12px', 
              fontSize: '12.5px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isAudioMuted ? '#fef2f2' : '#f8fafc',
              color: isAudioMuted ? '#ef4444' : '#475569',
              border: `1.5px solid ${isAudioMuted ? '#fca5a5' : '#e2e8f0'}`,
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600
            }}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isAudioMuted ? 'Muted' : 'Audio'}</span>
          </button>

          {/* Manual Announce Button: Speaks Token Number + Name 3 Times */}
          <button 
            type="button"
            style={{ 
              padding: '8px 14px', 
              fontSize: '12.5px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '7px',
              background: '#0f2b48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(15, 43, 72, 0.25)',
              transition: 'background 0.15s ease'
            }}
            onClick={() => announceToken(activeCallingToken)}
            title="Speaks Token Number and Patient Name 3 times clearly"
          >
            <Volume2 size={15} />
            <span>Voice Call (3x)</span>
          </button>

          {/* Fullscreen Button */}
          <button 
            type="button"
            onClick={toggleFullscreen}
            style={{ 
              padding: '8px 14px', 
              fontSize: '12.5px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isFullscreen ? '#0284c7' : '#f8fafc',
              color: isFullscreen ? '#ffffff' : '#0f172a',
              border: isFullscreen ? 'none' : '1.5px solid #cbd5e1',
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: isFullscreen ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
            }}
            title={isFullscreen ? 'Exit Full Screen TV' : 'Enter Full Screen Mode'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV'}</span>
          </button>
        </div>
      </div>

      {/* 2. LIVE INFO STRIP */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Active Station:</span>
            <strong style={{ color: '#0f172a' }}>Consultation Room 102</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Doctor:</span>
            <strong style={{ color: '#0f2b48' }}>Dr. Arvind Ramesh, MD (Gen Med)</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Waiting in OPD:</span>
            <strong style={{ color: '#0284c7' }}>{upcomingDoctorTokens.length + 1} Patients</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Lab Reports Ready:</span>
            <strong style={{ color: '#9333ea' }}>{labReportsReady.length} Ready</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            Consulted Today: <strong style={{ color: '#16a34a' }}>{completedTokensCount}</strong>
          </span>
          <span style={{ 
            background: '#ecfdf5', 
            color: '#059669', 
            border: '1px solid #a7f3d0',
            padding: '2px 10px',
            borderRadius: '5px',
            fontWeight: 700,
            fontSize: '11.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <CheckCircle2 size={13} /> TV Queue Active
          </span>
        </div>
      </div>

      {/* 3. MAIN CENTER DISPLAY (WHITE BACKGROUND, CLEAN HIGH CONTRAST) */}
      <div style={{ 
        flex: 1, 
        padding: isFullscreen ? '28px 36px' : '22px 28px', 
        display: 'grid', 
        gridTemplateColumns: isFullscreen ? '1.25fr 1fr' : '1.2fr 1fr', 
        gap: '24px',
        backgroundColor: '#ffffff'
      }}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO "NOW CALLING" (PRISTINE WHITE CARD WITH BOLD NAVY) */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '2.5px solid #0f2b48',
          boxShadow: '0 8px 30px rgba(15, 43, 72, 0.1)',
          padding: isFullscreen ? '36px 32px' : '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Top Badge: Calling Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ 
              background: '#0f2b48', 
              color: '#ffffff', 
              fontWeight: 800, 
              fontSize: '12px', 
              padding: '6px 14px', 
              borderRadius: '6px', 
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
              <span>NOW CALLING &bull; PLEASE PROCEED</span>
            </div>

            <div style={{ 
              fontSize: '12px', 
              color: '#0284c7', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: '#f0f9ff',
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid #bae6fd'
            }}>
              <Radio size={14} color="#0284c7" />
              <span>Voice: 3 Times (Clear & Slow)</span>
            </div>
          </div>

          {/* Central Hero Token Block */}
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              color: '#64748b', 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              marginBottom: '6px' 
            }}>
              CURRENT PATIENT TOKEN NUMBER
            </div>

            {/* Giant Monospace Token Number in Deep Navy */}
            <div style={{ 
              fontSize: isFullscreen ? '104px' : '84px', 
              fontWeight: 900, 
              fontFamily: 'var(--font-mono)', 
              color: '#0f2b48',
              lineHeight: 1,
              letterSpacing: '2px',
              margin: '10px 0'
            }}>
              {activeCallingToken?.tokenNo || 'TK-01'}
            </div>

            {/* Patient Name */}
            <div style={{ 
              fontSize: isFullscreen ? '34px' : '28px', 
              fontWeight: 900, 
              color: '#0f172a', 
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.2px',
              marginTop: '6px'
            }}>
              {activeCallingToken?.patientName || 'Waiting Patient'}
            </div>

            {/* Badges: UHID, Age, Gender, Category */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              marginTop: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                background: '#f1f5f9', 
                color: '#334155', 
                border: '1px solid #cbd5e1', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                UHID: {activeCallingToken?.patientId || 'DH-2026-001'}
              </span>

              <span style={{ 
                background: '#f1f5f9', 
                color: '#334155', 
                border: '1px solid #cbd5e1', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                fontWeight: 600
              }}>
                {activeCallingToken?.gender}, {activeCallingToken?.age} Yrs
              </span>

              <span style={{ 
                background: '#e0f2fe', 
                color: '#0369a1', 
                border: '1px solid #bae6fd', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                fontWeight: 700
              }}>
                {activeCallingToken?.type || 'General OPD'}
              </span>
            </div>
          </div>

          {/* Assigned Consultation Room & Doctor Banner */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #bae6fd',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '9px', 
                background: '#0284c7', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800 }}>
                  CONSULTATION ROOM
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f2b48' }}>
                  {activeCallingToken?.room || 'Consultation Room 102'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
                CONSULTING PHYSICIAN
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                {activeCallingToken?.doctor || 'Dr. Arvind Ramesh, MD'}
              </div>
            </div>
          </div>

          {/* Quick Audio & Next Token Action Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px', 
            marginTop: '16px' 
          }}>
            <button 
              type="button"
              onClick={() => announceToken(activeCallingToken)}
              style={{
                background: '#0f2b48',
                color: '#ffffff',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(15, 43, 72, 0.2)'
              }}
            >
              <Volume2 size={17} />
              <span>Announce (Voice x3)</span>
            </button>

            <button 
              type="button"
              onClick={handleCallNextWaiting}
              style={{
                background: '#ffffff',
                color: '#0f2b48',
                border: '2px solid #0f2b48',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>Call Next Token</span>
              <ChevronRight size={17} />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MULTI-DEPARTMENT QUEUES */}
        {/* 1. OPD DOCTOR QUEUE */}
        {/* 2. LAB REPORTS READY (MOVED UP - REPLACED PLACEMENT WITH PHARMACY) */}
        {/* 3. PHARMACY COUNTER (MOVED DOWN) */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* QUEUE CARD 1: OPD Consultation - Next In Line */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '1.5px solid #e2e8f0', 
            padding: '14px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={17} color="#0284c7" />
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  Next in Line &bull; OPD Doctor Queue
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Room 102
              </span>
            </div>

            {upcomingDoctorTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '14px', color: '#94a3b8', fontSize: '12.5px' }}>
                No subsequent waiting tokens in queue.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {upcomingDoctorTokens.slice(0, 3).map((tok, idx) => (
                  <div 
                    key={tok.tokenNo}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '15px', 
                        fontWeight: 900, 
                        color: '#0f2b48',
                        background: '#e2e8f0',
                        padding: '3px 8px',
                        borderRadius: '5px'
                      }}>
                        {tok.tokenNo}
                      </span>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                          {tok.patientName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {tok.patientId} &bull; {tok.gender}, {tok.age}Y
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: idx === 0 ? '#0284c7' : '#64748b',
                        background: idx === 0 ? '#e0f2fe' : '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {idx === 0 ? 'Next in Line' : `${idx + 1}${idx === 1 ? 'nd' : 'rd'} in Queue`}
                      </span>

                      {/* Clickable Call Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTokenToCall(tok)}
                        style={{
                          background: '#0f2b48',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 9px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title={`Call ${tok.tokenNo} now`}
                      >
                        <Volume2 size={12} />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* QUEUE CARD 2: DIAGNOSTIC LAB REPORTS READY (MOVED UP AS REQUESTED) */}
          {/* Only shows patients whose report is marked READY and NOT YET RECEIVED */}
          {/* If lab assistant marks ready -> shows here */}
          {/* If lab assistant clicks received -> hides here */}
          {/* ======================================================================= */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '2px solid #e9d5ff', 
            padding: '14px 18px',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.06)',
            flex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="#9333ea" />
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  Diagnostic Lab &bull; Reports Ready for Pickup
                </h3>
              </div>
              <span style={{ 
                fontSize: '11.5px', 
                background: '#faf5ff', 
                color: '#7e22ce', 
                fontWeight: 700,
                border: '1px solid #f3e8ff',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {labReportsReady.length} Available
              </span>
            </div>

            {labReportsReady.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12.5px' }}>
                No lab reports currently awaiting collection.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {labReportsReady.map((order) => (
                  <div 
                    key={order.orderId}
                    style={{
                      background: '#faf5ff',
                      borderRadius: '8px',
                      border: '1.5px solid #e9d5ff',
                      padding: '9px 13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '14px', 
                        fontWeight: 900, 
                        color: '#7e22ce',
                        background: '#f3e8ff',
                        padding: '3px 8px',
                        borderRadius: '5px'
                      }}>
                        {order.tokenNo}
                      </span>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                          {order.patientName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Tests: {order.tests.map(t => t.name).join(', ')}
                        </div>
                      </div>
                    </div>

                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: '#059669',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} color="#059669" />
                      <span>Report Ready</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* QUEUE CARD 3: PHARMACY DISPENSING COUNTER (MOVED DOWN AS REQUESTED) */}
          {/* ======================================================================= */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '1.5px solid #bbf7d0', 
            padding: '14px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            flex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={18} color="#16a34a" />
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  Pharmacy Counter &bull; Medicines Ready for Pickup
                </h3>
              </div>
              <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>
                Counter 01 & 02
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pharmacyQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px', color: '#94a3b8', fontSize: '12.5px' }}>
                  No pending prescriptions awaiting dispensary pickup.
                </div>
              ) : (
                pharmacyQueue.map(p => (
                  <div 
                    key={p.prescriptionId}
                    style={{
                      background: '#f0fdf4',
                      borderRadius: '7px',
                      border: '1px solid #bbf7d0',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '13px', 
                        fontWeight: 800, 
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {p.tokenNo}
                      </span>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{p.patientName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({p.prescriptionId})</span>
                      </div>
                    </div>

                    <span style={{ 
                      fontSize: '11.5px', 
                      fontWeight: 700, 
                      color: '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={13} /> Counter 01 Ready
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM TICKER: Moving Information Marquee (High Contrast Navy & White) */}
      <div style={{
        background: '#0f2b48',
        borderTop: '2px solid #0a1f36',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#ffffff',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontWeight: 800, color: '#38bdf8' }}>
          <AlertCircle size={16} color="#38bdf8" />
          <span>HOSPITAL NOTICE:</span>
        </div>

        <div style={{ 
          flex: 1, 
          overflow: 'hidden', 
          whiteSpace: 'nowrap', 
          margin: '0 20px',
          color: '#f8fafc',
          fontSize: '13px',
          fontWeight: 500
        }}>
          <span>
            Please watch the screen for your token number &bull; If your lab report is ready, please collect from Diagnostic Lab Desk &bull; Pharmacy Counter 01 & 02 are ready for prescription dispensing &bull; Keep your token slip ready before entering Consultation Room 102 &bull; Emergency Trauma Hotline: +91 422 2589100.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: '12.5px', color: '#38bdf8', fontWeight: 700 }}>
          <PhoneCall size={14} />
          <span>Helpdesk: Ext 100</span>
        </div>
      </div>
    </div>
  );
};
