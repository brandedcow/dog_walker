import { useMemo, useRef, useEffect } from 'react';
import { InstancedMesh, Object3D } from 'three';

export const InstancedTrees = ({ count = 40 }: { count?: number }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const foliageRef = useRef<InstancedMesh>(null);

  const treePositions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      pos: [(i % 2 === 0 ? 6 : -6), 0, -i * 12] as [number, number, number]
    }));
  }, [count]);

  useEffect(() => {
    if (!meshRef.current || !foliageRef.current) return;
    
    const tempObject = new Object3D();
    
    treePositions.forEach((tree, i) => {
      // Trunk
      tempObject.position.set(tree.pos[0], 1.5, tree.pos[2]);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(i, tempObject.matrix);

      // Foliage
      tempObject.position.set(tree.pos[0], 4, tree.pos[2]);
      tempObject.updateMatrix();
      foliageRef.current?.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
  }, [treePositions]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[0.5, 3, 0.5]} />
        <meshStandardMaterial color="#5d4037" />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, count]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#2e7d32" />
      </instancedMesh>
    </group>
  );
};
