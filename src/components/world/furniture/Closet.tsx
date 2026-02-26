import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Box } from '@react-three/drei';

export const Closet = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const worldPos = new Vector3();
      meshRef.current.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);
      meshRef.current.material.opacity = Math.max(0.2, Math.min(1.0, (dist - 1.5) / 2.0));
      meshRef.current.material.transparent = meshRef.current.material.opacity < 1.0;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[2.5, 3.8, 1.2]} position={[0, 1.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#4e342e" transparent opacity={1.0} />
      </Box>
      <Box args={[1.1, 3.6, 0.05]} position={[-0.6, 1.9, 0.61]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[1.1, 3.6, 0.05]} position={[0.6, 1.9, 0.61]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.04, 0.6, 0.05]} position={[-0.1, 1.9, 0.65]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
      <Box args={[0.04, 0.6, 0.05]} position={[0.1, 1.9, 0.65]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
    </group>
  );
};
