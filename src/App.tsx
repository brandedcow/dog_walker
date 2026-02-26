import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store/useGameStore';
import { RoadScene } from './components/world/RoadScene';
import { RoomScene } from './components/world/RoomScene';
import { HUD } from './components/ui/HUD';

export default function App() {
  const { gameState, menuState, setMenuState } = useGameStore();
  
  const handleGo = () => { if ((window as any).handleGo) (window as any).handleGo(); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuState !== 'IDLE') {
          setMenuState('IDLE');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuState, setMenuState]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', margin: 0, padding: 0, overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      <Canvas shadows camera={{ fov: 75 }}>
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
