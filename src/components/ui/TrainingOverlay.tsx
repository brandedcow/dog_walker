import { useState } from 'react';
import { useGameStore, getResonanceFilter, RESONANCE_ORDER } from '../../store/useGameStore';
import { SKILLS, type Skill } from '../../config/skills';
import { MenuState, ResonanceType } from '../../types';

const SkillNode = ({
  skill,
  unlocked,
  available,
  canAffordGrit,
  canAffordSP,
  potency,
  onPurchase,
}: {
  skill: Skill;
  unlocked: boolean;
  available: boolean;
  canAffordGrit: boolean;
  canAffordSP: boolean;
  potency: number;
  onPurchase: () => void;
}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (available && !unlocked && canAffordGrit && canAffordSP) onPurchase();
    }}
    style={{
      width: '100%',
      minHeight: '140px',
      background: unlocked ? '#2c3e50' : available ? '#ffffff' : '#e0e0e0',
      border: `2px solid ${unlocked ? "#2c3e50" : available ? (canAffordGrit && canAffordSP ? "#2e7d32" : "#d32f2f") : "#bdbdbd"}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      padding: "15px",
      cursor: available && !unlocked && canAffordGrit && canAffordSP ? "pointer" : "default",
      transition: "all 0.2s",
      opacity: available ? 1 : 0.6,
      color: unlocked ? "white" : "#2c3e50",
      boxShadow: unlocked ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
      boxSizing: 'border-box',
      position: 'relative'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
      <div style={{ fontSize: "16px", fontWeight: "900" }}>{skill.name}</div>
      {skill.isHatsu && <div style={{ fontSize: '10px', background: '#ffcc00', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>HATSU</div>}
    </div>
    <div style={{ fontSize: "12px", opacity: 0.8, lineHeight: "1.2", flex: 1 }}>
      {skill.desc}
    </div>
    
    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      {!unlocked && available && (
        <div style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '900' }}>
          <span style={{ color: canAffordGrit ? "#2e7d32" : "#d32f2f" }}>{skill.gritCost}G</span>
          <span style={{ color: canAffordSP ? "#1976d2" : "#d32f2f" }}>{skill.spCost}SP</span>
        </div>
      )}
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: potency === 1 ? '#2e7d32' : potency >= 0.6 ? '#fbc02d' : '#d32f2f' }}>
        POTENCY: {Math.round(potency * 100)}%
      </div>
    </div>
    
    {unlocked && <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: 'bold', color: '#44ff44' }}>UNLOCKED ✓</div>}
  </div>
);

// Map ResonanceType to trait keys for visualizer
const TRAIT_MAP: Record<string, string> = {
  'Anchor': 'strength',
  'Whisperer': 'bond',
  'Tactician': 'focus',
  'Nomad': 'speed',
  'Urbanist': 'awareness',
  'Specialist': 'mastery'
};

const HexagramVisualizer = ({ 
  currentResonance, 
  secondaryFocus,
  rawTraits,
  affinityXP,
  onResonanceSelect, 
  canSwitch 
}: { 
  currentResonance: ResonanceType, 
  secondaryFocus: ResonanceType | null,
  rawTraits: any,
  affinityXP: Record<ResonanceType, number>,
  onResonanceSelect: (type: ResonanceType) => void,
  canSwitch: boolean
}) => {
  const size = 340;
  const center = size / 2;
  const maxRadius = 110;
  const labelRadius = 145;

  // Max value for raw traits scaling: assume 20 is "full" for visual scaling
  const maxTraitVal = 20;

  const points = RESONANCE_ORDER.map((type, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const traitKey = TRAIT_MAP[type] || 'strength';
    const traitVal = (rawTraits as any)[traitKey] || 1;
    const dynamicRadius = (traitVal / maxTraitVal) * maxRadius;
    
    return {
      type,
      angle,
      bx: center + maxRadius * Math.cos(angle), // Blueprint Vertex
      by: center + maxRadius * Math.sin(angle),
      px: center + dynamicRadius * Math.cos(angle), // Pulse Vertex
      py: center + dynamicRadius * Math.sin(angle),
      lx: center + labelRadius * Math.cos(angle), // Label
      ly: center + labelRadius * Math.sin(angle),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', background: '#0a0a0a', borderRadius: '20px', border: '2px solid #333', position: 'relative', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textAlign: 'center', color: '#666', letterSpacing: '2px' }}>NEURAL RESONANCE READOUT</h3>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Mastery Rings */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((r, idx) => (
            <circle key={idx} cx={center} cy={center} r={maxRadius * r} fill="none" stroke="#222" strokeWidth="1" strokeDasharray="5 5" />
          ))}

          {/* The Blueprint (Static Outline) */}
          <polygon
            points={points.map(p => `${p.bx},${p.by}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          
          {/* Connection Lines */}
          {points.map((p, i) => (
            <line
              key={`line-${i}`}
              x1={center} y1={center}
              x2={p.bx} y2={p.by}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* The Neural Pulse (Dynamic Fill) */}
          <polygon
            points={points.map(p => `${p.px},${p.py}`).join(' ')}
            fill="rgba(68, 136, 255, 0.2)"
            stroke="#4488ff"
            strokeWidth="2"
            style={{ transition: 'all 0.5s ease-out' }}
          />

          {/* Vertices & Glows */}
          {points.map((p) => {
            const isPrimary = p.type === currentResonance;
            const isSecondary = p.type === secondaryFocus;
            const masteryLevel = Math.min(10, (affinityXP?.[p.type] || 0) / 1000);
            
            return (
              <g key={p.type} onClick={() => canSwitch && onResonanceSelect(p.type)} style={{ cursor: canSwitch ? 'pointer' : 'default' }}>
                {/* Secondary Focus Pulse */}
                {isSecondary && (
                  <circle cx={p.bx} cy={p.by} r="12" fill="none" stroke="#00ffff" strokeWidth="2">
                    <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Primary/Secondary Markers */}
                <circle
                  cx={p.bx} cy={p.by} r={isPrimary ? 6 : 4}
                  fill={isPrimary ? "#ffd700" : isSecondary ? "#00ffff" : "#333"}
                  stroke={isPrimary ? "#ffd700" : "#222"}
                  strokeWidth="1"
                />

                {/* Mastery Progress Arc (Mini) */}
                <circle
                  cx={p.bx} cy={p.by} r="8"
                  fill="none"
                  stroke="#44ff44"
                  strokeWidth="2"
                  strokeDasharray={`${masteryLevel * 5} 50`}
                  transform={`rotate(-90 ${p.bx} ${p.by})`}
                />

                <text
                  x={p.lx} y={p.ly}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  style={{ 
                    fontSize: '10px', 
                    fontWeight: '900', 
                    fill: isPrimary ? '#ffd700' : isSecondary ? '#00ffff' : '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {p.type}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const TrainingOverlay = () => {
  const {
    setMenuState,
    playerStats,
    unlockedSkills,
    purchaseSkill,
    respecSkills,
    traits = { strength: 1, bond: 1, focus: 1, speed: 1, awareness: 1, mastery: 1 },
    rawTraits = { strength: 1, bond: 1, focus: 1, speed: 1, awareness: 1, mastery: 1 },
    progression,
    resonanceType = ResonanceType.ANCHOR,
    secondaryFocus,
    affinityXP = {
      [ResonanceType.ANCHOR]: 0,
      [ResonanceType.WHISPERER]: 0,
      [ResonanceType.TACTICIAN]: 0,
      [ResonanceType.NOMAD]: 0,
      [ResonanceType.URBANIST]: 0,
      [ResonanceType.SPECIALIST]: 0,
    },
    setResonanceType
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'STATS' | 'SKILLS' | 'COMMANDS'>('STATS');
  const [confirmRespec, setConfirmRespec] = useState(false);

  const handleRespec = () => {
    if (confirmRespec) {
      respecSkills(250);
      setConfirmRespec(false);
    } else {
      setConfirmRespec(true);
    }
  };

  const resonancePaths = [
    { label: 'ANCHOR', type: ResonanceType.ANCHOR, traitKey: 'strength', skills: SKILLS.filter(s => s.resonance === ResonanceType.ANCHOR) },
    { label: 'WHISPERER', type: ResonanceType.WHISPERER, traitKey: 'bond', skills: SKILLS.filter(s => s.resonance === ResonanceType.WHISPERER) },
    { label: 'TACTICIAN', type: ResonanceType.TACTICIAN, traitKey: 'focus', skills: SKILLS.filter(s => s.resonance === ResonanceType.TACTICIAN) },
    { label: 'NOMAD', type: ResonanceType.NOMAD, traitKey: 'speed', skills: SKILLS.filter(s => s.resonance === ResonanceType.NOMAD) },
    { label: 'URBANIST', type: ResonanceType.URBANIST, traitKey: 'awareness', skills: SKILLS.filter(s => s.resonance === ResonanceType.URBANIST) },
    { label: 'SPECIALIST', type: ResonanceType.SPECIALIST, traitKey: 'mastery', skills: SKILLS.filter(s => s.resonance === ResonanceType.SPECIALIST) },
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100dvh',
      background: '#050505', zIndex: 100, display: 'flex', flexDirection: 'column',
      color: '#eee', fontFamily: '"Courier New", Courier, monospace',
      pointerEvents: 'auto', overflow: 'hidden'
    }}>
      {/* Sidebar Tabs */}
      <div style={{ position: 'absolute', right: 0, top: '100px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 10 }}>
        {['STATS', 'SKILLS', 'COMMANDS'].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              width: '50px', height: '120px',
              background: activeTab === tab ? '#111' : '#222',
              border: '1px solid #444', borderRight: 'none', borderRadius: '20px 0 0 20px',
              writingMode: 'vertical-rl', textOrientation: 'mixed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '900', cursor: 'pointer',
              color: activeTab === tab ? '#4488ff' : '#666',
              boxShadow: activeTab === tab ? '-4px 0 15px rgba(68,136,255,0.2)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: '20px 70px 20px 20px', borderBottom: '1px solid #333', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: '#4488ff' }}>{activeTab}</h1>
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>RESONANCE PROTOCOL v2.0</div>
          </div>
          <button 
            onClick={() => setMenuState(MenuState.IDLE)}
            style={{ width: '40px', height: '40px', background: '#222', color: '#eee', border: '1px solid #444', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}
          > × </button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 0 auto' }}>
            <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>GRIT CACHE</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#44ff44' }}>{playerStats?.grit || 0} G</div>
          </div>
          <div style={{ flex: '1 0 auto' }}>
            <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>SKILL POINTS</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#4488ff' }}>{progression?.skillPoints || 0} SP</div>
          </div>
          <button
            onClick={handleRespec}
            style={{
              background: confirmRespec ? '#d32f2f' : '#222',
              color: '#eee',
              border: `1px solid ${confirmRespec ? '#d32f2f' : '#444'}`,
              padding: '8px 15px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '900',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            {confirmRespec ? 'CONFIRM (250G)' : 'RESPEC FREQUENCY'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 70px 40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {activeTab === 'STATS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              <HexagramVisualizer 
                currentResonance={resonanceType} 
                secondaryFocus={secondaryFocus}
                rawTraits={rawTraits}
                affinityXP={affinityXP}
                onResonanceSelect={setResonanceType} 
                canSwitch={(progression?.walkerRank || 1) === 1} 
              />
              
              {/* XP Progress Section */}
              <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', fontSize: '14px', color: '#4488ff' }}>RANK {progression?.walkerRank || 1} PROGRESS</span>
                  <span style={{ fontSize: '14px', color: '#888' }}>{(progression?.xp || 0) % 1000}/1000 XP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${((progression?.xp || 0) % 1000) / 10}%`, height: '100%', background: '#4488ff' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#666', letterSpacing: '2px', textAlign: 'center' }}>VECTOR & MODIFIER READOUT</h3>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '300px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', color: '#888' }}>
                      <th style={{ padding: '10px 5px' }}>TRAIT</th>
                      <th style={{ padding: '10px 5px' }}>RAW</th>
                      <th style={{ padding: '10px 5px' }}>FILTER</th>
                      <th style={{ padding: '10px 5px' }}>OUTPUT</th>
                      <th style={{ padding: '10px 5px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resonancePaths.map((path) => {
                      const filter = getResonanceFilter(resonanceType, path.type);
                      const raw = (rawTraits as any)[path.traitKey] || 0;
                      const output = (traits as any)[path.traitKey] || 0;
                      const mastery = ((affinityXP?.[path.type] || 0) % 1000) / 10;
                      
                      const color = filter === 1 ? '#ffd700' : filter >= 0.8 ? '#c0c0c0' : filter >= 0.6 ? '#cd7f32' : '#666';
                      const status = filter === 1 ? 'PURE' : filter >= 0.8 ? 'HARMONIC' : filter >= 0.6 ? 'STABLE' : 'DISSONANT';

                      return (
                        <tr key={path.label} style={{ borderBottom: '1px solid #111' }}>
                          <td style={{ padding: '12px 5px', fontWeight: '900', color: '#eee' }}>{path.label}</td>
                          <td style={{ padding: '12px 5px', color: '#888' }}>{raw}</td>
                          <td style={{ padding: '12px 5px', color: color }}>x{filter.toFixed(1)}</td>
                          <td style={{ padding: '12px 5px', fontWeight: '900', color: color }}>{output.toFixed(1)}</td>
                          <td style={{ padding: '12px 5px', fontSize: '9px', color: color }}>
                            <div style={{ marginBottom: '4px' }}>{status}</div>
                            <div style={{ width: '100%', height: '3px', background: '#222', borderRadius: '2px' }}>
                              <div style={{ width: `${mastery}%`, height: '100%', background: '#44ff44' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Hatsu & Hybrid Section */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#666', letterSpacing: '2px', textAlign: 'center' }}>APEX & HYBRID SLOTTING</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '70px', height: '70px', border: '2px solid #ffd700', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.05)', position: 'relative' }}>
                    <div style={{ fontSize: '9px', position: 'absolute', top: '-8px', background: '#ffd700', color: '#000', padding: '2px 6px', fontWeight: '900' }}>APEX</div>
                    <div style={{ fontSize: '28px' }}>⚡</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2].map(i => (
                      <div key={i} style={{ width: '55px', height: '55px', border: '1px dashed #444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                        <div style={{ fontSize: '18px', opacity: 0.2 }}>🔒</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SKILLS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {resonancePaths.map((path) => {
              const potency = getResonanceFilter(resonanceType, path.type);
              return (
                <div key={path.label} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#eee' }}>
                      {path.label} <span style={{ fontSize: '12px', color: '#666' }}>({Math.round(potency * 100)}% Potency)</span>
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {path.skills.map((skill) => (
                      <div key={skill.id} style={{ flex: '0 0 280px' }}>
                        <SkillNode
                          skill={skill}
                          unlocked={unlockedSkills.includes(skill.id)}
                          available={!skill.dependsOn || unlockedSkills.includes(skill.dependsOn)}
                          canAffordGrit={playerStats?.grit >= skill.gritCost}
                          canAffordSP={progression?.skillPoints >= skill.spCost}
                          potency={potency}
                          onPurchase={() => purchaseSkill(skill.id, skill.gritCost, skill.spCost)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Hybrid Techniques Section */}
            {secondaryFocus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', padding: '20px', background: 'rgba(25, 118, 210, 0.05)', borderRadius: '15px', border: '2px solid #1976d2' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1976d2' }}>
                  Resonant Hybridization: {resonanceType} × {secondaryFocus}
                </h3>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {SKILLS.filter(s => s.id.startsWith('HYB')).map(skill => {
                    const unlocked = unlockedSkills.includes(skill.id);
                    const canAffordGrit = playerStats?.grit >= skill.gritCost;
                    const canAffordSP = progression?.skillPoints >= skill.spCost;
                    
                    return (
                      <div key={skill.id} style={{ flex: '0 0 280px' }}>
                        <SkillNode
                          skill={skill}
                          unlocked={unlocked}
                          available={true}
                          canAffordGrit={canAffordGrit}
                          canAffordSP={canAffordSP}
                          potency={1.0}
                          onPurchase={() => purchaseSkill(skill.id, skill.gritCost, skill.spCost)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'COMMANDS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {[
              { cmd: "🐾 GO", desc: 'Start walking or recapture heading. Buster follows your gaze.' },
              { cmd: "🪢 TUG", desc: "Correct pathing or manage tension. Strength-dependent recoil." },
              { cmd: "🐕 COME", desc: "High-frequency recall. Efficiency based on BOND resonance." },
              { cmd: "🛑 SIT", desc: "Stabilize state. Zeros out kinetic momentum for safety." },
            ].map((item) => (
              <div key={item.cmd} style={{ borderBottom: '1px solid #222', paddingBottom: '20px' }}>
                <div style={{ fontWeight: '900', fontSize: '24px', color: '#4488ff', marginBottom: '10px' }}>{item.cmd}</div>
                <div style={{ fontSize: '16px', color: '#888', lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
