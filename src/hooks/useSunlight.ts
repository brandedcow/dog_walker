import { useState, useEffect } from 'react';

export interface SunlightState {
  position: [number, number, number];
  intensity: number;
  color: string;
}

export const useSunlight = () => {
  const [sunlight, setSunlight] = useState<SunlightState>({ 
    position: [100, 20, 100], 
    intensity: 1.0,
    color: "#ffffff"
  });

  useEffect(() => {
    const updateSun = () => {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      const angle = (hours / 24) * Math.PI * 2 - Math.PI / 2;
      
      const sunY = Math.sin(angle);
      const sunZ = Math.cos(angle);
      const sunX = 0.5;

      let intensity = Math.max(0.1, sunY + 0.3) * 1.5;
      let color = "#ffffff";

      if (sunY < -0.1) {
        intensity = 0.15;
        color = "#8899ff";
      } else if (sunY < 0.2) {
        color = "#ffccaa";
      }

      setSunlight({
        position: [sunX * 100, sunY * 100, sunZ * 100],
        intensity,
        color
      });
    };

    updateSun();
    const interval = setInterval(updateSun, 60000);
    return () => clearInterval(interval);
  }, []);

  return sunlight;
};
