'use client';
import { useState, useEffect } from 'react';
import { useFactory } from '@/context/FactoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, AlertTriangle, Zap, Clock, Factory } from 'lucide-react';
import { ROITicker } from '@/components/ROITicker';

export default function Header() {
  const { kpis, machines, isCriticalMode } = useFactory();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }));
      setDate(now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const hasCritical = machines.some(m => m.status === 'critical');
  const hasWarning = machines.some(m => m.status === 'warning');

  const statusColor = hasCritical ? '#ef4444' : hasWarning ? '#f59e0b' : '#10b981';
  const statusLabel = hasCritical ? 'CRITICAL' : hasWarning ? 'WARNING' : 'OPTIMAL';
  const statusBg = hasCritical ? 'bg-[#ef4444]/10 border-[#ef4444]/30' : hasWarning ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' : 'bg-[#10b981]/10 border-[#10b981]/30';

  return (
    <header className="h-14 bg-[#111827] border-b border-[#1e293b] flex items-center px-4 gap-4 sticky top-0 z-10 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <Factory className="w-4 h-4 text-[#22d3ee] shrink-0" />
        <h1 className="text-sm font-bold text-[#f1f5f9] truncate hidden sm:block tracking-wide">
          SugarNxt Command Center
        </h1>
        <h1 className="text-sm font-bold text-[#f1f5f9] truncate sm:hidden">
          SugarNxt
        </h1>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-[#1e293b] shrink-0" />

      {/* Status Badge */}
      <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold terminal-text ${statusBg}`} style={{ color: statusColor }}>
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: statusColor }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {statusLabel}
      </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ROI Ticker */}
        <div className="hidden xl:block">
          <ROITicker />
        </div>

        <div className="hidden xl:block w-px h-6 bg-[#1e293b] shrink-0" />

      {/* Efficiency */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs">
        <Zap className="w-3.5 h-3.5 text-[#22d3ee]" />
        <span className="text-[#64748b]">Plant Efficiency</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={kpis.plantEfficiency}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[#22d3ee] font-bold terminal-text"
          >
            {mounted ? kpis.plantEfficiency : 94}%
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="hidden lg:block w-px h-6 bg-[#1e293b] shrink-0" />

      {/* Clock */}
      <div className="hidden sm:flex items-center gap-2 text-xs">
        <Clock className="w-3.5 h-3.5 text-[#475569]" />
        <div className="text-right">
          <div className="text-[#94a3b8] terminal-text font-medium">
            {mounted ? time : '--:--:--'}
          </div>
          <div className="text-[#475569] text-[10px]">
            {mounted ? date : '---'}
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-6 bg-[#1e293b] shrink-0" />

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-[#10b981]" />
        <span className="hidden md:block text-[10px] text-[#475569]">LIVE</span>
      </div>

      {/* Critical mode indicator */}
      <AnimatePresence>
        {isCriticalMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/50 text-[#ef4444] text-xs font-bold terminal-text pulse-red"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:block">SIM ACTIVE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
