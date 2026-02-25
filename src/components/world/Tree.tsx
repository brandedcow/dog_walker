import { Sphere, Box } from '@react-three/drei';

export const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[0.5, 3, 0.5]} position={[0, 1.5, 0]}>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Sphere args={[1.5, 8, 8]} position={[0, 4, 0]}>
      <meshStandardMaterial color="#2e7d32" />
    </Sphere>
  </group>
);
