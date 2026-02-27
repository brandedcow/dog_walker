import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { MenuState } from '../../types';

const OverlayContainer = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => (
  <div style={{ 
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '400px', background: 'rgba(0,0,0,0.9)', border: '2px solid white', borderRadius: '20px',
    padding: '30px', pointerEvents: 'auto', backdropFilter: 'blur(10px)',
    boxShadow: '0 0 50px rgba(0,0,0,0.8)', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px'
  }}>
    <h2 style={{ margin: 0, textAlign: 'center', color: '#44ff44', letterSpacing: '2px' }}>{title}</h2>
    <div style={{ flex: 1 }}>{children}</div>
    <button 
      onClick={onBack}
      style={{ 
        padding: '12px', background: 'white', color: 'black', border: 'none', 
        borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
      }}
    >
      BACK TO ROOM
    </button>
  </div>
);

export const KennelOverlay = () => {
  const { dogMetadata, dogStats, setMenuState } = useGameStore();
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '320px', height: '580px', background: '#111', border: '8px solid #333',
      borderRadius: '40px', padding: '20px', pointerEvents: 'auto', color: 'white',
      display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      overflow: 'hidden', borderBottomWidth: '15px'
    }}>
      {/* Smartphone Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', opacity: 0.6, padding: '0 10px' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <h2 style={{ margin: '10px 0 0 0', textAlign: 'center', color: '#44ff44', fontSize: '18px', letterSpacing: '1px' }}>THE KENNEL</h2>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🐕</div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{dogMetadata.name}</h3>
          <div style={{ fontSize: '12px', color: '#44ff44', fontWeight: 'bold', marginBottom: '15px' }}>
            LVL {dogStats.trainingLevel} {dogMetadata.trainingLevel}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>SIZE</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dogMetadata.size}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>MOOD</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dogMetadata.mood}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>TRAITS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Trust</span>
              <span style={{ color: '#ffcc00' }}>{dogStats.trust} 🐾</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${Math.min(100, (dogStats.trust / 100) * 100)}%`, height: '100%', background: '#ffcc00' }} />
            </div>
            
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>
              "{dogMetadata.characteristic}"
            </p>
          </div>
        </div>

        <button 
          style={{ 
            marginTop: 'auto', padding: '15px', background: '#333', color: 'white',
            border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer',
            opacity: 0.5
          }}
          disabled
        >
          CHANGE DOG (SOON)
        </button>
      </div>

      <button 
        onClick={() => setMenuState(MenuState.IDLE)}
        style={{ 
          padding: '12px', background: 'white', color: 'black', border: 'none', 
          borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
        }}
      >
        CLOSE APP
      </button>

      {/* Home Indicator */}
      <div style={{ 
        width: '100px', height: '4px', background: 'rgba(255,255,255,0.2)', 
        borderRadius: '2px', margin: '10px auto 0 auto' 
      }} />
    </div>
  );
};

export const RecordsOverlay = () => {
  const { totalDistanceWalked, resetProgress, setMenuState } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetProgress();
      setConfirmReset(false);
      setMenuState(MenuState.IDLE);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <OverlayContainer title="RECORDS" onBack={() => setMenuState(MenuState.IDLE)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(totalDistanceWalked)}m</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>TOTAL DISTANCE WALKED</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>0</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>CLEAN WALKS (LOW TENSION)</div>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <button 
            onClick={handleReset}
            style={{ 
              width: '100%', padding: '10px', 
              background: confirmReset ? '#ff4444' : 'rgba(255,0,0,0.2)', 
              color: 'white', border: '1px solid #ff4444', 
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {confirmReset ? 'ARE YOU SURE? (CLICK AGAIN)' : 'RESET ALL PROGRESS'}
          </button>
          {confirmReset && (
            <button 
              onClick={() => setConfirmReset(false)}
              style={{ 
                marginTop: '8px', background: 'transparent', color: 'white', 
                border: 'none', fontSize: '11px', textDecoration: 'underline', 
                cursor: 'pointer', opacity: 0.7 
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </OverlayContainer>
  );
};

