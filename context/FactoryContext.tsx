'use client';
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { MachineStatus } from '@/utils/riskCalculator';

export interface TelemetryPoint {
  time: number;
  temp: number;
  vibration: number;
}

export interface MachineState {
  id: 'crusher' | 'boiler' | 'centrifuge';
  name: string;
  status: MachineStatus;
  temp: number;
  vibration: number;
  riskScore: number;
  history: TelemetryPoint[];
}

export interface AIAlert {
  id: string;
  timestamp: Date;
  machineId: string;
  machineName: string;
  severity: MachineStatus;
  title: string;
  detail: string;
  action: string;
  riskScore: number;
  hoursToFailure: number;
}

export interface KPIs {
  throughput: number;
  downtimePrevented: number;
  maintenanceCostPerTon: number;
  automationIndex: number;
  plantEfficiency: number;
}

interface FactoryContextType {
  machines: MachineState[];
  alerts: AIAlert[];
  kpis: KPIs;
  isCriticalMode: boolean;
  isLoading: boolean;
  sessionStartTime: number;
  setMachines: React.Dispatch<React.SetStateAction<MachineState[]>>;
  setAlerts: React.Dispatch<React.SetStateAction<AIAlert[]>>;
  setKpis: React.Dispatch<React.SetStateAction<KPIs>>;
  setIsCriticalMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addAlert: (alert: AIAlert) => void;
}

const FactoryContext = createContext<FactoryContextType | null>(null);

export const INITIAL_MACHINES: MachineState[] = [
  { id: 'crusher', name: 'Cane Crusher', status: 'healthy', temp: 72, vibration: 2.1, riskScore: 42, history: [] },
  { id: 'boiler', name: 'Steam Boiler', status: 'healthy', temp: 108, vibration: 3.2, riskScore: 55, history: [] },
  { id: 'centrifuge', name: 'Centrifuge Unit', status: 'healthy', temp: 68, vibration: 2.4, riskScore: 38, history: [] },
];

export const INITIAL_KPIS: KPIs = {
  throughput: 142,
  downtimePrevented: 0,
  maintenanceCostPerTon: 74,
  automationIndex: 87,
  plantEfficiency: 94,
};

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [machines, setMachines] = useState<MachineState[]>(INITIAL_MACHINES);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [kpis, setKpis] = useState<KPIs>(INITIAL_KPIS);
  const [isCriticalMode, setIsCriticalMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sessionStartTime = useRef(Date.now()).current;

  const addAlert = useCallback((alert: AIAlert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50));
  }, []);

  return (
    <FactoryContext.Provider value={{
      machines, setMachines,
      alerts, setAlerts,
      kpis, setKpis,
      isCriticalMode, setIsCriticalMode,
      isLoading, setIsLoading,
      sessionStartTime,
      addAlert,
    }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  const ctx = useContext(FactoryContext);
  if (!ctx) throw new Error('useFactory must be used inside FactoryProvider');
  return ctx;
}
