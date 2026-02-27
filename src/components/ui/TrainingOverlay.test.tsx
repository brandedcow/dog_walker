import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainingOverlay } from './TrainingOverlay';
import { useGameStore } from '../../store/useGameStore';
import { MenuState, ResonanceType } from '../../types';

describe('TrainingOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      menuState: MenuState.TRAINING,
      playerStats: { strength: 1, grit: 100 },
      playerName: 'TEST WALKER',
      race: 'Human' as any,
      progression: { walkerRank: 1, xp: 0, skillPoints: 5 },
      unlockedSkills: ['FOUNDATION'],
      resonanceType: ResonanceType.ANCHOR,
      traits: { strength: 4, bond: 2, focus: 2, awareness: 2, speed: 1, mastery: 1 }
    });
  });

  it('renders correctly and defaults to STATS tab', () => {
    render(<TrainingOverlay />);
    
    expect(screen.getAllByText('STATS')[0]).toBeInTheDocument();
    expect(screen.getByText('TEST WALKER')).toBeInTheDocument();
    expect(screen.getByText('TRAITS')).toBeInTheDocument();
  });

  it('switches to RESONANCE tab and shows progress', () => {
    render(<TrainingOverlay />);
    
    const resonanceTab = screen.getByText('RESONANCE');
    fireEvent.click(resonanceTab);
    
    expect(screen.getByText(/RANK 1 PROGRESS/i)).toBeInTheDocument();
    expect(screen.getAllByText(/4.0/i).length).toBeGreaterThan(0);
  });

  it('switches between tabs', () => {
    render(<TrainingOverlay />);
    
    const skillsTab = screen.getByText('SKILLS');
    fireEvent.click(skillsTab);
    
    expect(screen.getAllByText(/STRENGTH/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/BOND/i)[0]).toBeInTheDocument();
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
    const purchaseSkill = vi.fn().mockReturnValue(true);
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
