import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Html, Billboard, Text } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { SKILLS, Skill } from '../../../config/skills';

const SkillNode = ({ skill, unlocked, available, canAfford, onPurchase }: { 
  skill: Skill, unlocked: boolean, available: boolean, canAfford: boolean, onPurchase: () => void 
}) => (
  <div 
    onClick={(e) => { e.stopPropagation(); if (available && !unlocked && canAfford) onPurchase(); }}
    style={{
      width: '120px', height: '120px', background: unlocked ? '#44ff44' : available ? '#1a1a1a' : '#0a0a0a',
      border: `3px solid ${unlocked ? '#fff' : available ? (canAfford ? '#44ff44' : '#ff4444') : '#222'}`,
      borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '15px', cursor: available && !unlocked && canAfford ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: available ? 1 : 0.3, position: 'relative',
      color: unlocked ? 'black' : 'white', pointerEvents: 'auto',
      boxShadow: unlocked ? '0 0 20px rgba(68, 255, 68, 0.4)' : 'none',
      transform: available && !unlocked && canAfford ? 'scale(1)' : 'scale(0.95)'
    }}
  >
    <div style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>{skill.name}</div>
    <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '8px', lineHeight: '1.2' }}>{skill.desc}</div>
    {!unlocked && available && (
      <div style={{ fontSize: '11px', fontWeight: '900', marginTop: '10px', color: canAfford ? '#44ff44' : '#ff4444' }}>
        {skill.cost}G
      </div>
    )}
    {unlocked && <div style={{ position: 'absolute', top: '5px', right: '8px', fontSize: '10px' }}>✓</div>}
  </div>
);

export const TrainingManual = ({ position }: { position: [number, number, number] }) => {
  const { menuState, setMenuState, playerStats, unlockedSkills, purchaseSkill } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const isOpen = menuState === 'TRAINING';

  useFrame(() => {
    if (!groupRef.current || isOpen) return;
    
    const worldPos = new Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const viewPos = worldPos.clone().project(camera);
    
    const isCenter = Math.abs(viewPos.x) < 0.2 && Math.abs(viewPos.y) < 0.2;
    const isInFront = viewPos.z < 1.0;
    
    setFocused(isCenter && isInFront);
  });

  return (
    <group 
      position={position}
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => {
        e.stopPropagation();
        setMenuState(isOpen ? 'IDLE' : 'TRAINING');
      }}
    >
      {/* Physical Book Model */}
      <Box args={[0.5, 0.1, 0.7]} castShadow receiveShadow>
        <meshStandardMaterial color="#2e7d32" emissive={isOpen ? "#44ff44" : hovered ? "#ffffff" : "#000000"} emissiveIntensity={isOpen ? 0.5 : hovered ? 0.3 : 0} />
      </Box>
      <Box args={[0.4, 0.02, 0.6]} position={[0, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#fff" />
      </Box>

      {(hovered || focused) && !isOpen && (
        <Billboard position={[0, 0.5, 0]}>
          <Text 
            fontSize={0.2} 
            color="white" 
            anchorX="center" 
            anchorY="bottom" 
            renderOrder={100}
            outlineWidth={0.015}
            outlineColor="#222222"
            outlineOpacity={0.8}
          >
            TRAINING MANUAL
            <meshBasicMaterial depthTest={false} toneMapped={false} />
          </Text>
        </Billboard>
      )}

      {isOpen && (
        <Html
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          occlude
          distanceFactor={0.5}
        >
          <div style={{
            width: '800px',
            height: '600px',
            background: '#f4f1ea', // Aged paper color
            backgroundImage: 'repeating-linear-gradient(#f4f1ea, #f4f1ea 24px, #e1dcd3 25px)',
            border: '15px solid #1b4d1b',
            borderRadius: '10px',
            padding: '40px',
            color: '#2c3e50',
            fontFamily: '"Courier New", Courier, monospace',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            userSelect: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px double #2c3e50', paddingBottom: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>TRAINING MANUAL v1.0</h1>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>CURRENT GRIT</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{playerStats.grit} G</div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignContent: 'center', padding: '20px' }}>
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

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setMenuState('IDLE')}
                style={{
                  padding: '15px 40px',
                  background: '#2c3e50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #1a252f',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 2px 0 #1a252f'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #1a252f'; }}
              >
                CLOSE MANUAL
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
