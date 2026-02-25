import { useGameStore } from '../../store/useGameStore';

export const ProfileCard = ({ handleTug }: { handleTug: () => void }) => {
  const dogState = useGameStore((state) => state.dogState);
  const distance = useGameStore((state) => state.distance);

  return (
    <div 
      onClick={handleTug}
      style={{ width: '115px', background: 'rgba(0,0,0,0.85)', borderRadius: '16px', border: '1.5px solid white', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', position: 'relative', borderBottom: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (distance / 150) * 100)}%`, background: 'rgba(68, 136, 255, 0.4)', transition: 'width 0.3s ease-out' }} />
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '7px', fontWeight: '900', letterSpacing: '0.6px', opacity: 0.8 }}>WALK METER:</span>
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(distance)}m</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '10px 8px', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ position: 'relative', width: '36px', height: '28px', background: '#8b4513', borderRadius: '6px' }}>
            <div style={{ position: 'absolute', top: '3px', left: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
            <div style={{ position: 'absolute', top: '3px', right: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
            <div style={{ position: 'absolute', top: '8px', left: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '6px', background: '#000', borderRadius: '2px' }} />
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.3px', textAlign: 'center' }}>BUSTER</div>
        </div>
        <div style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', minWidth: '24px', textAlign: 'center' }}>
          {dogState === 'WALKING' ? '🐾' : dogState === 'SNIFFING' ? '👃' : dogState === 'SITTING' ? '🪑' : dogState === 'IDLING' ? '💤' : dogState === 'COMING' ? '🐕' : '🧍'}
        </div>
      </div>
    </div>
  );
};
