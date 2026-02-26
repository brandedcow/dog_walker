export interface Scent {
  id: number;
  position: [number, number, number];
  tugsRequired: number;
}

export interface PlayerAttributes {
  strength: number;  // Affects tension threshold (0.8 -> 1.0)
  focus: number;     // Affects Grit multiplier & Pan stability
  agility: number;   // Affects base move speed (7.0 -> 9.0)
  bond: number;      // Affects Dog recall speed & idle calmness
}

export interface Progression {
  walkerRank: number;
  xp: number;
  skillPoints: number;
}

export const GameState = {
  START: 'START',
  HOME: 'HOME',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED'
} as const;
export type GameState = typeof GameState[keyof typeof GameState];

export const DogState = {
  WALKING: 'WALKING',
  SNIFFING: 'SNIFFING',
  STANDING: 'STANDING',
  SITTING: 'SITTING',
  IDLING: 'IDLING',
  COMING: 'COMING'
} as const;
export type DogState = typeof DogState[keyof typeof DogState];

export const MenuState = {
  IDLE: 'IDLE',
  KENNEL: 'KENNEL',
  TRAINING: 'TRAINING',
  GEAR: 'GEAR',
  RECORDS: 'RECORDS'
} as const;
export type MenuState = typeof MenuState[keyof typeof MenuState];

export const TrainingLevel = {
  GOOD_BOY: 'Good boy',
  PAWSITIVE: 'Paws-itive influence',
  COMPETENT: 'Fur-ly Competent',
  MESS: 'Pawful Mess',
  RUFF: 'Ruff Start'
} as const;
export type TrainingLevel = typeof TrainingLevel[keyof typeof TrainingLevel];

export const DogCharacteristic = {
  PULLER: 'Puller',
  REACTIVE: 'Reactive',
  VELCRO: 'Velcro',
  SNIFFER: 'Sniffer',
  ANXIOUS: 'Anxious Walker',
  ADHD: 'ADHD'
} as const;
export type DogCharacteristic = typeof DogCharacteristic[keyof typeof DogCharacteristic];

export const DogSize = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large'
} as const;
export type DogSize = typeof DogSize[keyof typeof DogSize];
