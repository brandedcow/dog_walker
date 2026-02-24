import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3 } from 'three';
import { Line, Sky, Plane, Sphere, Box, Text } from '@react-three/drei';

const MAX_LEASH_LENGTH = 5;
const PLAYER_BASE_SPEED = 0.12;
const DOG_BASE_SPEED = 0.15;
const SNIFF_RADIUS = 2.5;

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

const DogModel = ({ dogPos, state }: { dogPos: Vector3, state: string }) => {
  const groupRef = useRef<any>(null);
  const lastPos = useRef(new Vector3().copy(dogPos));
  const currentRotation = useRef(0);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      const bob = state === 'WALKING' ? Math.abs(Math.sin(time * 15)) * 0.02 : 0;
      const movement = new Vector3().subVectors(dogPos, lastPos.current);
      if (movement.length() > 0.001) {
        const targetRot = Math.atan2(movement.x, movement.z);
        currentRotation.current += (targetRot - currentRotation.current) * 0.1;
      }
      groupRef.current.position.set(dogPos.x, dogPos.y + bob, dogPos.z);
      groupRef.current.rotation.y = currentRotation.current + Math.PI;
      groupRef.current.rotation.z = state === 'WALKING' ? Math.sin(time * 15) * 0.02 : 0;
      lastPos.current.copy(dogPos);
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[0.45, 0.4, 1.6]} castShadow position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Box args={[0.35, 0.35, 0.4]} position={[0, 0.5, -0.9]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Box args={[0.1, 0.3, 0.2]} position={[0.2, 0.4, -0.9]} rotation={[0, 0, -0.2]}>
        <meshStandardMaterial color="#5d4037" />
      </Box>
      <Box args={[0.1, 0.3, 0.2]} position={[-0.2, 0.4, -0.9]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color="#5d4037" />
      </Box>
      <Box args={[0.08, 0.08, 0.5]} position={[0, 0.4, 0.8]} rotation={[0.6, 0, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Text position={[0, 0.3, 0.81]} fontSize={0.12} color="#5d4037" anchorX="center" anchorY="middle">X</Text>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, 0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.1, 0.2, 0.1]} position={[-0.15, 0.1, -0.6]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
    </group>
  );
};

const LeashModel = ({ start, end, tension }: { start: Vector3, end: Vector3, tension: number }) => {
  const points = useMemo(() => {
    const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y -= (1 - tension) * 1.2; 
    return [start, mid, end];
  }, [start, end, tension]);
  const curve = new CatmullRomCurve3(points);
  return <Line points={curve.getPoints(20)} color="#111" lineWidth={5} />;
};

const SceneContent = ({ 
  gameState, setGameState, onTensionUpdate, onProgressUpdate, dogState, setDogState 
}: any) => {
  const dogPos = useRef(new Vector3(0, 0, -3));
  const playerPos = useRef(new Vector3(0, 2.2, 0));
  const { camera } = useThree();
  const sniffingScentId = useRef<number | null>(null);

  // We use a REF for scents to avoid stale closures in input handlers, 
  // but keep a STATE version for rendering.
  const [scentsState, setScentsState] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i, 
      position: [(i % 2 === 0 ? -3.5 : 3.5), 0.05, -20 - i * 12] as [number, number, number],
      tugsRequired: 2
    }))
  );
  const scentsRef = useRef(scentsState);
  useEffect(() => { scentsRef.current = scentsState; }, [scentsState]);

  const trees = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, position: [(i % 2 === 0 ? 6 : -6), 0, -i * 8] as [number, number, number]
  })), []);

  const [keys, setKeys] = useState({ left: false, right: false });
  const [localUiTension, setLocalUiTension] = useState(0);

  useEffect(() => {
    const processTug = () => {
      const scentId = sniffingScentId.current;
      if (scentId === null) return;

      const currentScents = scentsRef.current;
      const activeScent = currentScents.find(s => s.id === scentId);
      if (!activeScent) return;

      const newTugs = activeScent.tugsRequired - 1;
      
      if (newTugs <= 0) {
        setDogState('WALKING');
        sniffingScentId.current = null;
        setScentsState(prev => prev.filter(s => s.id !== scentId));
      } else {
        setScentsState(prev => prev.map(s => s.id === scentId ? { ...s, tugsRequired: newTugs } : s));
      }
    };

    const handleInput = (e: any) => {
      if (gameState !== 'PLAYING') return;
      
      const isTap = e.type === 'mousedown' || e.type === 'touchstart';
      const isSpace = e.code === 'Space';

      if (isTap) {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const isRightSide = clientX > window.innerWidth / 2;
        setKeys({ left: !isRightSide, right: isRightSide });
        if (dogState === 'SNIFFING') processTug();
      }

      if (isSpace && dogState === 'SNIFFING') processTug();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }));
      if (e.code === 'Space' && dogState === 'SNIFFING') processTug();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }));
    };

    const handleGlobalPointerUp = () => setKeys({ left: false, right: false });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, [dogState, gameState, setDogState]);

  useFrame(() => {
    camera.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);
    camera.lookAt(dogPos.current.x * 0.5, 0.5, playerPos.current.z - 10);

    if (gameState !== 'PLAYING') return;

    const steerSpeed = 0.05;
    if (keys.left) {
      playerPos.current.x -= steerSpeed;
      dogPos.current.x -= steerSpeed * 0.8;
    }
    if (keys.right) {
      playerPos.current.x += steerSpeed;
      dogPos.current.x += steerSpeed * 0.8;
    }
    playerPos.current.x = Math.max(-3.5, Math.min(3.5, playerPos.current.x));
    dogPos.current.x = Math.max(-3.5, Math.min(3.5, dogPos.current.x));

    if (dogState === 'WALKING') {
      const DETECTION_RADIUS = 25.0;
      const scentsAhead = scentsState.filter(s => s.position[2] < dogPos.current.z);
      if (scentsAhead.length > 0) {
        const closestScent = scentsAhead.reduce((prev, curr) => {
          const distPrev = dogPos.current.distanceTo(new Vector3(...prev.position));
          const distCurr = dogPos.current.distanceTo(new Vector3(...curr.position));
          return distCurr < distPrev ? curr : prev;
        });
        if (dogPos.current.distanceTo(new Vector3(...closestScent.position)) < DETECTION_RADIUS) {
          const distToScent = dogPos.current.distanceTo(new Vector3(...closestScent.position));
          const pullStrength = Math.max(0.02, 0.08 * (1 - distToScent / DETECTION_RADIUS));
          if (dogPos.current.x < closestScent.position[0]) dogPos.current.x += pullStrength;
          else if (dogPos.current.x > closestScent.position[0]) dogPos.current.x -= pullStrength;
        }
      }
      dogPos.current.z -= DOG_BASE_SPEED;
    }

    const dist = new Vector3(playerPos.current.x, 0, playerPos.current.z).distanceTo(new Vector3(dogPos.current.x, 0, dogPos.current.z));
    const t = Math.max(0, Math.min((dist - 1.5) / (MAX_LEASH_LENGTH - 1.5), 1.0));
    if (Math.abs(t - localUiTension) > 0.01) {
      setLocalUiTension(t);
      onTensionUpdate(t);
    }

    const speed = Math.max(dogState === 'SNIFFING' ? 0 : 0.02, PLAYER_BASE_SPEED * (1 - t));
    playerPos.current.z -= speed;
    onProgressUpdate(Math.max(0, Math.min(Math.abs(playerPos.current.z) / 150, 1.0)));

    const dir = new Vector3(dogPos.current.x - playerPos.current.x, 0, dogPos.current.z - playerPos.current.z);
    if (dir.length() > MAX_LEASH_LENGTH) {
      dir.setLength(MAX_LEASH_LENGTH);
      dogPos.current.x = playerPos.current.x + dir.x;
      dogPos.current.z = playerPos.current.z + dir.z;
    }
    dogPos.current.y = 0;

    if (dogState === 'WALKING') {
      scentsState.forEach(s => {
        if (dogPos.current.distanceTo(new Vector3(...s.position)) < SNIFF_RADIUS) {
          setDogState('SNIFFING');
          sniffingScentId.current = s.id;
        }
      });
    }

    if (playerPos.current.z < -150) setGameState('FINISHED');
  });

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <DogModel dogPos={dogPos.current} state={dogState} />
      {scentsState.map(s => (
        <group key={s.id} position={s.position}>
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color={dogState === 'SNIFFING' ? "#ffff00" : "#ff4444"} transparent opacity={0.6} emissive={dogState === 'SNIFFING' ? "#ffff00" : "#ff4444"} emissiveIntensity={0.2} />
          </Sphere>
        </group>
      ))}
      {trees.map(t => <Tree key={t.id} position={t.position} />)}
      <LeashModel start={playerPos.current.clone().add(new Vector3(0.8, -1.2, -0.5))} end={dogPos.current.clone().add(new Vector3(0, 0.5, 0))} tension={localUiTension} />
      <Box args={[8, 0.2, 1000]} position={[0, -0.1, -500]} receiveShadow><meshStandardMaterial color="#444" /></Box>
      <gridHelper args={[8, 250, 0x666666, 0x333333]} position={[0, 0.01, -500]} />
      <Plane args={[200, 1000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, -500]} receiveShadow><meshStandardMaterial color="#1b3012" /></Plane>
    </>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FINISHED'>('START');
  const [dogState, setDogState] = useState<'WALKING' | 'SNIFFING'>('WALKING');
  const [tension, setTension] = useState(0);
  const [progress, setProgress] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Canvas shadows camera={{ fov: 60 }}>
        <SceneContent 
          gameState={gameState} setGameState={setGameState} 
          onTensionUpdate={setTension} onProgressUpdate={setProgress}
          dogState={dogState} setDogState={setDogState} 
        />
      </Canvas>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'white', fontFamily: 'monospace', zIndex: 10 }}>
        {gameState === 'START' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', pointerEvents: 'auto' }}>
            <h1 style={{ fontSize: '64px', margin: '0 0 10px 0', textAlign: 'center', color: '#44ff44' }}>CANINE TENSION</h1>
            <p style={{ fontSize: '20px', marginBottom: '40px' }}>A first-person dog walking simulator</p>
            <button onClick={() => setGameState('PLAYING')} style={{ padding: '25px 50px', fontSize: '28px', background: '#44ff44', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '15px', color: 'black' }}>START THE WALK</button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <>
            <div style={{ padding: '40px' }}>
              <h2 style={{ margin: 0, textShadow: '2px 2px #000' }}>WALKING...</h2>
              <div style={{ width: '350px', height: '30px', border: '3px solid white', background: 'rgba(0,0,0,0.5)', marginTop: '15px', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${tension * 100}%`, height: '100%', background: tension > 0.85 ? '#ff4444' : '#44ff44', transition: 'width 0.1s linear' }} />
              </div>
              <div style={{ fontSize: '28px', marginTop: '15px', fontWeight: 'bold', color: dogState === 'SNIFFING' ? '#ffff00' : '#ffffff', textShadow: '3px 3px #000' }}>{dogState === 'SNIFFING' ? '>>> TUG THE LEASH! (SPACE/CLICK) <<<' : 'STATUS: GOOD BOY'}</div>
            </div>
            <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', width: '60%', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', textShadow: '2px 2px #000' }}>PROGRESS TO PARK</p>
              <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.5)', border: '2px solid white', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${progress * 100}%`, height: '100%', background: '#44ff44', transition: 'width 0.3s ease-out' }} />
              </div>
            </div>
          </>
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
