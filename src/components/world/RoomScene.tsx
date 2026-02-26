import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Sky, Box, Text, Sphere, Billboard } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import type { MenuState } from '../../store/useGameStore';
import { DogModel } from './DogModel';
import { LeashModel } from './LeashModel';
import { useLeash } from '../../systems/physics/useLeash';
import { useDogAI } from '../../systems/ai/useDogAI';
import { useMenuCamera } from '../../systems/physics/useMenuCamera';
import { PLAYER_BASE_SPEED } from '../../config/constants';

const Interactable = ({ 
  position, args, color, label, targetState, currentMenuState, setMenuState, onClickOverride, showActiveGlow = true, children, labelOffset
}: { 
  position: [number, number, number], 
  args: [number, number, number], 
  color: string, 
  label: string, 
  targetState: MenuState, 
  currentMenuState: MenuState,
  setMenuState: (s: MenuState) => void,
  onClickOverride?: () => void,
  showActiveGlow?: boolean,
  children?: React.ReactNode,
  labelOffset?: [number, number, number]
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isActive = showActiveGlow && currentMenuState === targetState;
  const { camera } = useThree();
  const groupRef = useRef<any>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Calculate world position
    const worldPos = new Vector3();
    groupRef.current.getWorldPosition(worldPos);
    
    // Project world position to camera space
    const viewPos = worldPos.clone().project(camera);
    
    // Distance from camera to object
    const dist = camera.position.distanceTo(worldPos);
    
    // Focus check: within center of screen (normalized -1 to 1)
    const isCenter = Math.abs(viewPos.x) < 0.2 && Math.abs(viewPos.y) < 0.2;
    
    // Also check if object is actually in front of camera
    const isInFront = viewPos.z < 1.0;
    
    setFocused(isCenter && isInFront);
  });

  const finalLabelOffset: [number, number, number] = labelOffset || [0, args[1]/2 + 0.4, 0.2];

  return (
    <group position={position} ref={groupRef}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onClickOverride) onClickOverride();
          else setMenuState(currentMenuState === targetState ? 'IDLE' : targetState);
        }}
      >
        {children ? (
          <group>
            {children}
            {isActive && (
              <Box args={[args[0] * 1.1, 0.05, args[2] * 1.1]} position={[0, -0.05, 0]}>
                <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.5} transparent opacity={0.4} />
              </Box>
            )}
          </group>
        ) : (
          <Box 
            args={args} 
            castShadow 
          >
            <meshStandardMaterial 
              color={color} 
              emissive={isActive ? "#44ff44" : hovered ? "#ffffff" : "#000000"} 
              emissiveIntensity={isActive ? 0.5 : hovered ? 0.3 : 0} 
            />
          </Box>
        )}
      </group>
      {(hovered || focused) && (
        <Billboard position={finalLabelOffset}>
          <Text fontSize={0.2} color="white" anchorX="center" anchorY="bottom" depthTest={false} renderOrder={100}>
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

const Calendar = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Main slab */}
    <Box args={[0.8, 1.0, 0.02]} castShadow receiveShadow>
      <meshStandardMaterial color="#fff" />
    </Box>
    {/* Header */}
    <Box args={[0.8, 0.15, 0.01]} position={[0, 0.42, 0.01]}>
      <meshStandardMaterial color="#ff4444" />
    </Box>
    <Text position={[0, 0.42, 0.02]} fontSize={0.08} color="white" anchorX="center" anchorY="middle" depthTest={false} renderOrder={101}>FEB</Text>
    {/* Simple grid lines for dates */}
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

const OutdoorScene = () => (
  <group position={[0, 0, -4.5]}>
    {/* Grass */}
    <Box args={[40, 0.1, 40]} position={[0, -0.5, -15]}>
      <meshStandardMaterial color="#2e7d32" />
    </Box>
    
    {/* Wooden Fence (Back) */}
    <Box args={[40, 1.2, 0.1]} position={[0, 0.1, -10]}>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    {/* Wooden Fence (Sides) */}
    <Box args={[0.1, 1.2, 20]} position={[-10, 0.1, 0]}><meshStandardMaterial color="#5d4037" /></Box>
    <Box args={[0.1, 1.2, 20]} position={[10, 0.1, 0]}><meshStandardMaterial color="#5d4037" /></Box>
    
    {/* Fence Posts (Back) */}
    {[...Array(10)].map((_, i) => (
      <Box key={`post-b-${i}`} args={[0.15, 1.4, 0.15]} position={[(i - 5) * 4, 0.2, -9.9]}><meshStandardMaterial color="#3e2723" /></Box>
    ))}
    {/* Fence Posts (Sides) */}
    {[...Array(5)].map((_, i) => (
      <group key={`post-s-${i}`}>
        <Box args={[0.15, 1.4, 0.15]} position={[-9.9, 0.2, -8 + i * 4]}><meshStandardMaterial color="#3e2723" /></Box>
        <Box args={[0.15, 1.4, 0.15]} position={[9.9, 0.2, -8 + i * 4]}><meshStandardMaterial color="#3e2723" /></Box>
      </group>
    ))}

    {/* Garden Trees (Closer) */}
    <group position={[-3, 0, -4]}>
      <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}><meshStandardMaterial color="#3e2723" /></Box>
      <Box args={[1.5, 2, 1.5]} position={[0, 2.5, 0]}><meshStandardMaterial color="#1b5e20" /></Box>
    </group>
    <group position={[4, 0, -7]}>
      <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]}><meshStandardMaterial color="#3e2723" /></Box>
      <Box args={[2, 2.5, 2]} position={[0, 2.5, 0]}><meshStandardMaterial color="#1b5e20" /></Box>
    </group>

    {/* Simple Sky Backdrop */}
    <Box args={[100, 50, 0.1]} position={[0, 20, -20]}>
      <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
    </Box>
  </group>
);

