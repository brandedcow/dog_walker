import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Scent } from '../../types';

export const SmartwatchMinimap = ({ px, pz, dx, dz, scents }: { px: number, pz: number, dx: number, dz: number, scents: Scent[] }) => {
  const gameState = useGameStore((state) => state.gameState);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scale = 3.5;
  const viewRange = 20; 
  
  const isHome = gameState === 'HOME' || gameState === 'START';

  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', background: '#000', borderRadius: '24px', border: '3px solid #333', boxShadow: '0 0 15px rgba(0,0,0,0.5)', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ position: 'absolute', right: '-8px', top: '30px', width: '9px', height: '26px', background: 'linear-gradient(to right, #444, #222)', borderRadius: '3px', border: '1px solid #555' }} />
      <div style={{ position: 'absolute', right: '-6px', bottom: '35px', width: '6px', height: '22px', background: '#222', borderRadius: '3px', border: '1px solid #333' }} />
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#111', borderRadius: '21px', overflow: 'hidden', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isHome ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ display: 'flex', gap: '6px', fontSize: '9px', color: '#44ff44', opacity: 0.7, letterSpacing: '1px', fontWeight: 'bold' }}>
              <span>{time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span>
              <span>{time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#44ff44', textShadow: '0 0 10px rgba(68, 255, 68, 0.3)', lineHeight: '1' }}>
              {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `${8 * scale}px`, height: '200%', background: '#333' }} />
            {scents.map((s: Scent) => {
              const relativeZ = s.position[2] - pz;
              if (relativeZ < -viewRange || relativeZ > 5) return null;
              return (
                <div key={s.id} style={{ position: 'absolute', left: `${50 + s.position[0] * scale}%`, top: `${50 + (relativeZ) * scale}%`, width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 3px #ff4444' }} />
              );
            })}
            <div style={{ position: 'absolute', left: `${50 + px * scale}%`, top: '50%', width: '8px', height: '8px', background: '#4488ff', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '1.5px solid white' }} />
            <div style={{ position: 'absolute', left: `${50 + dx * scale}%`, top: `${50 + (dz - pz) * scale}%`, width: '6px', height: '6px', background: '#8b4513', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 11, border: '1.5px solid white' }} />
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', top: '50%' }} />
            <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(255,255,255,0.08)', left: '50%' }} />
          </>
        )}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)', pointerEvents: 'none', borderRadius: '21px' }} />
    </div>
  );
};
