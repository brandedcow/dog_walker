import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, NearestFilter } from 'three';

export const useFloorTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const colors = ["#ab8d67", "#b89b72", "#8c7150", "#a68862"];
    const rows = 16;
    const rowHeight = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
      const isStaggered = r % 2 === 0;
      const xOffset = isStaggered ? 64 : 0;
      const boardWidth = 128;
      const boardsPerRow = (canvas.width / boardWidth) + 1;

      for (let c = 0; c < boardsPerRow; c++) {
        const x = (c * boardWidth + xOffset) % (canvas.width + boardWidth) - boardWidth/2;
        
        ctx.fillStyle = colors[(r + c) % colors.length];
        ctx.fillRect(x, r * rowHeight, boardWidth, rowHeight);
        
        ctx.strokeStyle = "#7a5f41";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, r * rowHeight, boardWidth, rowHeight);
      }
    }

    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.magFilter = NearestFilter;
    return tex;
  }, []);
};
