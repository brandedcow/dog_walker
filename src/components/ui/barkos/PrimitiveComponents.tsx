import React from 'react';

interface HUDContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  scale?: number;
  origin?: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center';
}

export const HUDContainer: React.FC<HUDContainerProps> = ({ 
  children, 
  style = {}, 
  scale = 1.0, 
  origin = 'center' 
}) => {
  return (
    <div style={{
      ...style,
      transform: `scale(${scale})`,
      transformOrigin: origin,
      zIndex: 10,
    }}>
      {children}
    </div>
  );
};

interface HUDButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'circle';
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

export const HUDButton: React.FC<HUDButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  style = {},
  onMouseDown,
  onMouseUp
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circle':
        return {
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          fontSize: '32px',
          justifyContent: 'center',
          padding: 0,
        };
      case 'secondary':
        return {
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid white',
          borderRadius: '12px',
        };
      default:
        return {
          background: '#44ff44',
          color: 'black',
          border: 'none',
          borderRadius: '15px',
          boxShadow: '0 10px 20px rgba(68, 255, 68, 0.2)',
        };
    }
  };

  return (
    <button 
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'transform 0.1s active',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </button>
  );
};
