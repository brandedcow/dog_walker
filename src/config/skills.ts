import type { ResonanceTraits, ResonanceType } from '../types';

export interface Skill {
  id: string;
  name: string;
  desc: string;
  gritCost: number;
  spCost: number;
  resonance: ResonanceType | 'GENERAL';
  dependsOn?: string;
  augments?: Partial<ResonanceTraits>;
  isHatsu?: boolean;
}

export const SKILLS: Skill[] = [
  { id: 'FOUNDATION', name: 'FOUNDATION', desc: 'The basics of dog walking.', gritCost: 0, spCost: 0, resonance: 'GENERAL' },
  
  // THE ANCHOR (Strength / Enhancer)
  { id: 'STR_1', name: 'Power Grip', desc: '+1 Strength', gritCost: 50, spCost: 1, resonance: 'Anchor', dependsOn: 'FOUNDATION', augments: { strength: 1 } },
  { id: 'STR_2', name: 'Steady Hand', desc: '+2 Strength', gritCost: 200, spCost: 1, resonance: 'Anchor', dependsOn: 'STR_1', augments: { strength: 2 } },
  { id: 'STR_3', name: 'Event Horizon', desc: 'HATSU: The leash becomes an immovable physical constant.', gritCost: 1000, spCost: 3, resonance: 'Anchor', dependsOn: 'STR_2', isHatsu: true, augments: { strength: 2 } },

  // THE WHISPERER (Bond / Emitter)
  { id: 'BND_1', name: 'Calming Voice', desc: '+1 Bond', gritCost: 50, spCost: 1, resonance: 'Whisperer', dependsOn: 'FOUNDATION', augments: { bond: 1 } },
  { id: 'BND_2', name: 'Deep Connection', desc: '+2 Bond', gritCost: 200, spCost: 1, resonance: 'Whisperer', dependsOn: 'BND_1', augments: { bond: 2 } },
  { id: 'BND_3', name: 'Pack Pulse', desc: 'HATSU: A wave of calm that resets aggression.', gritCost: 1000, spCost: 3, resonance: 'Whisperer', dependsOn: 'BND_2', isHatsu: true, augments: { bond: 2 } },

  // THE TACTICIAN (Awareness / Manipulator)
  { id: 'AWR_T_1', name: 'Sharp Eye', desc: '+1 Awareness', gritCost: 50, spCost: 1, resonance: 'Tactician', dependsOn: 'FOUNDATION', augments: { awareness: 1 } },
  { id: 'AWR_T_2', name: 'Pre-emptive Timing', desc: '+2 Awareness', gritCost: 200, spCost: 1, resonance: 'Tactician', dependsOn: 'AWR_T_1', augments: { awareness: 2 } },
  { id: 'AWR_T_3', name: 'Perfect Pathing', desc: 'HATSU: Highlights the exact Golden Route to bypass triggers.', gritCost: 1000, spCost: 3, resonance: 'Tactician', dependsOn: 'AWR_T_2', isHatsu: true, augments: { awareness: 2 } },

  // THE NOMAD (Speed / Transmuter)
  { id: 'SPD_1', name: 'Fast Footwork', desc: '+1 Speed', gritCost: 50, spCost: 1, resonance: 'Nomad', dependsOn: 'FOUNDATION', augments: { speed: 1 } },
  { id: 'SPD_2', name: 'Endurance', desc: '+2 Speed', gritCost: 200, spCost: 1, resonance: 'Nomad', dependsOn: 'SPD_1', augments: { speed: 2 } },
  { id: 'SPD_3', name: 'Kinetic Recharge', desc: 'HATSU: Converts walking speed into stamina recovery.', gritCost: 1000, spCost: 3, resonance: 'Nomad', dependsOn: 'SPD_2', isHatsu: true, augments: { speed: 2 } },

  // THE URBANIST (Awareness / Conjurer)
  { id: 'AWR_U_1', name: 'City Sense', desc: '+1 Awareness', gritCost: 50, spCost: 1, resonance: 'Urbanist', dependsOn: 'FOUNDATION', augments: { awareness: 1 } },
  { id: 'AWR_U_2', name: 'Neighborhood Flow', desc: '+2 Awareness', gritCost: 200, spCost: 1, resonance: 'Urbanist', dependsOn: 'AWR_U_1', augments: { awareness: 2 } },
  { id: 'AWR_U_3', name: 'Urban Phasing', desc: 'HATSU: Ignore crowd collision and move through streets instantly.', gritCost: 1000, spCost: 3, resonance: 'Urbanist', dependsOn: 'AWR_U_2', isHatsu: true, augments: { awareness: 2 } },

  // THE SPECIALIST (Mastery / Specialist)
  { id: 'SPC_1', name: 'Exotic Handler', desc: '+1 Mastery', gritCost: 100, spCost: 1, resonance: 'Specialist', dependsOn: 'FOUNDATION', augments: { mastery: 1 } },
  { id: 'SPC_2', name: 'Chaos Management', desc: '+2 Mastery', gritCost: 400, spCost: 2, resonance: 'Specialist', dependsOn: 'SPC_1', augments: { mastery: 2 } },
  { id: 'SPC_3', name: 'Formless Style', desc: 'HATSU: Temporarily adopts the primary affinity of any other type.', gritCost: 1000, spCost: 3, resonance: 'Specialist', dependsOn: 'SPC_2', isHatsu: true, augments: { strength: 1, bond: 1, focus: 1, speed: 1, awareness: 1, mastery: 1 } },

  // HYBRID TECHNIQUES (Unlocked at level 5 of secondary focus)
  { id: 'HYB_AW', name: 'Weightless Lead', desc: 'HYBRID: Reduces stamina drain of Titans by 40%.', gritCost: 600, spCost: 2, resonance: 'Anchor' },
  { id: 'HYB_WT', name: 'Pre-emptive Calm', desc: 'HYBRID: Calming pulse triggered by hazard detection.', gritCost: 600, spCost: 2, resonance: 'Whisperer' },
  { id: 'HYB_TN', name: 'Slipstream', desc: 'HYBRID: Navigate gaps at high speed without Focus loss.', gritCost: 600, spCost: 2, resonance: 'Tactician' },
  { id: 'HYB_NU', name: 'Flow State', desc: 'HYBRID: Highlights high-speed Green Zones in crowds.', gritCost: 600, spCost: 2, resonance: 'Nomad' },
  { id: 'HYB_US', name: 'Habitat Mimicry', desc: 'HYBRID: Zero out Specialist dog stress via environment.', gritCost: 600, spCost: 2, resonance: 'Urbanist' },
  { id: 'HYB_SA', name: 'Bastion Grip', desc: 'HYBRID: Redirect aggressive breeds via raw power.', gritCost: 600, spCost: 2, resonance: 'Specialist' },
];
