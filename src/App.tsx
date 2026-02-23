import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3 } from 'three';
import { Line, Sky, Plane, Sphere, Box, Text } from '@react-three/drei';

const MAX_LEASH_LENGTH = 5;
const PLAYER_BASE_SPEED = 0.08;
const DOG_BASE_SPEED = 0.1;
const SNIFF_RADIUS = 2.0;

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
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      const bob = state === 'WALKING' ? Math.abs(Math.sin(time * 15)) * 0.03 : 0;
      groupRef.current.position.set(dogPos.x, dogPos.y + bob, dogPos.z);
      groupRef.current.rotation.z = state === 'WALKING' ? Math.sin(time * 15) * 0.02 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[0.5, 0.6, 1.1]} castShadow position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Box args={[0.4, 0.4, 0.4]} position={[0, 0.8, -0.7]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Box args={[0.1, 0.1, 0.4]} position={[0, 0.7, 0.6]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Text
        position={[0, 0.5, 0.56]}
        fontSize={0.15}
        color="#5d4037"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Box args={[0.12, 0.5, 0.12]} position={[0.18, 0.2, 0.35]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.12, 0.5, 0.12]} position={[-0.18, 0.2, 0.35]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.12, 0.5, 0.12]} position={[0.18, 0.2, -0.35]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
      <Box args={[0.12, 0.5, 0.12]} position={[-0.18, 0.2, -0.35]} castShadow><meshStandardMaterial color="#5d4037" /></Box>
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

const GameManager = ({ 
  gameState, 
  setGameState, 
  onTensionUpdate, 
  onProgressUpdate,
  dogState, 
  setDogState 
}: any) => {
  const dogPos = useRef(new Vector3(0, 0, -3));
  const playerPos = useRef(new Vector3(0, 2.2, 0));
  const { camera } = useThree();

  const [scents, setScents] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i, 
      position: [(Math.random() - 0.5) * 4, 0.05, -20 - i * 12] as [number, number, number],
      tugsRequired: 2
    }))
  );

  const trees = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, position: [(i % 2 === 0 ? 6 : -6), 0, -i * 8] as [number, number, number]
  })), []);

  const [keys, setKeys] = useState({ left: false, right: false });
  const [localUiTension, setLocalUiTension] = useState(0);

  useEffect(() => {
    const processTug = () => {
      const activeScent = scents.find(s => 
        dogPos.current.distanceTo(new Vector3(...s.position)) < SNIFF_RADIUS
      );
      if (activeScent) {
        setScents(prev => prev.map(s => {
          if (s.id === activeScent.id) {
            const newTugs = s.tugsRequired - 1;
            if (newTugs <= 0) {
              setDogState('WALKING');
              return null;
            }
            return { ...s, tugsRequired: newTugs };
          }
          return s;
        }).filter(Boolean) as any);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }));
      if (e.code === 'Space' && gameState === 'PLAYING' && dogState === 'SNIFFING') processTug();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }));
    };

    const handlePointerDown = (e: any) => {
      if (gameState !== 'PLAYING') return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return;
      const isRightSide = clientX > window.innerWidth / 2;
      if (isRightSide) setKeys(prev => ({ ...prev, right: true, left: false }));
      else setKeys(prev => ({ ...prev, left: true, right: false }));
      if (dogState === 'SNIFFING') processTug();
    };

    const handlePointerUp = () => setKeys({ left: false, right: false });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dogState, gameState, scents, setDogState]);

  useFrame(() => {
    camera.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);
    camera.lookAt(new Vector3(dogPos.current.x, 0.5, dogPos.current.z - 5));

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

    if (dogState === 'WALKING') dogPos.current.z -= DOG_BASE_SPEED;

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
      scents.forEach(s => {
        if (dogPos.current.distanceTo(new Vector3(...s.position)) < SNIFF_RADIUS) setDogState('SNIFFING');
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
      {scents.map(s => (
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
        <GameManager 
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
