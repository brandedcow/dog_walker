import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, MathUtils } from "three";
import { Box, Html, Billboard, Text } from "@react-three/drei";
import { useGameStore } from "../../../store/useGameStore";
import { SKILLS, type Skill } from "../../../config/skills";
import { CAMERA_TARGETS } from "../../../config/constants";

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
      width: "160px",
      height: "160px",
      background: unlocked ? "#44ff44" : available ? "#4b5320" : "#0a0a0a",
      border: `4px solid ${unlocked ? "#fff" : available ? (canAfford ? "#44ff44" : "#ff4444") : "#222"}`,
      borderRadius: "25px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
      cursor: available && !unlocked && canAfford ? "pointer" : "default",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: available ? 1 : 0.3,
      position: "relative",
      color: unlocked ? "black" : "white",
      pointerEvents: "auto",
      boxShadow: unlocked ? "0 0 20px rgba(68, 255, 68, 0.4)" : "none",
      transform:
        available && !unlocked && canAfford ? "scale(1)" : "scale(0.95)",
    }}
  >
    <div style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "1px" }}>
      {skill.name}
    </div>
    <div
      style={{
        fontSize: "12px",
        opacity: 0.8,
        marginTop: "10px",
        lineHeight: "1.2",
      }}
    >
      {skill.desc}
    </div>
    {!unlocked && available && (
      <div
        style={{
          fontSize: "14px",
          fontWeight: "900",
          marginTop: "12px",
          color: canAfford ? "#44ff44" : "#ff4444",
        }}
      >
        {skill.cost}G
      </div>
    )}
    {unlocked && (
      <div
        style={{
          position: "absolute",
          top: "5px",
          right: "8px",
          fontSize: "10px",
        }}
      >
        ✓
      </div>
    )}
  </div>
);

