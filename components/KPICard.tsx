'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  unit: string;
  prefix?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber';
  trend?: 'up' | 'down' | 'stable';
  threshold?: { warn: number; critical: number; direction: 'above' | 'below' };
  subtitle?: string;
  decimals?: number;
}

const colorMap = {
  blue: {
    text: 'text-[#22d3ee]',
    bg: 'bg-[#22d3ee]/10',
    border: 'border-[#22d3ee]/25',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    iconBg: 'bg-[#22d3ee]/15',
  },
  green: {
    text: 'text-[#10b981]',
    bg: 'bg-[#10b981]/10',
    border: 'border-[#10b981]/25',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-[#10b981]/15',
  },
  red: {
    text: 'text-[#ef4444]',
    bg: 'bg-[#ef4444]/10',
    border: 'border-[#ef4444]/25',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    iconBg: 'bg-[#ef4444]/15',
  },
  amber: {
    text: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
    border: 'border-[#f59e0b]/25',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    iconBg: 'bg-[#f59e0b]/15',
  },
};

function useAnimatedCounter(target: number, decimals = 0) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = target;
    if (prev === target) return;

    const steps = 20;
    const diff = target - prev;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(prev + diff * eased);
      if (step >= steps) {
        setDisplay(target);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();
}

export default function KPICard({
  title, value, unit, prefix = '', icon: Icon, color, trend, threshold, subtitle, decimals = 0
}: KPICardProps) {
  const displayValue = useAnimatedCounter(value, decimals);
  const colors = colorMap[color];

  const isWarning = threshold && (
    threshold.direction === 'above'
      ? value >= threshold.warn
      : value <= threshold.warn
  );
  const isCritical = threshold && (
    threshold.direction === 'above'
      ? value >= threshold.critical
      : value <= threshold.critical
  );

  const activeColor = isCritical ? colorMap.red : isWarning ? colorMap.amber : colors;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`
        relative bg-[#1e293b] rounded-xl border p-4 overflow-hidden cursor-default
        ${activeColor.border} ${activeColor.glow}
        ${isCritical ? 'pulse-red' : ''}
      `}
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Top row */}
      <div className="relative flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${activeColor.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${activeColor.text}`} strokeWidth={1.5} style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded
              ${trend === 'up' ? 'text-[#10b981] bg-[#10b981]/10' : trend === 'down' ? 'text-[#ef4444] bg-[#ef4444]/10' : 'text-[#94a3b8] bg-[#334155]'}`}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trend}
            </span>
          )}
          {isCritical && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[9px] font-bold text-[#ef4444] bg-[#ef4444]/15 px-1.5 py-0.5 rounded"
            >
              CRITICAL
            </motion.span>
          )}
          {isWarning && !isCritical && (
            <span className="text-[9px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded">
              WARN
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="relative">
        <div className="flex items-baseline gap-1">
          {prefix && <span className={`text-lg font-bold ${activeColor.text}`}>{prefix}</span>}
          <span className={`text-2xl font-black terminal-text ${activeColor.text} tracking-tight`}>
            {displayValue}
          </span>
          <span className={`text-sm font-medium ${activeColor.text} opacity-70`}>{unit}</span>
        </div>
        <p className="text-[11px] text-[#64748b] mt-1 font-medium leading-tight">{title}</p>
        {subtitle && <p className="text-[10px] text-[#475569] mt-0.5">{subtitle}</p>}
      </div>

      {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${isCritical ? '#ef4444' : isWarning ? '#f59e0b' : color === 'blue' ? '#22d3ee' : '#10b981'}, transparent)` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
    </motion.div>
  );
}
