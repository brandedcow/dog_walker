import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, MathUtils } from "three";
import { Box, Billboard, Text } from "@react-three/drei";
import { useGameStore } from "../../../store/useGameStore";

export const TrainingManual = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const {
    menuState,
    setMenuState,
  } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const coverRef = useRef<any>(null);
  const isOpen = menuState === "TRAINING";

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

        {/* Top Page Physical Texture */}
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
    </group>
  );
};
