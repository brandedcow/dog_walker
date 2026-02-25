import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3, Color } from 'three';
import { Line, Sky, Plane, Sphere, Box, Text } from '@react-three/drei';

const MAX_LEASH_LENGTH = 15;
const LEASH_NODES = 60;
const SEGMENT_LENGTH = MAX_LEASH_LENGTH / (LEASH_NODES - 1);
const LEASH_STIFFNESS = 15;
const LEASH_GRAVITY = -9.8;
const LEASH_FRICTION = 0.98;

interface Scent {
  id: number;
  position: [number, number, number];
  tugsRequired: number;
}

const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[0.5, 3, 0.5]} position={[0, 1.5, 0]}>
      <meshStandardMaterial color="#5d4037" />
    </Box>
    <Sphere args={[1.5, 8, 8]} position={[0, 4, 0]}>
      <meshStandardMaterial color="#2e7d32" />
    </Sphere>
  </group>
);

const DogModel = ({ dogPos, state, visualOffset = 0, gameState }: { dogPos: Vector3, state: 'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING', visualOffset?: number, gameState: string }) => {
  const groupRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const earsRef = useRef<[any, any]>([null, null]);
  const lastPos = useRef(new Vector3().copy(dogPos));
  const currentRotation = useRef(0);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const isPlaying = gameState === 'PLAYING';
      const time = clock.getElapsedTime();
      const isMoving = state === 'WALKING' || state === 'COMING';
      const bob = (isPlaying && isMoving) ? Math.abs(Math.sin(time * 15)) * 0.02 : 0;
      const movement = new Vector3().subVectors(dogPos, lastPos.current);
      if (isPlaying && movement.length() > 0.001) {
        const targetRot = Math.atan2(movement.x, movement.z);
        currentRotation.current += (targetRot - currentRotation.current) * 0.1;
      }
      const yPos = state === 'SITTING' ? -0.2 : 0;
      groupRef.current.position.set(dogPos.x, dogPos.y + bob + yPos, dogPos.z + visualOffset);
      groupRef.current.rotation.y = currentRotation.current + Math.PI;
      groupRef.current.rotation.z = (isPlaying && isMoving) ? Math.sin(time * 15) * 0.02 : 0;
      if (headRef.current) {
        const sittingTilt = state === 'SITTING' ? -0.4 : 0;
        headRef.current.rotation.x = (visualOffset * -1.5) + sittingTilt;
      }
      if (earsRef.current[0] && earsRef.current[1]) {
        const earWiggle = (isPlaying && isMoving) ? Math.sin(time * 20) * 0.1 : 0;
        const earYank = visualOffset * 2;
        earsRef.current[0].rotation.z = -0.2 + earWiggle + earYank;
        earsRef.current[1].rotation.z = 0.2 - earWiggle - earYank;
      }
      lastPos.current.copy(dogPos);
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[0.45, 0.4, 1.6]} castShadow position={[0, 0.3, 0]}><meshStandardMaterial color="#8b4513" /></Box>
      <group position={[0, 0.5, -0.9]} ref={headRef}>
        <Box args={[0.35, 0.35, 0.4]}><meshStandardMaterial color="#8b4513" /></Box>
        <Box args={[0.2, 0.2, 0.2]} position={[0, -0.05, -0.25]}><meshStandardMaterial color="#8b4513" /></Box>
        <Box args={[0.08, 0.06, 0.06]} position={[0, 0, -0.36]}><meshStandardMaterial color="#000" /></Box>
        <Box args={[0.06, 0.06, 0.02]} position={[0.1, 0.1, -0.21]}><meshStandardMaterial color="#000" /></Box>
        <Box args={[0.06, 0.06, 0.02]} position={[-0.1, 0.1, -0.21]}><meshStandardMaterial color="#000" /></Box>
        <Box ref={(el) => { earsRef.current[0] = el; }} args={[0.12, 0.35, 0.2]} position={[0.22, -0.1, 0]} rotation={[0, 0, -0.2]}><meshStandardMaterial color="#5d4037" /></Box>
        <Box ref={(el) => { earsRef.current[1] = el; }} args={[0.12, 0.35, 0.2]} position={[-0.22, -0.1, 0]} rotation={[0, 0, 0.2]}><meshStandardMaterial color="#5d4037" /></Box>
      </group>
      <Box args={[0.08, 0.08, 0.5]} position={[0, 0.4, 0.8]} rotation={[0.6, 0, 0]}><meshStandardMaterial color="#8b4513" /></Box>
      <Text position={[0, 0.3, 0.81]} fontSize={0.12} color="#5d4037" anchorX="center" anchorY="middle">X</Text>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
    </group>
  );
};

