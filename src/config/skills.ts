import type { PlayerAttributes, AffinityType } from '../types';

export interface Skill {
  id: string;
  name: string;
  desc: string;
  gritCost: number;
  spCost: number;
  affinity: AffinityType | 'GENERAL';
  dependsOn?: string;
  augments?: Partial<PlayerAttributes>;
  isHatsu?: boolean;
}

export const SKILLS: Skill[] = [
  { id: 'FOUNDATION', name: 'FOUNDATION', desc: 'The basics of dog walking.', gritCost: 0, spCost: 0, affinity: 'GENERAL' },
  
  // THE ANCHOR (Strength / Enhancer)
  { id: 'STR_1', name: 'Power Grip', desc: '+1 Strength', gritCost: 50, spCost: 1, affinity: 'Anchor', dependsOn: 'FOUNDATION', augments: { strength: 1 } },
  { id: 'STR_2', name: 'Steady Hand', desc: '+2 Strength', gritCost: 200, spCost: 1, affinity: 'Anchor', dependsOn: 'STR_1', augments: { strength: 2 } },
  { id: 'STR_3', name: 'Event Horizon', desc: 'HATSU: The leash becomes an immovable physical constant.', gritCost: 1000, spCost: 3, affinity: 'Anchor', dependsOn: 'STR_2', isHatsu: true, augments: { strength: 2 } },

  // THE WHISPERER (Bond / Emitter)
  { id: 'BND_1', name: 'Calming Voice', desc: '+1 Bond', gritCost: 50, spCost: 1, affinity: 'Whisperer', dependsOn: 'FOUNDATION', augments: { bond: 1 } },
  { id: 'BND_2', name: 'Deep Connection', desc: '+2 Bond', gritCost: 200, spCost: 1, affinity: 'Whisperer', dependsOn: 'BND_1', augments: { bond: 2 } },
  { id: 'BND_3', name: 'Pack Pulse', desc: 'HATSU: A wave of calm that resets aggression.', gritCost: 1000, spCost: 3, affinity: 'Whisperer', dependsOn: 'BND_2', isHatsu: true, augments: { bond: 2 } },

  // THE TACTICIAN (Focus / Manipulator)
  { id: 'FOC_1', name: 'Sharp Eye', desc: '+1 Focus', gritCost: 50, spCost: 1, affinity: 'Tactician', dependsOn: 'FOUNDATION', augments: { focus: 1 } },
  { id: 'FOC_2', name: 'Deep Concentration', desc: '+2 Focus', gritCost: 200, spCost: 1, affinity: 'Tactician', dependsOn: 'FOC_1', augments: { focus: 2 } },
  { id: 'FOC_3', name: 'Perfect Pathing', desc: 'HATSU: Highlights the exact Golden Route to maximize rewards.', gritCost: 1000, spCost: 3, affinity: 'Tactician', dependsOn: 'FOC_2', isHatsu: true, augments: { focus: 2 } },

  // THE NOMAD (Agility / Transmuter)
  { id: 'AGI_1', name: 'Fast Footwork', desc: '+1 Agility', gritCost: 50, spCost: 1, affinity: 'Nomad', dependsOn: 'FOUNDATION', augments: { agility: 1 } },
  { id: 'AGI_2', name: 'Endurance', desc: '+2 Agility', gritCost: 200, spCost: 1, affinity: 'Nomad', dependsOn: 'AGI_1', augments: { agility: 2 } },
  { id: 'AGI_3', name: 'Kinetic Recharge', desc: 'HATSU: Converts walking speed into stamina.', gritCost: 1000, spCost: 3, affinity: 'Nomad', dependsOn: 'AGI_2', isHatsu: true, augments: { agility: 2 } },

  // THE URBANIST (Awareness / Conjurer)
  { id: 'AWR_1', name: 'City Sense', desc: '+1 Awareness', gritCost: 50, spCost: 1, affinity: 'Urbanist', dependsOn: 'FOUNDATION', augments: { awareness: 1 } },
  { id: 'AWR_2', name: 'Neighborhood Flow', desc: '+2 Awareness', gritCost: 200, spCost: 1, affinity: 'Urbanist', dependsOn: 'AWR_1', augments: { awareness: 2 } },
  { id: 'AWR_3', name: 'Urban Phasing', desc: 'HATSU: Ignore crowd collision and move through streets instantly.', gritCost: 1000, spCost: 3, affinity: 'Urbanist', dependsOn: 'AWR_2', isHatsu: true, augments: { awareness: 2 } },

  // THE SPECIALIST (Mastery / Specialist)
  { id: 'SPC_1', name: 'Exotic Handler', desc: '+1 Bond, +1 Strength', gritCost: 100, spCost: 1, affinity: 'Specialist', dependsOn: 'FOUNDATION', augments: { bond: 1, strength: 1 } },
  { id: 'SPC_2', name: 'Chaos Management', desc: '+2 Focus, +2 Awareness', gritCost: 400, spCost: 2, affinity: 'Specialist', dependsOn: 'SPC_1', augments: { focus: 2, awareness: 2 } },
  { id: 'SPC_3', name: 'Formless Style', desc: 'HATSU: Temporarily adopts the primary affinity of any other type.', gritCost: 1000, spCost: 3, affinity: 'Specialist', dependsOn: 'SPC_2', isHatsu: true, augments: { bond: 1, strength: 1, focus: 1, agility: 1, awareness: 1 } },
];
