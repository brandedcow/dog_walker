import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Text, Billboard } from '@react-three/drei';
import type { MenuState } from '../../store/useGameStore';

export const Interactable = ({ 
  position, args, color, label, targetState, currentMenuState, setMenuState, onClickOverride, showActiveGlow = true, children, labelOffset
}: { 
  position: [number, number, number], 
  args: [number, number, number], 
  color: string, 
  label: string, 
  targetState: MenuState, 
  currentMenuState: MenuState,
  setMenuState: (s: MenuState) => void,
  onClickOverride?: () => void,
  showActiveGlow?: boolean,
  children?: React.ReactNode,
  labelOffset?: [number, number, number]
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isActive = showActiveGlow && currentMenuState === targetState;
  const { camera } = useThree();
  const groupRef = useRef<any>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const worldPos = new Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const viewPos = worldPos.clone().project(camera);
    
    const isCenter = Math.abs(viewPos.x) < 0.2 && Math.abs(viewPos.y) < 0.2;
    const isInFront = viewPos.z < 1.0;
    
    setFocused(isCenter && isInFront);
  });

  const finalLabelOffset: [number, number, number] = labelOffset || [0, args[1]/2 + 0.4, 0.2];

  return (
    <group position={position} ref={groupRef}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onClickOverride) onClickOverride();
          else setMenuState(currentMenuState === targetState ? 'IDLE' : targetState);
        }}
      >
        {children ? (
          <group>
            {children}
            {isActive && (
              <Box args={[args[0] * 1.1, 0.05, args[2] * 1.1]} position={[0, -0.05, 0]}>
                <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.5} transparent opacity={0.4} />
              </Box>
            )}
          </group>
        ) : (
          <Box 
            args={args} 
            castShadow 
          >
            <meshStandardMaterial 
              color={color} 
              emissive={isActive ? "#44ff44" : hovered ? "#ffffff" : "#000000"} 
              emissiveIntensity={isActive ? 0.5 : hovered ? 0.3 : 0} 
            />
          </Box>
        )}
      </group>
      {(hovered || focused) && (
        <Billboard position={finalLabelOffset}>
          <Text fontSize={0.2} color="white" anchorX="center" anchorY="bottom" renderOrder={100}>
            {label}
            <meshStandardMaterial depthTest={false} />
          </Text>
        </Billboard>
      )}
    </group>
  );
};
