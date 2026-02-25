import { useGameStore } from '../../store/useGameStore';

export const ProfileCard = () => {
  const { dogState, distance, isProfileExpanded, setIsProfileExpanded, dogMetadata } = useGameStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileExpanded(!isProfileExpanded);
  };

  return (
    <div 
      onClick={handleClick}
      style={{ 
        width: isProfileExpanded ? '240px' : '115px', 
        background: 'rgba(0,0,0,0.9)', 
        borderRadius: '16px', 
        border: '1.5px solid white', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        overflow: 'hidden', 
        backdropFilter: 'blur(15px)', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)', 
        pointerEvents: 'auto', 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxHeight: isProfileExpanded ? '400px' : '85px'
      }}
    >
      {/* Header - Walk Meter */}
      <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', position: 'relative', borderBottom: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (distance / 150) * 100)}%`, background: 'rgba(68, 136, 255, 0.4)', transition: 'width 0.3s ease-out' }} />
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '7px', fontWeight: '900', letterSpacing: '0.6px', opacity: 0.8 }}>WALK METER:</span>
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#4488ff' }}>{Math.floor(distance)}m</span>
        </div>
      </div>

      {/* Main Row / Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isProfileExpanded ? 'column' : 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: isProfileExpanded ? '16px' : '10px 8px', 
        gap: isProfileExpanded ? '12px' : '14px', 
        width: '100%', 
        boxSizing: 'border-box' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: '36px', height: '28px', background: '#8b4513', borderRadius: '6px' }}>
              <div style={{ position: 'absolute', top: '3px', left: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
              <div style={{ position: 'absolute', top: '3px', right: '-8px', width: '10px', height: '20px', background: '#5d4037', borderRadius: '3px' }} />
              <div style={{ position: 'absolute', top: '8px', left: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '3px', height: '3px', background: '#000', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '6px', background: '#000', borderRadius: '2px' }} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.3px', textAlign: 'center' }}>{dogMetadata.name}</div>
          </div>
          <div style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', minWidth: '24px', textAlign: 'center' }}>
            {dogState === 'WALKING' ? '🐾' : dogState === 'SNIFFING' ? '👃' : dogState === 'SITTING' ? '🪑' : dogState === 'IDLING' ? '💤' : dogState === 'COMING' ? '🐕' : '🧍'}
          </div>
        </div>

        {/* Expanded Details */}
        {isProfileExpanded && (
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            fontSize: '10px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '12px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span style={{ color: '#aaa' }}>TRAINING:</span>
              <span style={{ color: '#44ff44', fontWeight: 'bold' }}>{dogMetadata.trainingLevel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span style={{ color: '#aaa' }}>CHARACTER:</span>
              <span style={{ color: '#ffaa44', fontWeight: 'bold' }}>{dogMetadata.characteristic}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span style={{ color: '#aaa' }}>MOOD:</span>
              <span style={{ color: '#44ccff', fontWeight: 'bold' }}>{dogMetadata.mood}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span style={{ color: '#aaa' }}>SIZE:</span>
              <span style={{ color: 'white' }}>{dogMetadata.size}</span>
            </div>
            <div style={{ 
              marginTop: '4px', 
              fontSize: '8px', 
              color: '#888', 
              fontStyle: 'italic', 
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '8px'
            }}>
              TAP AGAIN TO COLLAPSE
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
