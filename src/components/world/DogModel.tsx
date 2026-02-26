import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Text } from '@react-three/drei';
import { GameState, DogState } from '../../types';

export const DogModel = ({ 
  dogPos, state, rotation = 0, visualOffset = 0, gameState 
}: { 
  dogPos: Vector3 | React.MutableRefObject<Vector3>, 
  state: DogState, 
  rotation?: number | React.MutableRefObject<number>,
  visualOffset?: number | React.MutableRefObject<number>, 
  gameState: GameState 
}) => {
  const groupRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const earsRef = useRef<[any, any]>([null, null]);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const isPlaying = gameState === GameState.PLAYING;
      const time = clock.getElapsedTime();
      const isMoving = state === DogState.WALKING || state === DogState.COMING || state === DogState.IDLING;
      
      // Handle potential ref or direct value
      const actualPos = (dogPos as any).current || dogPos;
      const actualRotation = typeof rotation === 'number' ? rotation : (rotation as any).current;
      const actualVisualOffset = typeof visualOffset === 'number' ? visualOffset : (visualOffset as any).current;

      const bob = (isPlaying && isMoving) ? Math.abs(Math.sin(time * 15)) * 0.02 : 0;
      
      const yPos = state === DogState.SITTING ? -0.2 : 0;
      groupRef.current.position.set(actualPos.x, actualPos.y + bob + yPos, actualPos.z);
      // The physical yank effect (recoil) is applied separately to the visual mesh if desired, 
      // but here we use visualOffset for the head tilt/body displacement
      groupRef.current.position.z += actualVisualOffset;

      groupRef.current.rotation.y = actualRotation + Math.PI;
      groupRef.current.rotation.z = (isPlaying && isMoving) ? Math.sin(time * 15) * 0.02 : 0;
      
      if (headRef.current) {
        const sittingTilt = state === DogState.SITTING ? -0.4 : 0;
        headRef.current.rotation.x = (actualVisualOffset * -1.5) + sittingTilt;
      }
      if (earsRef.current[0] && earsRef.current[1]) {
        const earWiggle = (isPlaying && isMoving) ? Math.sin(time * 20) * 0.1 : 0;
        const earYank = actualVisualOffset * 2;
        earsRef.current[0].rotation.z = -0.2 + earWiggle + earYank;
        earsRef.current[1].rotation.z = 0.2 - earWiggle - earYank;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[0.45, 0.4, 1.6]} castShadow position={[0, 0.3, 0]}><meshStandardMaterial color="#8b4513" /></Box>
      {/* Collar - Front Facet */}
      <Box args={[0.4, 0.3, 0.05]} position={[0, 0.3, -0.81]}><meshStandardMaterial color="#ff0000" /></Box>
      <group position={[0, 0.5, -0.9]} ref={headRef}>
        <Box args={[0.35, 0.35, 0.4]}><meshStandardMaterial color="#8b4513" /></Box>
        <Box args={[0.2, 0.2, 0.2]} position={[0, -0.05, -0.25]}><meshStandardMaterial color="#8b4513" /></Box>
        <Box args={[0.08, 0.06, 0.06]} position={[0, 0, -0.36]}><meshStandardMaterial color="#000" /></Box>
        <Box args={[0.06, 0.06, 0.02]} position={[0.1, 0.1, -0.21]}><meshStandardMaterial color="#000" /></Box>
        <Box args={[0.06, 0.06, 0.02]} position={[-0.1, 0.1, -0.21]}><meshStandardMaterial color="#000" /></Box>
        <Box ref={(el) => { earsRef.current[0] = el; }} args={[0.12, 0.35, 0.2]} position={[0.22, -0.1, 0]} rotation={[0, 0, -0.2]}><meshStandardMaterial color="#5d4037" /></Box>
        <Box ref={(el) => { earsRef.current[1] = el; }} args={[0.12, 0.35, 0.2]} position={[-0.22, -0.1, 0]} rotation={[0, 0, 0.2]}><meshStandardMaterial color="#5d4037" /></Box>
      </group>
      <Box args={[0.08, 0.08, 0.5]} position={[0, 0.4, 0.8]} rotation={[0.6, 0, 0]}><meshStandardMaterial color="#8b4513" /></Box>
      <Text position={[0, 0.3, 0.81]} fontSize={0.12} color="#5d4037" anchorX="center" anchorY="middle">X</Text>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
    </group>
  );
};
