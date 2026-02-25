'use client';
import { useFactory } from '@/context/FactoryContext';
import { useFactorySimulation } from '@/hooks/useFactorySimulation';
import SplashScreen from '@/components/SplashScreen';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, AlertTriangle, Cpu } from 'lucide-react';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs terminal-text shadow-xl">
      <p className="text-[#475569] mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="text-[#94a3b8]">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function PanelHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e293b] shrink-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#22d3ee]" />
        <span className="text-xs font-bold text-[#f1f5f9]">{title}</span>
      </div>
      {subtitle && <span className="text-[9px] text-[#475569] terminal-text">{subtitle}</span>}
    </div>
  );
}

export default function AnalyticsPage() {
  useFactorySimulation();
  const { machines, kpis, alerts, isLoading } = useFactory();

  // Generate historical efficiency trend (mock 24-hour data)
  const efficiencyTrend = useMemo(() => {
    const data = [];
    let val = 88;
    for (let h = 0; h < 24; h++) {
      val = Math.min(99, Math.max(70, val + (Math.random() - 0.45) * 3));
      data.push({
        hour: `${h.toString().padStart(2, '0')}:00`,
        efficiency: +val.toFixed(1),
        target: 92,
      });
    }
    return data;
  }, []);

  // Downtime risk over time (mock 12-hour)
  const riskHistory = useMemo(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        time: `${i * 2}h ago`,
        crusher: Math.round(30 + Math.random() * 40),
        boiler: Math.round(45 + Math.random() * 45),
        centrifuge: Math.round(25 + Math.random() * 35),
      });
    }
    return data;
  }, []);

  // Alert frequency by hour (mock)
  const alertFreq = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      hour: `${(12 - i).toString().padStart(2, '0')}:00`,
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 6),
      info: Math.floor(Math.random() * 4),
    })).reverse();
  }, []);

  // Machine health radial data
  const machineHealth = useMemo(() => [
    { name: 'Crusher', value: 100 - machines.find(m => m.id === 'crusher')!.riskScore, fill: '#22d3ee' },
    { name: 'Boiler', value: 100 - machines.find(m => m.id === 'boiler')!.riskScore, fill: '#10b981' },
    { name: 'Centrifuge', value: 100 - machines.find(m => m.id === 'centrifuge')!.riskScore, fill: '#f59e0b' },
  ], [machines]);

  // Cost breakdown
  const costBreakdown = useMemo(() => [
    { name: 'Labour', value: 28, color: '#22d3ee' },
    { name: 'Energy', value: 35, color: '#10b981' },
    { name: 'Maintenance', value: kpis.maintenanceCostPerTon, color: kpis.maintenanceCostPerTon > 80 ? '#ef4444' : '#f59e0b' },
    { name: 'Logistics', value: 18, color: '#8b5cf6' },
  ], [kpis.maintenanceCostPerTon]);

  if (isLoading) return <SplashScreen />;

  return (
    <div className="h-full overflow-auto p-3 flex flex-col gap-3">
      {/* Page header */}
      <div className="shrink-0 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[#22d3ee]" />
        <h2 className="text-sm font-bold text-[#f1f5f9]">Analytics & Intelligence</h2>
        <span className="text-[9px] terminal-text text-[#475569] bg-[#1e293b] px-2 py-0.5 rounded">PRODUCTION INTELLIGENCE DASHBOARD</span>
      </div>

      {/* Row 1: Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Avg Plant Efficiency', value: `${kpis.plantEfficiency}%`, color: '#22d3ee', sub: 'Last 24 hours' },
          { label: 'Total Alerts Today', value: alerts.length.toString(), color: '#f59e0b', sub: `${alerts.filter(a => a.severity === 'critical').length} critical` },
          { label: 'AI Accuracy', value: '94.2%', color: '#10b981', sub: 'Predictive model' },
          { label: 'Zero-Touch Index', value: `${kpis.automationIndex.toFixed(0)}%`, color: '#8b5cf6', sub: 'Human intervention ↓' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="bg-[#1e293b] rounded-xl border border-[#334155] p-3"
          >
            <p className="text-[10px] text-[#475569] mb-1">{stat.label}</p>
            <p className="text-xl font-black terminal-text" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[9px] text-[#334155] mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Efficiency trend + Risk history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Efficiency Trend */}
        <div className="bg-[#1e293b] rounded-xl border border-[#22d3ee]/20 overflow-hidden flex flex-col" style={{ height: 240 }}>
          <PanelHeader icon={TrendingUp} title="Production Efficiency Trend" subtitle="24-HOUR" />
          <div className="flex-1 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={efficiencyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#22d3ee" strokeWidth={2} fill="url(#effGrad)" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime Risk History */}
        <div className="bg-[#1e293b] rounded-xl border border-[#f59e0b]/20 overflow-hidden flex flex-col" style={{ height: 240 }}>
          <PanelHeader icon={AlertTriangle} title="Downtime Risk History" subtitle="12-HOUR" />
          <div className="flex-1 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistory} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="crusher" name="Crusher %" stroke="#22d3ee" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="boiler" name="Boiler %" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="centrifuge" name="Centrifuge %" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Alert Heatmap + Machine Health + Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Alert Frequency Bar Chart */}
        <div className="bg-[#1e293b] rounded-xl border border-[#ef4444]/15 overflow-hidden flex flex-col" style={{ height: 230 }}>
          <PanelHeader icon={AlertTriangle} title="Alert Frequency" subtitle="12-HR HEATMAP" />
          <div className="flex-1 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertFreq} margin={{ top: 4, right: 4, bottom: 0, left: -22 }} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill: '#334155', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#334155', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="critical" name="Critical" fill="#ef4444" stackId="a" isAnimationActive={false} />
                <Bar dataKey="warning" name="Warning" fill="#f59e0b" stackId="a" isAnimationActive={false} />
                <Bar dataKey="info" name="Info" fill="#22d3ee" stackId="a" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Health Radial */}
        <div className="bg-[#1e293b] rounded-xl border border-[#10b981]/15 overflow-hidden flex flex-col" style={{ height: 230 }}>
          <PanelHeader icon={Cpu} title="Machine Health Index" subtitle="REAL-TIME" />
          <div className="flex-1 p-2 flex flex-col gap-2">
            {machines.map(m => {
              const health = 100 - m.riskScore;
              const col = health > 60 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="text-[9px] text-[#475569] w-20 shrink-0">{m.name.split(' ')[0]}</span>
                  <div className="flex-1 h-2 bg-[#0f172a] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: col, width: `${health}%`, boxShadow: `0 0 6px ${col}60` }}
                      animate={{ width: `${health}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="text-[9px] terminal-text font-bold w-8 text-right" style={{ color: col }}>{health}%</span>
                </div>
              );
            })}

            {/* Radial chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={130}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={machineHealth} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#0f172a' }} isAnimationActive={false} />
                  <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-[9px] text-[#64748b]">{v}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-[#1e293b] rounded-xl border border-[#8b5cf6]/15 overflow-hidden flex flex-col" style={{ height: 230 }}>
          <PanelHeader icon={BarChart3} title="Cost per Ton Breakdown" subtitle="₹ / TON" />
          <div className="flex-1 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdown} layout="vertical" margin={{ top: 2, right: 30, bottom: 2, left: 30 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#334155', fontSize: 8, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="₹ / ton" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {costBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[9px] text-center text-[#334155] terminal-text mt-1">
              Target maintenance: <span className="text-[#10b981]">≤ ₹80</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
