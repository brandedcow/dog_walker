import { useGameStore } from '../../store/useGameStore';

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
    <OverlayContainer title="THE KENNEL" onBack={() => setMenuState('IDLE')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{dogMetadata.name}</h3>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Training Level: {dogMetadata.trainingLevel}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Characteristic: {dogMetadata.characteristic}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>Trust: {dogStats.trust} 🐾</p>
        </div>
        <p style={{ fontSize: '12px', textAlign: 'center', opacity: 0.5 }}>More dogs coming soon...</p>
      </div>
    </OverlayContainer>
  );
};

export const RecordsOverlay = () => {
  const { distance, setMenuState } = useGameStore();
  return (
    <OverlayContainer title="RECORDS" onBack={() => setMenuState('IDLE')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(distance)}m</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>TOTAL DISTANCE WALKED</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>0</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>CLEAN WALKS (LOW TENSION)</div>
        </div>
      </div>
    </OverlayContainer>
  );
};
