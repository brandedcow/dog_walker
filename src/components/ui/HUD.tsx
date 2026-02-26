import { useGameStore } from '../../store/useGameStore';
import { GameState, MenuState } from '../../types';
import { SmartwatchMinimap } from './SmartwatchMinimap';
import { ProfileCard } from './ProfileCard';
import { PawControls } from './PawControls';
import { KennelOverlay, RecordsOverlay } from './MenuOverlays';
import { TrainingOverlay } from './TrainingOverlay';
import { MissionSuccessOverlay } from './MissionSuccessOverlay';
import { useHUDLayout } from '../../hooks/useHUDLayout';

export const HUD = ({ handleGo }: { handleGo: () => void }) => {
  const { 
    gameState, setGameState, menuState, positions, finalizeWalk, isMenuReady 
  } = useGameStore();
  const { uiScale, topSafe, bottomSafe, leftSafe, rightSafe, baseOffset } = useHUDLayout();
  
  const scents: any[] = []; 

  const renderHomeOverlays = () => {
    if (gameState !== GameState.HOME || !isMenuReady) return null;
    
    return (
      <>
        {menuState === MenuState.KENNEL && <KennelOverlay />}
        {menuState === MenuState.RECORDS && <RecordsOverlay />}
        {menuState === MenuState.TRAINING && <TrainingOverlay />}
      </>
    );
  };

  const renderPersistentUI = () => {
    if (!([GameState.HOME, GameState.PLAYING, GameState.FINISHED] as any[]).includes(gameState)) return null;
    const isTraining = menuState === MenuState.TRAINING;

    return (
      <>
        {/* Minimap (Top-Left) */}
        {!isTraining && (
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
        )}

        {/* Return Home Button (Top-Right) */}
        {gameState === GameState.PLAYING && (
          <div 
            onClick={() => {
              finalizeWalk();
              setGameState(GameState.FINISHED);
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
        {!isTraining && (
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
        )}

        {/* Paw Controls (Bottom-Right) */}
        {((gameState === GameState.PLAYING || gameState === GameState.FINISHED) || (gameState === GameState.HOME && menuState === MenuState.IDLE)) && (
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
      {gameState === GameState.FINISHED && <MissionSuccessOverlay />}
    </div>
  );
};

