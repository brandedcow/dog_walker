import { useRef } from 'react';
import { Vector3 } from 'three';
import { DOG_MOVE_SPEED } from '../../config/constants';
import type { DogState } from '../../store/useGameStore';

export const useDogAI = () => {
  const dogPos = useRef(new Vector3(0, 0, -1));
  const dogFacingYaw = useRef(0);
  const dogDistance = useRef(0);
  const lastDogUpdatePos = useRef(new Vector3(0, 0, -1));
  const stationaryTime = useRef(0);
  const idleTarget = useRef<Vector3 | null>(null);

  const update = (
    delta: number, 
    playerPos: Vector3, 
    dogState: DogState, 
    setDogState: (s: DogState) => void
  ) => {
    // Idling logic
    if (dogState === 'STANDING') {
      stationaryTime.current += delta;
      if (stationaryTime.current > 5.0) {
        setDogState('IDLING');
        idleTarget.current = null;
      }
    } else if (dogState === 'IDLING') {
      if (!idleTarget.current || dogPos.current.distanceTo(idleTarget.current) < 0.1) {
        const currentAngle = Math.atan2(dogPos.current.z - playerPos.z, dogPos.current.x - playerPos.x);
        const targetAngle = currentAngle + (Math.random() - 0.5) * Math.PI;
        const idleDist = 1.2 + Math.random() * 1.3;
        idleTarget.current = new Vector3(playerPos.x + Math.cos(targetAngle) * idleDist, 0, playerPos.z + Math.sin(targetAngle) * idleDist);
      }
      const moveDir = new Vector3().subVectors(idleTarget.current, dogPos.current).normalize();
      dogPos.current.add(moveDir.multiplyScalar(0.5 * delta));
      if (dogPos.current.distanceTo(new Vector3(playerPos.x, 0, playerPos.z)) < 0.8) {
        const pushDir = new Vector3().subVectors(dogPos.current, new Vector3(playerPos.x, 0, playerPos.z)).normalize();
        dogPos.current.add(pushDir.multiplyScalar(0.05));
        idleTarget.current = null;
      }
    } else if (dogState === 'COMING') {
      const targetPos = playerPos.clone();
      targetPos.y = 0;
      const dir = new Vector3().subVectors(targetPos, dogPos.current);
      if (dir.length() < 1.2) {
        setDogState('STANDING');
        stationaryTime.current = 0;
      } else {
        dogPos.current.add(dir.normalize().multiplyScalar(12.0 * delta));
      }
    } else if (dogState === 'WALKING') {
      const moveX = Math.sin(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      const moveZ = -Math.cos(dogFacingYaw.current) * DOG_MOVE_SPEED * delta;
      dogPos.current.x += moveX;
      dogPos.current.z += moveZ;
    }

    // Distance tracking
    if (dogState === 'WALKING') {
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

  return { dogPos, dogDistance, update, startWalking };
};
