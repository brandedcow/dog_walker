import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainingOverlay } from './TrainingOverlay';
import { useGameStore } from '../../store/useGameStore';
import { MenuState } from '../../types';

describe('TrainingOverlay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      menuState: MenuState.TRAINING,
      playerStats: { strength: 1, grit: 100 },
      progression: { walkerRank: 1, xp: 0, skillPoints: 5 },
      unlockedSkills: ['FOUNDATION'],
      attributes: { strength: 1, focus: 1, agility: 1, bond: 1 },
    });
  });

  it('renders correctly and defaults to STATS tab', () => {
    render(<TrainingOverlay />);
    
    expect(screen.getByText(/WALKER RANK/i)).toBeInTheDocument();
    expect(screen.getByText(/STRENGTH/i)).toBeInTheDocument();
    // Match the Grit value specifically by looking for the one that is likely the main display
    const gritDisplay = screen.getAllByText(/100/).find(el => el.textContent?.includes('100 G'));
    expect(gritDisplay).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<TrainingOverlay />);
    
    // Switch to SKILLS tab
    const skillsTab = screen.getByText('SKILLS');
    fireEvent.click(skillsTab);
    
    // Check for Skill Points (5) - find the one that includes "SP"
    const spDisplay = screen.getAllByText(/5/).find(el => el.textContent?.includes('5 SP'));
    expect(spDisplay).toBeInTheDocument();
    
    // Switch to COMMANDS tab
    const commandsTab = screen.getByText('COMMANDS');
    fireEvent.click(commandsTab);
    
    expect(screen.getByText(/GO/i)).toBeInTheDocument();
    expect(screen.getByText(/TUG/i)).toBeInTheDocument();
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
    
    // Switch to SKILLS tab
    const skillsTab = screen.getByText('SKILLS');
    fireEvent.click(skillsTab);
    
    // Find the specific STRENGTH I node (avoiding STRENGTH II)
    const skillNodes = screen.getAllByText(/STRENGTH I/i);
    const strength1 = skillNodes.find(node => node.textContent === 'STRENGTH I');
    if (strength1) fireEvent.click(strength1);
    
    expect(purchaseSkill).toHaveBeenCalled();
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
    
    const skillNodes = screen.getAllByText(/STRENGTH I/i);
    const strength1 = skillNodes.find(node => node.textContent === 'STRENGTH I');
    if (strength1) fireEvent.click(strength1);
    
    expect(purchaseSkill).not.toHaveBeenCalled();
  });
});
