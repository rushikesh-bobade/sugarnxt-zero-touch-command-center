'use client';
import { motion } from 'framer-motion';
import { Thermometer, Activity, Cpu } from 'lucide-react';
import type { MachineState } from '@/context/FactoryContext';

function statusColor(s: MachineState['status']) {
  return s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#10b981';
}

interface MachineCardProps {
  machine: MachineState;
}

export default function MachineCard({ machine }: MachineCardProps) {
  const col = statusColor(machine.status);

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      className="bg-[#1e293b] rounded-xl border p-3"
      style={{ borderColor: `${col}30` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" style={{ color: col }} />
          <span className="text-xs font-semibold text-[#f1f5f9]">{machine.name}</span>
        </div>
        <span
          className="text-[9px] font-bold terminal-text px-1.5 py-0.5 rounded uppercase"
          style={{ color: col, background: `${col}18`, border: `1px solid ${col}35` }}
        >
          {machine.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center gap-1.5 bg-[#0f172a]/60 rounded-lg p-2">
          <Thermometer className="w-3 h-3 text-[#f59e0b]" />
          <div>
            <p className="text-[8px] text-[#475569]">Temp</p>
            <p className="text-[11px] font-bold text-[#f59e0b] terminal-text">{machine.temp.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0f172a]/60 rounded-lg p-2">
          <Activity className="w-3 h-3 text-[#22d3ee]" />
          <div>
            <p className="text-[8px] text-[#475569]">Vibration</p>
            <p className="text-[11px] font-bold text-[#22d3ee] terminal-text">{machine.vibration.toFixed(2)} mm/s</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-[#475569]">Risk Score</span>
          <span className="terminal-text font-bold" style={{ color: col }}>{machine.riskScore}%</span>
        </div>
        <div className="h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${machine.riskScore}%` }}
            transition={{ duration: 0.5 }}
            style={{
              background: machine.riskScore >= 75 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : machine.riskScore >= 50 ? 'linear-gradient(90deg,#10b981,#f59e0b)' : '#10b981',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
