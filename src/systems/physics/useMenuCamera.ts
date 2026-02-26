import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { CAMERA_TARGETS } from '../../config/constants';

export const useMenuCamera = () => {
  const { camera } = useThree();
  const menuState = useGameStore((state) => state.menuState);

  const targetPos = new Vector3();
  const targetLookAt = new Vector3();

  useFrame((_, delta) => {
    if (menuState === 'IDLE') return;
    
    const config = CAMERA_TARGETS[menuState] || CAMERA_TARGETS.IDLE;
    
    targetPos.set(config.pos[0], config.pos[1], config.pos[2]);
    targetLookAt.set(config.lookAt[0], config.lookAt[1], config.lookAt[2]);

    // 1. Interpolate Position
    camera.position.lerp(targetPos, delta * 3);

    // 2. Interpolate Rotation (LookAt)
    const oldQuaternion = camera.quaternion.clone();
    camera.lookAt(targetLookAt);
    const targetQuaternion = camera.quaternion.clone();
    
    // Restore and lerp
    camera.quaternion.copy(oldQuaternion);
    camera.quaternion.slerp(targetQuaternion, delta * 3);
  });
};
