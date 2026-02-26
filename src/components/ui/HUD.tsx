import { useGameStore } from '../../store/useGameStore';
import { SmartwatchMinimap } from './SmartwatchMinimap';
import { ProfileCard } from './ProfileCard';
import { PawControls } from './PawControls';
import { KennelOverlay, RecordsOverlay } from './MenuOverlays';
import { MissionSuccessOverlay } from './MissionSuccessOverlay';
import { useHUDLayout } from '../../hooks/useHUDLayout';

export const HUD = ({ handleGo }: { handleGo: () => void }) => {
  const { 
    gameState, setGameState, menuState, positions, finalizeWalk 
  } = useGameStore();
  const { uiScale, topSafe, bottomSafe, leftSafe, rightSafe, baseOffset } = useHUDLayout();
  
  const scents: any[] = []; 

  const renderHomeOverlays = () => {
    if (gameState !== 'HOME') return null;
    
    return (
      <>
        {menuState === 'KENNEL' && <KennelOverlay />}
        {menuState === 'RECORDS' && <RecordsOverlay />}
        
        {/* Global Close Button for Training/Sub-menus */}
        {menuState === 'TRAINING' && (
          <button 
            onClick={() => useGameStore.getState().setMenuState('IDLE')}
            style={{
              position: 'absolute',
              top: `calc(${topSafe} + 20px)`,
              right: `calc(${rightSafe} + 20px)`,
              width: '60px',
              height: '60px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '50%',
              fontSize: '32px',
              fontWeight: 'bold',
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              zIndex: 100,
              transition: 'transform 0.1s active'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ×
          </button>
        )}
      </>
    );
  };

  const renderPersistentUI = () => {
    if (!['HOME', 'PLAYING', 'FINISHED'].includes(gameState)) return null;

    return (
      <>
        {/* Minimap (Top-Left) */}
        <div style={{ 
          position: 'absolute', 
          top: `calc(${topSafe} + ${baseOffset}px)`, 
          left: `calc(${leftSafe} + ${baseOffset}px)`, 
          zIndex: 10, 
          width: `${120 * uiScale}px`, 
          height: `${120 * uiScale}px`, 
          transform: `scale(${uiScale})`, 
          transformOrigin: 'top left' 
        }}>
          <SmartwatchMinimap scents={scents} {...positions} />
        </div>

        {/* Return Home Button (Top-Right) */}
        {gameState === 'PLAYING' && (
          <div 
            onClick={() => {
              finalizeWalk();
              setGameState('FINISHED');
            }}
            style={{ 
              position: 'absolute', 
              top: `calc(${topSafe} + ${baseOffset}px)`, 
              right: `calc(${rightSafe} + ${baseOffset}px)`, 
              zIndex: 10, 
              padding: `${12 * uiScale}px ${20 * uiScale}px`, 
              background: 'rgba(0,0,0,0.8)', 
              border: '2px solid white', 
              borderRadius: '12px', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: `${14 * uiScale}px`, 
              cursor: 'pointer', 
              pointerEvents: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            <span>🏠</span> RETURN HOME
          </div>
        )}

        {/* Profile Card (Bottom-Left) */}
        <div style={{ 
          position: 'absolute', 
          bottom: `calc(${bottomSafe} + ${baseOffset}px)`, 
          left: `calc(${leftSafe} + ${baseOffset}px)`, 
          zIndex: 10, 
          transform: `scale(${uiScale})`, 
          transformOrigin: 'bottom left' 
        }}>
          <ProfileCard />
        </div>

        {/* Paw Controls (Bottom-Right) */}
        {((gameState === 'PLAYING' || gameState === 'FINISHED') || (gameState === 'HOME' && menuState === 'IDLE')) && (
          <div style={{ 
            position: 'absolute', 
            bottom: `calc(${bottomSafe} + ${baseOffset}px)`, 
            right: `calc(${rightSafe} + ${baseOffset}px)`, 
            zIndex: 10, 
            transform: `scale(${uiScale})`, 
            transformOrigin: 'bottom right' 
          }}>
            <PawControls handleGo={handleGo} />
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ 
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
      pointerEvents: 'none', color: 'white', fontFamily: 'monospace', zIndex: 10 
    }}>
      {renderHomeOverlays()}
      {renderPersistentUI()}
      {gameState === 'FINISHED' && <MissionSuccessOverlay />}
    </div>
  );
};

