import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box, Text } from '@react-three/drei';

export const DogModel = ({ dogPos, state, visualOffset = 0, gameState }: { dogPos: Vector3, state: 'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING', visualOffset?: number, gameState: string }) => {
  const groupRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const earsRef = useRef<[any, any]>([null, null]);
  const lastPos = useRef(new Vector3().copy(dogPos));
  const currentRotation = useRef(0);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const isPlaying = gameState === 'PLAYING';
      const time = clock.getElapsedTime();
      const isMoving = state === 'WALKING' || state === 'COMING';
      const bob = (isPlaying && isMoving) ? Math.abs(Math.sin(time * 15)) * 0.02 : 0;
      const movement = new Vector3().subVectors(dogPos, lastPos.current);
      if (isPlaying && movement.length() > 0.001) {
        const targetRot = Math.atan2(movement.x, movement.z);
        currentRotation.current += (targetRot - currentRotation.current) * 0.1;
      }
      const yPos = state === 'SITTING' ? -0.2 : 0;
      groupRef.current.position.set(dogPos.x, dogPos.y + bob + yPos, dogPos.z + visualOffset);
      groupRef.current.rotation.y = currentRotation.current + Math.PI;
      groupRef.current.rotation.z = (isPlaying && isMoving) ? Math.sin(time * 15) * 0.02 : 0;
      if (headRef.current) {
        const sittingTilt = state === 'SITTING' ? -0.4 : 0;
        headRef.current.rotation.x = (visualOffset * -1.5) + sittingTilt;
      }
      if (earsRef.current[0] && earsRef.current[1]) {
        const earWiggle = (isPlaying && isMoving) ? Math.sin(time * 20) * 0.1 : 0;
        const earYank = visualOffset * 2;
        earsRef.current[0].rotation.z = -0.2 + earWiggle + earYank;
        earsRef.current[1].rotation.z = 0.2 - earWiggle - earYank;
      }
      lastPos.current.copy(dogPos);
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[0.45, 0.4, 1.6]} castShadow position={[0, 0.3, 0]}><meshStandardMaterial color="#8b4513" /></Box>
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
