import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Billboard, Text } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { MenuState } from '../../../types';

export const Smartphone = ({ position }: { position: [number, number, number] }) => {
  const { menuState, setMenuState } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const isOpen = menuState === MenuState.KENNEL;

  useFrame(() => {
    if (!groupRef.current || isOpen) return;
    
    const worldPos = new Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const viewPos = worldPos.clone().project(camera);
    
    // Focused check for gaze-based interaction
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
        setMenuState(isOpen ? MenuState.IDLE : MenuState.KENNEL);
      }}
    >
      {/* Smartphone Body (Slightly tilted up for visibility) */}
      <group rotation={[0.1, 0, 0]}>
        {/* Case */}
        <Box args={[0.08, 0.01, 0.16]} position={[0, 0.005, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
        </Box>
        {/* Screen */}
        <Box args={[0.072, 0.002, 0.152]} position={[0, 0.011, 0]}>
          <meshStandardMaterial 
            color={isOpen ? "#44ff44" : "#111"} 
            emissive={isOpen ? "#44ff44" : "#00ccff"} 
            emissiveIntensity={isOpen ? 0.4 : 0.1} 
            roughness={0.1}
          />
        </Box>
        {/* Dynamic Screen Glow when active/hovered */}
        {(hovered || isOpen) && (
          <pointLight position={[0, 0.05, 0]} intensity={0.2} color="#00ccff" />
        )}
      </group>

      {(hovered || focused) && !isOpen && (
        <Billboard position={[0, 0.3, 0]}>
          <Text 
            fontSize={0.08} 
            color="white" 
            anchorX="center" 
            anchorY="bottom" 
            renderOrder={100}
            outlineWidth={0.008}
            outlineColor="#222222"
            outlineOpacity={0.8}
          >
            THE KENNEL
            <meshBasicMaterial depthTest={false} toneMapped={false} />
          </Text>
        </Billboard>
      )}
    </group>
  );
};
