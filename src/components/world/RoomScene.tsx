import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Sky, Box, Sphere } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { DogModel } from './DogModel';
import { LeashModel } from './LeashModel';
import { useLeash } from '../../systems/physics/useLeash';
import { useDogAI } from '../../systems/ai/useDogAI';
import { useMenuCamera } from '../../systems/physics/useMenuCamera';
import { PLAYER_BASE_SPEED } from '../../config/constants';

// Refactored Imports
import { Interactable } from './Interactable';
import { OutdoorScene } from './OutdoorScene';
import { useSunlight } from '../../hooks/useSunlight';
import { useFloorTexture } from '../../hooks/useFloorTexture';

// Furniture
import { Desk } from './furniture/Desk';
import { Chair } from './furniture/Chair';
import { StandingLamp } from './furniture/StandingLamp';
import { Closet } from './furniture/Closet';
import { Bed } from './furniture/Bed';
import { Laptop } from './furniture/Laptop';
import { Calendar } from './furniture/Calendar';
import { TrainingManual } from './furniture/TrainingManual';

export const RoomScene = () => {
  const { gameState, setGameState, dogState, setDogState, menuState, setMenuState, isMovingForward, unlockedSkills } = useGameStore();
  const [nightstandLampOn, setNightstandLampOn] = useState(true);
  const [standingLampOn, setStandingLampOn] = useState(true);
  
  const sunlight = useSunlight();
  const floorTexture = useFloorTexture();

  const playerPos = useRef(new Vector3(1.0, 1.7, 3.5)); 
  const povRotation = useRef({ yaw: 0, pitch: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  const { camera } = useThree();
  const leash = useLeash();
  const dogAI = useDogAI();

  useFrame((_, delta) => {
    if (menuState === 'IDLE' && isMovingForward) {
      const speed = PLAYER_BASE_SPEED * 0.6;
      playerPos.current.x += Math.sin(povRotation.current.yaw) * speed * delta;
      playerPos.current.z -= Math.cos(povRotation.current.yaw) * speed * delta;
      playerPos.current.x = Math.max(-4.5, Math.min(4.5, playerPos.current.x));
      playerPos.current.z = Math.max(-3.5, Math.min(4.5, playerPos.current.z));
    }
    leash.update(delta, playerPos.current, dogAI.dogPos.current, dogAI.currentRotation.current);
    dogAI.update(delta, playerPos.current, dogState, setDogState, unlockedSkills);
    if (menuState === 'IDLE') {
      const camDistance = 3;
      const camHeight = 1.8;
      const camX = Math.max(-4.8, Math.min(4.8, playerPos.current.x - Math.sin(povRotation.current.yaw) * camDistance));
      const camZ = Math.max(-3.8, Math.min(4.8, playerPos.current.z + Math.cos(povRotation.current.yaw) * camDistance));
      camera.position.set(camX, playerPos.current.y + camHeight, camZ);
      camera.lookAt(
        playerPos.current.x + Math.sin(povRotation.current.yaw) * 5,
        playerPos.current.y + Math.sin(povRotation.current.pitch) * 5,
        playerPos.current.z - Math.cos(povRotation.current.yaw) * 5
      );
    }
  });

  useMenuCamera();
  
  useEffect(() => {
    if (gameState === 'HOME') {
      povRotation.current = { yaw: 0, pitch: 0 };
      playerPos.current.set(1.0, 1.7, 3.5);
    }
  }, [gameState]);

  useEffect(() => {
    const handleDown = (e: any) => {
      isDragging.current = true;
      const x = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const y = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      lastMousePos.current = { x, y };
    };
    const handleMove = (e: any) => {
      if (!isDragging.current || menuState !== 'IDLE') return;
      const x = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const y = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      povRotation.current.yaw += (x - lastMousePos.current.x) * 0.005;
      povRotation.current.pitch -= (y - lastMousePos.current.y) * 0.005;
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
      <Sky sunPosition={sunlight.position} />
      <ambientLight intensity={sunlight.intensity * 0.3 + 0.4} /> 
      <directionalLight position={sunlight.position} intensity={sunlight.intensity} color={sunlight.color} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005}>
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15, 0.1, 500]} />
      </directionalLight>
      {nightstandLampOn && <pointLight position={[4.5, 1.25, 2.0]} intensity={1.2} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} color="#ffcc88" />}
      {standingLampOn && <pointLight position={[-4.5, 1.7, -3.5]} intensity={1.5} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} color="#ffcc88" />}

      {/* Floor */}
      <Box args={[12, 0.1, 12]} position={[0, -0.05, 0]} castShadow receiveShadow onClick={() => setMenuState('IDLE')}>
        <meshStandardMaterial 
          map={floorTexture} 
          roughness={1.0} 
          metalness={0} 
        />
      </Box>

      {/* Walls */}
      <group position={[0, 2.5, -4]}>
        <Box args={[10.5, 1.5, 0.1]} position={[0, -1.75, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
        <Box args={[10.5, 1.0, 0.1]} position={[0, 2.0, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
        <Box args={[1.5, 2.5, 0.1]} position={[-4.5, 0.25, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
        <Box args={[5.5, 2.5, 0.1]} position={[2.5, 0.25, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
      </group>
      <Box args={[10.5, 5, 0.1]} position={[0, 2.5, 5.01]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
      <Box args={[0.1, 5, 10.5]} position={[-5.01, 2.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#eee" /></Box>
      <Box args={[0.1, 5, 10.5]} position={[5.01, 2.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#ddd" /></Box>
      <Box args={[10.5, 0.1, 10.5]} position={[0, 5.01, 0]} castShadow receiveShadow><meshStandardMaterial color="#fff" /></Box>

      <OutdoorScene sunPosition={sunlight.position} />
      
      {/* Window */}
      <group position={[-2, 2.75, -3.96]}>
        <Box args={[4.0, 2.5, 0.05]}><meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.5} transparent opacity={0.6} /></Box>
        <Box args={[4.1, 0.1, 0.1]} position={[0, 1.25, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[4.1, 0.1, 0.1]} position={[0, -1.25, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.1, 2.6, 0.1]} position={[2, 0, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.1, 2.6, 0.1]} position={[-2, 0, 0]}><meshStandardMaterial color="#fff" /></Box>
        <Box args={[0.05, 2.5, 0.05]} position={[0, 0, 0]}><meshStandardMaterial color="#fff" /></Box> 
        <Box args={[4.0, 0.05, 0.05]} position={[0, 0, 0]}><meshStandardMaterial color="#fff" /></Box>
      </group>

      <Calendar position={[1.0, 2.5, -3.94]} />

      <Interactable position={[-4.5, 0, -3.5]} args={[0.6, 2.4, 0.6]} color="#333" label="LAMP" targetState="IDLE" currentMenuState={menuState} setMenuState={setMenuState} showActiveGlow={false} onClickOverride={() => { setStandingLampOn(!standingLampOn); setMenuState('IDLE'); }}>
        <StandingLamp position={[0, 0, 0]} isOn={standingLampOn} />
      </Interactable>

      <group position={[-3, 2.0, 4.9]}>
        <Interactable position={[0, 0, 0]} args={[2.0, 4.0, 0.2]} color="#8b4513" label="GO FOR A WALK" targetState="IDLE" currentMenuState={menuState} setMenuState={setMenuState} onClickOverride={() => setGameState('PLAYING')} showActiveGlow={false} labelOffset={[0, 2, -0.5]}>
          <group>
            <Box args={[2.0, 4.0, 0.2]} castShadow><meshStandardMaterial color="#8b4513" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, 1.1, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, -0.1, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[-0.4, -1.3, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, 1.1, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, -0.1, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <Box args={[0.6, 1.0, 0.05]} position={[0.4, -1.3, -0.11]} castShadow receiveShadow><meshStandardMaterial color="#6d330f" /></Box>
            <group position={[0.85, -0.7, -0.12]}>
              <Box args={[0.1, 0.1, 0.1]} position={[0, 0, -0.05]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
              <Sphere args={[0.1, 16, 16]} position={[0, 0, -0.1]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} /></Sphere>
            </group>
          </group>
        </Interactable>
      </group>

      <group position={[-2, 0, -3.0]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, 1.3]} />
        <Laptop position={[-0.6, 1.0, 0]} />
        <TrainingManual position={[0.6, 1.0, 0]} />
      </group>

      <Interactable position={[3.25, 0, -3.4]} args={[2.5, 3.8, 1.2]} color="#4e342e" label="GEAR CLOSET" targetState="GEAR" currentMenuState={menuState} setMenuState={setMenuState} labelOffset={[0, 4.0, 1.0]}><Closet position={[0, 0, 0]} /></Interactable>
      <Bed position={[2.75, 0, 3.9]} />
      <Interactable position={[4.5, 0, 2.0]} args={[1.0, 1.0, 1.0]} color="#5d4037" label="NIGHTSTAND" targetState="IDLE" currentMenuState={menuState} setMenuState={setMenuState} showActiveGlow={false} labelOffset={[-0.8, 1.8, 0]} onClickOverride={() => { setNightstandLampOn(!nightstandLampOn); setMenuState('IDLE'); }}>
        <group>
          <Box args={[1.0, 1.0, 1.0]} position={[0, 0.5, 0]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
          <Box args={[0.02, 0.3, 0.8]} position={[-0.5, 0.7, 0]} receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
          <Box args={[0.02, 0.3, 0.8]} position={[-0.5, 0.3, 0]} receiveShadow><meshStandardMaterial color="#3e2723" /></Box>
          <Box args={[0.05, 0.04, 0.3]} position={[-0.52, 0.7, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
          <Box args={[0.05, 0.04, 0.3]} position={[-0.52, 0.3, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></Box>
          <Box args={[0.3, 0.5, 0.3]} position={[0, 1.25, 0]}><meshStandardMaterial color="#ffc107" emissive="#ffc107" emissiveIntensity={nightstandLampOn ? 0.5 : 0} /></Box>
        </group>
      </Interactable>

      <Interactable position={[-0.9, 2.2, 4.75]} args={[1.5, 0.1, 0.2]} color="#ffcc00" label="TROPHY SHELF" targetState="RECORDS" currentMenuState={menuState} setMenuState={setMenuState} labelOffset={[0, 0.5, -0.5]}>
         <group>
            <Box args={[1.8, 0.05, 0.4]} position={[0, 0, 0.1]} castShadow receiveShadow><meshStandardMaterial color="#5d4037" /></Box>
            <Box args={[0.2, 0.4, 0.2]} position={[-0.5, 0.2, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" /></Box>
            <Box args={[0.2, 0.6, 0.2]} position={[0, 0.3, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" /></Box>
            <Box args={[0.2, 0.3, 0.2]} position={[0.5, 0.15, 0]} castShadow receiveShadow><meshStandardMaterial color="#ffd700" /></Box>
         </group>
      </Interactable>

      <DogModel dogPos={dogAI.dogPos} state={dogState} rotation={dogAI.currentRotation} visualOffset={leash.tugRecoil} gameState={gameState} />
      <group position={[-0.9, 2.1, 4.85]}>
        <Box args={[0.05, 0.1, 0.1]} position={[0, 0, 0]} castShadow receiveShadow><meshStandardMaterial color="#333" /></Box>
        <Box args={[0.02, 1.2, 0.02]} position={[0, -0.6, 0.05]} castShadow receiveShadow><meshStandardMaterial color="#880000" /></Box>
      </group>
      {gameState !== 'HOME' && <LeashModel nodes={leash.nodes.current} tension={0} />}
    </>
  );
};
