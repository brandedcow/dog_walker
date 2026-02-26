import { Box, Cylinder, Sphere } from "@react-three/drei";

export const DeskLamp = ({ position, rotation = [0, 0, 0], isOn }: { position: [number, number, number], rotation?: [number, number, number], isOn: boolean }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Circular Base (Black) */}
      <Cylinder args={[0.12, 0.12, 0.03, 32]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Cylinder>
      
      {/* Lower Arm (Black) */}
      <group position={[0, 0.015, 0]} rotation={[0, 0, 0.2]}>
        <Cylinder args={[0.01, 0.01, 0.35, 16]} position={[0, 0.175, 0]} castShadow>
          <meshStandardMaterial color="#1a1a1a" />
        </Cylinder>
        
        {/* Joint (Brass/Gold) */}
        <group position={[0, 0.35, 0]}>
          <Sphere args={[0.02, 16, 16]}>
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </Sphere>
          
          {/* Upper Arm (Black) */}
          <group rotation={[0, 0, -1.2]}>
            <Cylinder args={[0.01, 0.01, 0.3, 16]} position={[0, 0.15, 0]} castShadow>
              <meshStandardMaterial color="#1a1a1a" />
            </Cylinder>
            
            {/* Shade Connector (Brass/Gold) */}
            <group position={[0, 0.3, 0]} rotation={[0, 0, 1.4]}>
              <Cylinder args={[0.015, 0.015, 0.05, 16]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
              </Cylinder>
              
              {/* RANARP Conical Shade - OPEN ENDED */}
              <group position={[0, -0.05, 0]} rotation={[Math.PI / 1.6, 0, 0]}>
                {/* Shade Exterior (Black) - Large end at bottom */}
                <Cylinder args={[0.14, 0.04, 0.18, 32, 1, true]} castShadow>
                  <meshStandardMaterial color="#1a1a1a" roughness={0.8} side={2} />
                </Cylinder>
                {/* Shade Interior (White) */}
                <Cylinder args={[0.138, 0.038, 0.178, 32, 1, true]}>
                  <meshStandardMaterial color="#ffffff" side={1} />
                </Cylinder>
                {/* Top Cap (Brass/Gold) - Now at the smaller end */}
                <Cylinder args={[0.042, 0.042, 0.01, 32]} position={[0, -0.09, 0]}>
                  <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                </Cylinder>
                
                {/* Visible Lightbulb near the top cap */}
                <group position={[0, -0.06, 0]}>
                  <Sphere args={[0.03, 16, 16]}>
                    <meshStandardMaterial 
                      color="#fff4d6" 
                      emissive="#ffcc88" 
                      emissiveIntensity={isOn ? 2.5 : 0} 
                    />
                  </Sphere>
                  
                  {isOn && (
                    <pointLight 
                      intensity={3.0} 
                      distance={6} 
                      color="#ffcc88" 
                      castShadow 
                      shadow-bias={-0.001} 
                    />
                  )}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
