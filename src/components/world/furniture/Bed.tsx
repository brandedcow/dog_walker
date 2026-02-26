import { Box } from '@react-three/drei';

export const Bed = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[4.5, 0.4, 2.2]} position={[0, 0.2, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
    <Box args={[0.2, 1.2, 2.2]} position={[2.15, 0.6, 0]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
    <Box args={[4.2, 0.1, 2.0]} position={[0, 0.45, 0]} castShadow receiveShadow><meshStandardMaterial color="#3f51b5" /></Box>
    <Box args={[0.8, 0.2, 1.2]} position={[1.6, 0.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#fff" /></Box>
  </group>
);
