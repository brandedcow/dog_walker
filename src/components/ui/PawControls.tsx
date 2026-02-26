import { useGameStore } from '../../store/useGameStore';
import { DogState } from '../../types';

export const PawControls = ({ handleGo }: { handleGo: () => void }) => {
  const dogState = useGameStore((state) => state.dogState) as DogState;
  const setDogState = useGameStore((state) => state.setDogState);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const setIsMovingForward = useGameStore((state) => state.setIsMovingForward);
  const tension = useGameStore((state) => state.tension);

  return (
    <div style={{ position: 'relative', width: '180px', height: '180px', pointerEvents: 'none' }}>
      <div 
        onClick={() => setIsMovingForward(!isMovingForward)}
        style={{ 
          position: 'absolute', left: '110px', top: '110px', width: '90px', height: '90px', borderRadius: '50%', 
          background: isMovingForward ? 'rgba(68, 255, 68, 0.7)' : 'rgba(0,0,0,0.85)', 
          border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          cursor: 'pointer', userSelect: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.6)', 
          transition: 'all 0.1s', zIndex: 2, pointerEvents: 'auto', transform: 'translate(-50%, -50%)' 
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>{isMovingForward ? 'STOP' : 'WALK'}</div>
      </div>
      {/* 1: COME (180°) - Active if Coming */}
      <button 
        onClick={() => setDogState(DogState.COMING)} 
        style={{ 
          position: 'absolute', left: '35px', top: '110px', width: '50px', height: '50px', borderRadius: '50%', 
          background: dogState === DogState.COMING ? '#44ff44' : 'rgba(0,0,0,0.85)', 
          color: dogState === DogState.COMING ? 'black' : 'white', border: '2px solid white', 
          cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', 
          pointerEvents: 'auto', transform: 'translate(-50%, -50%)' 
        }}
      >
        COME
      </button>
      {/* 2: SIT (240°) */}
      <button 
        onClick={() => setDogState(DogState.SITTING)} 
        style={{ 
          position: 'absolute', left: '72.5px', top: '45px', width: '50px', height: '50px', borderRadius: '50%', 
          background: dogState === DogState.SITTING ? '#44ff44' : 'rgba(0,0,0,0.85)', 
          color: dogState === DogState.SITTING ? 'black' : 'white', border: '2px solid white', 
          cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', 
          pointerEvents: 'auto', transform: 'translate(-50%, -50%)' 
        }}
      >
        SIT
      </button>
      {/* 3: GO/TUG Button */}
      <button 
        onClick={handleGo} 
        style={{ 
          position: 'absolute', left: '147.5px', top: '45px', width: '50px', height: '50px', borderRadius: '50%', 
          background: `linear-gradient(to top, ${tension > 0.9 ? '#ff4444' : tension > 0.75 ? '#ffff00' : '#44ff44'} ${tension * 100}%, rgba(0,0,0,0.85) ${tension * 100}%)`, 
          color: (tension > 0.5 && dogState !== DogState.WALKING) ? 'black' : 'white', 
          border: '2px solid white', cursor: 'pointer', fontWeight: 'bold', fontSize: '8px', fontFamily: 'monospace', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.2s', 
          pointerEvents: 'auto', transform: 'translate(-50%, -50%)', overflow: 'hidden' 
        }}
      >
        <div style={{ zIndex: 1 }}>{(dogState === DogState.WALKING || dogState === DogState.COMING) ? 'TUG' : 'GO'}</div>
      </button>
    </div>
  );
};