const Desk = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[3.0, 0.1, 2.0]} position={[0, 0.95, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Box args={[0.1, 0.95, 0.1]} position={[-1.4, 0.475, -0.9]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[1.4, 0.475, -0.9]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[-1.4, 0.475, 0.9]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.1, 0.95, 0.1]} position={[1.4, 0.475, 0.9]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
  </group>
);

const Chair = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Seat */}
    <Box args={[0.6, 0.08, 0.6]} position={[0, 0.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
    {/* Legs */}
    <Box args={[0.06, 0.5, 0.06]} position={[-0.25, 0.25, -0.25]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[0.25, 0.25, -0.25]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[-0.25, 0.25, 0.25]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    <Box args={[0.06, 0.5, 0.06]} position={[0.25, 0.25, 0.25]} castShadow><meshStandardMaterial color="#3e2723" /></Box>
    {/* Backrest */}
    <Box args={[0.6, 0.6, 0.06]} position={[0, 0.8, 0.27]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
  </group>
);

const Closet = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const worldPos = new Vector3();
      meshRef.current.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);
      // Fade out when camera is very close (e.g., when walking through it or looking from behind)
      meshRef.current.material.opacity = Math.max(0.2, Math.min(1.0, (dist - 1.5) / 2.0));
      meshRef.current.material.transparent = meshRef.current.material.opacity < 1.0;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[2.5, 3.8, 1.2]} position={[0, 1.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#4e342e" transparent opacity={1.0} />
      </Box>
      {/* Doors */}
      <Box args={[1.1, 3.6, 0.05]} position={[-0.6, 1.9, 0.61]}><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[1.1, 3.6, 0.05]} position={[0.6, 1.9, 0.61]}><meshStandardMaterial color="#5d4037" /></Box>
      {/* Handles */}
      <Box args={[0.04, 0.6, 0.05]} position={[-0.1, 1.9, 0.65]}><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
      <Box args={[0.04, 0.6, 0.05]} position={[0.1, 1.9, 0.65]}><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
    </group>
  );
};

