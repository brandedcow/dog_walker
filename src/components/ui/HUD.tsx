import { useGameStore } from '../../store/useGameStore';
import { SmartwatchMinimap } from './SmartwatchMinimap';
import { ProfileCard } from './ProfileCard';
import { PawControls } from './PawControls';
import { KennelOverlay, RecordsOverlay } from './MenuOverlays';
import { useEffect, useState } from 'react';

export const HUD = ({ handleGo }: { handleGo: () => void }) => {
  const { 
    gameState, setGameState, menuState, positions, distance, hasStrained, sessionGrit, finalizeWalk 
  } = useGameStore();
  const scents: any[] = []; 

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = windowSize.width > 1000;
  const uiScale = isLargeScreen ? Math.min(1.5, windowSize.width / 1200) : 1.0;
  
  // Use CSS variables for safe area insets with fallbacks
  const topSafe = 'env(safe-area-inset-top, 0px)';
  const bottomSafe = 'env(safe-area-inset-bottom, 0px)';
  const leftSafe = 'env(safe-area-inset-left, 0px)';
  const rightSafe = 'env(safe-area-inset-right, 0px)';

  const baseOffset = isLargeScreen ? Math.min(60, 20 + (windowSize.width - 1000) * 0.1) : 20;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'white', fontFamily: 'monospace', zIndex: 10 }}>
      {/* 3D Menu Contextual Overlays */}
      {gameState === 'HOME' && (
        <>
          {menuState === 'KENNEL' && <KennelOverlay />}
          {menuState === 'RECORDS' && <RecordsOverlay />}
        </>
      )}

      {(gameState === 'HOME' || gameState === 'PLAYING' || gameState === 'FINISHED') && (
        <>
          <div style={{ position: 'absolute', top: `calc(${topSafe} + ${baseOffset}px)`, left: `calc(${leftSafe} + ${baseOffset}px)`, zIndex: 10, width: `${120 * uiScale}px`, height: `${120 * uiScale}px`, transform: `scale(${uiScale})`, transformOrigin: 'top left' }}>
            <SmartwatchMinimap scents={scents} {...positions} />
          </div>

          {gameState === 'PLAYING' && (
            <div 
              onClick={() => {
                finalizeWalk();
                setGameState('FINISHED');
              }}
              style={{ 
                position: 'absolute', top: `calc(${topSafe} + ${baseOffset}px)`, right: `calc(${rightSafe} + ${baseOffset}px)`, zIndex: 10, 
                padding: `${12 * uiScale}px ${20 * uiScale}px`, background: 'rgba(0,0,0,0.8)', border: '2px solid white', 
                borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: `${14 * uiScale}px`, 
                cursor: 'pointer', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              <span>🏠</span> RETURN HOME
            </div>
          )}

          <div style={{ position: 'absolute', bottom: `calc(${bottomSafe} + ${baseOffset}px)`, left: `calc(${leftSafe} + ${baseOffset}px)`, zIndex: 10, transform: `scale(${uiScale})`, transformOrigin: 'bottom left' }}>
            <ProfileCard />
          </div>
          {((gameState === 'PLAYING' || gameState === 'FINISHED') || (gameState === 'HOME' && menuState === 'IDLE')) && (
            <div style={{ position: 'absolute', bottom: `calc(${bottomSafe} + ${baseOffset}px)`, right: `calc(${rightSafe} + ${baseOffset}px)`, zIndex: 10, transform: `scale(${uiScale})`, transformOrigin: 'bottom right' }}>
              <PawControls handleGo={handleGo} />
            </div>
          )}
        </>
      )}
      {gameState === 'FINISHED' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
          <h1 style={{ fontSize: '64px', margin: '0 0 20px 0', textAlign: 'center', color: '#44ff44', letterSpacing: '4px' }}>MISSION SUCCESS</h1>
          
          <div style={{ width: '350px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '25px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <span style={{ opacity: 0.7 }}>DISTANCE</span>
              <span style={{ fontWeight: 'bold' }}>{Math.floor(distance)}m</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ opacity: 0.7 }}>BASE GRIT</span>
              <span>+{Math.floor(distance / 10)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ opacity: 0.7 }}>CLEAN WALK BONUS</span>
              <span style={{ color: !hasStrained ? '#44ff44' : '#ff4444' }}>
                {!hasStrained ? `+${Math.floor(distance / 20)}` : '0'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 'bold', color: '#44ff44', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #44ff44' }}>
              <span>TOTAL EARNED</span>
              <span>{sessionGrit} GRIT</span>
            </div>
          </div>

          <button 
            onClick={() => setGameState('HOME')} 
            style={{ marginTop: '40px', padding: '20px 60px', fontSize: '24px', background: '#44ff44', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '15px', color: 'black', boxShadow: '0 10px 20px rgba(68, 255, 68, 0.2)' }}
          >
            RETURN TO HUB
          </button>
        </div>
      )}
    </div>
  );
};
