// Thresholds for each machine and metric
export const THRESHOLDS = {
  crusher: {
    temp: { min: 65, max: 90, warning: 80, critical: 88 },
    vibration: { min: 1, max: 4, warning: 3.2, critical: 3.8 },
  },
  boiler: {
    temp: { min: 100, max: 130, warning: 118, critical: 126 },
    vibration: { min: 2, max: 6, warning: 4.5, critical: 5.5 },
  },
  centrifuge: {
    temp: { min: 60, max: 85, warning: 76, critical: 82 },
    vibration: { min: 1, max: 5, warning: 3.8, critical: 4.6 },
  },
};

export const ALERT_COOLDOWN_MS = 12000; // 12 seconds between same-machine alerts
export const TREND_WINDOW = 3; // number of intervals to check trend
export const SPIKE_THRESHOLD = 0.3; // 30% sudden spike
