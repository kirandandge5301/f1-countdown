export interface CircuitInfo {
  laps: number;
  length: string;
  distance: string;
  fact?: string;
}

export const CIRCUIT_INFO: Record<string, CircuitInfo> = {
  "Monaco Grand Prix": {
    laps: 78,
    length: "3.337 km",
    distance: "260.286 km"
  },

  "Canadian Grand Prix": {
    laps: 70,
    length: "4.361 km",
    distance: "305.270 km"
  },

  "Austrian Grand Prix": {
    laps: 71,
    length: "4.318 km",
    distance: "306.452 km"
  },

  "British Grand Prix": {
    laps: 52,
    length: "5.891 km",
    distance: "306.198 km"
  },

  "Belgian Grand Prix": {
    laps: 44,
    length: "7.004 km",
    distance: "308.052 km"
  },

  "Italian Grand Prix": {
    laps: 53,
    length: "5.793 km",
    distance: "306.720 km"
  }
};