const LeashModel = ({ nodes, tension }: { nodes: Vector3[], tension: number }) => {
  const curve = useMemo(() => new CatmullRomCurve3(nodes), [nodes]);
  const color = useMemo(() => {
    const c = new Color('#111');
    const tensionColor = tension > 0.9 ? new Color('#ff0000') : tension > 0.75 ? new Color('#ffff00') : new Color('#44ff44');
    return c.lerp(tensionColor, Math.pow(tension, 2));
  }, [tension]);
  return <Line points={curve.getPoints(30)} color={color} lineWidth={4} />;
};

const SceneContent = ({ 
  gameState, setGameState, onTensionUpdate, onProgressUpdate, onPositionsUpdate, dogState, setDogState, isMovingForward, onTug, onGo
}: {
  gameState: string,
  setGameState: (s: any) => void,
  onTensionUpdate: (t: number) => void,
  onProgressUpdate: (p: number) => void,
  onPositionsUpdate: (pos: any) => void,
  dogState: 'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING',
  setDogState: (s: any) => void,
  isMovingForward: boolean,
  onTug: (fn: () => void) => void,
  onGo: (fn: () => void) => void
}) => {
  const dogPos = useRef(new Vector3(0, 0, -1));
  const playerPos = useRef(new Vector3(0, 1.7, 0));
  const dogDistance = useRef(0);
  const lastDogUpdatePos = useRef(new Vector3(0, 0, -1));
  const { camera } = useThree();

  const trees = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, position: [(i % 2 === 0 ? 6 : -6), 0, -i * 8] as [number, number, number]
  })), []);

  const [localUiTension, setLocalUiTension] = useState(0);
  const tugRecoil = useRef(0);
  const povRotation = useRef({ yaw: 0, pitch: 0 });
  const lastYaw = useRef(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const swipeStartPos = useRef<{ x: number, y: number } | null>(null);
  const isMovingForwardRef = useRef(false);
  useEffect(() => { isMovingForwardRef.current = isMovingForward; }, [isMovingForward]);
  const stationaryTime = useRef(0);
  const idleTarget = useRef<Vector3 | null>(null);
  const dogFacingYaw = useRef(0);

  const leashNodes = useRef<Vector3[]>(Array.from({ length: LEASH_NODES }, (_, i) => new Vector3(0, 2 - (i * 0.1), -i * 0.1)));
  const oldLeashNodes = useRef<Vector3[]>(Array.from({ length: LEASH_NODES }, (_, i) => new Vector3(0, 2 - (i * 0.1), -i * 0.1)));

  useEffect(() => {
    const doGo = () => {
      if (dogState === 'WALKING' || dogState === 'SNIFFING' || dogState === 'COMING') {
        const dirToPlayer = new Vector3(playerPos.current.x - dogPos.current.x, 0, playerPos.current.z - dogPos.current.z).normalize();
        dogPos.current.add(dirToPlayer.multiplyScalar(0.35)); 
        tugRecoil.current = 1.0; 
        if (dogState === 'WALKING' || dogState === 'COMING') {
          setDogState('STANDING');
          stationaryTime.current = 0;
        }
      } else {
        setDogState('WALKING');
        dogFacingYaw.current = povRotation.current.yaw;
        stationaryTime.current = 0;
      }
    };
    onGo(doGo);
    onTug(doGo);

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
        if (dogState === 'SNIFFING' && deltaY > 30) doGo();
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
  }, [dogState, setDogState, onTug, onGo]);

  useFrame((_, delta) => {
    if (tugRecoil.current > 0) {
      tugRecoil.current *= 0.85; 
      if (tugRecoil.current < 0.01) tugRecoil.current = 0;
    }

    // 3rd Person Camera Logic
    const camDistance = 6;
    const camHeight = 2.5;
    const camX = playerPos.current.x - Math.sin(povRotation.current.yaw) * camDistance;
    const camZ = playerPos.current.z + Math.cos(povRotation.current.yaw) * camDistance;
    const camY = playerPos.current.y + camHeight;
    camera.position.set(camX, camY, camZ);
    const lookAheadDist = 5;
    const targetX = playerPos.current.x + Math.sin(povRotation.current.yaw) * lookAheadDist;
    const targetZ = playerPos.current.z - Math.cos(povRotation.current.yaw) * lookAheadDist;
    const targetY = playerPos.current.y + Math.sin(povRotation.current.pitch) * lookAheadDist;
    camera.lookAt(targetX, targetY, targetZ);

    if (gameState !== 'PLAYING') return;

    // Verlet Leash Update
    const nodes = leashNodes.current;
    const oldNodes = oldLeashNodes.current;
    for (let i = 1; i < LEASH_NODES - 1; i++) {
      const vx = (nodes[i].x - oldNodes[i].x) * LEASH_FRICTION;
      const vy = (nodes[i].y - oldNodes[i].y) * LEASH_FRICTION;
      const vz = (nodes[i].z - oldNodes[i].z) * LEASH_FRICTION;
      oldNodes[i].copy(nodes[i]);
      nodes[i].x += vx;
      nodes[i].y += vy + (LEASH_GRAVITY * delta * delta);
      nodes[i].z += vz;
    }
    const handPos = playerPos.current.clone().add(new Vector3(0.8, -1.2, -0.5));
    const neckPos = dogPos.current.clone().add(new Vector3(0, 0.5, 0));
    nodes[0].copy(handPos);
    nodes[LEASH_NODES - 1].copy(neckPos);
    for (let j = 0; j < LEASH_STIFFNESS; j++) {
      for (let i = 0; i < LEASH_NODES - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        const diff = new Vector3().subVectors(n1, n2);
        const d = diff.length();
        const error = (d - SEGMENT_LENGTH) / d;
        const correction = diff.multiplyScalar(error * 0.5);
        if (i > 0) n1.sub(correction);
        if (i + 1 < LEASH_NODES - 1) n2.add(correction);
      }
      nodes[0].copy(handPos);
      nodes[LEASH_NODES - 1].copy(neckPos);
    }

    const distVec = new Vector3(playerPos.current.x, 0, playerPos.current.z).distanceTo(new Vector3(dogPos.current.x, 0, dogPos.current.z));
    const rawTension = Math.max(0, Math.min((distVec - 1.5) / (MAX_LEASH_LENGTH - 1.5), 1.0));
    const t = Math.max(0, rawTension - (tugRecoil.current * 0.7));
    if (Math.abs(t - localUiTension) > 0.01) {
      setLocalUiTension(t);
      onTensionUpdate(t);
    }

    // Player Movement with Non-Linear Slowdown and Pan Slowdown
    const PLAYER_BASE_SPEED = 7.0;
    if (isMovingForwardRef.current) {
      let tensionSlowdown = 1.0;
      if (rawTension > 0.9) {
        const normalized = (rawTension - 0.9) / 0.1; 
        tensionSlowdown = 0.4 - (normalized * 0.3);
      } else if (rawTension > 0.75) {
        const normalized = (rawTension - 0.75) / 0.15;
        tensionSlowdown = 1.0 - (normalized * 0.6);
      }

      // Pan Slowdown Calculation
      const yawDelta = Math.abs(povRotation.current.yaw - lastYaw.current);
      const panSlowdown = Math.max(0.3, 1.0 - (yawDelta * 10)); // Slow down up to 70% if panning fast
      
      const speed = PLAYER_BASE_SPEED * tensionSlowdown * panSlowdown;
      const moveX = Math.sin(povRotation.current.yaw) * speed * delta;
      const moveZ = -Math.cos(povRotation.current.yaw) * speed * delta;
      playerPos.current.x += moveX;
      playerPos.current.z += moveZ;
    }
    lastYaw.current = povRotation.current.yaw;

    if (dogState === 'STANDING') {
      stationaryTime.current += delta;
      if (stationaryTime.current > 5.0) {
        setDogState('IDLING');
        idleTarget.current = null;
      }
    } else if (dogState === 'IDLING') {
      if (!idleTarget.current || dogPos.current.distanceTo(idleTarget.current) < 0.1) {
        const currentAngle = Math.atan2(dogPos.current.z - playerPos.current.z, dogPos.current.x - playerPos.current.x);
        const angleOffset = (Math.random() - 0.5) * Math.PI; 
        const targetAngle = currentAngle + angleOffset;
        const idleDist = 1.2 + Math.random() * 1.3;
        idleTarget.current = new Vector3(playerPos.current.x + Math.cos(targetAngle) * idleDist, 0, playerPos.current.z + Math.sin(targetAngle) * idleDist);
      }
      const moveDir = new Vector3().subVectors(idleTarget.current, dogPos.current).normalize();
      const idleSpeed = 0.5 * delta;
      dogPos.current.add(moveDir.multiplyScalar(idleSpeed));
      const playerPosVec = new Vector3(playerPos.current.x, 0, playerPos.current.z);
      if (dogPos.current.distanceTo(playerPosVec) < 0.8) {
        const pushDir = new Vector3().subVectors(dogPos.current, playerPosVec).normalize();
        dogPos.current.add(pushDir.multiplyScalar(0.05));
        idleTarget.current = null;
      }
    } else if (dogState === 'COMING') {
      const targetPos = playerPos.current.clone();
      targetPos.y = 0;
      const dir = new Vector3().subVectors(targetPos, dogPos.current);
      const dist = dir.length();
      if (dist < 1.2) {
        setDogState('STANDING');
        stationaryTime.current = 0;
      } else {
        const moveSpeed = 12.0 * delta;
        dogPos.current.add(dir.normalize().multiplyScalar(moveSpeed));
      }
    }

    const preConstraintDist = new Vector3(playerPos.current.x, 0, playerPos.current.z).distanceTo(new Vector3(dogPos.current.x, 0, dogPos.current.z));
    if (preConstraintDist > MAX_LEASH_LENGTH) {
      const overshot = preConstraintDist - MAX_LEASH_LENGTH;
      const dirToDog = new Vector3(dogPos.current.x - playerPos.current.x, 0, dogPos.current.z - playerPos.current.z).normalize();
      if (dogState !== 'WALKING' && dogState !== 'COMING') {
        playerPos.current.x += dirToDog.x * overshot;
        playerPos.current.z += dirToDog.z * overshot;
      } else {
        const dirToPlayer = dirToDog.clone().multiplyScalar(-1);
        dogPos.current.x += dirToPlayer.x * overshot;
        dogPos.current.z += dirToPlayer.z * overshot;
      }
    }
    dogPos.current.y = 0;

    if (dogState === 'WALKING') {
      const DOG_MOVE_SPEED = 9.0;
      const moveX = Math.sin(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      const moveZ = -Math.cos(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      dogPos.current.x += moveX;
      dogPos.current.z += moveZ;
    }

    if (dogState === 'WALKING') {
      const distFromLastUpdate = new Vector3(dogPos.current.x, 0, dogPos.current.z).distanceTo(lastDogUpdatePos.current);
      if (distFromLastUpdate > 0.25) { // 25cm threshold
        dogDistance.current += distFromLastUpdate;
        lastDogUpdatePos.current.copy(dogPos.current);
        onProgressUpdate(dogDistance.current);
      }
    }

    onPositionsUpdate({ px: playerPos.current.x, pz: playerPos.current.z, dx: dogPos.current.x, dz: dogPos.current.z });

    if (dogDistance.current > 150) setGameState('FINISHED');
  });

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <DogModel dogPos={dogPos.current} state={dogState} visualOffset={tugRecoil.current * 0.8} gameState={gameState} />
      {trees.map(t => <Tree key={t.id} position={t.position} />)}
      <LeashModel nodes={leashNodes.current} tension={localUiTension} />
      <Box args={[8, 0.2, 2000]} position={[0, -0.1, -450]} receiveShadow><meshStandardMaterial color="#444" /></Box>
      <gridHelper args={[8, 500, 0x666666, 0x333333]} position={[0, 0.01, -450]} />
      <Plane args={[200, 2000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, -450]} receiveShadow><meshStandardMaterial color="#1b3012" /></Plane>
    </>
  );
};

const SmartwatchMinimap = ({ px, pz, dx, dz, scents }: { px: number, pz: number, dx: number, dz: number, scents: Scent[] }) => {
  const scale = 3.5;
  const viewRange = 20; 
  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', background: '#000', borderRadius: '24px', border: '3px solid #333', boxShadow: '0 0 15px rgba(0,0,0,0.5)', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ position: 'absolute', right: '-8px', top: '30px', width: '9px', height: '26px', background: 'linear-gradient(to right, #444, #222)', borderRadius: '3px', border: '1px solid #555' }} />
      <div style={{ position: 'absolute', right: '-6px', bottom: '35px', width: '6px', height: '22px', background: '#222', borderRadius: '3px', border: '1px solid #333' }} />
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#111', borderRadius: '21px', overflow: 'hidden', border: '1px solid #222' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `${8 * scale}px`, height: '200%', background: '#333' }} />
        {scents.map((s: Scent) => {
          const relativeZ = s.position[2] - pz;
          if (relativeZ < -viewRange || relativeZ > 5) return null;
          return (
            <div key={s.id} style={{ position: 'absolute', left: `${50 + s.position[0] * scale}%`, top: `${50 + (relativeZ) * scale}%`, width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 3px #ff4444' }} />
          );
        })}
        <div style={{ position: 'absolute', left: `${50 + px * scale}%`, top: '50%', width: '8px', height: '8px', background: '#4488ff', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '1.5px solid white' }} />
        <div style={{ position: 'absolute', left: `${50 + dx * scale}%`, top: `${50 + (dz - pz) * scale}%`, width: '6px', height: '6px', background: '#8b4513', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 11, border: '1.5px solid white' }} />
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', top: '50%' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(255,255,255,0.08)', left: '50%' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)', pointerEvents: 'none', borderRadius: '21px' }} />
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FINISHED'>('START');
  const [dogState, setDogState] = useState<'WALKING' | 'SNIFFING' | 'STANDING' | 'SITTING' | 'IDLING' | 'COMING'>('STANDING');
  const [tension, setTension] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isMovingForward, setIsMovingForward] = useState(false);
  const [positions, setPositions] = useState({ px: 0, pz: 0, dx: 0, dz: 0 });
  const [scents] = useState<Scent[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = windowSize.width > 1000;
  const uiScale = isLargeScreen ? Math.min(1.5, windowSize.width / 1200) : 1.0;
  const edgeOffset = isLargeScreen ? Math.min(60, 20 + (windowSize.width - 1000) * 0.1) : 20;

  const tugHandler = useRef<(() => void) | null>(null);
  const handleTug = () => { if (tugHandler.current) tugHandler.current(); };

  const goHandler = useRef<(() => void) | null>(null);
  const handleGo = () => { if (goHandler.current) goHandler.current(); };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', margin: 0, padding: 0, overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <Canvas shadows camera={{ fov: 75 }}>
        <SceneContent gameState={gameState} setGameState={setGameState} onTensionUpdate={setTension} onProgressUpdate={setDistance} onPositionsUpdate={setPositions} dogState={dogState} setDogState={setDogState} isMovingForward={isMovingForward} onTug={(fn) => { tugHandler.current = fn; }} onGo={(fn) => { goHandler.current = fn; }} />
      </Canvas>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'white', fontFamily: 'monospace', zIndex: 10 }}>
        {(gameState === 'START' || gameState === 'PLAYING') && (
          <>
            <div style={{ position: 'absolute', top: `${edgeOffset}px`, left: `${edgeOffset}px`, zIndex: 10, width: `${120 * uiScale}px`, height: `${120 * uiScale}px`, transform: `scale(${uiScale})`, transformOrigin: 'top left' }}>
              <SmartwatchMinimap scents={scents} {...positions} />
            </div>
            <div style={{ position: 'absolute', bottom: `${edgeOffset}px`, left: `${edgeOffset}px`, zIndex: 10, transform: `scale(${uiScale})`, transformOrigin: 'bottom left' }}>
              <div 
                onClick={handleTug}
                style={{ width: '115px', background: 'rgba(0,0,0,0.85)', borderRadius: '16px', border: '1.5px solid white', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'auto', cursor: 'pointer' }}
              >
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', position: 'relative', borderBottom: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (distance / 150) * 100)}%`, background: 'rgba(68, 136, 255, 0.4)', transition: 'width 0.3s ease-out' }} />
                  <div style={{ zIndex: 1, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '7px', fontWeight: '900', letterSpacing: '0.6px', opacity: 0.8 }}>WALK METER:</span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(distance)}m</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '10px 8px', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ position: 'relative', width: '36px', height: '28px', background: '#8b4513', borderRadius: '6px' }}>
                      <div style={{ position: 'absolute', top: '3px', left: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
                      <div style={{ position: 'absolute', top: '3px', right: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '6px', background: '#000', borderRadius: '2px' }} />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.3px', textAlign: 'center' }}>BUSTER</div>
                  </div>
                  <div style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', minWidth: '24px', textAlign: 'center' }}>
                    {dogState === 'WALKING' ? '🐾' : dogState === 'SNIFFING' ? '👃' : dogState === 'SITTING' ? '🪑' : dogState === 'IDLING' ? '💤' : dogState === 'COMING' ? '🐕' : '🧍'}
                  </div>
                </div>
              </div>
            </div>
            {gameState === 'PLAYING' && (
              <div style={{ position: 'absolute', bottom: `${edgeOffset}px`, right: `${edgeOffset}px`, zIndex: 10, width: '180px', height: '180px', pointerEvents: 'none', transform: `scale(${uiScale})`, transformOrigin: 'bottom right' }}>
                <div onClick={() => setIsMovingForward(!isMovingForward)} style={{ position: 'absolute', left: '110px', top: '110px', width: '90px', height: '90px', borderRadius: '50%', background: isMovingForward ? 'rgba(68, 255, 68, 0.7)' : 'rgba(0,0,0,0.85)', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.6)', transition: 'all 0.1s', zIndex: 2, pointerEvents: 'auto', transform: 'translate(-50%, -50%)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>{isMovingForward ? 'STOP' : 'WALK'}</div>
                </div>
                {/* 1: COME (180°) - Active if Coming */}
                <button onClick={() => setDogState('COMING')} style={{ position: 'absolute', left: '35px', top: '110px', width: '50px', height: '50px', borderRadius: '50%', background: dogState === 'COMING' ? '#44ff44' : 'rgba(0,0,0,0.85)', color: dogState === 'COMING' ? 'black' : 'white', border: '2px solid white', cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', pointerEvents: 'auto', transform: 'translate(-50%, -50%)' }}>COME</button>
                {/* 2: SIT (240°) */}
                <button onClick={() => setDogState('SITTING')} style={{ position: 'absolute', left: '72.5px', top: '45px', width: '50px', height: '50px', borderRadius: '50%', background: dogState === 'SITTING' ? '#44ff44' : 'rgba(0,0,0,0.85)', color: dogState === 'SITTING' ? 'black' : 'white', border: '2px solid white', cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', pointerEvents: 'auto', transform: 'translate(-50%, -50%)' }}>SIT</button>
                {/* 3: GO/TUG Button */}
                <button onClick={handleGo} style={{ position: 'absolute', left: '147.5px', top: '45px', width: '50px', height: '50px', borderRadius: '50%', background: `linear-gradient(to top, ${tension > 0.9 ? '#ff4444' : tension > 0.75 ? '#ffff00' : '#44ff44'} ${tension * 100}%, rgba(0,0,0,0.85) ${tension * 100}%)`, color: (tension > 0.5 && dogState !== 'WALKING') ? 'black' : 'white', border: '2px solid white', cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', pointerEvents: 'auto', transform: 'translate(-50%, -50%)', overflow: 'hidden' }}>
                  <div style={{ zIndex: 1 }}>{(dogState === 'WALKING' || dogState === 'COMING') ? 'TUG' : 'GO'}</div>
                </button>
              </div>
            )}
          </>
        )}
        {gameState === 'START' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', pointerEvents: 'auto' }}>
            <h1 style={{ fontSize: '64px', margin: '0 0 10px 0', textAlign: 'center', color: '#44ff44' }}>BARKING MAD</h1>
            <p style={{ fontSize: '20px', marginBottom: '40px' }}>A first-person dog walking simulator</p>
            <button onClick={() => setGameState('PLAYING')} style={{ padding: '25px 50px', fontSize: '28px', background: '#44ff44', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '15px', color: 'black' }}>START THE WALK</button>
          </div>
        )}
        {gameState === 'FINISHED' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)', pointerEvents: 'auto' }}>
            <h1 style={{ fontSize: '72px', color: '#44ff44' }}>MISSION SUCCESS</h1>
            <button onClick={() => window.location.reload()} style={{ padding: '20px 50px', fontSize: '24px', background: 'white', border: 'none', cursor: 'pointer', borderRadius: '12px', color: 'black', fontWeight: 'bold' }}>PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}
