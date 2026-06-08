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
];

export const CONSTRUCTORS_STANDINGS: Constructor[] = [
];
