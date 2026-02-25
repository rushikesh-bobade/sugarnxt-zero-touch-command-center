import { THRESHOLDS } from './thresholds';

export type MachineId = 'crusher' | 'boiler' | 'centrifuge';
export type MachineStatus = 'healthy' | 'warning' | 'critical';

export interface RiskResult {
  riskScore: number;
  status: MachineStatus;
  reason: string;
}

export function calculateRisk(
  machineId: MachineId,
  temp: number,
  vibration: number,
  tempHistory: number[],
  vibrationHistory: number[]
): RiskResult {
  const thresholds = THRESHOLDS[machineId];
  
  const tempRisk = (temp / thresholds.temp.critical) * 100;
  const vibRisk = (vibration / thresholds.vibration.critical) * 100;
  const riskScore = Math.min(99, Math.round((tempRisk * 0.5 + vibRisk * 0.5)));

  let status: MachineStatus = 'healthy';
  let reason = 'All systems nominal';

  if (temp >= thresholds.temp.critical || vibration >= thresholds.vibration.critical) {
    status = 'critical';
    reason = temp >= thresholds.temp.critical
      ? `Temperature critically high: ${temp.toFixed(1)}°C`
      : `Vibration critically high: ${vibration.toFixed(2)} mm/s`;
  } else if (temp >= thresholds.temp.warning || vibration >= thresholds.vibration.warning) {
    status = 'warning';
    reason = temp >= thresholds.temp.warning
      ? `Temperature elevated: ${temp.toFixed(1)}°C`
      : `Vibration elevated: ${vibration.toFixed(2)} mm/s`;
  }

  // Check for rising trend
  if (tempHistory.length >= 3) {
    const last3 = tempHistory.slice(-3);
    if (last3[2] > last3[1] && last3[1] > last3[0] && status === 'healthy') {
      status = 'warning';
      reason = `Rising temperature trend detected`;
    }
  }

  return { riskScore, status, reason };
}

export function detectSpike(current: number, previous: number): boolean {
  if (previous === 0) return false;
  return (current - previous) / previous > 0.3;
}

export function isRisingTrend(history: number[]): boolean {
  if (history.length < 3) return false;
  const last = history.slice(-3);
  return last[2] > last[1] && last[1] > last[0];
}

export function generateAlertMessage(
  machineId: MachineId,
  status: MachineStatus,
  riskScore: number,
  temp: number,
  vibration: number,
  reason: string
): { title: string; detail: string; action: string; hoursToFailure: number } {
  const machineName = {
    crusher: 'Cane Crusher',
    boiler: 'Steam Boiler',
    centrifuge: 'Centrifuge Unit',
  }[machineId];

  const hoursToFailure = status === 'critical'
    ? Math.round(1 + Math.random() * 3)
    : Math.round(4 + Math.random() * 8);

  const actions: Record<MachineId, Record<MachineStatus, string>> = {
    crusher: {
      critical: 'Emergency shutdown recommended. Inspect bearing assembly immediately.',
      warning: 'Reduce feed rate by 20%. Schedule inspection within 2 hours.',
      healthy: 'Continue monitoring.',
    },
    boiler: {
      critical: 'Reduce steam pressure immediately. Inspect heat exchanger and safety valves.',
      warning: 'Reduce load by 15% and schedule automated lubrication cycle.',
      healthy: 'Continue monitoring.',
    },
    centrifuge: {
      critical: 'Stop centrifuge. Inspect balance and bearing assembly.',
      warning: 'Reduce RPM by 10%. Check lubrication system.',
      healthy: 'Continue monitoring.',
    },
  };

  return {
    title: `${machineName} ${reason}`,
    detail: `Temp: ${temp.toFixed(1)}°C | Vibration: ${vibration.toFixed(2)} mm/s | Risk: ${riskScore}%`,
    action: actions[machineId][status],
    hoursToFailure,
  };
}
