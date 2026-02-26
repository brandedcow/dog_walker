import { useRef } from 'react';
import { Vector3 } from 'three';
import { DOG_MOVE_SPEED } from '../../config/constants';
import { DogState } from '../../types';
import type { ResonanceTraits } from '../../types';

export const useDogAI = () => {
  const dogPos = useRef(new Vector3(1.0, 0, 2.0));
  const dogFacingYaw = useRef(0);
  const dogDistance = useRef(0);
  const lastDogUpdatePos = useRef(new Vector3(0, 0, -1));
  const stationaryTime = useRef(0);
  const idleTarget = useRef<Vector3 | null>(null);
  const currentRotation = useRef(0);

  const update = (
    delta: number, 
    playerPos: Vector3, 
    dogState: DogState, 
    setDogState: (s: DogState) => void,
    unlockedSkills: string[] = [],
    traits: ResonanceTraits = { strength: 1, bond: 1, awareness: 1, speed: 1, mastery: 1 }
  ) => {
    const prevDogPos = dogPos.current.clone();

    // Base recall speed (12.0) + skill bonuses + Bond bonus (1.5 per level)
    let recallSpeed = 12.0 + (traits.bond * 1.5);
    if (unlockedSkills.includes('RECALL_1')) recallSpeed += 1.5;
    if (unlockedSkills.includes('RECALL_2')) recallSpeed += 3.0;

    const furnitureZones = [
      { minX: -3.5, maxX: -0.5, minZ: -4.0, maxZ: -2.5 }, // Desk Area
      { minX: 2.0, maxX: 4.5, minZ: -4.0, maxZ: -2.8 },  // Closet Area
      { minX: 0.5, maxX: 5.0, minZ: 2.8, maxZ: 5.0 },   // Bed Area
      { minX: 4.0, maxX: 5.0, minZ: 1.5, maxZ: 2.5 },   // Nightstand Area
      { minX: -1.6, maxX: -0.2, minZ: 4.5, maxZ: 5.0 }, // Trophy Shelf Area
    ];

    const checkCollision = (pos: Vector3) => {
      for (const zone of furnitureZones) {
        if (pos.x >= zone.minX && pos.x <= zone.maxX && 
            pos.z >= zone.minZ && pos.z <= zone.maxZ) {
          return true;
        }
      }
      return false;
    };

    // Idling logic
    if (dogState === DogState.STANDING) {
      stationaryTime.current += delta;
      if (stationaryTime.current > 5.0) {
        setDogState(DogState.IDLING);
        idleTarget.current = null;
      }
    } else if (dogState === DogState.IDLING) {
      if (!idleTarget.current || dogPos.current.distanceTo(idleTarget.current) < 0.1) {
        const currentAngle = Math.atan2(dogPos.current.z - playerPos.z, dogPos.current.x - playerPos.x);
        const targetAngle = currentAngle + (Math.random() - 0.5) * Math.PI;
        const idleDist = 1.2 + Math.random() * 1.3;
        const candidate = new Vector3(
          playerPos.x + Math.cos(targetAngle) * idleDist, 
          0, 
          playerPos.z + Math.sin(targetAngle) * idleDist
        );
        
        // Ensure idle target isn't inside furniture or walls
        if (!checkCollision(candidate)) {
          idleTarget.current = candidate;
        } else {
          idleTarget.current = null; // Re-roll next frame
        }
      }

      if (idleTarget.current) {
        const moveDir = new Vector3().subVectors(idleTarget.current, dogPos.current).normalize();
        const nextPos = dogPos.current.clone().add(moveDir.multiplyScalar(0.5 * delta));
        
        if (!checkCollision(nextPos)) {
          dogPos.current.copy(nextPos);
        } else {
          idleTarget.current = null; // Stop and re-roll
        }
      }

      // Clamp to Room Boundaries (10x8 room)
      dogPos.current.x = Math.max(-4.5, Math.min(4.5, dogPos.current.x));
      dogPos.current.z = Math.max(-3.5, Math.min(4.5, dogPos.current.z));

      if (dogPos.current.distanceTo(new Vector3(playerPos.x, 0, playerPos.z)) < 0.8) {
        const pushDir = new Vector3().subVectors(dogPos.current, new Vector3(playerPos.x, 0, playerPos.z)).normalize();
        dogPos.current.add(pushDir.multiplyScalar(0.05));
        idleTarget.current = null;
      }
    } else if (dogState === DogState.COMING) {
      const targetPos = playerPos.clone();
      targetPos.y = 0;
      const dir = new Vector3().subVectors(targetPos, dogPos.current);
      if (dir.length() < 1.2) {
        setDogState(DogState.STANDING);
        stationaryTime.current = 0;
      } else {
        dogPos.current.add(dir.normalize().multiplyScalar(recallSpeed * delta));
      }
    } else if (dogState === DogState.WALKING) {
      const moveX = Math.sin(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      const moveZ = -Math.cos(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      dogPos.current.x += moveX;
      dogPos.current.z += moveZ;
    }

    // Rotation logic (calculated after position update to capture displacement)
    if (dogState === DogState.WALKING || dogState === DogState.COMING || dogState === DogState.IDLING) {
      const moveX = dogPos.current.x - prevDogPos.x;
      const moveZ = dogPos.current.z - prevDogPos.z;
      const movementLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
      
      if (movementLength > 0.0001) {
        const targetRot = Math.atan2(moveX, moveZ);
        // Smoothly interpolate towards target rotation
        let angleDiff = targetRot - currentRotation.current;
        // Normalize angle to -PI to PI
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        
        currentRotation.current += angleDiff * 0.1;
      }
    }

    // Distance tracking
    if (dogState === DogState.WALKING) {
      const distFromLastUpdate = new Vector3(dogPos.current.x, 0, dogPos.current.z).distanceTo(lastDogUpdatePos.current);
      if (distFromLastUpdate > 0.25) {
        dogDistance.current += distFromLastUpdate;
        lastDogUpdatePos.current.copy(dogPos.current);
      }
    }

    return { dogPos: dogPos.current, dogDistance: dogDistance.current };
  };

  const startWalking = (yaw: number) => {
    dogFacingYaw.current = yaw;
    stationaryTime.current = 0;
  };

  return { dogPos, dogDistance, currentRotation, update, startWalking };
};
