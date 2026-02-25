import { useMemo } from 'react';
import { Vector3, CatmullRomCurve3, Color } from 'three';
import { Line } from '@react-three/drei';

export const LeashModel = ({ nodes, tension }: { nodes: Vector3[], tension: number }) => {
  const curve = useMemo(() => new CatmullRomCurve3(nodes), [nodes]);
  const color = useMemo(() => {
    const c = new Color('#111');
    const tensionColor = tension > 0.9 ? new Color('#ff0000') : tension > 0.75 ? new Color('#ffff00') : new Color('#44ff44');
    return c.lerp(tensionColor, Math.pow(tension, 2));
  }, [tension]);
  return <Line points={curve.getPoints(30)} color={color} lineWidth={4} />;
};
