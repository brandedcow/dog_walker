import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HUD } from './HUD';
import { useGameStore } from '../../store/useGameStore';
import { GameState, MenuState } from '../../types';

// Mock sub-components to focus on HUD logic
vi.mock('./SmartwatchMinimap', () => ({
  SmartwatchMinimap: () => <div data-testid="minimap" />
}));
vi.mock('./ProfileCard', () => ({
  ProfileCard: () => <div data-testid="profile-card" />
}));
vi.mock('./PawControls', () => ({
  PawControls: ({ handleGo }: { handleGo: () => void }) => (
    <button data-testid="paw-controls" onClick={handleGo}>PAW</button>
  )
}));
vi.mock('./TrainingOverlay', () => ({
  TrainingOverlay: () => <div data-testid="training-overlay" />
}));

describe('HUD Component', () => {
  const handleGo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: GameState.HOME,
      menuState: MenuState.IDLE,
      isMenuReady: false,
      positions: { px: 0, pz: 0, dx: 0, dz: -1 },
    });
  });

  it('renders correctly in HOME state (Idle)', () => {
    render(<HUD handleGo={handleGo} />);
    
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('paw-controls')).toBeInTheDocument();
    expect(screen.queryByText(/RETURN HOME/i)).not.toBeInTheDocument();
  });

  it('renders PLAYING state UI elements', () => {
    useGameStore.setState({ gameState: GameState.PLAYING });
    render(<HUD handleGo={handleGo} />);
    
    expect(screen.getByTestId('minimap')).toBeInTheDocument();
    expect(screen.getByText(/RETURN HOME/i)).toBeInTheDocument();
    expect(screen.getByTestId('paw-controls')).toBeInTheDocument();
  });

  it('triggers finalizeWalk and state change when RETURN HOME is clicked', () => {
    const finalizeWalk = vi.fn();
    useGameStore.setState({ 
      gameState: GameState.PLAYING,
      finalizeWalk 
    });
    
    render(<HUD handleGo={handleGo} />);
    
    const returnBtn = screen.getByText(/RETURN HOME/i);
    fireEvent.click(returnBtn);
    
    expect(finalizeWalk).toHaveBeenCalled();
    expect(useGameStore.getState().gameState).toBe(GameState.FINISHED);
  });

  it('renders TrainingOverlay only when menuState is TRAINING and isMenuReady is true', () => {
    act(() => {
      useGameStore.setState({ 
        gameState: GameState.HOME,
        menuState: MenuState.TRAINING,
        isMenuReady: false 
      });
    });
    
    const { rerender } = render(<HUD handleGo={handleGo} />);
    expect(screen.queryByTestId('training-overlay')).not.toBeInTheDocument();
    
    act(() => {
      useGameStore.setState({ isMenuReady: true });
    });
    
    rerender(<HUD handleGo={handleGo} />);
    expect(screen.getByTestId('training-overlay')).toBeInTheDocument();
  });

  it('hides specific UI elements when in TRAINING menu', () => {
    useGameStore.setState({ 
      gameState: GameState.HOME,
      menuState: MenuState.TRAINING,
      isMenuReady: true 
    });
    
    render(<HUD handleGo={handleGo} />);
    
    // Minimap and ProfileCard should be hidden when training is active
    expect(screen.queryByTestId('minimap')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
  });
});
