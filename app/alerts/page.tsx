'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFactory, AIAlert } from '@/context/FactoryContext';
import { useFactorySimulation } from '@/hooks/useFactorySimulation';
import AIAlertsPanel from '@/components/AIAlertsPanel';
import SplashScreen from '@/components/SplashScreen';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  Trash2,
  Download,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';

type FilterType = 'all' | 'critical' | 'warning';

function exportAlerts(alerts: AIAlert[], format: 'csv' | 'json') {
  if (alerts.length === 0) return;

  if (format === 'json') {
    const data = JSON.stringify(
      alerts.map(a => ({
        id: a.id,
        timestamp: a.timestamp.toISOString(),
        machine: a.machineName,
        severity: a.severity,
        title: a.title,
        detail: a.detail,
        recommendedAction: a.action,
        riskScore: a.riskScore,
        hoursToFailure: a.hoursToFailure,
      })),
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sugarnxt-alerts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const headers = ['Timestamp', 'Machine', 'Severity', 'Risk Score (%)', 'Hours to Failure', 'Title', 'Detail', 'Recommended Action'];
    const rows = alerts.map(a => [
      a.timestamp.toISOString(),
      a.machineName,
      a.severity,
      a.riskScore,
      a.hoursToFailure,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.detail.replace(/"/g, '""')}"`,
      `"${a.action.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sugarnxt-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function AlertCard({ alert }: { alert: AIAlert }) {
  const sevColor = alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#f59e0b' : '#22d3ee';
  const cardBg = alert.severity === 'critical' ? 'rgba(239,68,68,0.07)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.07)' : 'rgba(34,211,238,0.05)';
  const machineColor = alert.machineId === 'boiler' ? '#f59e0b' : alert.machineId === 'crusher' ? '#22d3ee' : '#10b981';
  const riskColor = alert.riskScore >= 75 ? '#ef4444' : alert.riskScore >= 50 ? '#f59e0b' : '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.005 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: `${sevColor}40`, background: cardBg }}
    >
      <div className="flex items-stretch">
        {/* Severity stripe */}
        <div className="w-[3px] shrink-0" style={{ background: sevColor }} />

        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {alert.severity === 'critical'
              ? <AlertTriangle className="w-4 h-4" style={{ color: sevColor }} />
              : alert.severity === 'warning'
                ? <AlertCircle className="w-4 h-4" style={{ color: sevColor }} />
                : <Info className="w-4 h-4" style={{ color: sevColor }} />
            }
            <span
              className="text-[11px] font-bold terminal-text px-2 py-0.5 rounded-md uppercase tracking-wider"
              style={{ color: sevColor, background: `${sevColor}20`, border: `1px solid ${sevColor}50` }}
            >
              {alert.severity}
            </span>
            <span
              className="text-[11px] font-semibold terminal-text px-2 py-0.5 rounded-md"
              style={{ color: machineColor, background: `${machineColor}18`, border: `1px solid ${machineColor}40` }}
            >
              {alert.machineName}
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-1 text-[#64748b]">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] terminal-text">
                {alert.timestamp.toLocaleTimeString('en-IN', { hour12: false })}
              </span>
            </div>
          </div>

          {/* Title */}
          <p className="text-sm font-bold text-white mb-1.5 leading-snug">{alert.title}</p>

          {/* Detail */}
          <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">{alert.detail}</p>

          {/* Risk bar + score */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="text-xs text-[#94a3b8]">Risk Probability</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold terminal-text" style={{ color: riskColor }}>{alert.riskScore}%</span>
                <div className="flex items-center gap-1 text-[#64748b]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs text-[#94a3b8]">Failure in <span className="font-bold text-white">{alert.hoursToFailure}h</span></span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${alert.riskScore}%` }}
                transition={{ duration: 0.7 }}
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
          <div className="rounded-lg px-3 py-2 border" style={{ background: `${sevColor}08`, borderColor: `${sevColor}25` }}>
            <p className="text-[10px] font-bold text-[#64748b] terminal-text uppercase tracking-wider mb-1">Recommended Action</p>
            <p className="text-xs text-[#22d3ee] leading-relaxed">{alert.action}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertsPage() {
  useFactorySimulation();
  const { alerts, setAlerts, isLoading } = useFactory();
  const [filter, setFilter] = useState<FilterType>('all');
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const warnCount = alerts.filter(a => a.severity === 'warning').length;

  if (isLoading) return <SplashScreen />;

  return (
    <div className="h-full overflow-hidden flex flex-col p-3 gap-3">
      {/* Page header */}
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#22d3ee]" />
            <h2 className="text-sm font-bold text-[#f1f5f9]">AI Predictive Alerts</h2>
          </div>
          <span className="text-[9px] terminal-text text-[#475569] bg-[#1e293b] px-2 py-0.5 rounded">
            {alerts.length} TOTAL EVENTS
          </span>
          {critCount > 0 && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[9px] terminal-text font-bold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 px-2 py-0.5 rounded"
            >
              {critCount} CRITICAL
            </motion.span>
          )}
        </div>
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setExportOpen(o => !o)}
                disabled={alerts.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] text-[#64748b] text-[10px] terminal-text hover:text-[#22d3ee] hover:border-[#22d3ee]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                Export
              </motion.button>
              <AnimatePresence>
                {exportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 z-50 flex flex-col gap-1 p-1.5 rounded-xl border border-[#334155] bg-[#0d1b2a] shadow-2xl min-w-[130px]"
                  >
                    <button
                      onClick={() => { exportAlerts(alerts, 'csv'); setExportOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] terminal-text text-[#94a3b8] hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all text-left"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => { exportAlerts(alerts, 'json'); setExportOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] terminal-text text-[#94a3b8] hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 transition-all text-left"
                    >
                      <Zap className="w-3 h-3" />
                      Export as JSON
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAlerts([])}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] text-[#64748b] text-[10px] terminal-text hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </motion.button>
          </div>
      </div>

      {/* Stat strip */}
      <div className="shrink-0 grid grid-cols-3 gap-2">
        {[
          { label: 'Critical', count: critCount, color: '#ef4444', key: 'critical' as FilterType },
          { label: 'Warnings', count: warnCount, color: '#f59e0b', key: 'warning' as FilterType },
          { label: 'Total', count: alerts.length, color: '#22d3ee', key: 'all' as FilterType },
        ].map(({ label, count, color, key }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-xl border p-2.5 text-left transition-all ${filter === key ? 'ring-1' : 'opacity-70 hover:opacity-100'}`}
            style={{
              background: `${color}10`,
              borderColor: `${color}30`,
              ringColor: color,
            }}
          >
            <p className="text-xl font-black terminal-text" style={{ color }}>{count}</p>
            <p className="text-[9px] text-[#475569]">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="shrink-0 flex items-center gap-2">
        <Filter className="w-3 h-3 text-[#475569]" />
        {(['all', 'critical', 'warning'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] terminal-text px-2.5 py-1 rounded-lg border transition-all capitalize ${
              filter === f
                ? 'text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/30'
                : 'text-[#475569] border-[#1e293b] hover:border-[#334155]'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="text-[9px] text-[#334155] terminal-text ml-2">{filtered.length} shown</span>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Alert cards list */}
        <div className="overflow-y-auto flex flex-col gap-2 pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 gap-3"
              >
                <Bell className="w-10 h-10 text-[#1e293b]" />
                <p className="text-xs text-[#334155] terminal-text">No {filter === 'all' ? '' : filter} alerts</p>
              </motion.div>
            ) : (
              filtered.map(alert => <AlertCard key={alert.id} alert={alert} />)
            )}
          </AnimatePresence>
        </div>

        {/* Terminal feed */}
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden flex flex-col">
          <div className="bg-[#0d1b2a] px-3 py-2 flex items-center gap-2 shrink-0 border-b border-[#1e293b]">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/70" />
            </div>
            <span className="text-[9px] text-[#334155] terminal-text flex-1 text-center">
              sugarnxt-ai-engine — live alert stream
            </span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          <AIAlertsPanel showTitle={false} />
        </div>
      </div>
    </div>
  );
}
