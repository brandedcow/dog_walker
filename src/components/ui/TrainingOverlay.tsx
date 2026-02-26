import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SKILLS, type Skill } from '../../config/skills';
import { MenuState } from '../../types';

const SkillNode = ({
  skill,
  unlocked,
  available,
  canAffordGrit,
  canAffordSP,
  onPurchase,
}: {
  skill: Skill;
  unlocked: boolean;
  available: boolean;
  canAffordGrit: boolean;
  canAffordSP: boolean;
  onPurchase: () => void;
}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (available && !unlocked && canAffordGrit && canAffordSP) onPurchase();
    }}
    style={{
      width: '100%',
      minHeight: '120px',
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
      boxSizing: 'border-box'
    }}
  >
    <div style={{ fontSize: "16px", fontWeight: "900", marginBottom: '4px' }}>
      {skill.name}
    </div>
    <div style={{ fontSize: "12px", opacity: 0.8, lineHeight: "1.2", flex: 1 }}>
      {skill.desc}
    </div>
    {!unlocked && available && (
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '14px', fontWeight: '900' }}>
        <span style={{ color: canAffordGrit ? "#2e7d32" : "#d32f2f" }}>{skill.gritCost}G</span>
        <span style={{ color: canAffordSP ? "#1976d2" : "#d32f2f" }}>{skill.spCost}SP</span>
      </div>
    )}
    {unlocked && <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold', color: '#44ff44' }}>UNLOCKED ✓</div>}
  </div>
);

