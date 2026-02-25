import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Sky, Plane, Box } from '@react-three/drei';
import { PLAYER_BASE_SPEED } from './config/constants';
import { useGameStore } from './store/useGameStore';
import { useLeash } from './systems/physics/useLeash';
import { useDogAI } from './systems/ai/useDogAI';
import { InstancedTrees } from './components/world/InstancedTrees';
import { DogModel } from './components/world/DogModel';
import { LeashModel } from './components/world/LeashModel';
import { HUD } from './components/ui/HUD';

const SceneContent = () => {
  const { gameState, setGameState, dogState, setDogState, isMovingForward, setTension, setDistance, setPositions } = useGameStore();
  const playerPos = useRef(new Vector3(0, 1.7, 0));
  const povRotation = useRef({ yaw: 0, pitch: 0 });
  const lastYaw = useRef(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const swipeStartPos = useRef<{ x: number, y: number } | null>(null);
  
  const { camera } = useThree();
  const leash = useLeash();
  const dogAI = useDogAI();
  const accumulator = useRef(0);

  // Local state for immediate visual feedback of tension
  const [localTension, setLocalTension] = useState(0);

  useEffect(() => {
    const handleGo = () => {
      if (dogState === 'WALKING' || dogState === 'SNIFFING' || dogState === 'COMING') {
        const dirToPlayer = new Vector3(playerPos.current.x - dogAI.dogPos.current.x, 0, playerPos.current.z - dogAI.dogPos.current.z).normalize();
        dogAI.dogPos.current.add(dirToPlayer.multiplyScalar(0.35)); 
        leash.applyTug();
        if (dogState === 'WALKING' || dogState === 'COMING') setDogState('STANDING');
      } else {
        setDogState('WALKING');
        dogAI.startWalking(povRotation.current.yaw);
      }
    };

    (window as any).handleGo = handleGo;
    (window as any).handleTug = handleGo;

    const handleDown = (e: any) => {
      isDragging.current = true;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      lastMousePos.current = { x, y };
      swipeStartPos.current = { x, y };
    };
    const handleMove = (e: any) => {
      if (!isDragging.current) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = x - lastMousePos.current.x;
      const deltaY = y - lastMousePos.current.y;
      povRotation.current.yaw += deltaX * 0.005;
      povRotation.current.pitch -= deltaY * 0.005;
      povRotation.current.pitch = Math.max(-Math.PI/2.25, Math.min(Math.PI/3, povRotation.current.pitch));
      lastMousePos.current = { x, y };
    };
    const handleUp = (e: any) => {
      isDragging.current = false;
      if (swipeStartPos.current) {
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
        const deltaY = clientY - swipeStartPos.current.y;
        if (dogState === 'SNIFFING' && deltaY > 30) handleGo();
      }
      swipeStartPos.current = null;
    };

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
  }, [dogState, setDogState, dogAI, leash]);

  useFrame((_, delta) => {
    // 1. Camera Logic (per-frame for smoothness)
    const camDistance = 6;
    const camHeight = 2.5;
    const camX = playerPos.current.x - Math.sin(povRotation.current.yaw) * camDistance;
    const camZ = playerPos.current.z + Math.cos(povRotation.current.yaw) * camDistance;
    camera.position.set(camX, playerPos.current.y + camHeight, camZ);
    const lookAheadDist = 5;
    camera.lookAt(
      playerPos.current.x + Math.sin(povRotation.current.yaw) * lookAheadDist,
      playerPos.current.y + Math.sin(povRotation.current.pitch) * lookAheadDist,
      playerPos.current.z - Math.cos(povRotation.current.yaw) * lookAheadDist
    );

    if (gameState !== 'PLAYING') return;

    // 2. Physics & AI Updates (Sub-stepped for stability)
    const FIXED_DELTA = 1 / 60 / 8; // Local ref for speed
    accumulator.current += Math.min(delta, 0.1); // Cap delta to prevent spiral of death

    let lastLeashState: any = null;
    let lastAIState: any = null;

    while (accumulator.current >= FIXED_DELTA) {
      lastLeashState = leash.update(FIXED_DELTA, playerPos.current, dogAI.dogPos.current, dogAI.currentRotation.current);
      lastAIState = dogAI.update(FIXED_DELTA, playerPos.current, dogState, setDogState);

      // Player Movement (Inside fixed update for consistent physics)
      if (isMovingForward) {
        let tensionSlowdown = 1.0;
        if (lastLeashState.rawTension > 0.9) {
          tensionSlowdown = 0.4 - (((lastLeashState.rawTension - 0.9) / 0.1) * 0.3);
        } else if (lastLeashState.rawTension > 0.75) {
          tensionSlowdown = 1.0 - (((lastLeashState.rawTension - 0.75) / 0.15) * 0.6);
        }
        const yawDelta = Math.abs(povRotation.current.yaw - lastYaw.current);
        const panSlowdown = Math.max(0.3, 1.0 - (yawDelta * 10));
        const speed = PLAYER_BASE_SPEED * tensionSlowdown * panSlowdown;
        playerPos.current.x += Math.sin(povRotation.current.yaw) * speed * FIXED_DELTA;
        playerPos.current.z -= Math.cos(povRotation.current.yaw) * speed * FIXED_DELTA;
      }
      lastYaw.current = povRotation.current.yaw;

      accumulator.current -= FIXED_DELTA;
    }

    // Sync Store & UI (once per frame)
    if (lastLeashState && lastAIState) {
      setTension(lastLeashState.tension);
      setLocalTension(lastLeashState.tension);
      setDistance(lastAIState.dogDistance);
      setPositions({ 
        px: playerPos.current.x, pz: playerPos.current.z, 
        dx: dogAI.dogPos.current.x, dz: dogAI.dogPos.current.z 
      });

      if (lastAIState.dogDistance > 150) setGameState('FINISHED');
    }
  });

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <DogModel dogPos={dogAI.dogPos.current} state={dogState} visualOffset={leash.tugRecoil.current * 0.8} gameState={gameState} />
      <InstancedTrees count={40} />
      <LeashModel nodes={leash.nodes.current} tension={localTension} />
      <Box args={[8, 0.2, 2000]} position={[0, -0.1, -450]} receiveShadow><meshStandardMaterial color="#444" /></Box>
      <gridHelper args={[8, 500, 0x666666, 0x333333]} position={[0, 0.01, -450]} />
      <Plane args={[200, 2000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, -450]} receiveShadow><meshStandardMaterial color="#1b3012" /></Plane>
    </>
  );
};

export default function App() {
  const handleGo = () => { if ((window as any).handleGo) (window as any).handleGo(); };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', margin: 0, padding: 0, overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <Canvas shadows camera={{ fov: 75 }}>
        <SceneContent />
      </Canvas>
      <HUD handleGo={handleGo} />
    </div>
  );
}
