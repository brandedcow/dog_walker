import { Box, Sphere } from '@react-three/drei';

export const StandingLamp = ({ position, isOn }: { position: [number, number, number], isOn: boolean }) => (
  <group position={position}>
    <Box args={[0.5, 0.05, 0.5]} position={[0, 0.025, 0]} castShadow receiveShadow><meshStandardMaterial color="#333" /></Box>
    <Box args={[0.06, 2.4, 0.06]} position={[0, 1.2, 0]} castShadow receiveShadow><meshStandardMaterial color="#333" /></Box>
    
    <group position={[0, 2.2, 0]}>
      <Box args={[0.6, 0.5, 0.02]} position={[0, 0, 0.29]} castShadow={false} receiveShadow>
        <meshStandardMaterial color="#fffde7" emissive="#ffcc88" emissiveIntensity={isOn ? 0.3 : 0} transparent opacity={0.9} />
      </Box>
      <Box args={[0.6, 0.5, 0.02]} position={[0, 0, -0.29]} castShadow={false} receiveShadow>
        <meshStandardMaterial color="#fffde7" emissive="#ffcc88" emissiveIntensity={isOn ? 0.3 : 0} transparent opacity={0.9} />
      </Box>
      <Box args={[0.02, 0.5, 0.6]} position={[0.29, 0, 0]} castShadow={false} receiveShadow>
        <meshStandardMaterial color="#fffde7" emissive="#ffcc88" emissiveIntensity={isOn ? 0.3 : 0} transparent opacity={0.9} />
      </Box>
      <Box args={[0.02, 0.5, 0.6]} position={[-0.29, 0, 0]} castShadow={false} receiveShadow>
        <meshStandardMaterial color="#fffde7" emissive="#ffcc88" emissiveIntensity={isOn ? 0.3 : 0} transparent opacity={0.9} />
      </Box>
      <Sphere args={[0.1, 16, 16]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#fff" emissive="#ffcc88" emissiveIntensity={isOn ? 2.0 : 0} />
      </Sphere>
    </group>
  </group>
);
