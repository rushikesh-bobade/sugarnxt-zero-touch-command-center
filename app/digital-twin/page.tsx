'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useFactory } from '@/context/FactoryContext';
import { useFactorySimulation } from '@/hooks/useFactorySimulation';
import SplashScreen from '@/components/SplashScreen';
import { Box, Cpu, Thermometer, Activity, AlertTriangle, RotateCcw } from 'lucide-react';

const DigitalTwin = dynamic(() => import('@/components/DigitalTwin'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full"
        />
        <span className="text-xs text-[#334155] terminal-text">Loading 3D Engine...</span>
      </div>
    </div>
  ),
});

function statusColor(s: string) {
  return s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#10b981';
}

export default function DigitalTwinPage() {
  useFactorySimulation();
  const { machines, isLoading, isCriticalMode, setIsCriticalMode, setMachines, addAlert, setKpis } = useFactory();

  const triggerCritical = () => {
    setIsCriticalMode(true);
    setMachines(prev => prev.map(m => {
      if (m.id === 'boiler') {
        return { ...m, temp: 140, vibration: 5.8, riskScore: 98, status: 'critical' as const };
      }
      return m;
    }));
    addAlert({
      id: `dt-crit-${Date.now()}`,
      timestamp: new Date(),
      machineId: 'boiler',
      machineName: 'Steam Boiler',
      severity: 'critical',
      title: '🚨 CRITICAL: Boiler over-temperature — 140°C',
      detail: 'Temp: 140.0°C | Vibration: 5.8 mm/s | Risk: 98% | SIMULATION',
      action: 'EMERGENCY: Reduce steam pressure. Inspect heat exchanger. Activate automated shutdown.',
      riskScore: 98,
      hoursToFailure: 1,
    });
  };

  const resetSim = () => {
    setIsCriticalMode(false);
    setMachines(prev => prev.map(m => ({
      ...m,
      status: 'healthy' as const,
      temp: m.id === 'boiler' ? 108 : m.id === 'crusher' ? 72 : 68,
      vibration: m.id === 'boiler' ? 3.2 : 2.1,
      riskScore: 40,
    })));
    setKpis(prev => ({ ...prev, maintenanceCostPerTon: 74, plantEfficiency: 94 }));
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="h-full overflow-hidden flex flex-col p-3 gap-3">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#22d3ee]" />
          <h2 className="text-sm font-bold text-[#f1f5f9]">Digital Twin — 3D Factory View</h2>
          <span className="text-[9px] terminal-text text-[#475569] bg-[#1e293b] px-2 py-0.5 rounded">
            REAL-TIME SYNC
          </span>
        </div>
        <div className="flex gap-2">
          {!isCriticalMode ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={triggerCritical}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] text-[11px] font-bold terminal-text hover:bg-[#ef4444]/25 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Failure
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetSim}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-[11px] font-bold terminal-text hover:bg-[#10b981]/25 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Normal
            </motion.button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* 3D View - takes 2 cols */}
        <div
          className="lg:col-span-2 bg-[#1e293b] rounded-xl border overflow-hidden relative"
          style={{ borderColor: isCriticalMode ? 'rgba(239,68,68,0.35)' : 'rgba(34,211,238,0.2)' }}
        >
          {isCriticalMode && (
            <motion.div
              className="absolute inset-0 border-2 border-[#ef4444]/40 rounded-xl pointer-events-none z-10"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          <DigitalTwin />
        </div>

        {/* Machine detail cards */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {machines.map(machine => {
            const col = statusColor(machine.status);
            return (
              <motion.div
                key={machine.id}
                layout
                whileHover={{ x: 2 }}
                className="bg-[#1e293b] rounded-xl border p-3 flex flex-col gap-2"
                style={{ borderColor: `${col}30`, background: `${col}06` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" style={{ color: col }} />
                    <span className="text-xs font-bold text-[#f1f5f9]">{machine.name}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold terminal-text px-1.5 py-0.5 rounded uppercase"
                    style={{ color: col, background: `${col}18`, border: `1px solid ${col}35` }}
                  >
                    {machine.status}
                  </span>
                </div>

                {/* Risk gauge */}
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-[#475569]">Risk Score</span>
                    <span className="terminal-text font-bold" style={{ color: col }}>{machine.riskScore}%</span>
                  </div>
                  <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${machine.riskScore}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: machine.riskScore >= 75
                          ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                          : machine.riskScore >= 50
                            ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                            : '#10b981',
                        boxShadow: `0 0 8px ${col}60`
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-[#0f172a]/60 rounded-lg p-2 flex items-center gap-1.5">
                    <Thermometer className="w-3 h-3 text-[#f59e0b]" />
                    <div>
                      <p className="text-[8px] text-[#475569]">Temp</p>
                      <p className="text-[11px] font-bold text-[#f59e0b] terminal-text">{machine.temp.toFixed(1)}°C</p>
                    </div>
                  </div>
                  <div className="bg-[#0f172a]/60 rounded-lg p-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[#22d3ee]" />
                    <div>
                      <p className="text-[8px] text-[#475569]">Vibration</p>
                      <p className="text-[11px] font-bold text-[#22d3ee] terminal-text">{machine.vibration.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* History sparkline */}
                {machine.history.length > 3 && (
                  <div className="flex items-end gap-0.5 h-6">
                    {machine.history.slice(-12).map((pt, i) => {
                      const maxTemp = Math.max(...machine.history.map(h => h.temp));
                      const minTemp = Math.min(...machine.history.map(h => h.temp));
                      const range = maxTemp - minTemp || 1;
                      const barH = ((pt.temp - minTemp) / range) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-sm opacity-70"
                          style={{ height: `${Math.max(15, barH)}%`, background: col }}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Factory pipeline legend */}
          <div className="bg-[#1e293b] rounded-xl border border-[#1e293b] p-3 mt-1">
            <p className="text-[9px] text-[#334155] terminal-text mb-2 uppercase tracking-wider">Process Flow</p>
            <div className="flex items-center gap-1 flex-wrap">
              {['Cane In', '→', 'Crusher', '→', 'Boiler', '→', 'Centrifuge', '→', 'Bag Out'].map((step, i) => (
                <span
                  key={i}
                  className={`text-[9px] terminal-text ${step === '→' ? 'text-[#334155]' : 'text-[#22d3ee] bg-[#22d3ee]/08 px-1.5 py-0.5 rounded'}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
