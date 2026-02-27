import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KennelOverlay, RecordsOverlay } from './MenuOverlays';
import { useGameStore } from '../../store/useGameStore';
import { MenuState, TrainingLevel, DogCharacteristic, DogSize } from '../../types';

describe('MenuOverlays', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      menuState: MenuState.IDLE,
      dogMetadata: {
        name: 'BUSTER',
        trainingLevel: TrainingLevel.COMPETENT,
        characteristic: DogCharacteristic.ADHD,
        size: DogSize.SMALL,
        mood: 'Happy',
      },
      dogStats: {
        trainingLevel: 1,
        trust: 50,
        recallSpeed: 12.0,
      },
      totalDistanceWalked: 100,
    });
  });

  describe('KennelOverlay', () => {
    it('renders dog metadata correctly', () => {
      render(<KennelOverlay />);
      
      expect(screen.getByText('THE KENNEL')).toBeInTheDocument();
      expect(screen.getByText('BUSTER')).toBeInTheDocument();
      expect(screen.getByText(/LVL 1/)).toBeInTheDocument();
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Happy')).toBeInTheDocument();
      expect(screen.getByText('50 🐾')).toBeInTheDocument();
      expect(screen.getByText(/"ADHD"/)).toBeInTheDocument();
    });

    it('calls setMenuState(IDLE) when CLOSE APP is clicked', () => {
      const setMenuState = vi.fn();
      useGameStore.setState({ setMenuState });
      
      render(<KennelOverlay />);
      
      const closeBtn = screen.getByText('CLOSE APP');
      fireEvent.click(closeBtn);
      
      expect(setMenuState).toHaveBeenCalledWith(MenuState.IDLE);
    });
  });

  describe('RecordsOverlay', () => {
    it('renders distance statistics correctly', () => {
      render(<RecordsOverlay />);
      
      expect(screen.getByText('RECORDS')).toBeInTheDocument();
      expect(screen.getByText('100m')).toBeInTheDocument();
      expect(screen.getByText('TOTAL DISTANCE WALKED')).toBeInTheDocument();
    });

    it('handles progress reset with confirmation', () => {
      const resetProgress = vi.fn();
      const setMenuState = vi.fn();
      useGameStore.setState({ resetProgress, setMenuState });
      
      render(<RecordsOverlay />);
      
      const resetBtn = screen.getByText('RESET ALL PROGRESS');
      
      // First click shows confirmation
      fireEvent.click(resetBtn);
      expect(screen.getByText('ARE YOU SURE? (CLICK AGAIN)')).toBeInTheDocument();
      expect(resetProgress).not.toHaveBeenCalled();
      
      // Second click triggers reset
      fireEvent.click(screen.getByText('ARE YOU SURE? (CLICK AGAIN)'));
      expect(resetProgress).toHaveBeenCalled();
      expect(setMenuState).toHaveBeenCalledWith(MenuState.IDLE);
    });

    it('allows canceling reset confirmation', () => {
      render(<RecordsOverlay />);
      
      fireEvent.click(screen.getByText('RESET ALL PROGRESS'));
      const cancelBtn = screen.getByText('Cancel');
      
      fireEvent.click(cancelBtn);
      expect(screen.getByText('RESET ALL PROGRESS')).toBeInTheDocument();
    });

    it('calls onBack (sets IDLE state)', () => {
      const setMenuState = vi.fn();
      useGameStore.setState({ setMenuState });
      
      render(<RecordsOverlay />);
      
      const backBtn = screen.getByText('BACK TO ROOM');
      fireEvent.click(backBtn);
      
      expect(setMenuState).toHaveBeenCalledWith(MenuState.IDLE);
    });
  });
});
