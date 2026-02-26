export interface Scent {
  id: number;
  position: [number, number, number];
  tugsRequired: number;
}

export interface ResonanceTraits {
  strength: number;  // Kinetic Force / Physical Control (Anchor)
  bond: number;      // Psychological Connection / Non-verbal cues (Whisperer)
  focus: number;     // Detection Radius for triggers (Tactician)
  speed: number;     // Optimization of gait / stamina (Nomad)
  awareness: number; // Environmental mastery / shortcuts (Urbanist)
  mastery: number;   // Specialized heuristics / edge cases (Specialist)
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

export const ResonanceType = {
  ANCHOR: 'Anchor',       // Strength
  WHISPERER: 'Whisperer', // Bond
  TACTICIAN: 'Tactician', // Focus
  NOMAD: 'Nomad',         // Speed
  URBANIST: 'Urbanist',   // Awareness
  SPECIALIST: 'Specialist' // Mastery
} as const;
export type ResonanceType = typeof ResonanceType[keyof typeof ResonanceType];

export const RESONANCE_STATS: Record<ResonanceType, ResonanceTraits> = {
  [ResonanceType.ANCHOR]: { strength: 4, bond: 2, focus: 2, speed: 1, awareness: 1, mastery: 1 },
  [ResonanceType.WHISPERER]: { strength: 2, bond: 4, focus: 2, speed: 2, awareness: 1, mastery: 1 },
  [ResonanceType.TACTICIAN]: { strength: 1, bond: 2, focus: 4, speed: 2, awareness: 2, mastery: 2 },
  [ResonanceType.NOMAD]: { strength: 1, bond: 1, focus: 2, speed: 4, awareness: 3, mastery: 3 },
  [ResonanceType.URBANIST]: { strength: 2, bond: 1, focus: 3, speed: 1, awareness: 4, mastery: 3 },
  [ResonanceType.SPECIALIST]: { strength: 2, bond: 2, focus: 2, speed: 2, awareness: 2, mastery: 4 },
};
