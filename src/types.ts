export interface Scent {
  id: number;
  position: [number, number, number];
  tugsRequired: number;
}

export interface PlayerAttributes {
  strength: number;  // Capacity to resist lunges (0.8 -> 1.0)
  focus: number;     // Detection Radius for triggers
  agility: number;   // Base movement velocity
  bond: number;      // Responsiveness to verbal cues
  awareness: number; // Environmental mastery / shortcuts
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

export const AffinityType = {
  ANCHOR: 'Anchor',       // Enhancer: Strength
  WHISPERER: 'Whisperer', // Emitter: Bond
  TACTICIAN: 'Tactician', // Manipulator: Focus
  NOMAD: 'Nomad',         // Transmuter: Agility
  URBANIST: 'Urbanist',   // Conjurer: Awareness
  SPECIALIST: 'Specialist' // Specialist: Niche Mastery
} as const;
export type AffinityType = typeof AffinityType[keyof typeof AffinityType];

export const AFFINITY_STATS: Record<AffinityType, PlayerAttributes> = {
  [AffinityType.ANCHOR]: { strength: 4, agility: 1, focus: 2, bond: 2, awareness: 1 },
  [AffinityType.WHISPERER]: { strength: 2, agility: 2, focus: 2, bond: 4, awareness: 1 },
  [AffinityType.TACTICIAN]: { strength: 1, agility: 2, focus: 4, bond: 2, awareness: 2 },
  [AffinityType.NOMAD]: { strength: 1, agility: 4, focus: 2, bond: 1, awareness: 3 },
  [AffinityType.URBANIST]: { strength: 2, agility: 1, focus: 3, bond: 1, awareness: 4 },
  [AffinityType.SPECIALIST]: { strength: 2, agility: 2, focus: 2, bond: 3, awareness: 2 },
};
