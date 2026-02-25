import { useGameStore } from '../../store/useGameStore';
import { SmartwatchMinimap } from './SmartwatchMinimap';
import { ProfileCard } from './ProfileCard';
import { PawControls } from './PawControls';
import { useEffect, useState } from 'react';

export const HUD = ({ handleGo }: { handleGo: () => void }) => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const positions = useGameStore((state) => state.positions);
  const scents: any[] = []; // Currently empty based on latest App.tsx

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = windowSize.width > 1000;
  const uiScale = isLargeScreen ? Math.min(1.5, windowSize.width / 1200) : 1.0;
  const edgeOffset = isLargeScreen ? Math.min(60, 20 + (windowSize.width - 1000) * 0.1) : 20;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'white', fontFamily: 'monospace', zIndex: 10 }}>
      {(gameState === 'START' || gameState === 'PLAYING' || gameState === 'FINISHED') && (
        <>
          <div style={{ position: 'absolute', top: `${edgeOffset}px`, left: `${edgeOffset}px`, zIndex: 10, width: `${120 * uiScale}px`, height: `${120 * uiScale}px`, transform: `scale(${uiScale})`, transformOrigin: 'top left' }}>
            <SmartwatchMinimap scents={scents} {...positions} />
          </div>
          <div style={{ position: 'absolute', bottom: `${edgeOffset}px`, left: `${edgeOffset}px`, zIndex: 10, transform: `scale(${uiScale})`, transformOrigin: 'bottom left' }}>
            <ProfileCard />
          </div>
          {(gameState === 'PLAYING' || gameState === 'FINISHED') && (
            <div style={{ position: 'absolute', bottom: `${edgeOffset}px`, right: `${edgeOffset}px`, zIndex: 10, transform: `scale(${uiScale})`, transformOrigin: 'bottom right' }}>
              <PawControls handleGo={handleGo} />
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
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', pointerEvents: 'auto' }}>
          <h1 style={{ fontSize: '72px', color: '#44ff44', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>MISSION SUCCESS</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '20px 50px', fontSize: '24px', background: 'white', border: 'none', cursor: 'pointer', borderRadius: '12px', color: 'black', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
};