export const TrainingManual = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const {
    menuState,
    setMenuState,
    playerStats,
    unlockedSkills,
    purchaseSkill,
    attributes,
    progression,
  } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"STATS" | "SKILLS" | "COMMANDS">(
    "STATS",
  );
  const { camera, size } = useThree();
  const groupRef = useRef<any>(null);
  const coverRef = useRef<any>(null);
  const isOpen = menuState === "TRAINING";

  // Dynamic scaling based on screen width/height to keep UI sharp
  const aspect = size.width / size.height;
  const isPortrait = aspect < 1.0;
  const dynamicDistanceFactor = isPortrait ? 0.32 : 0.38;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Gaze-based focus detection
    if (!isOpen) {
      const worldPos = new Vector3();
      groupRef.current.getWorldPosition(worldPos);
      const viewPos = worldPos.clone().project(camera);
      const isCenter = Math.abs(viewPos.x) < 0.2 && Math.abs(viewPos.y) < 0.2;
      const isInFront = viewPos.z < 1.0;
      setFocused(isCenter && isInFront);
    }

    // Cover Flip Animation
    if (coverRef.current) {
      const targetRotation = isOpen ? -Math.PI * 0.9 : 0;
      coverRef.current.rotation.z = MathUtils.lerp(
        coverRef.current.rotation.z,
        targetRotation,
        delta * 10,
      );
    }

    // Synchronize UI visibility with camera and cover animation
    const target = CAMERA_TARGETS.TRAINING;
    const aspect = size.width / size.height;
    let zOffset = 0;
    if (aspect < 1.1) {
      zOffset = (1.1 - aspect) * 0.85;
    }
    const targetPos = new Vector3(
      target.pos[0],
      target.pos[1] + zOffset,
      target.pos[2],
    );
    const isCameraClose = camera.position.distanceTo(targetPos) < 0.15;
    const isCoverOpen =
      coverRef.current && coverRef.current.rotation.z < -Math.PI * 0.8;

    if (isOpen && isCameraClose && isCoverOpen) {
      if (!uiVisible) setUiVisible(true);
    } else if (!isOpen) {
      if (uiVisible) setUiVisible(false);
    }
  });

  return (
    <group
      position={position}
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOpen) setMenuState("TRAINING");
      }}
    >
      {/* Physical Notebook Model */}
      <group>
        {/* Back Cover */}
        <Box args={[0.5, 0.05, 0.7]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#4b5320"
            emissive={isOpen ? "#44ff44" : hovered ? "#ffffff" : "#000000"}
            emissiveIntensity={isOpen ? 0.2 : hovered ? 0.1 : 0}
          />
        </Box>

        {/* Pages */}
        <Box args={[0.48, 0.04, 0.68]} position={[0, 0.03, 0]} receiveShadow>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </Box>

        {/* Top Page Physical Texture (Visible while opening) */}
        <mesh
          position={[0, 0.0505, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.48, 0.68]} />
          <meshStandardMaterial
            transparent
            opacity={1.0}
            polygonOffset
            polygonOffsetFactor={-1}
            emissive="#ffffff"
            emissiveIntensity={0.05}
          >
            <canvasTexture
              attach="map"
              image={(function () {
                const canvas = document.createElement("canvas");
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 512, 512);

                // Ruled lines
                ctx.strokeStyle = "#abced4";
                ctx.lineWidth = 1;
                for (let i = 0; i < 512; i += 24) {
                  ctx.beginPath();
                  ctx.moveTo(0, i);
                  ctx.lineTo(512, i);
                  ctx.stroke();
                }

                // Margin
                ctx.strokeStyle = "#ffbaba";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(80, 0);
                ctx.lineTo(80, 512);
                ctx.stroke();

                return canvas;
              })()}
            />
          </meshStandardMaterial>
        </mesh>

        {/* Front Cover with Pivot at Binding */}
        <group position={[-0.25, 0.05, 0]} ref={coverRef}>
          <group position={[0.25, 0.005, 0]}>
            <Box args={[0.5, 0.01, 0.7]} castShadow receiveShadow>
              <meshStandardMaterial
                color="#4b5320"
                emissive={hovered && !isOpen ? "#ffffff" : "#000000"}
                emissiveIntensity={0.1}
              />
            </Box>
            {/* Title on physical cover */}
            <Text
              position={[0, 0.006, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.035}
              color="#ffd700"
              fontStyle="italic"
              fontWeight="900"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.4}
              textAlign="center"
            >
              TRAINING{"\n"}NOTES
            </Text>
            {/* Decorative line */}
            <Box args={[0.3, 0.001, 0.005]} position={[0, 0.006, 0.08]}>
              <meshStandardMaterial color="#ffd700" transparent opacity={0.6} />
            </Box>
          </group>
        </group>

        {/* Spiral Binding */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[-0.26, 0.03, -0.3 + i * 0.055]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.03, 0.005, 8, 16]} />
            <meshStandardMaterial
              color="#888"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {(hovered || focused) && !isOpen && (
        <Billboard position={[0, 0.5, 0]}>
          <Text
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="bottom"
            renderOrder={100}
            outlineWidth={0.015}
            outlineColor="#222222"
            outlineOpacity={0.8}
          >
            TRAINING MANUAL
            <meshBasicMaterial depthTest={false} toneMapped={false} />
          </Text>
        </Billboard>
      )}

      {uiVisible && (
        <Html
          position={[0, 0.051, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          occlude
          distanceFactor={dynamicDistanceFactor}
        >
          <div
            style={{
              width: "850px",
              height: isPortrait ? "1050px" : "1150px",
              background: "transparent",
              border: "none",
              padding: isPortrait
                ? "40px 30px 30px 105px"
                : "55px 45px 30px 130px",
              color: "#2c3e50",
              fontFamily: '"Courier New", Courier, monospace',
              display: "flex",
              flexDirection: "column",
              boxShadow: "none",
              pointerEvents: "auto",
              userSelect: "none",
              overflow: "visible",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {/* Side Tabs (Positioned just off the notebook edge) */}
            <div
              style={{
                position: "absolute",
                right: "-70px",
                top: "0px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {["STATS", "SKILLS", "COMMANDS"].map((tab) => (
                <div
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab as any);
                  }}
                  style={{
                    width: "60px",
                    height: "110px",
                    background: activeTab === tab ? "#ffffff" : "#d1cdb0",
                    border: "1px solid #bcba9a",
                    borderLeft: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "0 15px 15px 0",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow:
                      activeTab === tab
                        ? "4px 2px 10px rgba(0,0,0,0.12)"
                        : "2px 1px 4px rgba(0,0,0,0.08)",
                    color: activeTab === tab ? "#2c3e50" : "#6e6c56",
                    transition: "all 0.2s",
                    paddingLeft: "3px",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "35px",
                borderBottom: "3px solid #2c3e50",
                paddingBottom: "15px",
                position: "relative",
                marginRight: "10px",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "900" }}>
                {activeTab === "STATS"
                  ? "DASHBOARD"
                  : activeTab === "SKILLS"
                    ? "FIELD NOTES"
                    : "COMMANDS"}
              </h1>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div style={{ fontSize: "14px", opacity: 0.7 }}>
                    GRIT CACHE:
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#2e7d32",
                    }}
                  >
                    {playerStats.grit} G
                  </div>
                </div>
                {activeTab === "SKILLS" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "14px", opacity: 0.7 }}>
                      SKILL POINTS:
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#d32f2f",
                      }}
                    >
                      {progression.skillPoints} SP
                    </div>
                  </div>
                )}
              </div>
            </div>

            {activeTab === "STATS" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                  flex: 1,
                }}
              >
                {/* XP & Rank */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    padding: "20px",
                    borderRadius: "15px",
                    border: "2px dashed #2c3e50",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "900", fontSize: "18px" }}>
                      WALKER RANK {progression.walkerRank}
                    </span>
                    <span style={{ fontSize: "14px" }}>
                      {progression.xp % 1000}/1000 XP
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "12px",
                      background: "#e0e0e0",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(progression.xp % 1000) / 10}%`,
                        height: "100%",
                        background: "#2c3e50",
                      }}
                    />
                  </div>
                </div>

                {/* Attributes */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {[
                    {
                      label: "STRENGTH",
                      value: attributes.strength,
                      color: "#d32f2f",
                      desc: "Strain threshold",
                    },
                    {
                      label: "FOCUS",
                      value: attributes.focus,
                      color: "#1976d2",
                      desc: "Grit & Pan stability",
                    },
                    {
                      label: "AGILITY",
                      value: attributes.agility,
                      color: "#388e3c",
                      desc: "Movement speed",
                    },
                    {
                      label: "BOND",
                      value: attributes.bond,
                      color: "#fbc02d",
                      desc: "Recall & Calmness",
                    },
                  ].map((attr) => (
                    <div key={attr.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "16px",
                          marginBottom: "5px",
                        }}
                      >
                        <span style={{ fontWeight: "900" }}>{attr.label}</span>
                        <span style={{ fontWeight: "900" }}>
                          LVL {attr.value}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "16px",
                          background: "#e0e0e0",
                          borderRadius: "4px",
                          border: "1.5px solid #2c3e50",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: `${(attr.value / 10) * 100}%`,
                            height: "100%",
                            background: attr.color,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          opacity: 0.6,
                          marginTop: "4px",
                        }}
                      >
                        {attr.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "SKILLS" ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                  justifyContent: "flex-start",
                  alignContent: "flex-start",
                }}
              >
                {SKILLS.map((skill) => {
                  const unlocked = unlockedSkills.includes(skill.id);
                  const available =
                    !skill.dependsOn ||
                    unlockedSkills.includes(skill.dependsOn);
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
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                  flex: 1,
                }}
              >
                {[
                  {
                    cmd: "🐾 GO",
                    desc: 'Click the "🐾" paw or look ahead to start walking. Buster follows your gaze.',
                  },
                  {
                    cmd: "🪢 TUG",
                    desc: "When Buster stops or pulls, click the paw to gently reel him in (0.35m recall).",
                  },
                  {
                    cmd: "🐕 COME",
                    desc: "A focused recall. Brings Buster back to your side at high speed. (Unlocks via Skills)",
                  },
                  {
                    cmd: "🛑 SIT",
                    desc: "Command Buster to sit and wait. Useful for managing tension or taking a break.",
                  },
                  {
                    cmd: "🏠 RETURN",
                    desc: "End the walk early from the HUD to bank your current Grit and XP.",
                  },
                ].map((item) => (
                  <div
                    key={item.cmd}
                    style={{
                      borderBottom: "2px solid rgba(0,0,0,0.1)",
                      paddingBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "900",
                        fontSize: "22px",
                        color: "#2c3e50",
                        marginBottom: "8px",
                      }}
                    >
                      {item.cmd}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        opacity: 0.8,
                        lineHeight: "1.4",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: "auto",
                    fontSize: "14px",
                    fontStyle: "italic",
                    opacity: 0.5,
                    textAlign: "center",
                  }}
                >
                  * Commands are more effective as BOND and WALKER RANK
                  increase.
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
