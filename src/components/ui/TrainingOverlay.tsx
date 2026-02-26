import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SKILLS, type Skill } from '../../config/skills';

const SkillNode = ({
  skill,
  unlocked,
  available,
  canAfford,
  onPurchase,
}: {
  skill: Skill;
  unlocked: boolean;
  available: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (available && !unlocked && canAfford) onPurchase();
    }}
    style={{
      flex: '1 1 calc(50% - 20px)',
      minHeight: '180px',
      background: unlocked ? '#44ff44' : available ? '#2c3e50' : '#1a1a1a',
      border: `4px solid ${unlocked ? "#fff" : available ? (canAfford ? "#44ff44" : "#ff4444") : "#333"}`,
      borderRadius: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
      cursor: available && !unlocked && canAfford ? "pointer" : "default",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: available ? 1 : 0.4,
      position: "relative",
      color: unlocked ? "black" : "white",
      boxShadow: unlocked ? "0 0 30px rgba(68, 255, 68, 0.3)" : "none",
      boxSizing: 'border-box'
    }}
  >
    <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px", marginBottom: '8px' }}>
      {skill.name}
    </div>
    <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.3" }}>
      {skill.desc}
    </div>
    {!unlocked && available && (
      <div style={{ fontSize: "16px", fontWeight: "900", marginTop: "15px", color: canAfford ? "#44ff44" : "#ff4444" }}>
        {skill.cost}G
      </div>
    )}
    {unlocked && <div style={{ position: "absolute", top: "10px", right: "15px", fontSize: "16px", fontWeight: 'bold' }}>✓</div>}
  </div>
);

export const TrainingOverlay = () => {
  const {
    setMenuState,
    playerStats,
    unlockedSkills,
    purchaseSkill,
    attributes,
    progression,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'STATS' | 'SKILLS' | 'COMMANDS'>('STATS');

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100dvh',
      background: '#f4f1ea', // Paper-like background
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: '#2c3e50',
      fontFamily: '"Courier New", Courier, monospace',
      pointerEvents: 'auto',
      overflow: 'hidden'
    }}>
      {/* Sidebar Tabs (Right Edge) */}
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
            {activeTab === 'STATS' ? 'DASHBOARD' : activeTab === 'SKILLS' ? 'FIELD NOTES' : 'COMMANDS'}
          </h1>
          <button 
            onClick={() => setMenuState('IDLE')}
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
          {activeTab === 'SKILLS' && (
            <div>
              <span style={{ fontSize: '14px', opacity: 0.7 }}>SKILL POINTS:</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#d32f2f' }}>{progression.skillPoints} SP</div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
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
                { label: 'STRENGTH', value: attributes.strength, color: '#d32f2f', desc: 'Strain threshold before leash snaps' },
                { label: 'FOCUS', value: attributes.focus, color: '#1976d2', desc: 'Grit multiplier & Pan stability' },
                { label: 'AGILITY', value: attributes.agility, color: '#388e3c', desc: 'Player movement speed' },
                { label: 'BOND', value: attributes.bond, color: '#fbc02d', desc: 'Recall speed & Dog calmness' },
              ].map((attr) => (
                <div key={attr.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', marginBottom: '8px', fontWeight: '900' }}>
                    <span>{attr.label}</span>
                    <span>LVL {attr.value}</span>
                  </div>
                  <div style={{ width: '100%', height: '24px', background: '#d1cdb0', borderRadius: '12px', border: '2px solid #2c3e50', overflow: 'hidden' }}>
                    <div style={{ width: `${(attr.value / 10) * 100}%`, height: '100%', background: attr.color }} />
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '6px' }}>{attr.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'SKILLS' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {SKILLS.map((skill) => {
              const unlocked = unlockedSkills.includes(skill.id);
              const available = !skill.dependsOn || unlockedSkills.includes(skill.dependsOn);
              const canAfford = playerStats.grit >= skill.cost;
              return (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  unlocked={unlocked}
                  available={available}
                  canAfford={canAfford}
                  onPurchase={() => purchaseSkill(skill.id, skill.cost)}
                />
              );
            })}
          </div>
        )}

        {activeTab === 'COMMANDS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {[
              { cmd: "🐾 GO", desc: 'Click the "🐾" paw or look ahead to start walking. Buster follows your gaze.' },
              { cmd: "🪢 TUG", desc: "When Buster stops or pulls, click the paw to gently reel him in (0.35m recall)." },
              { cmd: "🐕 COME", desc: "A focused recall. Brings Buster back to your side at high speed. (Unlocks via Skills)" },
              { cmd: "🛑 SIT", desc: "Command Buster to sit and wait. Useful for managing tension or taking a break." },
              { cmd: "🏠 RETURN", desc: "End the walk early from the HUD to bank your current Grit and XP." },
            ].map((item) => (
              <div key={item.cmd} style={{ borderBottom: '3px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                <div style={{ fontWeight: '900', fontSize: '28px', color: '#2c3e50', marginBottom: '10px' }}>{item.cmd}</div>
                <div style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: '20px', fontSize: '16px', fontStyle: 'italic', opacity: 0.6, textAlign: 'center' }}>
              * Commands are more effective as BOND and WALKER RANK increase.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
