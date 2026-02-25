'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFactory } from '@/context/FactoryContext';
import { IndianRupee, Clock, TrendingUp, Zap } from 'lucide-react';

// Predict hours to maintenance based on risk score + status
function predictHoursToMaintenance(riskScore: number, status: string): number {
  if (status === 'critical') return Math.max(0.5, (100 - riskScore) * 0.05);
  if (status === 'warning') return Math.max(2, (100 - riskScore) * 0.15);
  return Math.max(8, (100 - riskScore) * 0.8);
}

function formatCountdown(hours: number): string {
  if (hours < 1) {
    const mins = Math.floor(hours * 60);
    const secs = Math.floor((hours * 3600) % 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function formatRupees(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.floor(amount)}`;
}

export function ROITicker() {
  const { sessionStartTime, kpis, machines, alerts } = useFactory();
  const [savings, setSavings] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prevSavings, setPrevSavings] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - sessionStartTime;
      const elapsedHrs = elapsedMs / 3600000;
      setElapsed(elapsedMs);

      // ₹15,000/hr downtime cost × hours prevented + ₹800/alert in early detection savings
      const downtimeSavings = kpis.downtimePrevented * 15000;
      const alertSavings = alerts.filter(a => a.severity !== 'healthy').length * 800;
      const efficiencySavings = (kpis.plantEfficiency - 85) * elapsedHrs * 500;
      const total = Math.max(0, downtimeSavings + alertSavings + efficiencySavings);

      setPrevSavings(savings);
      setSavings(total);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, kpis, alerts, savings]);

  const elapsedSecs = Math.floor(elapsed / 1000);
  const elapsedMins = Math.floor(elapsedSecs / 60);
  const elapsedHrs = Math.floor(elapsedMins / 60);
  const displayTime = elapsedHrs > 0
    ? `${elapsedHrs}h ${(elapsedMins % 60).toString().padStart(2, '0')}m`
    : `${elapsedMins}m ${(elapsedSecs % 60).toString().padStart(2, '0')}s`;

  const isIncreasing = savings > prevSavings;

  return (
    <motion.div
      className="flex items-center gap-3 px-3 py-2 rounded-xl border"
      style={{
        background: 'rgba(16,185,129,0.06)',
        borderColor: 'rgba(16,185,129,0.25)',
      }}
      animate={isIncreasing ? { boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 12px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'] } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-1.5">
        <IndianRupee className="w-3.5 h-3.5 text-[#10b981]" />
        <div>
          <p className="text-[9px] text-[#475569] terminal-text leading-none mb-0.5">AI SAVINGS (SESSION)</p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={Math.floor(savings / 100)}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              className="text-sm font-black terminal-text text-[#10b981]"
            >
              {formatRupees(savings)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="w-px h-6 bg-[#1e293b]" />
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-[#475569]" />
        <span className="text-[10px] text-[#475569] terminal-text">{displayTime}</span>
      </div>
      {isIncreasing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1"
        >
          <TrendingUp className="w-3 h-3 text-[#10b981]" />
          <span className="text-[9px] text-[#10b981] terminal-text font-bold">SAVING</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function PredictiveCountdowns() {
  const { machines } = useFactory();
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  // Initialize countdowns from machine risk
  useEffect(() => {
    setCountdowns(prev => {
      const next = { ...prev };
      machines.forEach(m => {
        const predicted = predictHoursToMaintenance(m.riskScore, m.status);
        // Only update if machine status changed or not yet set
        const key = `${m.id}-${m.status}`;
        if (!next[m.id + '-base'] || next[m.id + '-status'] !== m.status) {
          next[m.id] = predicted * 3600; // store in seconds
          next[m.id + '-base'] = predicted * 3600;
          next[m.id + '-status'] = m.status as unknown as number;
        }
      });
      return next;
    });
  }, [machines.map(m => m.status + m.riskScore).join(',')]);

  // Tick down every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const next = { ...prev };
        machines.forEach(m => {
          if (typeof next[m.id] === 'number' && next[m.id] > 0) {
            next[m.id] = Math.max(0, next[m.id] - 1);
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [machines]);

  const machineColors: Record<string, string> = {
    crusher: '#22d3ee',
    boiler: '#f59e0b',
    centrifuge: '#10b981',
  };

  return (
    <div className="flex flex-col gap-2">
      {machines.map(m => {
        const secsLeft = countdowns[m.id] ?? 0;
        const hoursLeft = secsLeft / 3600;
        const color = m.status === 'critical' ? '#ef4444' : m.status === 'warning' ? '#f59e0b' : machineColors[m.id];
        const baseSeconds = (countdowns[m.id + '-base'] as number) || 1;
        const progress = Math.max(0, Math.min(1, secsLeft / baseSeconds));
        const urgency = m.status === 'critical' ? 'CRITICAL' : m.status === 'warning' ? 'SCHEDULED' : 'PREDICTED';

        return (
          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl border"
            style={{ background: `${color}08`, borderColor: `${color}25` }}>
            <div className="shrink-0">
              <Zap className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-semibold text-[#e2e8f0] truncate">{m.name}</p>
                <span className="text-[8px] terminal-text font-bold px-1.5 py-0.5 rounded"
                  style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
                  {urgency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#0f172a] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${(1 - progress) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: m.status === 'critical'
                        ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                        : m.status === 'warning'
                          ? 'linear-gradient(90deg,#10b981,#f59e0b)'
                          : color,
                    }}
                  />
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={Math.floor(secsLeft / 10)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold terminal-text shrink-0 w-20 text-right"
                    style={{ color }}
                  >
                    {m.status === 'critical'
                      ? `⚡ ${formatCountdown(hoursLeft)}`
                      : formatCountdown(hoursLeft)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
