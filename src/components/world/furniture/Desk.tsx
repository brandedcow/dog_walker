import { Box } from '@react-three/drei';

export const Desk = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[3.0, 0.1, 2.0]} position={[0, 0.95, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Box args={[0.1, 0.95, 0.1]} position={[-1.4, 0.475, -0.9]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[1.4, 0.475, -0.9]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[-1.4, 0.475, 0.9]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[1.4, 0.475, 0.9]} castShadow receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
  </group>
);
