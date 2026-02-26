export interface Skill {
  id: string;
  name: string;
  desc: string;
  cost: number;
  dependsOn?: string;
  pos: [number, number]; 
}

export const SKILLS: Skill[] = [
  { id: 'FOUNDATION', name: 'FOUNDATION', desc: 'The basics of dog walking.', cost: 0, pos: [0, 0] },
  // Player Path
  { id: 'STRENGTH_1', name: 'STRENGTH I', desc: '+5% tension resistance', cost: 20, dependsOn: 'FOUNDATION', pos: [-1, 1] },
  { id: 'STRENGTH_2', name: 'STRENGTH II', desc: '+10% tension resistance', cost: 100, dependsOn: 'STRENGTH_1', pos: [-1, 2] },
  // Dog Path
  { id: 'RECALL_1', name: 'RECALL I', desc: '+1.5 recall speed', cost: 25, dependsOn: 'FOUNDATION', pos: [1, 1] },
  { id: 'RECALL_2', name: 'RECALL II', desc: '+3.0 recall speed', cost: 120, dependsOn: 'RECALL_1', pos: [1, 2] },
  // Economy Path
  { id: 'GRIT_FOCUS', name: 'GRIT FOCUS', desc: '+25% base grit earned', cost: 150, dependsOn: 'FOUNDATION', pos: [0, 2] },
];
