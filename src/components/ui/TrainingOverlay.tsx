import { useState } from 'react';
import { useGameStore, getResonanceFilter, RESONANCE_ORDER } from '../../store/useGameStore';
import { SKILLS, type Skill } from '../../config/skills';
import { MenuState, ResonanceType, RESONANCE_STATS } from '../../types';

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
  const size = 300;
  const center = size / 2;
  const maxRadius = 85;
  const labelRadius = 115;
  const maxTraitVal = 20;

  const points = RESONANCE_ORDER.map((type, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const traitKey = TRAIT_MAP[type] || 'strength';
    const traitVal = (rawTraits as any)[traitKey] || 1;
    const dynamicRadius = (traitVal / maxTraitVal) * maxRadius;
    
    return {
      type,
      angle,
      bx: center + maxRadius * Math.cos(angle),
      by: center + maxRadius * Math.sin(angle),
      px: center + dynamicRadius * Math.cos(angle),
      py: center + dynamicRadius * Math.sin(angle),
      lx: center + labelRadius * Math.cos(angle),
      ly: center + labelRadius * Math.sin(angle),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', background: 'white', borderRadius: '15px', border: '2px solid #2c3e50', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textAlign: 'center', color: '#2c3e50' }}>NEURAL RESONANCE READOUT</h3>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((r, idx) => (
            <circle key={idx} cx={center} cy={center} r={maxRadius * r} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="3 3" />
          ))}

          <polygon
            points={points.map(p => `${p.bx},${p.by}`).join(' ')}
            fill="none"
            stroke="rgba(44, 62, 80, 0.1)"
            strokeWidth="1"
          />
          
          {points.map((p, i) => (
            <line key={`line-${i}`} x1={center} y1={center} x2={p.bx} y2={p.by} stroke="rgba(44, 62, 80, 0.1)" strokeWidth="1" />
          ))}

          <polygon
            points={points.map(p => `${p.px},${p.py}`).join(' ')}
            fill="rgba(44, 62, 80, 0.15)"
            stroke="#2c3e50"
            strokeWidth="2"
            style={{ transition: 'all 0.5s ease-out' }}
          />

          {points.map((p) => {
            const isPrimary = p.type === currentResonance;
            const isSecondary = p.type === secondaryFocus;
            const masteryLevel = Math.min(10, (affinityXP?.[p.type] || 0) / 1000);
            
            return (
              <g key={p.type} onClick={() => canSwitch && onResonanceSelect(p.type)} style={{ cursor: canSwitch ? 'pointer' : 'default' }}>
                {isSecondary && (
                  <circle cx={p.bx} cy={p.by} r="10" fill="none" stroke="#1976d2" strokeWidth="2">
                    <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  cx={p.bx} cy={p.by} r={isPrimary ? 6 : 4}
                  fill={isPrimary ? "#2c3e50" : isSecondary ? "#1976d2" : "#d1cdb0"}
                  stroke="#2c3e50"
                  strokeWidth="1"
                />

                <circle
                  cx={p.bx} cy={p.by} r="8"
                  fill="none"
                  stroke="#2e7d32"
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
                    fill: isPrimary ? '#2c3e50' : '#6e6c56',
                    textTransform: 'uppercase'
                  }}
                >
                  {TRAIT_MAP[p.type]?.toUpperCase() || p.type}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {canSwitch && (
        <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', textAlign: 'center', fontSize: '9px', fontStyle: 'italic', opacity: 0.6, color: '#2c3e50' }}>
          * Tap a frequency to tune (Rank 1 only)
        </div>
      )}
    </div>
  );
};

export const TrainingOverlay = () => {
  const {
    setMenuState,
    playerStats,
    playerName = 'WALKER',
    race = 'Human',
    unlockedSkills,
    purchaseSkill,
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

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'STATS' | 'SKILLS' | 'COMMANDS'>('PROFILE');

  const resonancePaths = [
    { label: 'STRENGTH', type: ResonanceType.ANCHOR, traitKey: 'strength', skills: SKILLS.filter(s => s.resonance === ResonanceType.ANCHOR) },
    { label: 'BOND', type: ResonanceType.WHISPERER, traitKey: 'bond', skills: SKILLS.filter(s => s.resonance === ResonanceType.WHISPERER) },
    { label: 'FOCUS', type: ResonanceType.TACTICIAN, traitKey: 'focus', skills: SKILLS.filter(s => s.resonance === ResonanceType.TACTICIAN) },
    { label: 'SPEED', type: ResonanceType.NOMAD, traitKey: 'speed', skills: SKILLS.filter(s => s.resonance === ResonanceType.NOMAD) },
    { label: 'AWARENESS', type: ResonanceType.URBANIST, traitKey: 'awareness', skills: SKILLS.filter(s => s.resonance === ResonanceType.URBANIST) },
    { label: 'MASTERY', type: ResonanceType.SPECIALIST, traitKey: 'mastery', skills: SKILLS.filter(s => s.resonance === ResonanceType.SPECIALIST) },
  ];

  const totalLevel = Math.floor(Object.values(rawTraits).reduce((a, b) => a + b, 0));

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100dvh',
      background: '#f4f1ea', zIndex: 100, display: 'flex', flexDirection: 'column',
      color: '#2c3e50', fontFamily: '"Courier New", Courier, monospace',
      pointerEvents: 'auto', overflow: 'hidden'
    }}>
      {/* Sidebar Tabs */}
      <div style={{ position: 'absolute', right: 0, top: '100px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 10 }}>
        {['PROFILE', 'STATS', 'SKILLS', 'COMMANDS'].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              width: '50px', height: '100px',
              background: activeTab === tab ? '#ffffff' : '#d1cdb0',
              border: '2px solid #2c3e50', borderRight: 'none', borderRadius: '20px 0 0 20px',
              writingMode: 'vertical-rl', textOrientation: 'mixed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '900', cursor: 'pointer',
              color: activeTab === tab ? '#2c3e50' : '#6e6c56',
              boxShadow: activeTab === tab ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Header - Only houses the title */}
      <div style={{ padding: '20px 70px 20px 20px', borderBottom: '4px solid #2c3e50', background: 'rgba(255,255,255,0.5)', position: 'relative' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '2px', color: '#2c3e50' }}>
            {activeTab === 'PROFILE' ? playerName : activeTab}
          </h1>
          {activeTab === 'PROFILE' && (
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#6e6c56', marginTop: '2px', display: 'flex', gap: '10px' }}>
              <span>{race.toUpperCase()}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>LEVEL {totalLevel}</span>
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#6e6c56', marginTop: '4px', opacity: 0.6 }}>FIELD NOTES v2.0</div>
        </div>
        <button 
          onClick={() => setMenuState(MenuState.IDLE)}
          style={{ 
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '40px', 
            height: '40px', 
            background: '#2c3e50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50%', 
            fontSize: '24px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
        > × </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 70px 40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {activeTab === 'PROFILE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '3px solid #2c3e50' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '900', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>OVERVIEW</h2>
              
              {/* Metadata Sub-section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                <div style={{ marginTop: '5px' }}>
                  <span style={{ fontWeight: '900', color: '#6e6c56', fontSize: '12px', display: 'block', marginBottom: '8px' }}>RESONANCE AFFINITY</span>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, background: '#2c3e50', color: 'white', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>MAIN</div>
                      <div style={{ fontWeight: '900', fontSize: '14px' }}>{resonanceType.toUpperCase()}</div>
                    </div>
                    <div style={{ flex: 1, background: secondaryFocus ? '#1976d2' : '#d1cdb0', color: 'white', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>SECONDARY</div>
                      <div style={{ fontWeight: '900', fontSize: '14px' }}>{secondaryFocus ? secondaryFocus.toUpperCase() : 'NONE'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traits Sub-section */}
              <h3 style={{ margin: '20px 0 15px 0', fontSize: '14px', fontWeight: '900', color: '#2c3e50', letterSpacing: '1px', borderTop: '1px solid #eee', paddingTop: '15px' }}>TRAIT BREAKDOWN</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resonancePaths.map(path => {
                  const base = (RESONANCE_STATS[resonanceType] as any)[path.traitKey];
                  const raw = (rawTraits as any)[path.traitKey] || 0;
                  const bonus = Math.max(0, raw - base);
                  
                  return (
                    <div key={path.label} style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                      <div style={{ width: '100px', fontWeight: '900', fontSize: '12px' }}>{path.label}</div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: base, background: '#d1cdb0', height: '12px', borderRadius: '6px' }} />
                        {bonus > 0 && <div style={{ flex: bonus, background: '#2e7d32', height: '12px', borderRadius: '6px' }} />}
                        <div style={{ flex: Math.max(0, 20 - raw), height: '12px' }} />
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', fontSize: '12px' }}>
                        <span style={{ fontWeight: '900' }}>{base}</span>
                        {bonus > 0 && <span style={{ color: '#2e7d32', fontWeight: '900' }}> +{bonus}</span>}
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#d1cdb0', borderRadius: '2px' }} /> BASE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#2e7d32', borderRadius: '2px' }} /> SKILL BONUS
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '2px solid #2c3e50', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', fontSize: '14px', color: '#2c3e50' }}>RANK {progression?.walkerRank || 1} PROGRESS</span>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>{(progression?.xp || 0) % 1000}/1000 XP</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#d1cdb0', borderRadius: '6px', overflow: 'hidden', border: '2px solid #2c3e50' }}>
                  <div style={{ width: `${((progression?.xp || 0) % 1000) / 10}%`, height: '100%', background: '#2c3e50' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#2c3e50', letterSpacing: '2px', textAlign: 'center' }}>VECTOR & MODIFIER READOUT</h3>
              <div style={{ overflowX: 'auto', width: '100%', background: 'white', borderRadius: '15px', border: '2px solid #2c3e50' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '300px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2c3e50', textAlign: 'left', color: '#2c3e50' }}>
                      <th style={{ padding: '10px' }}>TRAIT</th>
                      <th style={{ padding: '10px' }}>RAW</th>
                      <th style={{ padding: '10px' }}>FILTER</th>
                      <th style={{ padding: '10px' }}>OUTPUT</th>
                      <th style={{ padding: '10px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resonancePaths.map((path) => {
                      const filter = getResonanceFilter(resonanceType, path.type);
                      const raw = (rawTraits as any)[path.traitKey] || 0;
                      const output = (traits as any)[path.traitKey] || 0;
                      const mastery = ((affinityXP?.[path.type] || 0) % 1000) / 10;
                      
                      const color = filter === 1 ? '#2e7d32' : filter >= 0.8 ? '#1976d2' : filter >= 0.6 ? '#fbc02d' : '#d32f2f';
                      const status = filter === 1 ? 'PURE' : filter >= 0.8 ? 'HARMONIC' : filter >= 0.6 ? 'STABLE' : 'DISSONANT';

                      return (
                        <tr key={path.label} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '900', color: '#2c3e50' }}>{path.label}</td>
                          <td style={{ padding: '12px 10px', color: '#6e6c56' }}>{raw}</td>
                          <td style={{ padding: '12px 10px', color: color }}>x{filter.toFixed(1)}</td>
                          <td style={{ padding: '12px 10px', fontWeight: '900', color: color }}>{output.toFixed(1)}</td>
                          <td style={{ padding: '12px 10px', fontSize: '9px', color: color }}>
                            <div style={{ marginBottom: '4px' }}>{status}</div>
                            <div style={{ width: '40px', height: '4px', background: '#d1cdb0', borderRadius: '2px' }}>
                              <div style={{ width: `${mastery}%`, height: '100%', background: '#2e7d32' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#2c3e50', letterSpacing: '2px', textAlign: 'center' }}>APEX & HYBRID SLOTTING</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '70px', height: '70px', border: '2px solid #2c3e50', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', position: 'relative' }}>
                    <div style={{ fontSize: '9px', position: 'absolute', top: '-8px', background: '#2c3e50', color: 'white', padding: '2px 6px', fontWeight: '900' }}>APEX</div>
                    <div style={{ fontSize: '28px' }}>📜</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2].map(i => (
                      <div key={i} style={{ width: '55px', height: '55px', border: '2px dashed #d1cdb0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '18px', opacity: 0.3 }}>🔒</div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #2c3e50', paddingBottom: '5px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#2c3e50' }}>
                      {path.label} <span style={{ fontSize: '12px', color: '#6e6c56' }}>({Math.round(potency * 100)}% Potency)</span>
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

            {secondaryFocus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', padding: '20px', background: 'white', borderRadius: '15px', border: '2px solid #1976d2' }}>
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
              <div key={item.cmd} style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                <div style={{ fontWeight: '900', fontSize: '24px', color: '#2c3e50', marginBottom: '10px' }}>{item.cmd}</div>
                <div style={{ fontSize: '16px', color: '#6e6c56', lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
