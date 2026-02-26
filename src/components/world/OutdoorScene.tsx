import { Box } from '@react-three/drei';

export const OutdoorScene = ({ sunPosition }: { sunPosition: [number, number, number] }) => (
  <group position={[0, 0, -4.5]}>
    {/* Optional: Add light that follows sunPosition for more realism */}
    <pointLight position={sunPosition} intensity={0.1} color="#fff" />
    <Box args={[40, 0.1, 40]} position={[0, -0.5, -15]}>
      <meshStandardMaterial color="#2e7d32" />
    </Box>
    
    <Box args={[40, 1.2, 0.1]} position={[0, 0.1, -10]}>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Box args={[0.1, 1.2, 20]} position={[-10, 0.1, 0]}><meshStandardMaterial color="#5d4037" /></Box>
    <Box args={[0.1, 1.2, 20]} position={[10, 0.1, 0]}><meshStandardMaterial color="#5d4037" /></Box>
    
    {[...Array(10)].map((_, i) => (
      <Box key={`post-b-${i}`} args={[0.15, 1.4, 0.15]} position={[(i - 5) * 4, 0.2, -9.9]}><meshStandardMaterial color="#3e2723" /></Box>
    ))}
    {[...Array(5)].map((_, i) => (
      <group key={`post-s-${i}`}>
        <Box args={[0.15, 1.4, 0.15]} position={[-9.9, 0.2, -8 + i * 4]}><meshStandardMaterial color="#3e2723" /></Box>
        <Box args={[0.15, 1.4, 0.15]} position={[9.9, 0.2, -8 + i * 4]}><meshStandardMaterial color="#3e2723" /></Box>
      </group>
    ))}

    <group position={[-3, 0, -4]}>
      <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}><meshStandardMaterial color="#3e2723" /></Box>
      <Box args={[1.5, 2, 1.5]} position={[0, 2.5, 0]}><meshStandardMaterial color="#1b5e20" /></Box>
    </group>
    <group position={[4, 0, -7]}>
      <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}><meshStandardMaterial color="#3e2723" /></Box>
      <Box args={[2, 2.5, 2]} position={[0, 2.5, 0]}><meshStandardMaterial color="#1b5e20" /></Box>
    </group>

    <Box args={[100, 50, 0.1]} position={[0, 20, -20]}>
      <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
    </Box>
  </group>
);
