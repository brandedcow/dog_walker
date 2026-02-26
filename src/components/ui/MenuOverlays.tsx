import { useGameStore } from '../../store/useGameStore';

const OverlayContainer = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => (
  <div style={{ 
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '400px', background: 'rgba(0,0,0,0.9)', border: '2px solid white', borderRadius: '20px',
    padding: '30px', pointerEvents: 'auto', backdropFilter: 'blur(10px)',
    boxShadow: '0 0 50px rgba(0,0,0,0.8)', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px'
  }}>
    <h2 style={{ margin: 0, textAlign: 'center', color: '#44ff44', letterSpacing: '2px' }}>{title}</h2>
    <div style={{ flex: 1 }}>{children}</div>
    <button 
      onClick={onBack}
      style={{ 
        padding: '12px', background: 'white', color: 'black', border: 'none', 
        borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
      }}
    >
      BACK TO ROOM
    </button>
  </div>
);

export const KennelOverlay = () => {
  const { dogMetadata, dogStats, setMenuState } = useGameStore();
  return (
    <OverlayContainer title="THE KENNEL" onBack={() => setMenuState('IDLE')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{dogMetadata.name}</h3>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Training Level: {dogMetadata.trainingLevel}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Characteristic: {dogMetadata.characteristic}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Trust: {dogStats.trust} 🐾</p>
        </div>
        <p style={{ fontSize: '12px', textAlign: 'center', opacity: 0.5 }}>More dogs coming soon...</p>
      </div>
    </OverlayContainer>
  );
};

interface Skill {
  id: string;
  name: string;
  desc: string;
  cost: number;
  dependsOn?: string;
  pos: [number, number]; 
}

const SKILLS: Skill[] = [
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

const SkillNode = ({ skill, unlocked, available, canAfford, onPurchase }: { 
  skill: Skill, unlocked: boolean, available: boolean, canAfford: boolean, onPurchase: () => void 
}) => (
  <div 
    onClick={() => available && !unlocked && canAfford && onPurchase()}
    style={{
      width: '100px', height: '100px', background: unlocked ? '#44ff44' : available ? '#222' : '#111',
      border: `2px solid ${unlocked ? '#fff' : available ? (canAfford ? '#44ff44' : '#ff4444') : '#333'}`,
      borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '10px', cursor: available && !unlocked && canAfford ? 'pointer' : 'default',
      transition: 'all 0.2s', opacity: available ? 1 : 0.4, position: 'relative',
      color: unlocked ? 'black' : 'white', pointerEvents: 'auto'
    }}
  >
    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{skill.name}</div>
    <div style={{ fontSize: '8px', opacity: 0.7, marginTop: '4px' }}>{skill.desc}</div>
    {!unlocked && available && (
      <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '8px', color: canAfford ? '#44ff44' : '#ff4444' }}>
        {skill.cost}G
      </div>
    )}
  </div>
);

export const TrainingOverlay = () => {
  const { playerStats, unlockedSkills, purchaseSkill, setMenuState } = useGameStore();

  return (
    <OverlayContainer title="SKILL TREE" onBack={() => setMenuState('IDLE')}>
      <div style={{ position: 'relative', width: '100%', height: '350px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', overflow: 'hidden', padding: '20px' }}>
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', 
          alignItems: 'center', height: '100%', alignContent: 'center' 
        }}>
          {SKILLS.map(skill => {
            const unlocked = unlockedSkills.includes(skill.id);
            const available = !skill.dependsOn || unlockedSkills.includes(skill.dependsOn);
            const canAfford = playerStats.grit >= skill.cost;
            
            return (
              <SkillNode 
                key={skill.id} 
                skill={skill} 
                unlocked={unlocked} 
                available={available}
                canAfford={canAfford}
                onPurchase={() => purchaseSkill(skill.id, skill.cost)}
              />
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: 'center', background: 'rgba(68, 255, 68, 0.1)', padding: '10px', borderRadius: '10px' }}>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>CURRENT BALANCE</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#44ff44' }}>{playerStats.grit} GRIT</div>
      </div>
    </OverlayContainer>
  );
};

export const RecordsOverlay = () => {
  const { distance, setMenuState } = useGameStore();
  return (
    <OverlayContainer title="RECORDS" onBack={() => setMenuState('IDLE')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(distance)}m</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>TOTAL DISTANCE WALKED</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>0</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>CLEAN WALKS (LOW TENSION)</div>
        </div>
      </div>
    </OverlayContainer>
  );
};
