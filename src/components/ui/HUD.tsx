import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GameState, MenuState } from '../../types';
import { SmartwatchMinimap } from './SmartwatchMinimap';
import { ProfileCard } from './ProfileCard';
import { PawControls } from './PawControls';
import { KennelOverlay, RecordsOverlay } from './MenuOverlays';
import { TrainingOverlay } from './TrainingOverlay';
import { MissionSuccessOverlay } from './MissionSuccessOverlay';
import { useHUDLayout } from '../../hooks/useHUDLayout';

const NeuralPulseHUD = () => {
  const { tension, distance, isMovingForward } = useGameStore();
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = (t: number) => {
      setTime(t / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  
  // Wave parameters
  const playerFreq = 2 + (isMovingForward ? 2 : 0);
  const canineFreq = 1.5 + (tension * 5);
  
  // Synchrony logic: simplified check for MVP
  const isSynchronized = distance > 50 && tension < 0.5;

  return (
    <div style={{
      position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
      width: '300px', height: '100px', background: 'rgba(0,0,0,0.85)',
      borderRadius: '20px', border: `2px solid ${isSynchronized ? '#44ff44' : '#333'}`,
      overflow: 'hidden', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column',
      padding: '10px', boxShadow: isSynchronized ? '0 0 25px rgba(68,255,68,0.4)' : 'none',
      pointerEvents: 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '900', color: '#666', letterSpacing: '1px', marginBottom: '5px' }}>
        <span>PLAYER OUTPUT</span>
        <span style={{ color: isSynchronized ? '#44ff44' : '#666' }}>{isSynchronized ? 'NEURAL SYNCHRONY (1.5x)' : 'SYNCING...'}</span>
        <span>CANINE STATE</span>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {/* Player Wave */}
          <path
            d={`M 0 30 ${Array.from({ length: 30 }).map((_, i) => {
              const x = (i / 30) * 280;
              const y = 30 + Math.sin(time * playerFreq + i * 0.5) * 15;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none" stroke="#4488ff" strokeWidth="2"
          />
          {/* Canine Wave */}
          <path
            d={`M 0 30 ${Array.from({ length: 30 }).map((_, i) => {
              const x = (i / 30) * 280;
              const y = 30 + Math.sin(time * canineFreq + i * 0.5) * 15;
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none" stroke={isSynchronized ? '#44ff44' : "#ff4444"} strokeWidth="2" strokeOpacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
};

export const HUD = ({ handleGo }: { handleGo: () => void }) => {
  const { 
    gameState, setGameState, menuState, positions, finalizeWalk, isMenuReady,
    tension, sessionGrit, progression
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
    const isMenuOpen = menuState !== MenuState.IDLE;

    return (
      <>
        {/* Minimap & Status (Top-Left) */}
        {!isMenuOpen && (
          <div style={{ 
            position: 'absolute', 
            top: `calc(${topSafe} + ${baseOffset}px)`, 
            left: `calc(${leftSafe} + ${baseOffset}px)`, 
            zIndex: 10, 
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transform: `scale(${uiScale})`, 
            transformOrigin: 'top left' 
          }}>
            <div style={{ width: '120px', height: '120px' }}>
              <SmartwatchMinimap scents={scents} {...positions} />
            </div>
            
            {/* Persistence Summary */}
            <div style={{ 
              background: 'rgba(0,0,0,0.85)', padding: '10px 15px', borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '4px',
              width: '120px', boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: '8px', fontWeight: '900', opacity: 0.6, letterSpacing: '0.5px' }}>RANK {progression.walkerRank}</div>
              <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(progression.xp % 1000) / 10}%`, height: '100%', background: '#4488ff' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#44ff44' }}>{sessionGrit} G</div>
            </div>
          </div>
        )}

        {/* Return Home Button (Top-Right) */}
        {gameState === GameState.PLAYING && (
          <div 
            onClick={() => {
              finalizeWalk();
              setGameState(GameState.HOME);
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

        {/* Center Tension HUD */}
        {gameState === GameState.PLAYING && (
          <>
            <div style={{ 
              position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
              textAlign: 'center', opacity: tension > 0.7 ? 1 : 0, transition: 'opacity 0.3s'
            }}>
              <div style={{ fontSize: `${24 * uiScale}px`, fontWeight: '900', color: tension > 0.9 ? '#ff0000' : '#ffcc00', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                {tension > 0.9 ? 'CRITICAL TENSION' : 'LEASH STRAIN'}
              </div>
            </div>
            <div style={{ transform: `scale(${uiScale})`, transformOrigin: 'bottom center', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <NeuralPulseHUD />
            </div>
          </>
        )}

        {/* Profile Card (Bottom-Left) */}
        {!isMenuOpen && (
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
        {((gameState === GameState.PLAYING || gameState === GameState.FINISHED) || (gameState === GameState.HOME && !isMenuOpen)) && (
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

