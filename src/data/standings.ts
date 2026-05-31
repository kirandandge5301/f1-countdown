export interface Driver {
  position: number;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
}

export interface Constructor {
  position: number;
  name: string;
  teamColor: string;
  points: number;
  wins: number;
}

export const DRIVERS_STANDINGS: Driver[] = [
  { position: 1, firstName: 'Max', lastName: 'Verstappen', team: 'Red Bull Racing', teamColor: '#1E41FF', points: 285, wins: 6 },
  { position: 2, firstName: 'Lando', lastName: 'Norris', team: 'McLaren', teamColor: '#FF8000', points: 248, wins: 3 },
  { position: 3, firstName: 'Charles', lastName: 'Leclerc', team: 'Ferrari', teamColor: '#DC0000', points: 215, wins: 2 },
  { position: 4, firstName: 'Oscar', lastName: 'Piastri', team: 'McLaren', teamColor: '#FF8000', points: 198, wins: 1 },
  { position: 5, firstName: 'Lewis', lastName: 'Hamilton', team: 'Ferrari', teamColor: '#DC0000', points: 172, wins: 1 },
  { position: 6, firstName: 'George', lastName: 'Russell', team: 'Mercedes', teamColor: '#27F4D2', points: 156, wins: 0 },
  { position: 7, firstName: 'Andrea Kimi', lastName: 'Antonelli', team: 'Mercedes', teamColor: '#27F4D2', points: 134, wins: 0 },
  { position: 8, firstName: 'Fernando', lastName: 'Alonso', team: 'Aston Martin', teamColor: '#006F62', points: 98, wins: 0 },
  { position: 9, firstName: 'Alexander', lastName: 'Albon', team: 'Williams', teamColor: '#64C4FF', points: 76, wins: 0 },
  { position: 10, firstName: 'Lance', lastName: 'Stroll', team: 'Aston Martin', teamColor: '#006F62', points: 62, wins: 0 }
];

export const CONSTRUCTORS_STANDINGS: Constructor[] = [
  { position: 1, name: 'McLaren', teamColor: '#FF8000', points: 446, wins: 4 },
  { position: 2, name: 'Red Bull Racing', teamColor: '#1E41FF', points: 385, wins: 6 },
  { position: 3, name: 'Ferrari', teamColor: '#DC0000', points: 387, wins: 3 },
  { position: 4, name: 'Mercedes', teamColor: '#27F4D2', points: 290, wins: 0 },
  { position: 5, name: 'Aston Martin', teamColor: '#006F62', points: 160, wins: 0 },
  { position: 6, name: 'Williams', teamColor: '#64C4FF', points: 104, wins: 0 },
  { position: 7, name: 'RB', teamColor: '#6692FF', points: 42, wins: 0 },
  { position: 8, name: 'Haas F1 Team', teamColor: '#B6BABD', points: 28, wins: 0 },
  { position: 9, name: 'Alpine', teamColor: '#FF87BC', points: 22, wins: 0 },
  { position: 10, name: 'Kick Sauber', teamColor: '#52E252', points: 0, wins: 0 }
];
