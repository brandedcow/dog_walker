import { Box } from '@react-three/drei';

export const Laptop = () => (
  <group>
    <Box args={[0.6, 0.04, 0.4]} position={[0, 0.02, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#333" />
    </Box>
    <group position={[0, 0.04, -0.19]} rotation={[-0.4, 0, 0]}>
      <Box args={[0.6, 0.4, 0.04]} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#333" />
      </Box>
      <Box args={[0.54, 0.34, 0.01]} position={[0, 0.2, 0.02]}>
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} />
      </Box>
    </group>
  </group>
);
