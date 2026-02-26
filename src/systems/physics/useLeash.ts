import { useRef } from 'react';
import { Vector3 } from 'three';
import { LEASH_NODES, LEASH_FRICTION, LEASH_GRAVITY, LEASH_STIFFNESS, SEGMENT_LENGTH, MAX_LEASH_LENGTH } from '../../config/constants';

export const useLeash = () => {
  const nodes = useRef<Vector3[]>(Array.from({ length: LEASH_NODES }, (_, i) => new Vector3(0, 2 - (i * 0.1), -i * 0.1)));
  const oldNodes = useRef<Vector3[]>(Array.from({ length: LEASH_NODES }, (_, i) => new Vector3(0, 2 - (i * 0.1), -i * 0.1)));
  const tugRecoil = useRef(0);

  const update = (delta: number, playerPos: Vector3, dogPos: Vector3, dogRotation: number) => {
    if (tugRecoil.current > 0) {
      tugRecoil.current *= 0.85;
      if (tugRecoil.current < 0.01) tugRecoil.current = 0;
    }

    const n = nodes.current;
    const on = oldNodes.current;

    // A. Verlet Integration
    for (let i = 1; i < LEASH_NODES - 1; i++) {
      const vx = (n[i].x - on[i].x) * LEASH_FRICTION;
      const vy = (n[i].y - on[i].y) * LEASH_FRICTION;
      const vz = (n[i].z - on[i].z) * LEASH_FRICTION;
      on[i].copy(n[i]);
      n[i].x += vx;
      n[i].y += vy + (LEASH_GRAVITY * delta * delta);
      n[i].z += vz;
    }

    // B. Pinning & Anchors
    const handPos = playerPos.clone().add(new Vector3(0.8, -1.2, -0.5));
    
    // Neck anchor: Apply dog rotation to collar offset [0, 0.3, -0.81] (chest facet)
    const collarOffset = new Vector3(0, 0.3, -0.81);
    collarOffset.applyAxisAngle(new Vector3(0, 1, 0), dogRotation);
    const neckPos = dogPos.clone().add(collarOffset);

    // Hard physical leash constraint: clamp positions before solver
    const distVec = new Vector3(playerPos.x, 0, playerPos.z).distanceTo(new Vector3(dogPos.x, 0, dogPos.z));
    if (distVec > MAX_LEASH_LENGTH) {
      const overshot = distVec - MAX_LEASH_LENGTH;
      const dirToDog = new Vector3().subVectors(dogPos, playerPos).normalize();
      dirToDog.y = 0;
      dogPos.sub(dirToDog.multiplyScalar(overshot));
      // Recalculate neckPos after clamping dogPos
      neckPos.copy(dogPos).add(collarOffset);
    }

    n[0].copy(handPos);
    n[LEASH_NODES - 1].copy(neckPos);

    // Dynamic segment length: leash "contracts" when dog is close
    const stretchFactor = Math.max(0.3, Math.min(1.0, distVec / MAX_LEASH_LENGTH));
    const dynamicSegmentLength = SEGMENT_LENGTH * stretchFactor;

    // C. Distance Constraint Solver
    for (let j = 0; j < LEASH_STIFFNESS; j++) {
      for (let i = 0; i < LEASH_NODES - 1; i++) {
        const n1 = n[i];
        const n2 = n[i + 1];
        const diff = new Vector3().subVectors(n1, n2);
        const d = diff.length();
        if (d > 0.0001) {
          const error = (d - dynamicSegmentLength) / d;
          const correction = diff.multiplyScalar(error * 0.5);
          if (i > 0) n1.sub(correction);
          if (i + 1 < LEASH_NODES - 1) n2.add(correction);
        }
      }
      // Ground collision
      for (let i = 1; i < LEASH_NODES - 1; i++) {
        if (n[i].y < 0.05) n[i].y = 0.05;
      }
      n[0].copy(handPos);
      n[LEASH_NODES - 1].copy(neckPos);
    }

    const rawTension = Math.max(0, Math.min((distVec - 1.5) / (MAX_LEASH_LENGTH - 1.5), 1.0));
    const t = Math.max(0, rawTension - (tugRecoil.current * 0.7));

    return { nodes: n, rawTension, tension: t, tugRecoil: tugRecoil.current };
  };

  const applyTug = () => {
    tugRecoil.current = 1.0;
  };

  return { nodes, tugRecoil, update, applyTug };
};
