import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { MenuState } from '../../types';
import { CAMERA_TARGETS } from '../../config/constants';

export const useMenuCamera = () => {
  const { camera, size } = useThree();
  const menuState = useGameStore((state) => state.menuState);
  const setIsMenuReady = useGameStore((state) => state.setIsMenuReady);
  const isMenuReady = useGameStore((state) => state.isMenuReady);

  const targetPos = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const targetQuaternion = useRef(new Quaternion());

  useFrame((_, delta) => {
    const { menuState, isMenuReady, setIsMenuReady } = useGameStore.getState();
    if (menuState === MenuState.IDLE) return;
    
    const config = CAMERA_TARGETS[menuState] || CAMERA_TARGETS.IDLE;
    const aspect = size.width / size.height;
    
    // Dynamic Zoom for Training Manual on mobile/narrow screens
    let zOffset = 0;
    if (menuState === MenuState.TRAINING && aspect < 1.1) {
      zOffset = (1.1 - aspect) * 0.85; 
    }

    targetPos.current.set(config.pos[0], config.pos[1] + zOffset, config.pos[2]);
    targetLookAt.current.set(config.lookAt[0], config.lookAt[1], config.lookAt[2]);

    // 1. Position Interpolation with Threshold
    const dist = camera.position.distanceTo(targetPos.current);
    if (dist > 0.005) {
      camera.position.lerp(targetPos.current, delta * 6);
    } else {
      camera.position.copy(targetPos.current);
    }

    // 2. Rotation Interpolation with Threshold
    const oldQuaternion = camera.quaternion.clone();
    camera.lookAt(targetLookAt.current);
    targetQuaternion.current.copy(camera.quaternion);
    camera.quaternion.copy(oldQuaternion);

    const angleDist = camera.quaternion.angleTo(targetQuaternion.current);
    if (angleDist > 0.005) {
      camera.quaternion.slerp(targetQuaternion.current, delta * 6);
    } else {
      camera.quaternion.copy(targetQuaternion.current);
    }

    // Notify store when stable
    if (dist <= 0.01 && angleDist <= 0.01 && !isMenuReady) {
      setIsMenuReady(true);
    }
  });
};
