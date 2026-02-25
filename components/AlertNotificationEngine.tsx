'use client';
import { useEffect, useRef } from 'react';
import { useFactory } from '@/context/FactoryContext';

// Generate a beep/alarm sound using Web Audio API — no external files needed
function playAlarmSound(type: 'critical' | 'warning') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'critical') {
      // Two-tone urgent alarm
      const freqs = [880, 660, 880, 660];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.18 + 0.16);
        osc.start(ctx.currentTime + i * 0.18);
        osc.stop(ctx.currentTime + i * 0.18 + 0.18);
      });
    } else {
      // Single soft chime for warning
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // Silently fail if audio context not available
  }
}

function requestBrowserNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  const send = () => {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sugarnxt-alert',
        requireInteraction: false,
      });
    } catch {
      // Notifications may be blocked
    }
  };

  if (Notification.permission === 'granted') {
    send();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') send();
    });
  }
}

export default function AlertNotificationEngine() {
  const { alerts, machines } = useFactory();
  const lastAlertIdRef = useRef<string>('');
  const lastCriticalMachines = useRef<Set<string>>(new Set());
  const permissionRequested = useRef(false);

  // Request notification permission early (on first interaction / mount)
  useEffect(() => {
    if (!permissionRequested.current && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Request on first user interaction instead of immediately
        const handler = () => {
          Notification.requestPermission();
          permissionRequested.current = true;
          window.removeEventListener('click', handler);
        };
        window.addEventListener('click', handler, { once: true });
      }
      permissionRequested.current = true;
    }
  }, []);

  // Watch alerts array for new entries
  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[0];
    if (latest.id === lastAlertIdRef.current) return;
    lastAlertIdRef.current = latest.id;

    if (latest.severity === 'critical') {
      playAlarmSound('critical');
      requestBrowserNotification(
        `🚨 CRITICAL — ${latest.machineName}`,
        `${latest.title}\n${latest.detail}`,
      );
    } else if (latest.severity === 'warning') {
      playAlarmSound('warning');
      requestBrowserNotification(
        `⚠️ WARNING — ${latest.machineName}`,
        `${latest.title}`,
      );
    }
  }, [alerts]);

  // Watch machine status for critical transitions
  useEffect(() => {
    machines.forEach(m => {
      const wasCritical = lastCriticalMachines.current.has(m.id);
      if (m.status === 'critical' && !wasCritical) {
        lastCriticalMachines.current.add(m.id);
        playAlarmSound('critical');
        requestBrowserNotification(
          `🚨 ${m.name} — CRITICAL`,
          `Temperature: ${m.temp.toFixed(1)}°C | Vibration: ${m.vibration.toFixed(2)} mm/s | Risk: ${m.riskScore}%`,
        );
      } else if (m.status !== 'critical' && wasCritical) {
        lastCriticalMachines.current.delete(m.id);
      }
    });
  }, [machines.map(m => m.status).join(',')]);

  return null; // purely side-effect component
}
