import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainingOverlay } from './TrainingOverlay';
import { useGameStore } from '../../store/useGameStore';
import { MenuState, Race } from '../../types';

describe('TrainingOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      menuState: MenuState.TRAINING,
      playerStats: { strength: 1, grit: 100 },
      progression: { walkerRank: 1, xp: 0, skillPoints: 5 },
      unlockedSkills: ['FOUNDATION'],
      race: Race.HUMAN,
      attributes: { strength: 2, agility: 2, focus: 2, bond: 3 }
    });
  });

  it('renders correctly and defaults to STATS tab', () => {
    render(<TrainingOverlay />);
    
    expect(screen.getAllByText('STATS')[0]).toBeInTheDocument();
    expect(screen.getByText('WALKER RANK 1')).toBeInTheDocument();
    expect(screen.getAllByText('LEVEL 2').length).toBeGreaterThan(0); // Human base levels
  });

  it('switches between tabs', () => {
    render(<TrainingOverlay />);
    
    const skillsTab = screen.getByText('SKILLS');
    fireEvent.click(skillsTab);
    
    expect(screen.getByText(/HANDLER/i)).toBeInTheDocument();
    expect(screen.getByText(/ATHLETE/i)).toBeInTheDocument();
  });

  it('calls setMenuState(IDLE) when close button is clicked', () => {
    const setMenuState = vi.fn();
    useGameStore.setState({ setMenuState });
    
    render(<TrainingOverlay />);
    
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    
    expect(setMenuState).toHaveBeenCalledWith(MenuState.IDLE);
  });

  it('renders skill nodes and allows purchasing', () => {
    const purchaseSkill = vi.fn();
    useGameStore.setState({ purchaseSkill });
    
    render(<TrainingOverlay />);
    
    // Switch to skills
    fireEvent.click(screen.getByText('SKILLS'));
    
    // Find the Power Grip node
    const powerGrip = screen.getByText('Power Grip');
    fireEvent.click(powerGrip);
    
    // Check if purchase was called with correct args (STR_1, 50G, 1SP)
    expect(purchaseSkill).toHaveBeenCalledWith('STR_1', 50, 1);
  });

  it('prevents purchasing if insufficient resources', () => {
    const purchaseSkill = vi.fn();
    useGameStore.setState({ 
      purchaseSkill,
      playerStats: { strength: 1, grit: 0 },
      progression: { walkerRank: 1, xp: 0, skillPoints: 0 }
    });
    
    render(<TrainingOverlay />);
    
    fireEvent.click(screen.getByText('SKILLS'));
    
    const powerGrip = screen.getByText('Power Grip');
    fireEvent.click(powerGrip);
    
    // Should NOT have been called
    expect(purchaseSkill).not.toHaveBeenCalled();
  });
});
