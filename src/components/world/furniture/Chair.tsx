import { Box } from '@react-three/drei';

export const Chair = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Box args={[0.6, 0.08, 0.6]} position={[0, 0.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[-0.25, 0.25, -0.25]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[0.25, 0.25, -0.25]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[-0.25, 0.25, 0.25]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[0.25, 0.25, 0.25]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.6, 0.6, 0.06]} position={[0, 0.8, 0.27]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
  </group>
);
