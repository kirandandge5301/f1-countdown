export interface ConstructorBranding {
  canonicalName: string;
  shortName: string;
  monogram: string;
  primary: string;
  secondary: string;
  accentText: string;
}

const BRANDING_ENTRIES: Array<[string[], ConstructorBranding]> = [
  [["McLaren"], { canonicalName: 'McLaren', shortName: 'Papaya', monogram: 'MCL', primary: '#FF8000', secondary: '#2B1B11', accentText: '#FFE7D0' }],
  [["Red Bull Racing", "Red Bull"], { canonicalName: 'Red Bull Racing', shortName: 'Milton Keynes', monogram: 'RBR', primary: '#1E41FF', secondary: '#06122E', accentText: '#E7EEFF' }],
  [["Ferrari", "Scuderia Ferrari"], { canonicalName: 'Ferrari', shortName: 'Maranello', monogram: 'FER', primary: '#DC0000', secondary: '#2A0606', accentText: '#FFE1E1' }],
  [["Mercedes", "Mercedes-AMG Petronas", "Mercedes AMG Petronas"], { canonicalName: 'Mercedes', shortName: 'Brackley', monogram: 'MER', primary: '#27F4D2', secondary: '#06221D', accentText: '#E0FFFA' }],
  [["Aston Martin"], { canonicalName: 'Aston Martin', shortName: 'Silverstone', monogram: 'AMR', primary: '#006F62', secondary: '#081D19', accentText: '#D5FFF8' }],
  [["Williams"], { canonicalName: 'Williams', shortName: 'Grove', monogram: 'WIL', primary: '#64C4FF', secondary: '#091A25', accentText: '#E4F6FF' }],
  [["RB", "Racing Bulls"], { canonicalName: 'Racing Bulls', shortName: 'Faenza', monogram: 'RB', primary: '#6692FF', secondary: '#0C1327', accentText: '#E6EDFF' }],
  [["Haas F1 Team", "Haas"], { canonicalName: 'Haas F1 Team', shortName: 'Kannapolis', monogram: 'HAAS', primary: '#B6BABD', secondary: '#1A1B1D', accentText: '#F7F8F8' }],
  [["Alpine"], { canonicalName: 'Alpine', shortName: 'Enstone', monogram: 'ALP', primary: '#FF87BC', secondary: '#240D17', accentText: '#FFE7F1' }],
  [["Kick Sauber", "Sauber"], { canonicalName: 'Kick Sauber', shortName: 'Hinwil', monogram: 'KIK', primary: '#52E252', secondary: '#0C200C', accentText: '#E6FFE6' }],
];

const FALLBACK_BRANDING: ConstructorBranding = {
  canonicalName: 'Constructor',
  shortName: 'Team',
  monogram: 'F1',
  primary: '#999999',
  secondary: '#141414',
  accentText: '#FFFFFF',
};

export function getConstructorBranding(teamName: string): ConstructorBranding {
  const normalized = teamName.trim().toLowerCase();

  for (const [aliases, branding] of BRANDING_ENTRIES) {
    if (aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return branding;
    }
  }

  return {
    ...FALLBACK_BRANDING,
    canonicalName: teamName || FALLBACK_BRANDING.canonicalName,
    monogram: teamName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || FALLBACK_BRANDING.monogram,
  };
}
