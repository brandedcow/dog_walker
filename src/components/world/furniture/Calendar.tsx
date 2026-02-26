import { Box, Text } from '@react-three/drei';

export const Calendar = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[0.8, 1.0, 0.02]} castShadow receiveShadow>
      <meshStandardMaterial color="#fff" />
    </Box>
    <Box args={[0.8, 0.15, 0.01]} position={[0, 0.42, 0.01]}>
      <meshStandardMaterial color="#ff4444" />
    </Box>
    <Text position={[0, 0.42, 0.02]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
      FEB
      <meshStandardMaterial depthTest={false} />
    </Text>
    {[...Array(5)].map((_, i) => (
      <Box key={`h-${i}`} args={[0.7, 0.005, 0.001]} position={[0, 0.3 - (i * 0.15), 0.011]}>
        <meshStandardMaterial color="#ddd" />
      </Box>
    ))}
    {[...Array(7)].map((_, i) => (
      <Box key={`v-${i}`} args={[0.005, 0.7, 0.001]} position={[-0.35 + (i * 0.116), 0, 0.011]}>
        <meshStandardMaterial color="#ddd" />
      </Box>
    ))}
  </group>
);
