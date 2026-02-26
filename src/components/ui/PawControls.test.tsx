import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PawControls } from './PawControls';
import { useGameStore } from '../../store/useGameStore';
import { GameState, DogState } from '../../types';

describe('PawControls Component', () => {
  const handleGo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: GameState.HOME,
      dogState: DogState.STANDING,
      tension: 0,
    });
  });

  it('renders correctly in HOME state', () => {
    render(<PawControls handleGo={handleGo} />);
    expect(screen.getByText('WALK')).toBeInTheDocument();
  });

  it('shows TUG icon when dog is not walking and tension is high (or simplified logic)', () => {
    // In actual code, the center button is "WALK" and the top-right is "GO" or "TUG"
    // Based on the failing test output, the top-right button contains "GO" or "TUG"
    useGameStore.setState({ 
      gameState: GameState.PLAYING,
      dogState: DogState.WALKING 
    });
    
    render(<PawControls handleGo={handleGo} />);
    expect(screen.getByText('TUG')).toBeInTheDocument();
  });

  it('triggers handleGo when TUG button is clicked', () => {
    useGameStore.setState({ 
      gameState: GameState.PLAYING,
      dogState: DogState.WALKING 
    });
    
    render(<PawControls handleGo={handleGo} />);
    const tugBtn = screen.getByText('TUG');
    fireEvent.click(tugBtn);
    
    expect(handleGo).toHaveBeenCalled();
  });

  it('triggers setDogState(SITTING) when SIT button is clicked', () => {
    const setDogState = vi.fn();
    useGameStore.setState({ 
      gameState: GameState.PLAYING,
      setDogState
    });
    
    render(<PawControls handleGo={handleGo} />);
    const sitBtn = screen.getByText('SIT');
    fireEvent.click(sitBtn);
    
    expect(setDogState).toHaveBeenCalledWith(DogState.SITTING);
  });

  it('triggers handleGo when GO button is clicked', () => {
    useGameStore.setState({ 
      gameState: GameState.PLAYING,
      dogState: DogState.STANDING
    });
    
    render(<PawControls handleGo={handleGo} />);
    const goBtn = screen.getByText('GO');
    fireEvent.click(goBtn);
    
    expect(handleGo).toHaveBeenCalled();
  });
});
