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
  const [activeApp, setActiveApp] = useState<'HOME' | 'KENNEL'>('HOME');

  const renderHomeScreen = () => (
    <div style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', 
      padding: '40px 20px', flex: 1, alignContent: 'start' 
    }}>
      {[
        { id: 'KENNEL', icon: '🐕', label: 'Kennel', color: '#44ff44' },
        { id: 'MAPS', icon: '🗺️', label: 'Maps', color: '#4488ff', disabled: true },
        { id: 'WALLET', icon: '💳', label: 'Wallet', color: '#ffcc00', disabled: true },
        { id: 'MESSAGES', icon: '💬', label: 'Chat', color: '#ff44aa', disabled: true },
        { id: 'CAMERA', icon: '📷', label: 'Camera', color: '#888', disabled: true },
        { id: 'SETTINGS', icon: '⚙️', label: 'System', color: '#555', disabled: true },
      ].map(app => (
        <div 
          key={app.id}
          onClick={() => !app.disabled && setActiveApp('KENNEL')}
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            cursor: app.disabled ? 'default' : 'pointer', opacity: app.disabled ? 0.4 : 1
          }}
        >
          <div style={{ 
            width: '60px', height: '60px', background: app.color, borderRadius: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            {app.icon}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{app.label}</div>
        </div>
      ))}
    </div>
  );

  const renderKennelApp = () => (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <button 
          onClick={() => setActiveApp('HOME')}
          style={{ background: 'none', border: 'none', color: '#44ff44', fontSize: '24px', cursor: 'pointer', padding: 0 }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: '#44ff44', fontSize: '20px', letterSpacing: '1px' }}>THE KENNEL</h2>
      </div>

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
  );

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100dvh',
      background: activeApp === 'HOME' ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' : '#111',
      zIndex: 100, pointerEvents: 'auto', color: 'white',
      display: 'flex', flexDirection: 'column', gap: '10px',
      overflow: 'hidden', fontFamily: 'sans-serif'
    }}>
      {/* Smartphone Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.8, padding: '10px 20px' }}>
        <span style={{ fontWeight: 'bold' }}>9:41</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {activeApp === 'HOME' ? renderHomeScreen() : renderKennelApp()}

      {/* Navigation Bar (Back, Home, App Switcher) */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
        padding: '5px 0 15px 0', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Back Button */}
        <div 
          onClick={() => {
            if (activeApp !== 'HOME') setActiveApp('HOME');
            else setMenuState(MenuState.IDLE);
          }}
          style={{ 
            width: '60px', height: '44px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', opacity: 0.8 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
        {/* Home Button (House Icon with outline) */}
        <div 
          onClick={() => {
            if (activeApp === 'HOME') setMenuState(MenuState.IDLE);
            else setActiveApp('HOME');
          }}
          style={{ 
            width: '60px', height: '44px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', opacity: 0.8 
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {/* App Switcher Button */}
        <div 
          onClick={() => {
            // Placeholder feedback
          }}
          style={{ 
            width: '60px', height: '44px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', opacity: 0.8 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </div>
      </div>
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

