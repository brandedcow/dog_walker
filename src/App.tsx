import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store/useGameStore';
import { RoadScene } from './components/world/RoadScene';
import { RoomScene } from './components/world/RoomScene';
import { HUD } from './components/ui/HUD';
import { AudioEngine } from './systems/audio/AudioEngine';

export default function App() {
  const { gameState } = useGameStore();
  
  const handleGo = () => { if ((window as any).handleGo) (window as any).handleGo(); };

  return (
    <div style={{ width: '100vw', height: '100dvh', backgroundColor: '#000', position: 'relative', margin: 0, padding: 0, overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <Canvas shadows camera={{ fov: 75 }}>
        <AudioEngine />
        {gameState === 'HOME' || gameState === 'START' ? (
          <RoomScene />
        ) : (
          <RoadScene />
        )}
      </Canvas>
      <HUD handleGo={handleGo} />
    </div>
  );
}
