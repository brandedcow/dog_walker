import { useMemo } from 'react';
import { Vector3, CatmullRomCurve3, Color } from 'three';
import { Line } from '@react-three/drei';

export const LeashModel = ({ nodes, tension }: { nodes: Vector3[], tension: number }) => {
  const curve = useMemo(() => {
    if (nodes.length < 2) return null;
    return new CatmullRomCurve3(nodes);
  }, [nodes]);

  const color = useMemo(() => {
    const c = new Color('#666');
    const tensionColor = tension > 0.9 ? new Color('#ff0000') : tension > 0.75 ? new Color('#ffff00') : new Color('#44ff44');
    return c.lerp(tensionColor, Math.pow(tension, 2));
  }, [tension]);

  if (!curve) return null;

  // Use a key to force re-calculation of points if needed, or just call getPoints
  const points = curve.getPoints(30);

  return <Line points={points} color={color} lineWidth={4} />;
};
