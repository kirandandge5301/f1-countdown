export interface Broadcaster {
  name: string;
  description: string;
  region: string;
  variant: 'red' | 'dark';
  icon: 'globe' | 'tv';
}

export interface CountryBroadcasters {
  primary: Broadcaster;
  secondary: Broadcaster;
}

export const BROADCASTERS: Record<string, CountryBroadcasters> = {
  IN: {
    primary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race — plus team radio, onboard cameras and live timing.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    },
    secondary: {
      name: 'Disney+ Hotstar',
      description: 'Live streaming of all F1 sessions in India with Hindi and English commentary.',
      region: 'INDIA',
      variant: 'dark',
      icon: 'tv'
    }
  },
  GB: {
    primary: {
      name: 'Sky Sports F1',
      description: 'The home of Formula 1 in the UK with full race weekend coverage.',
      region: 'UNITED KINGDOM \u00b7 IRELAND',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race — plus team radio, onboard cameras and live timing.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    }
  },
  US: {
    primary: {
      name: 'ESPN',
      description: 'Free-to-air broadcast of all F1 races with expert commentary and analysis.',
      region: 'UNITED STATES',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    }
  },
  FR: {
    primary: {
      name: 'Canal+',
      description: 'Full coverage of the F1 season with French commentary and exclusive content.',
      region: 'FRANCE',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    }
  },
  DE: {
    primary: {
      name: 'Sky Sport F1',
      description: 'Comprehensive F1 coverage in Germany with expert analysis and German commentary.',
      region: 'GERMANY',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    }
  },
  AU: {
    primary: {
      name: 'Fox Sports',
      description: 'Full F1 race weekend coverage across Australia with local commentary team.',
      region: 'AUSTRALIA',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'Kayo Sports',
      description: 'Stream every F1 session live and on-demand with Kayo Sports.',
      region: 'AUSTRALIA \u00b7 STREAMING',
      variant: 'dark',
      icon: 'tv'
    }
  },
  CA: {
    primary: {
      name: 'DAZN',
      description: 'Full F1 coverage in Canada with all practice sessions, qualifying, and races.',
      region: 'CANADA',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'RDS',
      description: 'French-language coverage of all F1 sessions for Quebec and French Canada.',
      region: 'CANADA \u00b7 FRAN\u00c7AIS',
      variant: 'dark',
      icon: 'tv'
    }
  },
  BR: {
    primary: {
      name: 'BandSports',
      description: 'Complete F1 coverage in Brazil with Portuguese commentary.',
      region: 'BRAZIL',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'F1 TV Pro',
      description: 'The official Formula 1 streaming service. Every practice, qualifying, sprint and race.',
      region: 'WORLDWIDE \u00b7 OFFICIAL',
      variant: 'red',
      icon: 'globe'
    }
  },
  JP: {
    primary: {
      name: 'DAZN',
      description: 'Full F1 coverage in Japan with Japanese commentary.',
      region: 'JAPAN',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'Fuji TV',
      description: 'Selected F1 races broadcast on Fuji Television Network.',
      region: 'JAPAN',
      variant: 'dark',
      icon: 'tv'
    }
  },
  IT: {
    primary: {
      name: 'Sky Sport F1',
      description: 'Complete F1 coverage in Italy with Italian commentary.',
      region: 'ITALY',
      variant: 'dark',
      icon: 'tv'
    },
    secondary: {
      name: 'TV8',
      description: 'Selected F1 races available free-to-air on TV8.',
      region: 'ITALY \u00b7 FREE',
      variant: 'dark',
      icon: 'tv'
    }
  }
};

export const COUNTRY_OPTIONS = [
  { code: 'IN', flag: '\ud83c\uddee\ud83c\uddf3', label: 'INDIA' },
  { code: 'GB', flag: '\ud83c\uddec\ud83c\udde7', label: 'UK' },
  { code: 'US', flag: '\ud83c\uddfa\ud83c\uddf8', label: 'USA' },
  { code: 'FR', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FRANCE' },
  { code: 'DE', flag: '\ud83c\udde9\ud83c\uddea', label: 'GERMANY' },
  { code: 'AU', flag: '\ud83c\udde6\ud83c\uddfa', label: 'AUSTRALIA' },
  { code: 'CA', flag: '\ud83c\udde8\ud83c\udde6', label: 'CANADA' },
  { code: 'BR', flag: '\ud83c\udde7\ud83c\uddf7', label: 'BRAZIL' },
  { code: 'JP', flag: '\ud83c\uddef\ud83c\uddf5', label: 'JAPAN' },
  { code: 'IT', flag: '\ud83c\uddee\ud83c\uddf9', label: 'ITALY' }
];
