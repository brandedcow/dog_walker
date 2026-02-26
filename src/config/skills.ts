import type { PlayerAttributes } from '../types';

export interface Skill {
  id: string;
  name: string;
  desc: string;
  gritCost: number;
  spCost: number;
  dependsOn?: string;
  augments?: Partial<PlayerAttributes>;
}

export const SKILLS: Skill[] = [
  { id: 'FOUNDATION', name: 'FOUNDATION', desc: 'The basics of dog walking.', gritCost: 0, spCost: 0 },
  
  // THE HANDLER (Strength)
  { id: 'STR_1', name: 'Power Grip', desc: '+1 Strength', gritCost: 50, spCost: 1, dependsOn: 'FOUNDATION', augments: { strength: 1 } },
  { id: 'STR_2', name: 'Steady Hand', desc: '+2 Strength', gritCost: 200, spCost: 1, dependsOn: 'STR_1', augments: { strength: 2 } },
  { id: 'STR_3', name: 'Power Reel', desc: 'Tugs are twice as effective.', gritCost: 500, spCost: 2, dependsOn: 'STR_2', augments: { strength: 1 } },

  // THE ATHLETE (Agility)
  { id: 'AGI_1', name: 'Fast Footwork', desc: '+1 Agility', gritCost: 50, spCost: 1, dependsOn: 'FOUNDATION', augments: { agility: 1 } },
  { id: 'AGI_2', name: 'Endurance', desc: '+2 Agility', gritCost: 200, spCost: 1, dependsOn: 'AGI_1', augments: { agility: 2 } },
  { id: 'AGI_3', name: 'Steady Pace', desc: 'No pan penalty to speed.', gritCost: 500, spCost: 2, dependsOn: 'AGI_2', augments: { agility: 1 } },

  // THE ANALYST (Focus)
  { id: 'FOC_1', name: 'Sharp Eye', desc: '+1 Focus', gritCost: 50, spCost: 1, dependsOn: 'FOUNDATION', augments: { focus: 1 } },
  { id: 'FOC_2', name: 'Deep Concentration', desc: '+2 Focus', gritCost: 200, spCost: 1, dependsOn: 'FOC_1', augments: { focus: 2 } },
  { id: 'FOC_3', name: 'Scent Vision', desc: 'Distractions appear on Minimap.', gritCost: 500, spCost: 2, dependsOn: 'FOC_2', augments: { focus: 1 } },

  // THE WHISPERER (Bond)
  { id: 'BND_1', name: 'Calming Voice', desc: '+1 Bond', gritCost: 50, spCost: 1, dependsOn: 'FOUNDATION', augments: { bond: 1 } },
  { id: 'BND_2', name: 'Deep Connection', desc: '+2 Bond', gritCost: 200, spCost: 1, dependsOn: 'BND_1', augments: { bond: 2 } },
  { id: 'BND_3', name: 'Soul Bond', desc: 'Auto-SIT on high tension.', gritCost: 500, spCost: 2, dependsOn: 'BND_2', augments: { bond: 1 } },
];
