import { useGameStore } from '../../store/useGameStore';
import { GameState } from '../../types';

export const MissionSuccessOverlay = () => {
  const { setGameState, distance, hasStrained, sessionGrit } = useGameStore();

  return (
    <div style={{ 
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', 
      backdropFilter: 'blur(10px)', pointerEvents: 'auto' 
    }}>
      <h1 style={{ 
        fontSize: 'clamp(32px, 8vw, 64px)', margin: '0 0 20px 0', textAlign: 'center', 
        color: '#44ff44', letterSpacing: '4px' 
      }}>MISSION SUCCESS</h1>
      
      <div style={{ 
        width: 'min(350px, 80vw)', background: 'rgba(255,255,255,0.05)', padding: '30px', 
        borderRadius: '25px', display: 'flex', flexDirection: 'column', gap: '20px', 
        border: '1px solid rgba(255,255,255,0.1)' 
      }}>
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', 
          paddingBottom: '10px' 
        }}>
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

        <div style={{ 
          display: 'flex', justifyContent: 'space-between', fontSize: '24px', 
          fontWeight: 'bold', color: '#44ff44', marginTop: '10px', paddingTop: '10px', 
          borderTop: '2px solid #44ff44' 
        }}>
          <span>TOTAL EARNED</span>
          <span>{sessionGrit} GRIT</span>
        </div>
      </div>

      <button 
        onClick={() => setGameState(GameState.HOME)} 
        style={{ 
          marginTop: '40px', padding: '20px 60px', fontSize: '24px', background: '#44ff44', 
          border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '15px', 
          color: 'black', boxShadow: '0 10px 20px rgba(68, 255, 68, 0.2)' 
        }}
      >
        RETURN TO HUB
      </button>
    </div>
  );
};
