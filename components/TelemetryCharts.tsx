'use client';
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useFactory } from '@/context/FactoryContext';
import type { MachineState } from '@/context/FactoryContext';
import { Thermometer, Activity } from 'lucide-react';

function statusColor(s: MachineState['status']) {
  return s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#10b981';
}

interface MachineChartProps {
  machine: MachineState;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-xs terminal-text shadow-xl">
      <p className="text-[#475569] mb-1.5">T+{label}s</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#94a3b8]">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function MachineChart({ machine }: MachineChartProps) {
  const col = statusColor(machine.status);

  const data = useMemo(() =>
    machine.history.map((pt, i) => ({
      t: i * 2,
      temp: +pt.temp.toFixed(1),
      vib: +pt.vibration.toFixed(2),
    })),
    [machine.history]
  );

  return (
    <div
      className="flex-1 min-w-0 bg-[#0f172a]/60 rounded-xl border p-3 flex flex-col gap-2"
      style={{ borderColor: `${col}30` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full" style={{ background: col, boxShadow: `0 0 8px ${col}` }} />
          <span className="text-xs font-semibold text-[#f1f5f9]">{machine.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold terminal-text px-1.5 py-0.5 rounded uppercase"
            style={{ color: col, background: `${col}18`, border: `1px solid ${col}40` }}
          >
            {machine.status}
          </span>
          <span className="text-[9px] text-[#475569] terminal-text">RISK: <span className="text-[#f1f5f9] font-bold">{machine.riskScore}%</span></span>
        </div>
      </div>

      {/* Live readings */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 bg-[#1e293b]/60 rounded-lg px-2 py-1.5">
          <Thermometer className="w-3 h-3 text-[#f59e0b] shrink-0" />
          <div>
            <p className="text-[9px] text-[#475569]">Temperature</p>
            <p className="text-xs font-bold text-[#f59e0b] terminal-text">{machine.temp.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1e293b]/60 rounded-lg px-2 py-1.5">
          <Activity className="w-3 h-3 text-[#22d3ee] shrink-0" />
          <div>
            <p className="text-[9px] text-[#475569]">Vibration</p>
            <p className="text-xs font-bold text-[#22d3ee] terminal-text">{machine.vibration.toFixed(2)} mm/s</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1" style={{ minHeight: 90 }}>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}s`}
              interval={4}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <YAxis
              yAxisId="vib"
              orientation="right"
              tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={22}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Temp (°C)"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="vib"
              type="monotone"
              dataKey="vib"
              name="Vib (mm/s)"
              stroke="#22d3ee"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function TelemetryCharts() {
  const { machines } = useFactory();

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-auto">
      {machines.map(machine => (
        <MachineChart key={machine.id} machine={machine} />
      ))}
    </div>
  );
}
