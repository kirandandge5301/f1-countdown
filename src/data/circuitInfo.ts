export interface CircuitInfo {
  length: string;
  laps: string;
  distance: string;
  lapRecord: string;
  firstGrandPrix: string;
  drsZones: string;
  fact: string;
}

export const CIRCUIT_INFO: Record<string, CircuitInfo> = {
  "Australian Grand Prix": {
    length: "5.278 km",
    laps: "58",
    distance: "306.124 km",
    lapRecord: "1:19.813 — Charles Leclerc (2024)",
    firstGrandPrix: "1985",
    drsZones: "4",
    fact: "Albert Park blends temporary-street precision with a quick opening sector and heavy braking zones around the lake."
  },

  "Chinese Grand Prix": {
    length: "5.451 km",
    laps: "56",
    distance: "305.066 km",
    lapRecord: "1:32.238 — Michael Schumacher (2004)",
    firstGrandPrix: "2004",
    drsZones: "2",
    fact: "Shanghai opens with a tightening snail and closes with one of the longest full-throttle runs on the calendar."
  },

  "Japanese Grand Prix": {
    length: "5.807 km",
    laps: "53",
    distance: "307.471 km",
    lapRecord: "1:30.983 — Lewis Hamilton (2019)",
    firstGrandPrix: "1976",
    drsZones: "1",
    fact: "Suzuka still exposes the best-balanced cars through the Esses, Degners, and the long run through 130R."
  },

  "Miami Grand Prix": {
    length: "5.412 km",
    laps: "57",
    distance: "308.326 km",
    lapRecord: "1:29.708 — Max Verstappen (2023)",
    firstGrandPrix: "2022",
    drsZones: "3",
    fact: "Miami is all about braking stability into the slow corners without giving up speed across the long straights."
  },

  "Canadian Grand Prix": {
    length: "4.361 km",
    laps: "70",
    distance: "305.270 km",
    lapRecord: "1:13.078 — Valtteri Bottas (2019)",
    firstGrandPrix: "1967",
    drsZones: "3",
    fact: "Montréal rewards commitment over the kerbs and punishes mistakes with walls at both ends of the lap."
  },

  "Monaco Grand Prix": {
    length: "3.337 km",
    laps: "78",
    distance: "260.286 km",
    lapRecord: "1:12.909 — Lewis Hamilton (2021)",
    firstGrandPrix: "1950",
    drsZones: "1",
    fact: "Around Monte Carlo, confidence and placement matter more than outright horsepower once the barriers close in."
  },

  "Barcelona Grand Prix": {
    length: "4.657 km",
    laps: "66",
    distance: "307.236 km",
    lapRecord: "1:15.743 — Oscar Piastri (2025)",
    firstGrandPrix: "1991",
    drsZones: "2",
    fact: "Barcelona remains one of the clearest tests of full-car balance, especially once tyre wear builds through the final sector."
  },

  "Austrian Grand Prix": {
    length: "4.318 km",
    laps: "71",
    distance: "306.452 km",
    lapRecord: "1:05.619 — Carlos Sainz (2020)",
    firstGrandPrix: "1964",
    drsZones: "3",
    fact: "At Spielberg the lap is short, the braking zones are brutal, and tiny mistakes get amplified immediately."
  },

  "British Grand Prix": {
    length: "5.891 km",
    laps: "52",
    distance: "306.198 km",
    lapRecord: "1:27.097 — Max Verstappen (2020)",
    firstGrandPrix: "1950",
    drsZones: "2",
    fact: "Silverstone is built on confidence through the high-speed sweepers where aerodynamic grip becomes the whole conversation."
  },

  "Belgian Grand Prix": {
    length: "7.004 km",
    laps: "44",
    distance: "308.052 km",
    lapRecord: "1:46.286 — Valtteri Bottas (2018)",
    firstGrandPrix: "1950",
    drsZones: "2",
    fact: "Spa stretches the calendar with elevation, weather swings, and full-throttle commitment from La Source to the Kemmel Straight."
  },

  "Hungarian Grand Prix": {
    length: "4.381 km",
    laps: "70",
    distance: "306.630 km",
    lapRecord: "1:16.627 — Lewis Hamilton (2020)",
    firstGrandPrix: "1986",
    drsZones: "2",
    fact: "The Hungaroring rewards drivers who stay clean through every rotation because overtaking windows are always at a premium."
  },

  "Dutch Grand Prix": {
    length: "4.259 km",
    laps: "72",
    distance: "306.587 km",
    lapRecord: "1:11.097 — Lewis Hamilton (2021)",
    firstGrandPrix: "1952",
    drsZones: "2",
    fact: "Zandvoort’s banking and tight ribbon of asphalt make tyre life and precision equally important through the dunes."
  },

  "Italian Grand Prix": {
    length: "5.793 km",
    laps: "53",
    distance: "306.720 km",
    lapRecord: "1:21.046 — Rubens Barrichello (2004)",
    firstGrandPrix: "1950",
    drsZones: "2",
    fact: "Monza is still the purest speed test on the calendar, where low drag and braking bravery decide the shape of the weekend."
  },

  "Azerbaijan Grand Prix": {
    length: "6.003 km",
    laps: "51",
    distance: "306.049 km",
    lapRecord: "1:43.009 — Charles Leclerc (2019)",
    firstGrandPrix: "2016",
    drsZones: "2",
    fact: "Baku asks drivers to switch instantly from castle-section patience to maximum commitment down the waterfront straight."
  },

  "Singapore Grand Prix": {
    length: "4.940 km",
    laps: "62",
    distance: "306.143 km",
    lapRecord: "1:35.867 — Lewis Hamilton (2023)",
    firstGrandPrix: "2008",
    drsZones: "Data currently unavailable",
    fact: "Singapore is a night-race endurance test where heat, humidity, and repeated traction zones punish even small setup misses."
  },

  "United States Grand Prix": {
    length: "5.513 km",
    laps: "56",
    distance: "308.405 km",
    lapRecord: "1:36.169 — Charles Leclerc (2019)",
    firstGrandPrix: "2012",
    drsZones: "2",
    fact: "Austin mixes a dramatic uphill Turn 1 with flowing first-sector changes and power-sensitive long-straight racing."
  },

  "Mexico City Grand Prix": {
    length: "4.304 km",
    laps: "71",
    distance: "305.354 km",
    lapRecord: "1:17.774 — Valtteri Bottas (2021)",
    firstGrandPrix: "1963",
    drsZones: "3",
    fact: "At high altitude in Mexico City, straight-line speed rises while cooling and downforce become much harder to manage."
  },

  "São Paulo Grand Prix": {
    length: "4.309 km",
    laps: "71",
    distance: "305.879 km",
    lapRecord: "1:10.540 — Valtteri Bottas (2018)",
    firstGrandPrix: "1973",
    drsZones: "2",
    fact: "Interlagos rarely stays quiet for long — elevation, weather, and safety-car risk can rewrite a race in minutes."
  },

  "Las Vegas Grand Prix": {
    length: "6.201 km",
    laps: "50",
    distance: "309.958 km",
    lapRecord: "1:35.490 — Oscar Piastri (2023)",
    firstGrandPrix: "2023",
    drsZones: "2",
    fact: "Las Vegas rewards efficient low-drag setups in cool conditions where tyre preparation can swing the whole lap."
  },

  "Qatar Grand Prix": {
    length: "5.419 km",
    laps: "57",
    distance: "308.611 km",
    lapRecord: "1:24.319 — Max Verstappen (2023)",
    firstGrandPrix: "2021",
    drsZones: "1",
    fact: "Lusail loads the tyres heavily through long medium- and high-speed sequences, especially once the heat settles in."
  },

  "Abu Dhabi Grand Prix": {
    length: "5.281 km",
    laps: "58",
    distance: "306.183 km",
    lapRecord: "1:26.103 — Max Verstappen (2021)",
    firstGrandPrix: "2009",
    drsZones: "2",
    fact: "Yas Marina closes the season with long straights, traction zones, and a twilight track evolution teams have to read perfectly."
  },

  "Spanish Grand Prix": {
    length: "5.416 km",
    laps: "57",
    distance: "308.524 km",
    lapRecord: "Data currently unavailable",
    firstGrandPrix: "2026",
    drsZones: "Data currently unavailable",
    fact: "Madrid’s new layout is still building its competitive history, so the first running will define the reference points."
  },
};