export const TrainingOverlay = () => {
  const {
    setMenuState,
    playerStats,
    unlockedSkills,
    purchaseSkill,
    respecSkills,
    attributes,
    progression,
    race,
    setRace,
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

  const skillPaths = [
    { label: 'HANDLER', skills: SKILLS.filter(s => s.id.startsWith('STR')) },
    { label: 'ATHLETE', skills: SKILLS.filter(s => s.id.startsWith('AGI')) },
    { label: 'ANALYST', skills: SKILLS.filter(s => s.id.startsWith('FOC')) },
    { label: 'WHISPERER', skills: SKILLS.filter(s => s.id.startsWith('BND')) },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100dvh',
      background: '#f4f1ea',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: '#2c3e50',
      fontFamily: '"Courier New", Courier, monospace',
      pointerEvents: 'auto',
      overflow: 'hidden'
    }}>
      {/* Sidebar Tabs */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        zIndex: 10
      }}>
        {['STATS', 'SKILLS', 'COMMANDS'].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              width: '50px',
              height: '120px',
              background: activeTab === tab ? '#ffffff' : '#d1cdb0',
              border: '2px solid #2c3e50',
              borderRight: 'none',
              borderRadius: '20px 0 0 20px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
              color: activeTab === tab ? '#2c3e50' : '#6e6c56',
              boxShadow: activeTab === tab ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        padding: '40px 80px 20px 40px',
        borderBottom: '4px solid #2c3e50',
        background: 'rgba(255,255,255,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ margin: 0, fontSize: '42px', fontWeight: '900', letterSpacing: '-1px' }}>
            {activeTab}
          </h1>
          <button 
            onClick={() => setMenuState(MenuState.IDLE)}
            style={{
              width: '60px',
              height: '60px',
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '32px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', marginTop: '15px' }}>
          <div>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>GRIT CACHE:</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#2e7d32' }}>{playerStats.grit} G</div>
          </div>
          <div>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>SKILL POINTS:</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1976d2' }}>{progression.skillPoints} SP</div>
          </div>
          {activeTab === 'SKILLS' && (
            <button
              onClick={handleRespec}
              style={{
                background: confirmRespec ? '#d32f2f' : '#2c3e50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                alignSelf: 'flex-end',
                marginBottom: '5px'
              }}
            >
              {confirmRespec ? 'CONFIRM (250G)' : 'RESPEC BUILD'}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px 80px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        WebkitOverflowScrolling: 'touch'
      }}>
        {activeTab === 'STATS' && (
          <>
            {/* Race Selection */}
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Human', 'Elf', 'Dwarf'].map((r) => (
                <div
                  key={r}
                  onClick={() => setRace(r as any)}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: race === r ? '#2c3e50' : '#ffffff',
                    color: race === r ? 'white' : '#2c3e50',
                    border: '3px solid #2c3e50',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: '900',
                    fontSize: '18px',
                    transition: 'all 0.2s'
                  }}
                >
                  {r.toUpperCase()}
                </div>
              ))}
            </div>

            {/* XP & Rank */}
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '25px', borderRadius: '20px', border: '3px dashed #2c3e50' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '900', fontSize: '22px' }}>WALKER RANK {progression.walkerRank}</span>
                <span style={{ fontSize: '18px' }}>{progression.xp % 1000}/1000 XP</span>
              </div>
              <div style={{ width: '100%', height: '20px', background: '#d1cdb0', borderRadius: '10px', overflow: 'hidden', border: '2px solid #2c3e50' }}>
                <div style={{ width: `${(progression.xp % 1000) / 10}%`, height: '100%', background: '#2c3e50' }} />
              </div>
            </div>

            {/* Attributes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {[
                { label: 'STRENGTH', value: attributes.strength, color: '#d32f2f', desc: 'Strain threshold & Tug power' },
                { label: 'AGILITY', value: attributes.agility, color: '#388e3c', desc: 'Player movement speed & Pan stability' },
                { label: 'FOCUS', value: attributes.focus, color: '#1976d2', desc: 'Grit multiplier & Camera stabilization' },
                { label: 'BOND', value: attributes.bond, color: '#fbc02d', desc: 'Recall speed & Canine calmness' },
              ].map((attr) => (
                <div key={attr.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', marginBottom: '8px', fontWeight: '900' }}>
                    <span>{attr.label}</span>
                    <span>LEVEL {attr.value}</span>
                  </div>
                  <div style={{ width: '100%', height: '24px', background: '#d1cdb0', borderRadius: '12px', border: '2px solid #2c3e50', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (attr.value / 10) * 100)}%`, height: '100%', background: attr.color }} />
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '6px' }}>{attr.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'SKILLS' && (
          <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
            {skillPaths.map((path) => (
              <div key={path.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '900', textAlign: 'center', borderBottom: '2px solid #2c3e50' }}>{path.label}</h3>
                {path.skills.map((skill) => {
                  const unlocked = unlockedSkills.includes(skill.id);
                  const available = !skill.dependsOn || unlockedSkills.includes(skill.dependsOn);
                  const canAffordGrit = playerStats.grit >= skill.gritCost;
                  const canAffordSP = progression.skillPoints >= skill.spCost;
                  return (
                    <SkillNode
                      key={skill.id}
                      skill={skill}
                      unlocked={unlocked}
                      available={available}
                      canAffordGrit={canAffordGrit}
                      canAffordSP={canAffordSP}
                      onPurchase={() => purchaseSkill(skill.id, skill.gritCost, skill.spCost)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'COMMANDS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {[
              { cmd: "🐾 GO", desc: 'Click the "🐾" paw or look ahead to start walking. Buster follows your gaze.' },
              { cmd: "🪢 TUG", desc: "When Buster stops or pulls, click the paw to gently reel him in. Enhanced by STRENGTH." },
              { cmd: "🐕 COME", desc: "A focused recall. Brings Buster back to your side at high speed. Enhanced by BOND." },
              { cmd: "🛑 SIT", desc: "Command Buster to sit and wait. Useful for managing tension or taking a break." },
              { cmd: "🏠 RETURN", desc: "End the walk early from the HUD to bank your current Grit and XP." },
            ].map((item) => (
              <div key={item.cmd} style={{ borderBottom: '3px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                <div style={{ fontWeight: '900', fontSize: '28px', color: '#2c3e50', marginBottom: '10px' }}>{item.cmd}</div>
                <div style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: '20px', fontSize: '16px', fontStyle: 'italic', opacity: 0.6, textAlign: 'center' }}>
              * Commands are more effective as attributes and skill augments increase.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
