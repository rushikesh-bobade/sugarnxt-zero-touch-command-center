'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useFactory } from '@/context/FactoryContext';
import { calculateRisk, detectSpike, isRisingTrend, generateAlertMessage, MachineId } from '@/utils/riskCalculator';
import { THRESHOLDS, ALERT_COOLDOWN_MS } from '@/utils/thresholds';
import type { TelemetryPoint, MachineState, AIAlert } from '@/context/FactoryContext';

// Random walk helper
function randomWalk(current: number, minVal: number, maxVal: number, step: number): number {
  const delta = (Math.random() - 0.5) * step * 2;
  return Math.min(maxVal, Math.max(minVal, current + delta));
}

export function useFactorySimulation() {
  const { machines, setMachines, setKpis, addAlert, isCriticalMode, setIsLoading } = useFactory();
  const alertCooldowns = useRef<Record<string, number>>({});
  const tickRef = useRef(0);

  const generateReading = useCallback((machine: MachineState, forceCritical = false): { temp: number; vibration: number } => {
    const id = machine.id as MachineId;
    const t = THRESHOLDS[id];

    if (forceCritical && id === 'boiler') {
      return { temp: 140, vibration: 5.8 };
    }

    const temp = randomWalk(machine.temp, t.temp.min, t.temp.max, 2.5);
    const vibration = randomWalk(machine.vibration, t.vibration.min, t.vibration.max, 0.3);
    return { temp, vibration };
  }, []);

  useEffect(() => {
    // Clear loading after splash
    const loadTimer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(loadTimer);
  }, [setIsLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      setMachines(prev => {
        const updated = prev.map(machine => {
          const { temp, vibration } = generateReading(machine, isCriticalMode);
          const tempHistory = [...machine.history.map(h => h.temp), temp];
          const vibHistory = [...machine.history.map(h => h.vibration), vibration];

          const { riskScore, status, reason } = calculateRisk(
            machine.id as MachineId,
            temp,
            vibration,
            tempHistory,
            vibHistory
          );

          const newPoint: TelemetryPoint = { time: tick, temp, vibration };
          const history = [...machine.history, newPoint].slice(-20);

          // Alert logic
          const now = Date.now();
          const lastAlert = alertCooldowns.current[machine.id] || 0;
          const canAlert = now - lastAlert > ALERT_COOLDOWN_MS;

          const prevTemp = machine.history.length > 0 ? machine.history[machine.history.length - 1].temp : temp;
          const prevVib = machine.history.length > 0 ? machine.history[machine.history.length - 1].vibration : vibration;
          
          const hasSpike = detectSpike(temp, prevTemp) || detectSpike(vibration, prevVib);
          const hasTrend = isRisingTrend(tempHistory);

          if (canAlert && (status === 'warning' || status === 'critical' || hasSpike || (hasTrend && tick > 5))) {
            alertCooldowns.current[machine.id] = now;
            const alertData = generateAlertMessage(machine.id as MachineId, status, riskScore, temp, vibration, reason);
            const alert: AIAlert = {
              id: `${machine.id}-${Date.now()}`,
              timestamp: new Date(),
              machineId: machine.id,
              machineName: machine.name,
              severity: status === 'healthy' ? (hasSpike ? 'warning' : 'healthy') : status,
              title: alertData.title,
              detail: alertData.detail,
              action: alertData.action,
              riskScore,
              hoursToFailure: alertData.hoursToFailure,
            };
            // Only push non-healthy alerts
            if (alert.severity !== 'healthy') {
              addAlert(alert);
            }
          }

          return { ...machine, temp, vibration, riskScore, status, history };
        });

        return updated;
      });

      // Update KPIs
      setKpis(prev => {
        const throughput = randomWalk(prev.throughput, 120, 165, 3);
        const downtimePrevented = isCriticalMode
          ? Math.min(prev.downtimePrevented + 0.1, 48)
          : prev.downtimePrevented + (Math.random() * 0.05);
        const maintenanceCost = isCriticalMode
          ? Math.min(prev.maintenanceCostPerTon + 1, 99)
          : Math.max(65, randomWalk(prev.maintenanceCostPerTon, 65, 79, 1));
        const automation = randomWalk(prev.automationIndex, 84, 92, 0.5);
        const efficiency = isCriticalMode
          ? Math.max(72, prev.plantEfficiency - 0.3)
          : Math.min(98, randomWalk(prev.plantEfficiency, 88, 97, 0.5));

        return {
          throughput: Math.round(throughput * 10) / 10,
          downtimePrevented: Math.round(downtimePrevented * 10) / 10,
          maintenanceCostPerTon: Math.round(maintenanceCost),
          automationIndex: Math.round(automation * 10) / 10,
          plantEfficiency: Math.round(efficiency * 10) / 10,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isCriticalMode, generateReading, setMachines, setKpis, addAlert]);
}
