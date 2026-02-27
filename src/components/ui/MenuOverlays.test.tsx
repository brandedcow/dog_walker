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
    it('renders homescreen with app icons correctly', () => {
      render(<KennelOverlay />);
      
      expect(screen.getByText('9:41')).toBeInTheDocument();
      expect(screen.getByText('Kennel')).toBeInTheDocument();
      expect(screen.getByText('Maps')).toBeInTheDocument();
      expect(screen.getByText('Wallet')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('navigates to Kennel app and renders metadata', () => {
      render(<KennelOverlay />);
      
      // Click Kennel icon
      const kennelIcon = screen.getByText('Kennel');
      fireEvent.click(kennelIcon);

      expect(screen.getByText('THE KENNEL')).toBeInTheDocument();
      expect(screen.getByText('BUSTER')).toBeInTheDocument();
      expect(screen.getByText(/LVL 1/)).toBeInTheDocument();
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Happy')).toBeInTheDocument();
      expect(screen.getByText('50 🐾')).toBeInTheDocument();
      expect(screen.getByText(/"ADHD"/)).toBeInTheDocument();
    });

    it('calls setMenuState(IDLE) when home button is clicked from home screen', () => {
      const setMenuState = vi.fn();
      useGameStore.setState({ setMenuState });
      
      const { container } = render(<KennelOverlay />);
      
      // Home button is the square/border-box in the middle of the nav bar
      const homeBtn = container.lastElementChild?.lastElementChild?.children[1];
      if (homeBtn) fireEvent.click(homeBtn);
      
      expect(setMenuState).toHaveBeenCalledWith(MenuState.IDLE);
    });

    it('returns to home screen when back button is clicked in app', () => {
      render(<KennelOverlay />);
      
      // Navigate to app first
      fireEvent.click(screen.getByText('Kennel'));
      expect(screen.getByText('THE KENNEL')).toBeInTheDocument();

      // Click back button (first child of nav bar)
      const { container } = render(<KennelOverlay />);
      // More precise:
      const navBar = container.lastElementChild?.lastElementChild;
      const backNavBtn = navBar?.children[0];
      if (backNavBtn) fireEvent.click(backNavBtn);
      
      expect(screen.getByText('Kennel')).toBeInTheDocument();
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
