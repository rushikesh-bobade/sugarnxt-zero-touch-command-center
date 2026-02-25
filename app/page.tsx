'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useFactory } from '@/context/FactoryContext';
import { useFactorySimulation } from '@/hooks/useFactorySimulation';
import KPICard from '@/components/KPICard';
import TelemetryCharts from '@/components/TelemetryCharts';
import AIAlertsPanel from '@/components/AIAlertsPanel';
import SplashScreen from '@/components/SplashScreen';
import { PredictiveCountdowns } from '@/components/ROITicker';
import {
  Gauge,
  ShieldCheck,
  IndianRupee,
  Bot,
  Zap,
  AlertTriangle,
  RotateCcw,
  Clock,
} from 'lucide-react';

const DigitalTwin = dynamic(() => import('@/components/DigitalTwin'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full"
        />
        <span className="text-[10px] text-[#334155] terminal-text">Loading 3D Engine...</span>
      </div>
    </div>
  ),
});

function SimulateButton() {
  const { isCriticalMode, setIsCriticalMode, setMachines, addAlert, setKpis } = useFactory();

  const triggerCritical = () => {
    setIsCriticalMode(true);

    // Force boiler to critical immediately
    setMachines(prev => prev.map(m => {
      if (m.id === 'boiler') {
        const critPoint = { time: Date.now(), temp: 140, vibration: 5.8 };
        return {
          ...m,
          temp: 140,
          vibration: 5.8,
          riskScore: 98,
          status: 'critical' as const,
          history: [...m.history, critPoint].slice(-20),
        };
      }
      if (m.id === 'crusher') {
        return { ...m, status: 'warning' as const, riskScore: 68 };
      }
      return m;
    }));

    addAlert({
      id: `sim-critical-${Date.now()}`,
      timestamp: new Date(),
      machineId: 'boiler',
      machineName: 'Steam Boiler',
      severity: 'critical',
      title: '🚨 CRITICAL: Steam Boiler over-temperature — 140°C detected!',
      detail: 'Temp: 140.0°C | Vibration: 5.8 mm/s | Risk: 98% | SIMULATION TRIGGER',
      action: 'EMERGENCY: Reduce steam pressure immediately. Inspect heat exchanger & safety valves. Activate automated shutdown protocol.',
      riskScore: 98,
      hoursToFailure: 1,
    });

    setKpis(prev => ({
      ...prev,
      maintenanceCostPerTon: 99,
      plantEfficiency: Math.max(72, prev.plantEfficiency - 12),
    }));
  };

  const resetSimulation = () => {
    setIsCriticalMode(false);
    setMachines(prev => prev.map(m => ({
      ...m,
      status: 'healthy' as const,
      temp: m.id === 'boiler' ? 108 : m.id === 'crusher' ? 72 : 68,
      vibration: m.id === 'boiler' ? 3.2 : m.id === 'crusher' ? 2.1 : 2.4,
      riskScore: 40,
    })));
    setKpis(prev => ({
      ...prev,
      maintenanceCostPerTon: 74,
      plantEfficiency: 94,
    }));
  };

  return (
    <div className="flex items-center gap-2">
      {!isCriticalMode ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={triggerCritical}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] text-xs font-bold terminal-text hover:bg-[#ef4444]/25 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Simulate Critical Failure
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetSimulation}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-xs font-bold terminal-text hover:bg-[#10b981]/25 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Normal
        </motion.button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  useFactorySimulation();
  const { kpis, machines, isLoading, isCriticalMode } = useFactory();

  const criticalCount = machines.filter(m => m.status === 'critical').length;
  const warningCount = machines.filter(m => m.status === 'warning').length;

  const costColor = kpis.maintenanceCostPerTon >= 90 ? 'red' : kpis.maintenanceCostPerTon >= 80 ? 'amber' : 'green';
  const effColor = kpis.plantEfficiency < 80 ? 'red' : kpis.plantEfficiency < 90 ? 'amber' : 'blue';

  if (isLoading) return <SplashScreen />;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b] bg-[#0f172a]/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#22d3ee]" />
            <span className="text-sm font-bold text-[#f1f5f9]">Live Operations Dashboard</span>
          </div>
          <span className="text-[9px] text-[#475569] terminal-text bg-[#1e293b] px-2 py-0.5 rounded">
            CANE-TO-BAG ZERO-TOUCH
          </span>
          {criticalCount > 0 && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1 text-[#ef4444] text-[10px] terminal-text font-bold bg-[#ef4444]/10 border border-[#ef4444]/30 px-2 py-0.5 rounded"
            >
              <AlertTriangle className="w-3 h-3" />
              {criticalCount} CRITICAL
            </motion.div>
          )}
          {warningCount > 0 && criticalCount === 0 && (
            <div className="flex items-center gap-1 text-[#f59e0b] text-[10px] terminal-text font-bold bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3" />
              {warningCount} WARNING
            </div>
          )}
        </div>
        <SimulateButton />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">

        {/* KPI Row */}
        <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title="Current Throughput"
            value={kpis.throughput}
            unit="t/hr"
            icon={Gauge}
            color="blue"
            trend={kpis.throughput > 145 ? 'up' : kpis.throughput < 130 ? 'down' : 'stable'}
            subtitle="Cane processing rate"
            decimals={1}
          />
          <KPICard
            title="AI Downtime Prevented"
            value={kpis.downtimePrevented}
            unit="hrs"
            icon={ShieldCheck}
            color="green"
            trend="up"
            subtitle="Cumulative session savings"
            decimals={1}
          />
          <KPICard
            title="Maintenance Cost"
            value={kpis.maintenanceCostPerTon}
            unit="/ ton"
            prefix="₹"
            icon={IndianRupee}
            color={costColor}
            threshold={{ warn: 80, critical: 90, direction: 'above' }}
            trend={kpis.maintenanceCostPerTon > 80 ? 'up' : 'down'}
            subtitle="Target: below ₹80"
          />
          <KPICard
            title="Manpower Automation"
            value={kpis.automationIndex}
            unit="% reduced"
            icon={Bot}
            color="green"
            trend="up"
            subtitle="Zero-touch index"
            decimals={1}
          />
        </div>

        {/* Middle Row: Digital Twin + Telemetry */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Digital Twin Panel */}
          <div className={`bg-[#1e293b] rounded-xl border overflow-hidden flex flex-col ${isCriticalMode ? 'panel-glow-red' : 'panel-glow-blue'}`}
            style={{ borderColor: isCriticalMode ? 'rgba(239,68,68,0.3)' : 'rgba(34,211,238,0.2)' }}
          >
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">DIGITAL TWIN — 3D FACTORY VIEW</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#475569]">
                <span className="text-[9px] terminal-text">LIVE SYNC</span>
                <motion.div
                  className="w-1 h-1 rounded-full bg-[#10b981]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 relative" style={{ minHeight: 220 }}>
              <DigitalTwin />
            </div>
          </div>

          {/* Telemetry Charts Panel */}
          <div className="bg-[#1e293b] rounded-xl border border-[#22d3ee]/15 overflow-hidden flex flex-col">
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">LIVE MACHINE TELEMETRY</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#475569] terminal-text">↻ 2s</span>
                <div className="flex items-center gap-1 text-[9px] text-[#475569]">
                  <span className="inline-flex items-center gap-0.5"><span className="w-2 h-0.5 rounded bg-[#f59e0b] inline-block" /> Temp</span>
                  <span className="inline-flex items-center gap-0.5"><span className="w-2 h-0.5 rounded bg-[#22d3ee] inline-block" /> Vib</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-2 overflow-auto">
              <TelemetryCharts />
            </div>
          </div>
        </div>

          {/* Bottom Row: AI Alerts + Predictive Countdowns */}
          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ height: 200 }}>
            {/* AI Alerts */}
            <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
              <AIAlertsPanel showTitle={true} />
            </div>
            {/* Predictive Failure Countdowns */}
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden flex flex-col">
              <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-[#0f172a]">
                <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="text-xs font-bold text-[#f1f5f9] tracking-wide">PREDICTED MAINTENANCE</span>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <PredictiveCountdowns />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
