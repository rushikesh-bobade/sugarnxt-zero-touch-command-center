'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFactory, AIAlert } from '@/context/FactoryContext';
import { AlertTriangle, AlertCircle, Info, Zap, Clock } from 'lucide-react';

function severityIcon(s: AIAlert['severity']) {
  if (s === 'critical') return <AlertTriangle className="w-3 h-3 text-[#ef4444]" />;
  if (s === 'warning') return <AlertCircle className="w-3 h-3 text-[#f59e0b]" />;
  return <Info className="w-3 h-3 text-[#22d3ee]" />;
}

function severityLabel(s: AIAlert['severity']) {
  if (s === 'critical') return { text: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' };
  if (s === 'warning') return { text: 'WARNING', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
  return { text: 'INFO', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' };
}

function machineColor(id: string) {
  if (id === 'boiler') return '#f59e0b';
  if (id === 'crusher') return '#22d3ee';
  return '#10b981';
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function AlertRow({ alert }: { alert: AIAlert }) {
  const sev = severityLabel(alert.severity);
  const mc = machineColor(alert.machineId);
  const riskColor = alert.riskScore >= 75 ? '#ef4444' : alert.riskScore >= 50 ? '#f59e0b' : '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-[#1e293b] last:border-0"
    >
      <div
        className="px-3 py-3 hover:bg-white/[0.03] transition-colors cursor-default"
        style={{ borderLeft: `3px solid ${sev.color}` }}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {severityIcon(alert.severity)}
          <span
            className="text-[10px] font-bold terminal-text px-1.5 py-0.5 rounded-md uppercase tracking-wider"
            style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
          >
            {sev.text}
          </span>
          <span
            className="text-[10px] font-semibold terminal-text px-1.5 py-0.5 rounded-md"
            style={{ color: mc, background: `${mc}18`, border: `1px solid ${mc}40` }}
          >
            {alert.machineName}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-[#64748b]">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] terminal-text">{formatTime(alert.timestamp)}</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-[13px] font-bold text-white mb-1 leading-snug">{alert.title}</p>

        {/* Detail */}
        <p className="text-xs text-[#94a3b8] mb-2 leading-relaxed">{alert.detail}</p>

        {/* Risk bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#f59e0b]" />
              <span className="text-[10px] text-[#64748b]">Risk</span>
              <span className="text-[10px] font-bold terminal-text" style={{ color: riskColor }}>{alert.riskScore}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#64748b]" />
              <span className="text-[10px] text-[#94a3b8]">~<span className="font-bold text-white">{alert.hoursToFailure}h</span> to failure</span>
            </div>
          </div>
          <div className="h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${alert.riskScore}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full rounded-full"
              style={{
                background: alert.riskScore >= 75
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : alert.riskScore >= 50
                    ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                    : '#10b981'
              }}
            />
          </div>
        </div>

        {/* Recommended action */}
        <div className="flex items-start gap-1.5 rounded-lg px-2 py-1.5" style={{ background: `${sev.color}08` }}>
          <span className="text-[10px] terminal-text shrink-0 mt-px" style={{ color: sev.color }}>▶</span>
          <span className="text-[11px] text-[#22d3ee] leading-snug">{alert.action}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface AIAlertsPanelProps {
  maxHeight?: string;
  showTitle?: boolean;
}

export default function AIAlertsPanel({ maxHeight = '100%', showTitle = true }: AIAlertsPanelProps) {
  const { alerts } = useFactory();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new alert arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [alerts.length]);

  return (
    <div className="w-full h-full flex flex-col">
      {showTitle && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">AI PREDICTIVE ALERTS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#475569] terminal-text">LIVE FEED</span>
            <span className="text-[9px] terminal-text px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b]">
              {alerts.length} events
            </span>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ maxHeight, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Info className="w-8 h-8 text-[#22d3ee]" />
            </motion.div>
            <p className="text-[11px] text-[#334155] terminal-text text-center">
              AI Engine monitoring all systems...<br />
              <span className="text-[10px] text-[#1e293b]">No anomalies detected</span>
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-[#22d3ee]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
