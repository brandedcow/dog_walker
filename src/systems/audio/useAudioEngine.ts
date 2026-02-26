import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { DogState, GameState, MenuState } from '../../types';

export const useAudioEngine = () => {
  const { camera } = useThree();
  const listener = useRef<THREE.AudioListener>(null!);
  const audioLoader = useRef(new THREE.AudioLoader());
  
  // Persistent Audio Buffers
  const buffers = useRef<Record<string, AudioBuffer>>({});
  
  // Active Loop Sounds
  const strainLoop = useRef<THREE.Audio | null>(null);
  const roadAmbience = useRef<THREE.Audio | null>(null);
  const roomAmbience = useRef<THREE.Audio | null>(null);

  const { 
    tension, dogState, gameState, menuState, sessionGrit 
  } = useGameStore();

  // 1. Initialize Listener and Load Assets
  useEffect(() => {
    listener.current = new THREE.AudioListener();
    camera.add(listener.current);

    const soundFiles = [
      { id: 'CLICK', path: '/audio/click.wav' },
      { id: 'TUG', path: '/audio/tug.wav' },
      { id: 'BARK', path: '/audio/bark.wav' },
      { id: 'SUCCESS', path: '/audio/success.wav' },
      { id: 'GRIT', path: '/audio/grit.wav' },
      { id: 'STRAIN', path: '/audio/strain.wav', loop: true },
      { id: 'ROOM_AMBI', path: '/audio/room_ambi.wav', loop: true },
      { id: 'ROAD_AMBI', path: '/audio/road_ambi.wav', loop: true }
    ];

    soundFiles.forEach(file => {
      audioLoader.current.load(file.path, (buffer) => {
        buffers.current[file.id] = buffer;
        
        // Setup loops immediately if loaded
        if (file.id === 'STRAIN') {
          strainLoop.current = new THREE.Audio(listener.current);
          strainLoop.current.setBuffer(buffer);
          strainLoop.current.setLoop(true);
          strainLoop.current.setVolume(0);
        }
        if (file.id === 'ROOM_AMBI') {
          roomAmbience.current = new THREE.Audio(listener.current);
          roomAmbience.current.setBuffer(buffer);
          roomAmbience.current.setLoop(true);
        }
        if (file.id === 'ROAD_AMBI') {
          roadAmbience.current = new THREE.Audio(listener.current);
          roadAmbience.current.setBuffer(buffer);
          roadAmbience.current.setLoop(true);
        }
      });
    });

    return () => {
      camera.remove(listener.current);
      // Stop all loops on unmount
      [strainLoop.current, roadAmbience.current, roomAmbience.current].forEach(s => s?.stop());
    };
  }, [camera]);

  // 2. State-Driven Triggers
  
  // UI Clicks & Transitions
  useEffect(() => {
    if (menuState !== MenuState.IDLE) playSound('CLICK', 0.5);
  }, [menuState]);

  // Mission Success
  useEffect(() => {
    if (gameState === GameState.FINISHED) playSound('SUCCESS', 0.8);
  }, [gameState]);

  // Grit Counter (Play sound when session grit updates)
  const lastGrit = useRef(0);
  useEffect(() => {
    if (sessionGrit > lastGrit.current) {
      playSound('GRIT', 0.4);
      lastGrit.current = sessionGrit;
    }
  }, [sessionGrit]);

  // Leash Tug
  const lastDogState = useRef(dogState);
  useEffect(() => {
    // Basic tug logic - if dog was walking/coming and suddenly stands/sits, play "snap"
    if ((lastDogState.current === DogState.WALKING || lastDogState.current === DogState.COMING) && 
        (dogState === DogState.STANDING || dogState === DogState.SITTING)) {
       playSound('TUG', 0.6);
    }
    
    // Barking logic
    if (dogState === DogState.IDLING && Math.random() > 0.8) {
      playSound('BARK', 0.4);
    }

    lastDogState.current = dogState;
  }, [dogState]);

  // 3. Ambient & Loop Management (Fading)
  useFrame((_, delta) => {
    // Strain Loop (Pitch shifted by tension)
    if (strainLoop.current && buffers.current['STRAIN']) {
      if (tension > 0.75) {
        if (!strainLoop.current.isPlaying) strainLoop.current.play();
        const intensity = (tension - 0.75) / 0.25; // 0.0 to 1.0
        strainLoop.current.setVolume(intensity * 0.5);
        strainLoop.current.setPlaybackRate(1.0 + intensity * 0.5); // Pitch up
      } else if (strainLoop.current.isPlaying) {
        strainLoop.current.setVolume(Math.max(0, strainLoop.current.getVolume() - delta * 4));
        if (strainLoop.current.getVolume() <= 0) strainLoop.current.stop();
      }
    }

    // Ambiance Fading
    if (gameState === GameState.HOME) {
      fade(roomAmbience.current, 0.4, delta);
      fade(roadAmbience.current, 0, delta);
    } else if (gameState === GameState.PLAYING) {
      fade(roomAmbience.current, 0, delta);
      fade(roadAmbience.current, 0.5, delta);
    } else {
      fade(roomAmbience.current, 0, delta);
      fade(roadAmbience.current, 0, delta);
    }
  });

  const playSound = (id: string, volume: number = 0.5) => {
    const buffer = buffers.current[id];
    if (!buffer || !listener.current) return;

    const sound = new THREE.Audio(listener.current);
    sound.setBuffer(buffer);
    sound.setVolume(volume);
    sound.play();
  };

  const fade = (audio: THREE.Audio | null, targetVol: number, delta: number) => {
    if (!audio) return;
    if (targetVol > 0 && !audio.isPlaying) audio.play();
    
    const currentVol = audio.getVolume();
    if (Math.abs(currentVol - targetVol) < 0.01) {
      audio.setVolume(targetVol);
      if (targetVol === 0 && audio.isPlaying) audio.stop();
      return;
    }
    
    const nextVol = THREE.MathUtils.lerp(currentVol, targetVol, delta * 2);
    audio.setVolume(nextVol);
  };

  return { playSound };
};