const Bed = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[4.5, 0.4, 2.2]} position={[0, 0.2, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
    <Box args={[0.2, 1.2, 2.2]} position={[2.15, 0.6, 0]}><meshStandardMaterial color="#5d4037" /></Box> {/* Headboard */}
    <Box args={[4.2, 0.1, 2.0]} position={[0, 0.45, 0]}><meshStandardMaterial color="#3f51b5" /></Box> {/* Blanket */}
    <Box args={[0.8, 0.2, 1.2]} position={[1.6, 0.5, 0]}><meshStandardMaterial color="#fff" /></Box> {/* One Pillow */}
  </group>
);

const Laptop = () => (
  <group>
    <Box args={[0.6, 0.04, 0.4]} position={[0, 0.02, 0]} castShadow>
      <meshStandardMaterial color="#333" />
    </Box>
    <group position={[0, 0.04, -0.19]} rotation={[-0.4, 0, 0]}>
      <Box args={[0.6, 0.4, 0.04]} position={[0, 0.2, 0]} castShadow>
        <meshStandardMaterial color="#333" />
      </Box>
      <Box args={[0.54, 0.34, 0.01]} position={[0, 0.2, 0.02]}>
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} />
      </Box>
    </group>
  </group>
);

export const RoomScene = () => {
  const { gameState, setGameState, dogState, setDogState, menuState, setMenuState, isMovingForward } = useGameStore();
  const playerPos = useRef(new Vector3(0, 1.7, 0)); 
  const povRotation = useRef({ yaw: Math.PI, pitch: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  const { camera } = useThree();
  const leash = useLeash();
  const dogAI = useDogAI();
  
  useFrame((_, delta) => {
    if (menuState === 'IDLE' && isMovingForward) {
      const speed = PLAYER_BASE_SPEED * 0.6;
      const moveX = Math.sin(povRotation.current.yaw) * speed * delta;
      const moveZ = -Math.cos(povRotation.current.yaw) * speed * delta;
      playerPos.current.x += moveX;
      playerPos.current.z += moveZ;
      playerPos.current.x = Math.max(-4.5, Math.min(4.5, playerPos.current.x));
      playerPos.current.z = Math.max(-4.5, Math.min(4.5, playerPos.current.z));
    }

    leash.update(delta, playerPos.current, dogAI.dogPos.current, dogAI.currentRotation.current);
    dogAI.update(delta, playerPos.current, dogState, setDogState);

    if (menuState === 'IDLE') {
      const camDistance = 3;
      const camHeight = 1.8;
      const camX = Math.max(-4.8, Math.min(4.8, playerPos.current.x - Math.sin(povRotation.current.yaw) * camDistance));
      const camZ = Math.max(-3.8, Math.min(4.8, playerPos.current.z + Math.cos(povRotation.current.yaw) * camDistance));
      camera.position.set(camX, playerPos.current.y + camHeight, camZ);
      const lookAheadDist = 5;
      camera.lookAt(
        playerPos.current.x + Math.sin(povRotation.current.yaw) * lookAheadDist,
        playerPos.current.y + Math.sin(povRotation.current.pitch) * lookAheadDist,
        playerPos.current.z - Math.cos(povRotation.current.yaw) * lookAheadDist
      );
    }
  });

  useMenuCamera();
  
  // Reset orientation when entering HOME
  useEffect(() => {
    if (gameState === 'HOME') {
      povRotation.current = { yaw: 0, pitch: 0 };
      playerPos.current.set(1.0, 1.7, 3.5);
    }
  }, [gameState]);

  useEffect(() => {
    const handleDown = (e: any) => {
      isDragging.current = true;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      lastMousePos.current = { x, y };
    };
    const handleMove = (e: any) => {
      if (!isDragging.current || menuState !== 'IDLE') return;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = x - lastMousePos.current.x;
      const deltaY = y - lastMousePos.current.y;
      povRotation.current.yaw += deltaX * 0.005;
      povRotation.current.pitch -= deltaY * 0.005;
      povRotation.current.pitch = Math.max(-Math.PI/4, Math.min(Math.PI/4, povRotation.current.pitch));
      lastMousePos.current = { x, y };
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [menuState]);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

      {/* Floor */}
      <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]} receiveShadow onClick={() => setMenuState('IDLE')}>
        <meshStandardMaterial color="#443322" />
      </Box>

      {/* Walls */}
      {/* North Wall with Window Hole (centered at x:-2, y:2.75, width:4, height:2.5) */}
      <group position={[0, 2.5, -4]}>
        {/* Bottom part */}
        <Box args={[10, 1.5, 0.1]} position={[0, -1.75, 0]} receiveShadow><meshStandardMaterial color="#eee" /></Box>
        {/* Top part */}
        <Box args={[10, 1.0, 0.1]} position={[0, 2.0, 0]} receiveShadow><meshStandardMaterial color="#eee" /></Box>
        {/* Left of window */}
        <Box args={[1.0, 2.5, 0.1]} position={[-4.5, 0.25, 0]} receiveShadow><meshStandardMaterial color="#eee" /></Box>
        {/* Right of window */}
        <Box args={[5.0, 2.5, 0.1]} position={[2.5, 0.25, 0]} receiveShadow><meshStandardMaterial color="#eee" /></Box>
      </group>

      <Box args={[10, 5, 0.1]} position={[0, 2.5, 5]} receiveShadow><meshStandardMaterial color="#eee" /></Box>  {/* South */}
      <Box args={[0.1, 5, 10]} position={[-5, 2.5, 0]} receiveShadow><meshStandardMaterial color="#eee" /></Box> {/* West */}
      <Box args={[0.1, 5, 10]} position={[5, 2.5, 0]} receiveShadow><meshStandardMaterial color="#ddd" /></Box>  {/* East */}
      <Box args={[10, 0.1, 10]} position={[0, 5, 0]} receiveShadow><meshStandardMaterial color="#fff" /></Box>

      <OutdoorScene />

      {/* North Window (Over Desk) */}
      <group position={[-2, 2.75, -3.96]}>
        <Box args={[4.0, 2.5, 0.05]}><meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.5} transparent opacity={0.6} /></Box>
        <Box args={[4.1, 0.1, 0.1]} position={[0, 1.25, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[4.1, 0.1, 0.1]} position={[0, -1.25, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.1, 2.6, 0.1]} position={[2, 0, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.1, 2.6, 0.1]} position={[-2, 0, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.05, 2.5, 0.05]} position={[0, 0, 0]}><meshStandardMaterial color="#fff" /></Box> {/* Vertical Mullion */}
        <Box args={[4.0, 0.05, 0.05]} position={[0, 0, 0]}><meshStandardMaterial color="#fff" /></Box> {/* Horizontal Mullion */}
      </group>

      <Calendar position={[1.0, 2.5, -3.94]} />

      {/* South Door (Offset West) */}
      <group position={[-3, 2.0, 4.9]}>
        <Interactable position={[0, 0, 0]} args={[2.0, 4.0, 0.2]} color="#8b4513" label="GO FOR A WALK" targetState="IDLE" currentMenuState={menuState} setMenuState={setMenuState} onClickOverride={() => setGameState('PLAYING')} showActiveGlow={false} labelOffset={[0, 2, -0.5]}>
          <group>
            {/* Main slab */}
            <Box args={[2.0, 4.0, 0.2]} castShadow>
              <meshStandardMaterial color="#8b4513" />
            </Box>
            
            {/* Decorative Panels (Left Column) */}
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, 1.1, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, -0.1, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, -1.3, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            
            {/* Decorative Panels (Right Column) */}
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, 1.1, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, -0.1, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, -1.3, -0.11]}><meshStandardMaterial color="#6d330f" /></Box>
            
            {/* Improved Doorknob */}
            <group position={[0.85, -0.7, -0.12]}>
              <Box args={[0.1, 0.1, 0.1]} position={[0, 0, -0.05]}><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
              <Sphere args={[0.1, 16, 16]} position={[0, 0, -0.1]}><meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} /></Sphere>
            </group>
          </group>
        </Interactable>
      </group>

      {/* Furniture Arrangement */}
      
      {/* Top-Left: Desk beneath Window */}
      <group position={[-2, 0, -3.0]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, 1.3]} />
        <Interactable position={[-0.6, 1.0, 0]} args={[0.6, 0.5, 0.4]} color="#333" label="THE KENNEL" targetState="KENNEL" currentMenuState={menuState} setMenuState={setMenuState}>
          <Laptop />
        </Interactable>
        <Interactable position={[0.6, 1.0, 0]} args={[0.5, 0.2, 0.7]} color="#2e7d32" label="TRAINING MANUAL" targetState="TRAINING" currentMenuState={menuState} setMenuState={setMenuState}>
          <group>
            <Box args={[0.5, 0.1, 0.7]} castShadow><meshStandardMaterial color="#2e7d32" /></Box>
            <Box args={[0.4, 0.02, 0.6]} position={[0, 0.06, 0]}><meshStandardMaterial color="#fff" /></Box>
          </group>
        </Interactable>
      </group>

      {/* Top-Right: Standing Closet */}
      <Interactable position={[3.25, 0, -3.4]} args={[2.5, 3.8, 1.2]} color="#4e342e" label="GEAR CLOSET" targetState="GEAR" currentMenuState={menuState} setMenuState={setMenuState} labelOffset={[0, 4.0, 1.0]}>
        <Closet position={[0, 0, 0]} />
      </Interactable>

      {/* Bottom-Right: Bed */}
      <Bed position={[2.75, 0, 3.9]} />

      {/* Middle-Right: Nightstand */}
      <Interactable position={[4.5, 0, 2.0]} args={[1.0, 1.0, 1.0]} color="#5d4037" label="NIGHTSTAND" targetState="IDLE" currentMenuState={menuState} setMenuState={setMenuState} showActiveGlow={false} labelOffset={[-0.8, 1.8, 0]}>
        <group>
          <Box args={[1.0, 1.0, 1.0]} position={[0, 0.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
          {/* Drawer Insets (on the West face) */}
          <Box args={[0.02, 0.3, 0.8]} position={[-0.5, 0.7, 0]}><meshStandardMaterial color="#3e2723" /></Box>
          <Box args={[0.02, 0.3, 0.8]} position={[-0.5, 0.3, 0]}><meshStandardMaterial color="#3e2723" /></Box>
          {/* Golden Horizontal Handles */}
          <Box args={[0.05, 0.04, 0.3]} position={[-0.52, 0.7, 0]}><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
          <Box args={[0.05, 0.04, 0.3]} position={[-0.52, 0.3, 0]}><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
          <Box args={[0.3, 0.5, 0.3]} position={[0, 1.25, 0]}><meshStandardMaterial color="#ffc107" emissive="#ffc107" emissiveIntensity={0.5} /></Box> {/* Lamp */}
        </group>
      </Interactable>

      {/* Bottom-Left: Trophy Shelf (West Wall) */}
      <Interactable position={[-4.75, 1.5, 2.5]} args={[0.2, 0.1, 2.0]} color="#ffcc00" label="TROPHY SHELF" targetState="RECORDS" currentMenuState={menuState} setMenuState={setMenuState} labelOffset={[0.5, 0.5, 0]}>
         <group>
            <Box args={[0.4, 0.05, 2.0]} position={[0.1, 0, 0]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
            <Box args={[0.2, 0.4, 0.2]} position={[0, 0.2, -0.6]}><meshStandardMaterial color="#ffd700" /></Box>
            <Box args={[0.2, 0.6, 0.2]} position={[0, 0.3, 0]}><meshStandardMaterial color="#ffd700" /></Box>
            <Box args={[0.2, 0.3, 0.2]} position={[0, 0.15, 0.6]}><meshStandardMaterial color="#ffd700" /></Box>
         </group>
      </Interactable>

      <DogModel 
        dogPos={dogAI.dogPos} 
        state={dogState} 
        rotation={dogAI.currentRotation}
        visualOffset={leash.tugRecoil}
        gameState={gameState} 
      />
      <LeashModel nodes={leash.nodes.current} tension={0} />
    </>
  );
};
