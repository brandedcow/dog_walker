import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { Box, Html, Billboard, Text } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { SKILLS, type Skill } from '../../../config/skills';
import { CAMERA_TARGETS } from '../../../config/constants';

const SkillNode = ({ skill, unlocked, available, canAfford, onPurchase }: { 
  skill: Skill, unlocked: boolean, available: boolean, canAfford: boolean, onPurchase: () => void 
}) => (
  <div 
    onClick={(e) => { e.stopPropagation(); if (available && !unlocked && canAfford) onPurchase(); }}
    style={{
      width: '120px', height: '120px', background: unlocked ? '#44ff44' : available ? '#4b5320' : '#0a0a0a',
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
  const [uiVisible, setUiVisible] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const coverRef = useRef<any>(null);
  const isOpen = menuState === 'TRAINING';

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Gaze-based focus detection
    if (!isOpen) {
      const worldPos = new Vector3();
      groupRef.current.getWorldPosition(worldPos);
      const viewPos = worldPos.clone().project(camera);
      const isCenter = Math.abs(viewPos.x) < 0.2 && Math.abs(viewPos.y) < 0.2;
      const isInFront = viewPos.z < 1.0;
      setFocused(isCenter && isInFront);
    }

    // Cover Flip Animation
    if (coverRef.current) {
      const targetRotation = isOpen ? -Math.PI * 0.9 : 0;
      coverRef.current.rotation.z = MathUtils.lerp(coverRef.current.rotation.z, targetRotation, delta * 10);
    }

    // Synchronize UI visibility with camera and cover animation
    const target = CAMERA_TARGETS.TRAINING;
    const targetPos = new Vector3(target.pos[0], target.pos[1], target.pos[2]);
    const isCameraClose = camera.position.distanceTo(targetPos) < 0.1;
    const isCoverOpen = coverRef.current && coverRef.current.rotation.z < -Math.PI * 0.8;

    if (isOpen && isCameraClose && isCoverOpen) {
      if (!uiVisible) setUiVisible(true);
    } else if (!isOpen) {
      if (uiVisible) setUiVisible(false);
    }
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
      {/* Physical Notebook Model */}
      <group>
        {/* Back Cover */}
        <Box args={[0.5, 0.05, 0.7]} castShadow receiveShadow>
          <meshStandardMaterial color="#4b5320" emissive={isOpen ? "#44ff44" : hovered ? "#ffffff" : "#000000"} emissiveIntensity={isOpen ? 0.2 : hovered ? 0.1 : 0} />
        </Box>
        
        {/* Pages */}
        <Box args={[0.48, 0.04, 0.68]} position={[0, 0.03, 0]} receiveShadow>
          <meshStandardMaterial color="#fdfcf0" />
          {/* Ruled lines on physical pages */}
          <meshStandardMaterial attach="material-0" color="#fdfcf0" /> {/* Side */}
          <meshStandardMaterial attach="material-1" color="#fdfcf0" /> {/* Side */}
          <meshStandardMaterial attach="material-2" color="#fdfcf0" /> {/* Top */}
          <meshStandardMaterial attach="material-3" color="#fdfcf0" /> {/* Bottom */}
          <meshStandardMaterial attach="material-4" color="#fdfcf0" /> {/* Front */}
          <meshStandardMaterial attach="material-5" color="#fdfcf0" /> {/* Back */}
        </Box>

        {/* Top Page Detail (Ruled Lines) */}
        <mesh position={[0, 0.0505, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.48, 0.68]} />
          <meshStandardMaterial transparent opacity={0.3} polygonOffset polygonOffsetFactor={-1}>
            <canvasTexture 
              attach="map"
              image={(function() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#fdfcf0';
                ctx.fillRect(0, 0, 512, 512);
                
                // Ruled lines
                ctx.strokeStyle = '#abced4';
                ctx.lineWidth = 1;
                for (let i = 0; i < 512; i += 24) {
                  ctx.beginPath();
                  ctx.moveTo(0, i);
                  ctx.lineTo(512, i);
                  ctx.stroke();
                }
                
                // Margin
                ctx.strokeStyle = '#ffbaba';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(80, 0);
                ctx.lineTo(80, 512);
                ctx.stroke();
                
                return canvas;
              })()}
            />
          </meshStandardMaterial>
        </mesh>

        {/* Front Cover with Pivot at Binding */}
        <group position={[-0.25, 0.05, 0]} ref={coverRef}>
          <group position={[0.25, 0.005, 0]}>
            <Box args={[0.5, 0.01, 0.7]} castShadow receiveShadow>
              <meshStandardMaterial color="#4b5320" emissive={hovered && !isOpen ? "#ffffff" : "#000000"} emissiveIntensity={0.1} />
            </Box>
            {/* Title on physical cover */}
            <Text
              position={[0, 0.006, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.035}
              color="#ffd700"
              fontStyle="italic"
              fontWeight="900"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.4}
              textAlign="center"
            >
              TRAINING{"\n"}NOTES
            </Text>
            {/* Decorative line */}
            <Box args={[0.3, 0.001, 0.005]} position={[0, 0.006, 0.08]}>
              <meshStandardMaterial color="#ffd700" transparent opacity={0.6} />
            </Box>
          </group>
        </group>

        {/* Spiral Binding */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[-0.26, 0.03, -0.3 + i * 0.055]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.03, 0.005, 8, 16]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

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

      {uiVisible && (
        <Html
          position={[0, 0.051, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          occlude
          scale={0.001}
        >
          <div style={{
            width: '480px',
            height: '680px',
            background: '#fff',
            backgroundImage: `
              linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
              linear-gradient(#eee .1em, transparent .1em)
            `,
            backgroundSize: '100% 1.2em',
            border: 'none',
            padding: '40px 20px 20px 100px',
            color: '#2c3e50',
            fontFamily: '"Courier New", Courier, monospace',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            pointerEvents: 'auto',
            userSelect: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>FIELD NOTES</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>GRIT CACHE:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>{playerStats.grit} G</div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start', alignContent: 'flex-start' }}>
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

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setMenuState('IDLE')}
                style={{
                  padding: '10px 30px',
                  background: '#2c3e50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #1a252f',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 2px 0 #1a252f'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #1a252f'; }}
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
