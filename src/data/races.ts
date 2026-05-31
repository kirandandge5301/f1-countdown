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
  circuit: string;
  country: string;
  city: string;
  sprint?: boolean;
  raceUTC: string;
  sessions: RaceSession;
}

export const RACES: Race[] = [
  {
    round: 1, date: "2026-03-08", day: "SUN", gp: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit", country: "BH", city: "Sakhir", raceUTC: "15:00",
    sessions: {
      fp1: "2026-03-06T11:30:00Z", fp2: "2026-03-06T15:30:00Z",
      fp3: "2026-03-07T11:30:00Z", qualifying: "2026-03-07T15:00:00Z",
      race: "2026-03-08T15:00:00Z"
    }
  },
  {
    round: 2, date: "2026-03-15", day: "SUN", gp: "Saudi Arabian Grand Prix",
    circuit: "Jeddah Corniche Circuit", country: "SA", city: "Jeddah", raceUTC: "17:00",
    sessions: {
      fp1: "2026-03-13T13:30:00Z", fp2: "2026-03-13T17:30:00Z",
      fp3: "2026-03-14T13:30:00Z", qualifying: "2026-03-14T17:00:00Z",
      race: "2026-03-15T17:00:00Z"
    }
  },
  {
    round: 3, date: "2026-03-29", day: "SUN", gp: "Australian Grand Prix",
    circuit: "Albert Park Circuit", country: "AU", city: "Melbourne", raceUTC: "04:00",
    sessions: {
      fp1: "2026-03-27T01:30:00Z", fp2: "2026-03-27T05:30:00Z",
      fp3: "2026-03-28T01:30:00Z", qualifying: "2026-03-28T05:00:00Z",
      race: "2026-03-29T04:00:00Z"
    }
  },
  {
    round: 4, date: "2026-04-12", day: "SUN", gp: "Japanese Grand Prix",
    circuit: "Suzuka International Racing Course", country: "JP", city: "Suzuka", raceUTC: "05:00",
    sessions: {
      fp1: "2026-04-10T02:30:00Z", fp2: "2026-04-10T06:30:00Z",
      fp3: "2026-04-11T02:30:00Z", qualifying: "2026-04-11T06:00:00Z",
      race: "2026-04-12T05:00:00Z"
    }
  },
  {
    round: 5, date: "2026-04-19", day: "SUN", gp: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit", country: "CN", city: "Shanghai", sprint: true, raceUTC: "07:00",
    sessions: {
      fp1: "2026-04-17T03:30:00Z", sprintQualifying: "2026-04-17T07:30:00Z",
      sprint: "2026-04-18T03:00:00Z", qualifying: "2026-04-18T07:00:00Z",
      race: "2026-04-19T07:00:00Z"
    }
  },
  {
    round: 6, date: "2026-05-03", day: "SUN", gp: "Miami Grand Prix",
    circuit: "Miami International Autodrome", country: "US", city: "Miami", sprint: true, raceUTC: "19:00",
    sessions: {
      fp1: "2026-05-01T15:30:00Z", sprintQualifying: "2026-05-01T19:30:00Z",
      sprint: "2026-05-02T15:00:00Z", qualifying: "2026-05-02T19:00:00Z",
      race: "2026-05-03T19:00:00Z"
    }
  },
  {
    round: 7, date: "2026-05-17", day: "SUN", gp: "Emilia Romagna Grand Prix",
    circuit: "Autodromo Internazionale Enzo e Dino Ferrari", country: "IT", city: "Imola", raceUTC: "13:00",
    sessions: {
      fp1: "2026-05-15T09:30:00Z", fp2: "2026-05-15T13:30:00Z",
      fp3: "2026-05-16T09:30:00Z", qualifying: "2026-05-16T13:00:00Z",
      race: "2026-05-17T13:00:00Z"
    }
  },
  {
    round: 8, date: "2026-05-31", day: "SUN", gp: "Monaco Grand Prix",
    circuit: "Circuit de Monaco", country: "MC", city: "Monte Carlo", raceUTC: "13:00",
    sessions: {
      fp1: "2026-05-29T09:30:00Z", fp2: "2026-05-29T13:30:00Z",
      fp3: "2026-05-30T09:30:00Z", qualifying: "2026-05-30T13:00:00Z",
      race: "2026-05-31T13:00:00Z"
    }
  },
  {
    round: 9, date: "2026-06-07", day: "SUN", gp: "Spanish Grand Prix",
    circuit: "Circuit de Barcelona-Catalunya", country: "ES", city: "Barcelona", raceUTC: "13:00",
    sessions: {
      fp1: "2026-06-05T09:30:00Z", fp2: "2026-06-05T13:30:00Z",
      fp3: "2026-06-06T09:30:00Z", qualifying: "2026-06-06T13:00:00Z",
      race: "2026-06-07T13:00:00Z"
    }
  },
  {
    round: 10, date: "2026-06-21", day: "SUN", gp: "Canadian Grand Prix",
    circuit: "Circuit Gilles Villeneuve", country: "CA", city: "Montreal", raceUTC: "18:00",
    sessions: {
      fp1: "2026-06-19T14:30:00Z", fp2: "2026-06-19T18:30:00Z",
      fp3: "2026-06-20T14:30:00Z", qualifying: "2026-06-20T18:00:00Z",
      race: "2026-06-21T18:00:00Z"
    }
  },
  {
    round: 11, date: "2026-06-28", day: "SUN", gp: "Austrian Grand Prix",
    circuit: "Red Bull Ring", country: "AT", city: "Spielberg", sprint: true, raceUTC: "13:00",
    sessions: {
      fp1: "2026-06-26T09:30:00Z", sprintQualifying: "2026-06-26T13:30:00Z",
      sprint: "2026-06-27T09:00:00Z", qualifying: "2026-06-27T13:00:00Z",
      race: "2026-06-28T13:00:00Z"
    }
  },
  {
    round: 12, date: "2026-07-12", day: "SUN", gp: "British Grand Prix",
    circuit: "Silverstone Circuit", country: "GB", city: "Silverstone", raceUTC: "14:00",
    sessions: {
      fp1: "2026-07-10T10:30:00Z", fp2: "2026-07-10T14:30:00Z",
      fp3: "2026-07-11T10:30:00Z", qualifying: "2026-07-11T14:00:00Z",
      race: "2026-07-12T14:00:00Z"
    }
  },
  {
    round: 13, date: "2026-07-26", day: "SUN", gp: "Belgian Grand Prix",
    circuit: "Circuit de Spa-Francorchamps", country: "BE", city: "Spa", raceUTC: "13:00",
    sessions: {
      fp1: "2026-07-24T09:30:00Z", fp2: "2026-07-24T13:30:00Z",
      fp3: "2026-07-25T09:30:00Z", qualifying: "2026-07-25T13:00:00Z",
      race: "2026-07-26T13:00:00Z"
    }
  },
  {
    round: 14, date: "2026-08-02", day: "SUN", gp: "Hungarian Grand Prix",
    circuit: "Hungaroring", country: "HU", city: "Budapest", raceUTC: "13:00",
    sessions: {
      fp1: "2026-07-31T09:30:00Z", fp2: "2026-07-31T13:30:00Z",
      fp3: "2026-08-01T09:30:00Z", qualifying: "2026-08-01T13:00:00Z",
      race: "2026-08-02T13:00:00Z"
    }
  },
  {
    round: 15, date: "2026-08-23", day: "SUN", gp: "Dutch Grand Prix",
    circuit: "Circuit Zandvoort", country: "NL", city: "Zandvoort", raceUTC: "13:00",
    sessions: {
      fp1: "2026-08-21T09:30:00Z", fp2: "2026-08-21T13:30:00Z",
      fp3: "2026-08-22T09:30:00Z", qualifying: "2026-08-22T13:00:00Z",
      race: "2026-08-23T13:00:00Z"
    }
  },
  {
    round: 16, date: "2026-08-30", day: "SUN", gp: "Italian Grand Prix",
    circuit: "Autodromo Nazionale Monza", country: "IT", city: "Monza", raceUTC: "13:00",
    sessions: {
      fp1: "2026-08-28T09:30:00Z", fp2: "2026-08-28T13:30:00Z",
      fp3: "2026-08-29T09:30:00Z", qualifying: "2026-08-29T13:00:00Z",
      race: "2026-08-30T13:00:00Z"
    }
  },
  {
    round: 17, date: "2026-09-13", day: "SUN", gp: "Azerbaijan Grand Prix",
    circuit: "Baku City Circuit", country: "AZ", city: "Baku", raceUTC: "11:00",
    sessions: {
      fp1: "2026-09-11T07:30:00Z", fp2: "2026-09-11T11:30:00Z",
      fp3: "2026-09-12T07:30:00Z", qualifying: "2026-09-12T11:00:00Z",
      race: "2026-09-13T11:00:00Z"
    }
  },
  {
    round: 18, date: "2026-09-20", day: "SUN", gp: "Singapore Grand Prix",
    circuit: "Marina Bay Street Circuit", country: "SG", city: "Singapore", raceUTC: "12:00",
    sessions: {
      fp1: "2026-09-18T08:30:00Z", fp2: "2026-09-18T12:30:00Z",
      fp3: "2026-09-19T08:30:00Z", qualifying: "2026-09-19T12:00:00Z",
      race: "2026-09-20T12:00:00Z"
    }
  },
  {
    round: 19, date: "2026-10-04", day: "SUN", gp: "United States Grand Prix",
    circuit: "Circuit of the Americas", country: "US", city: "Austin", sprint: true, raceUTC: "19:00",
    sessions: {
      fp1: "2026-10-02T15:30:00Z", sprintQualifying: "2026-10-02T19:30:00Z",
      sprint: "2026-10-03T15:00:00Z", qualifying: "2026-10-03T19:00:00Z",
      race: "2026-10-04T19:00:00Z"
    }
  },
  {
    round: 20, date: "2026-10-18", day: "SUN", gp: "Mexican Grand Prix",
    circuit: "Autodromo Hermanos Rodriguez", country: "MX", city: "Mexico City", raceUTC: "19:00",
    sessions: {
      fp1: "2026-10-16T15:30:00Z", fp2: "2026-10-16T19:30:00Z",
      fp3: "2026-10-17T15:30:00Z", qualifying: "2026-10-17T19:00:00Z",
      race: "2026-10-18T19:00:00Z"
    }
  },
  {
    round: 21, date: "2026-11-01", day: "SUN", gp: "Brazilian Grand Prix",
    circuit: "Autodromo Jose Carlos Pace", country: "BR", city: "Sao Paulo", sprint: true, raceUTC: "16:00",
    sessions: {
      fp1: "2026-10-30T12:30:00Z", sprintQualifying: "2026-10-30T16:30:00Z",
      sprint: "2026-10-31T12:00:00Z", qualifying: "2026-10-31T16:00:00Z",
      race: "2026-11-01T16:00:00Z"
    }
  },
  {
    round: 22, date: "2026-11-15", day: "SUN", gp: "Las Vegas Grand Prix",
    circuit: "Las Vegas Strip Circuit", country: "US", city: "Las Vegas", raceUTC: "04:00",
    sessions: {
      fp1: "2026-11-13T01:30:00Z", fp2: "2026-11-13T05:30:00Z",
      fp3: "2026-11-14T01:30:00Z", qualifying: "2026-11-14T05:00:00Z",
      race: "2026-11-15T04:00:00Z"
    }
  },
  {
    round: 23, date: "2026-11-22", day: "SUN", gp: "Qatar Grand Prix",
    circuit: "Lusail International Circuit", country: "QA", city: "Lusail", sprint: true, raceUTC: "16:00",
    sessions: {
      fp1: "2026-11-20T12:30:00Z", sprintQualifying: "2026-11-20T16:30:00Z",
      sprint: "2026-11-21T12:00:00Z", qualifying: "2026-11-21T16:00:00Z",
      race: "2026-11-22T16:00:00Z"
    }
  },
  {
    round: 24, date: "2026-11-29", day: "SUN", gp: "Abu Dhabi Grand Prix",
    circuit: "Yas Marina Circuit", country: "AE", city: "Abu Dhabi", raceUTC: "13:00",
    sessions: {
      fp1: "2026-11-27T09:30:00Z", fp2: "2026-11-27T13:30:00Z",
      fp3: "2026-11-28T09:30:00Z", qualifying: "2026-11-28T13:00:00Z",
      race: "2026-11-29T13:00:00Z"
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
