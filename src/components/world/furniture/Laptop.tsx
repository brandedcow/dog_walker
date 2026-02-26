import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Billboard, Text } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';

export const Laptop = ({ position }: { position: [number, number, number] }) => {
  const { menuState, setMenuState } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const isOpen = menuState === 'KENNEL';

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
        setMenuState(isOpen ? 'IDLE' : 'KENNEL');
      }}
    >
      <Box args={[0.6, 0.04, 0.4]} position={[0, 0.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#333" emissive={isOpen ? "#44ff44" : hovered ? "#ffffff" : "#000000"} emissiveIntensity={isOpen ? 0.3 : hovered ? 0.2 : 0} />
      </Box>
      <group position={[0, 0.04, -0.19]} rotation={[-0.4, 0, 0]}>
        <Box args={[0.6, 0.4, 0.04]} position={[0, 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#333" />
        </Box>
        <Box args={[0.54, 0.34, 0.01]} position={[0, 0.2, 0.02]}>
          <meshStandardMaterial color={isOpen ? "#44ff44" : "#00ccff"} emissive={isOpen ? "#44ff44" : "#00ccff"} emissiveIntensity={0.5} />
        </Box>
      </group>

      {(hovered || focused) && !isOpen && (
        <Billboard position={[0, 0.6, 0]}>
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
            THE KENNEL
            <meshBasicMaterial depthTest={false} toneMapped={false} />
          </Text>
        </Billboard>
      )}
    </group>
  );
};
