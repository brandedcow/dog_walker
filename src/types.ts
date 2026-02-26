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
