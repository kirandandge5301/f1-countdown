export interface CircuitInfo {
  laps: number;
  length: string;
  distance: string;
  fact?: string;
  lapRecord?: string;
  firstGrandPrix?: number;
  drsZones?: number;
}

export const CIRCUIT_INFO: Record<string, CircuitInfo> = {
  "Bahrain Grand Prix": {
    laps: 57,
    length: "5.412 km",
    distance: "308.238 km",
    lapRecord: "1:31.447 — Pedro de la Rosa (2005)",
    firstGrandPrix: 2004,
    drsZones: 3,
    fact: "A desert circuit under the lights where traction, tyre wear, and rear-end stability usually shape the weekend."
  },

  "Saudi Arabian Grand Prix": {
    laps: 50,
    length: "6.174 km",
    distance: "308.450 km",
    lapRecord: "1:30.734 — Lewis Hamilton (2021)",
    firstGrandPrix: 2021,
    drsZones: 3,
    fact: "Jeddah is all confidence and commitment — one of the fastest street circuits the sport has ever seen."
  },

  "Australian Grand Prix": {
    laps: 58,
    length: "5.278 km",
    distance: "306.124 km",
    lapRecord: "1:19.813 — Charles Leclerc (2024)",
    firstGrandPrix: 1985,
    drsZones: 4,
    fact: "Albert Park rewards rhythm, kerb control, and drivers willing to commit early in the lap."
  },

  "Japanese Grand Prix": {
    laps: 53,
    length: "5.807 km",
    distance: "307.471 km",
    lapRecord: "1:30.983 — Lewis Hamilton (2019)",
    firstGrandPrix: 1976,
    drsZones: 1,
    fact: "Suzuka is a true driver’s circuit where balance through the Esses usually reveals the fastest cars immediately."
  },

  "Chinese Grand Prix": {
    laps: 56,
    length: "5.451 km",
    distance: "305.066 km",
    lapRecord: "1:32.238 — Michael Schumacher (2004)",
    firstGrandPrix: 2004,
    drsZones: 2,
    fact: "Shanghai mixes long traction zones with a front-limited flow that can punish poor setup choices across a stint."
  },

  "Miami Grand Prix": {
    laps: 57,
    length: "5.412 km",
    distance: "308.326 km",
    lapRecord: "1:29.708 — Max Verstappen (2023)",
    firstGrandPrix: 2022,
    drsZones: 3,
    fact: "Miami tends to reward top speed, braking stability, and patience through the technical middle sector."
  },

  "Emilia Romagna Grand Prix": {
    laps: 63,
    length: "4.909 km",
    distance: "309.049 km",
    lapRecord: "1:15.484 — Lewis Hamilton (2020)",
    firstGrandPrix: 1980,
    drsZones: 1,
    fact: "Imola is narrow, old-school, and unforgiving — a place where track position still matters deeply."
  },

  "Monaco Grand Prix": {
    laps: 78,
    length: "3.337 km",
    distance: "260.286 km",
    lapRecord: "1:12.909 — Lewis Hamilton (2021)",
    firstGrandPrix: 1950,
    drsZones: 1,
    fact: "Precision matters more than raw pace here; once the barriers close in, every millimetre has consequences."
  },

  "Spanish Grand Prix": {
    laps: 66,
    length: "4.657 km",
    distance: "307.236 km",
    lapRecord: "1:16.330 — Max Verstappen (2023)",
    firstGrandPrix: 1951,
    drsZones: 2,
    fact: "Barcelona is still one of the clearest places to read overall car balance across a full race distance."
  },

  "Canadian Grand Prix": {
    laps: 70,
    length: "4.361 km",
    distance: "305.270 km",
    lapRecord: "1:13.078 — Valtteri Bottas (2019)",
    firstGrandPrix: 1967,
    drsZones: 3,
    fact: "Montreal invites brave braking and punishes overconfidence with walls, kerbs, and the famous final chicane."
  },

  "Austrian Grand Prix": {
    laps: 71,
    length: "4.318 km",
    distance: "306.452 km",
    lapRecord: "1:05.619 — Carlos Sainz (2020)",
    firstGrandPrix: 1964,
    drsZones: 3,
    fact: "Short lap, huge consequences: small gains around the Red Bull Ring can reshape the whole grid order."
  },

  "British Grand Prix": {
    laps: 52,
    length: "5.891 km",
    distance: "306.198 km",
    lapRecord: "1:27.097 — Max Verstappen (2020)",
    firstGrandPrix: 1950,
    drsZones: 2,
    fact: "Silverstone is all about commitment through the high-speed sweepers where aerodynamic confidence becomes everything."
  },

  "Belgian Grand Prix": {
    laps: 44,
    length: "7.004 km",
    distance: "308.052 km",
    lapRecord: "1:46.286 — Valtteri Bottas (2018)",
    firstGrandPrix: 1950,
    drsZones: 2,
    fact: "Spa remains a momentum circuit where weather, elevation, and bravery can shuffle the order in minutes."
  },

  "Hungarian Grand Prix": {
    laps: 70,
    length: "4.381 km",
    distance: "306.630 km",
    lapRecord: "1:16.627 — Lewis Hamilton (2020)",
    firstGrandPrix: 1986,
    drsZones: 2,
    fact: "The Hungaroring demands rhythm and tyre care, often turning Saturday precision into Sunday control."
  },

  "Dutch Grand Prix": {
    laps: 72,
    length: "4.259 km",
    distance: "306.587 km",
    lapRecord: "1:11.097 — Lewis Hamilton (2021)",
    firstGrandPrix: 1952,
    drsZones: 2,
    fact: "Zandvoort’s banking and flowing final sector reward drivers who stay aggressive without overheating the tyres."
  },

  "Italian Grand Prix": {
    laps: 53,
    length: "5.793 km",
    distance: "306.720 km",
    lapRecord: "1:21.046 — Rubens Barrichello (2004)",
    firstGrandPrix: 1950,
    drsZones: 2,
    fact: "Monza is still the temple of speed, where low drag and fearless braking shape the entire weekend."
  },

  "Azerbaijan Grand Prix": {
    laps: 51,
    length: "6.003 km",
    distance: "306.049 km",
    lapRecord: "1:43.009 — Charles Leclerc (2019)",
    firstGrandPrix: 2016,
    drsZones: 2,
    fact: "Baku combines castle-wall precision with one of the longest flat-out runs on the calendar."
  },

  "Singapore Grand Prix": {
    laps: 62,
    length: "4.940 km",
    distance: "306.143 km",
    lapRecord: "1:35.867 — Lewis Hamilton (2023)",
    firstGrandPrix: 2008,
    drsZones: 3,
    fact: "Singapore is a night-race endurance test where heat, humidity, and strategy can decide everything late on."
  },

  "United States Grand Prix": {
    laps: 56,
    length: "5.513 km",
    distance: "308.405 km",
    lapRecord: "1:36.169 — Charles Leclerc (2019)",
    firstGrandPrix: 1959,
    drsZones: 2,
    fact: "COTA rewards cars that can rotate in the slow stuff without giving away speed down the long straights."
  },

  "Mexican Grand Prix": {
    laps: 71,
    length: "4.304 km",
    distance: "305.354 km",
    lapRecord: "1:17.774 — Valtteri Bottas (2021)",
    firstGrandPrix: 1963,
    drsZones: 3,
    fact: "Mexico City’s altitude changes everything — less drag, less downforce, and plenty of stress on cooling."
  },

  "Brazilian Grand Prix": {
    laps: 71,
    length: "4.309 km",
    distance: "305.879 km",
    lapRecord: "1:10.540 — Valtteri Bottas (2018)",
    firstGrandPrix: 1973,
    drsZones: 2,
    fact: "Interlagos can flip a race in a lap, especially when cloud cover and safety cars arrive at the same time."
  },

  "Las Vegas Grand Prix": {
    laps: 50,
    length: "6.201 km",
    distance: "309.958 km",
    lapRecord: "1:35.490 — Oscar Piastri (2023)",
    firstGrandPrix: 2023,
    drsZones: 2,
    fact: "Las Vegas is a low-temperature, low-grip challenge where straight-line efficiency can dominate the headline pace."
  },

  "Qatar Grand Prix": {
    laps: 57,
    length: "5.419 km",
    distance: "308.611 km",
    lapRecord: "1:24.319 — Max Verstappen (2023)",
    firstGrandPrix: 2021,
    drsZones: 1,
    fact: "Lusail punishes dirty air and tyre stress, especially through the long sequence of fast directional changes."
  },

  "Abu Dhabi Grand Prix": {
    laps: 58,
    length: "5.281 km",
    distance: "306.183 km",
    lapRecord: "1:26.103 — Max Verstappen (2021)",
    firstGrandPrix: 2009,
    drsZones: 2,
    fact: "Yas Marina is the final chapter of the season, where twilight strategy and traction off slow corners decide the closing fight."
  }
};
