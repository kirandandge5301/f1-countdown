export interface RaceSession {
  fp1?: string;
  fp2?: string;
  fp3?: string;
  sprintQualifying?: string;
  sprint?: string;
  qualifying?: string;
  race: string;
}

export interface Race {
  round: number;
  date: string;
  day: string;
  gp: string;
  officialName?: string;
  circuit: string;
  country: string;
  countryName?: string;
  city: string;
  sprint?: boolean;
  raceUTC: string;
  sessions: RaceSession;
}

export const RACES: Race[] = [
  {
    round: 1, date: "2026-03-08", day: "SUN", gp: "Australian Grand Prix",
    officialName: "FORMULA 1 QATAR AIRWAYS AUSTRALIAN GRAND PRIX 2026",
    circuit: "Melbourne", country: "AUS", countryName: "Australia", city: "Melbourne", raceUTC: "04:00",
    sessions: {
      fp1: "2026-03-06T01:30:00Z", fp2: "2026-03-06T05:00:00Z",
      fp3: "2026-03-07T01:30:00Z", qualifying: "2026-03-07T05:00:00Z",
      race: "2026-03-08T04:00:00Z"
    }
  },
  {
    round: 2, date: "2026-03-15", day: "SUN", gp: "Chinese Grand Prix",
    officialName: "FORMULA 1 HEINEKEN CHINESE GRAND PRIX 2026",
    circuit: "Shanghai", country: "CHN", countryName: "China", city: "Shanghai", sprint: true, raceUTC: "07:00",
    sessions: {
      fp1: "2026-03-13T03:30:00Z", sprintQualifying: "2026-03-13T07:30:00Z",
      sprint: "2026-03-14T03:00:00Z", qualifying: "2026-03-14T07:00:00Z",
      race: "2026-03-15T07:00:00Z"
    }
  },
  {
    round: 3, date: "2026-03-29", day: "SUN", gp: "Japanese Grand Prix",
    officialName: "FORMULA 1 ARAMCO JAPANESE GRAND PRIX 2026",
    circuit: "Suzuka", country: "JPN", countryName: "Japan", city: "Suzuka", raceUTC: "05:00",
    sessions: {
      fp1: "2026-03-27T02:30:00Z", fp2: "2026-03-27T06:00:00Z",
      fp3: "2026-03-28T02:30:00Z", qualifying: "2026-03-28T06:00:00Z",
      race: "2026-03-29T05:00:00Z"
    }
  },
  {
    round: 4, date: "2026-05-03", day: "SUN", gp: "Miami Grand Prix",
    officialName: "FORMULA 1 CRYPTO.COM MIAMI GRAND PRIX 2026",
    circuit: "Miami", country: "USA", countryName: "United States", city: "Miami Gardens", sprint: true, raceUTC: "17:00",
    sessions: {
      fp1: "2026-05-01T16:00:00Z", sprintQualifying: "2026-05-01T20:30:00Z",
      sprint: "2026-05-02T16:00:00Z", qualifying: "2026-05-02T20:00:00Z",
      race: "2026-05-03T17:00:00Z"
    }
  },
  {
    round: 5, date: "2026-05-24", day: "SUN", gp: "Canadian Grand Prix",
    officialName: "FORMULA 1 LENOVO GRAND PRIX DU CANADA 2026",
    circuit: "Montreal", country: "CAN", countryName: "Canada", city: "Montréal", sprint: true, raceUTC: "20:00",
    sessions: {
      fp1: "2026-05-22T16:30:00Z", sprintQualifying: "2026-05-22T20:30:00Z",
      sprint: "2026-05-23T16:00:00Z", qualifying: "2026-05-23T20:00:00Z",
      race: "2026-05-24T20:00:00Z"
    }
  },
  {
    round: 6, date: "2026-06-07", day: "SUN", gp: "Monaco Grand Prix",
    officialName: "FORMULA 1 LOUIS VUITTON GRAND PRIX DE MONACO 2026",
    circuit: "Monte Carlo", country: "MON", countryName: "Monaco", city: "Monte Carlo", raceUTC: "13:00",
    sessions: {
      fp1: "2026-06-05T11:30:00Z", fp2: "2026-06-05T15:00:00Z",
      fp3: "2026-06-06T10:30:00Z", qualifying: "2026-06-06T14:00:00Z",
      race: "2026-06-07T13:00:00Z"
    }
  },
  {
    round: 7, date: "2026-06-14", day: "SUN", gp: "Barcelona Grand Prix",
    officialName: "FORMULA 1 MSC CRUISES GRAN PREMIO DE BARCELONA-CATALUNYA 2026",
    circuit: "Catalunya", country: "ESP", countryName: "Spain", city: "Barcelona", raceUTC: "13:00",
    sessions: {
      fp1: "2026-06-12T11:30:00Z", fp2: "2026-06-12T15:00:00Z",
      fp3: "2026-06-13T10:30:00Z", qualifying: "2026-06-13T14:00:00Z",
      race: "2026-06-14T13:00:00Z"
    }
  },
  {
    round: 8, date: "2026-06-28", day: "SUN", gp: "Austrian Grand Prix",
    officialName: "FORMULA 1 LENOVO AUSTRIAN GRAND PRIX 2026",
    circuit: "Spielberg", country: "AUT", countryName: "Austria", city: "Spielberg", raceUTC: "13:00",
    sessions: {
      fp1: "2026-06-26T11:30:00Z", fp2: "2026-06-26T15:00:00Z",
      fp3: "2026-06-27T10:30:00Z", qualifying: "2026-06-27T14:00:00Z",
      race: "2026-06-28T13:00:00Z"
    }
  },
  {
    round: 9, date: "2026-07-05", day: "SUN", gp: "British Grand Prix",
    officialName: "FORMULA 1 PIRELLI BRITISH GRAND PRIX 2026",
    circuit: "Silverstone", country: "GBR", countryName: "United Kingdom", city: "Silverstone", sprint: true, raceUTC: "14:00",
    sessions: {
      fp1: "2026-07-03T11:30:00Z", sprintQualifying: "2026-07-03T15:30:00Z",
      sprint: "2026-07-04T11:00:00Z", qualifying: "2026-07-04T15:00:00Z",
      race: "2026-07-05T14:00:00Z"
    }
  },
  {
    round: 10, date: "2026-07-19", day: "SUN", gp: "Belgian Grand Prix",
    officialName: "FORMULA 1 MOËT & CHANDON BELGIAN GRAND PRIX 2026",
    circuit: "Spa-Francorchamps", country: "BEL", countryName: "Belgium", city: "Spa-Francorchamps", raceUTC: "13:00",
    sessions: {
      fp1: "2026-07-17T11:30:00Z", fp2: "2026-07-17T15:00:00Z",
      fp3: "2026-07-18T10:30:00Z", qualifying: "2026-07-18T14:00:00Z",
      race: "2026-07-19T13:00:00Z"
    }
  },
  {
    round: 11, date: "2026-07-26", day: "SUN", gp: "Hungarian Grand Prix",
    officialName: "FORMULA 1 AWS HUNGARIAN GRAND PRIX 2026",
    circuit: "Hungaroring", country: "HUN", countryName: "Hungary", city: "Budapest", raceUTC: "13:00",
    sessions: {
      fp1: "2026-07-24T11:30:00Z", fp2: "2026-07-24T15:00:00Z",
      fp3: "2026-07-25T10:30:00Z", qualifying: "2026-07-25T14:00:00Z",
      race: "2026-07-26T13:00:00Z"
    }
  },
  {
    round: 12, date: "2026-08-23", day: "SUN", gp: "Dutch Grand Prix",
    officialName: "FORMULA 1 HEINEKEN DUTCH GRAND PRIX 2026",
    circuit: "Zandvoort", country: "NED", countryName: "Netherlands", city: "Zandvoort", sprint: true, raceUTC: "13:00",
    sessions: {
      fp1: "2026-08-21T10:30:00Z", sprintQualifying: "2026-08-21T14:30:00Z",
      sprint: "2026-08-22T10:00:00Z", qualifying: "2026-08-22T14:00:00Z",
      race: "2026-08-23T13:00:00Z"
    }
  },
  {
    round: 13, date: "2026-09-06", day: "SUN", gp: "Italian Grand Prix",
    officialName: "FORMULA 1 PIRELLI GRAN PREMIO D’ITALIA 2026",
    circuit: "Monza", country: "ITA", countryName: "Italy", city: "Monza", raceUTC: "13:00",
    sessions: {
      fp1: "2026-09-04T10:30:00Z", fp2: "2026-09-04T14:00:00Z",
      fp3: "2026-09-05T10:30:00Z", qualifying: "2026-09-05T14:00:00Z",
      race: "2026-09-06T13:00:00Z"
    }
  },
  {
    round: 14, date: "2026-09-13", day: "SUN", gp: "Spanish Grand Prix",
    officialName: "FORMULA 1 TAG HEUER GRAN PREMIO DE ESPAÑA 2026",
    circuit: "Madring", country: "ESP", countryName: "Spain", city: "Madrid", raceUTC: "13:00",
    sessions: {
      fp1: "2026-09-11T11:30:00Z", fp2: "2026-09-11T15:00:00Z",
      fp3: "2026-09-12T10:30:00Z", qualifying: "2026-09-12T14:00:00Z",
      race: "2026-09-13T13:00:00Z"
    }
  },
  {
    round: 15, date: "2026-09-26", day: "SAT", gp: "Azerbaijan Grand Prix",
    officialName: "FORMULA 1 QATAR AIRWAYS AZERBAIJAN GRAND PRIX 2026",
    circuit: "Baku", country: "AZE", countryName: "Azerbaijan", city: "Baku", raceUTC: "11:00",
    sessions: {
      fp1: "2026-09-24T08:30:00Z", fp2: "2026-09-24T12:00:00Z",
      fp3: "2026-09-25T08:30:00Z", qualifying: "2026-09-25T12:00:00Z",
      race: "2026-09-26T11:00:00Z"
    }
  },
  {
    round: 16, date: "2026-10-11", day: "SUN", gp: "Singapore Grand Prix",
    officialName: "FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026",
    circuit: "Singapore", country: "SGP", countryName: "Singapore", city: "Marina Bay", sprint: true, raceUTC: "12:00",
    sessions: {
      fp1: "2026-10-09T08:30:00Z", sprintQualifying: "2026-10-09T12:30:00Z",
      sprint: "2026-10-10T09:00:00Z", qualifying: "2026-10-10T13:00:00Z",
      race: "2026-10-11T12:00:00Z"
    }
  },
  {
    round: 17, date: "2026-10-25", day: "SUN", gp: "United States Grand Prix",
    officialName: "FORMULA 1 MSC CRUISES UNITED STATES GRAND PRIX 2026",
    circuit: "Austin", country: "USA", countryName: "United States", city: "Austin", raceUTC: "20:00",
    sessions: {
      fp1: "2026-10-23T17:30:00Z", fp2: "2026-10-23T21:00:00Z",
      fp3: "2026-10-24T17:30:00Z", qualifying: "2026-10-24T21:00:00Z",
      race: "2026-10-25T20:00:00Z"
    }
  },
  {
    round: 18, date: "2026-11-01", day: "SUN", gp: "Mexico City Grand Prix",
    officialName: "FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026",
    circuit: "Mexico City", country: "MEX", countryName: "Mexico", city: "Mexico City", raceUTC: "20:00",
    sessions: {
      fp1: "2026-10-30T18:30:00Z", fp2: "2026-10-30T22:00:00Z",
      fp3: "2026-10-31T17:30:00Z", qualifying: "2026-10-31T21:00:00Z",
      race: "2026-11-01T20:00:00Z"
    }
  },
  {
    round: 19, date: "2026-11-08", day: "SUN", gp: "São Paulo Grand Prix",
    officialName: "FORMULA 1 MSC CRUISES GRANDE PRÊMIO DE SÃO PAULO 2026",
    circuit: "Interlagos", country: "BRA", countryName: "Brazil", city: "São Paulo", raceUTC: "17:00",
    sessions: {
      fp1: "2026-11-06T15:30:00Z", fp2: "2026-11-06T19:00:00Z",
      fp3: "2026-11-07T14:30:00Z", qualifying: "2026-11-07T18:00:00Z",
      race: "2026-11-08T17:00:00Z"
    }
  },
  {
    round: 20, date: "2026-11-22", day: "SUN", gp: "Las Vegas Grand Prix",
    officialName: "FORMULA 1 HEINEKEN LAS VEGAS GRAND PRIX 2026",
    circuit: "Las Vegas", country: "USA", countryName: "United States", city: "Las Vegas", raceUTC: "04:00",
    sessions: {
      fp1: "2026-11-20T00:30:00Z", fp2: "2026-11-20T04:00:00Z",
      fp3: "2026-11-21T00:30:00Z", qualifying: "2026-11-21T04:00:00Z",
      race: "2026-11-22T04:00:00Z"
    }
  },
  {
    round: 21, date: "2026-11-29", day: "SUN", gp: "Qatar Grand Prix",
    officialName: "FORMULA 1 QATAR AIRWAYS QATAR GRAND PRIX 2026",
    circuit: "Lusail", country: "QAT", countryName: "Qatar", city: "Lusail", raceUTC: "16:00",
    sessions: {
      fp1: "2026-11-27T13:30:00Z", fp2: "2026-11-27T17:00:00Z",
      fp3: "2026-11-28T14:30:00Z", qualifying: "2026-11-28T18:00:00Z",
      race: "2026-11-29T16:00:00Z"
    }
  },
  {
    round: 22, date: "2026-12-06", day: "SUN", gp: "Abu Dhabi Grand Prix",
    officialName: "FORMULA 1 ETIHAD AIRWAYS ABU DHABI GRAND PRIX 2026",
    circuit: "Yas Marina Circuit", country: "UAE", countryName: "United Arab Emirates", city: "Yas Marina", raceUTC: "13:00",
    sessions: {
      fp1: "2026-12-04T09:30:00Z", fp2: "2026-12-04T13:00:00Z",
      fp3: "2026-12-05T10:30:00Z", qualifying: "2026-12-05T14:00:00Z",
      race: "2026-12-06T13:00:00Z"
    }
  }
];

export const SESSION_ORDER: (keyof RaceSession)[] = [
  'fp1', 'fp2', 'fp3', 'sprintQualifying', 'sprint', 'qualifying', 'race'
];

export const SESSION_LABELS: Record<string, string> = {
  fp1: 'Practice 1',
  fp2: 'Practice 2',
  fp3: 'Practice 3',
  sprintQualifying: 'Sprint Qualifying',
  sprint: 'Sprint',
  qualifying: 'Qualifying',
  race: 'Race'
};
