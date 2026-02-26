# Project Specification: Barking Mad (Modular MVP)

---

## 1. Project Vision

**Barking Mad** is a third-person simulation focusing on the mechanical and physical relationship between a human walker and a Dachshund. The game features a spatial 3D hub for progression and management, transitioning seamlessly into physics-based "Infinite Road" gameplay.

---

## 2. Systems Architecture (Modular)

### 2.1 Component Breakdown

| System                | Responsibility                                                     | Key Variables                                          |
| :-------------------- | :----------------------------------------------------------------- | :----------------------------------------------------- |
| **Locomotion Engine** | Manages player/dog velocity and 3rd-person camera positioning.     | `PLAYER_BASE_SPEED` (7.0), `panSlowdown`, `uiScale`    |
| **Physics (useLeash)**| Verlet Integration + PBD. Handles collar attachment & tension.     | `LEASH_NODES` (60), `MAX_LEASH_LENGTH` (15m)           |
| **Canine AI (useDogAI)**| Displacement-driven rotation & state transitions.                | `dogFacingYaw`, `COMING`, `IDLING`, `currentRotation`  |
| **Menu (useMenuCamera)**| Cinematic camera transitions between 3D room objects.            | `CAMERA_TARGETS`, `lerp`, `slerp`                      |
| **State (Zustand)**   | Centralized event-driven state for HUD and scene sync.             | `useGameStore`: `gameState`, `menuState`, `dogStats`   |
| **HUD (React)**       | Modular UI components: Profile Card, Overlays, and Paw Controls.   | `KennelOverlay`, `TrainingOverlay`, `RecordsOverlay`   |

---

## 3. Core Mechanics & Logic

### 3.1 Leash Physics (Verlet + Dynamic Length)
The leash is a chain of 60 nodes using Verlet Integration and fixed-timestep sub-stepping (480Hz).
- **Dynamic Retraction:** Leash segments contract when the dog is close and stretch to full length as tension increases.
- **Collar Attachment:** Physically pinned to the dog's front "chest" facet, synchronized with the dog's rotation.
- **Constraints:** Hard physical clamp at 15m; ground collision ensures visibility even when slack.
- **Visuals:** Interpolates from Gray to Yellow (75%) to Red (90%+) based on stress.

### 3.2 Canine AI & Unified Rotation
- **Displacement-Driven Orientation:** The dog model smoothly rotates to face its actual travel vector calculated every frame.
- **States:** WALKING (🐾), STANDING (🧍), SITTING (🪑), IDLING (💤), COMING (🐕).
- **Idling:** Dog roams randomly within the leash slack if the player remains stationary.

### 3.3 Command System (The "Paw")
- **GO / TUG:** Captures camera heading for pathing (GO) or pulls the dog 0.35m closer (TUG).
- **COME:** High-speed recall toward the player.
- **SIT:** Stationary anchor state.

---

## 4. Interaction Model

### 4.1 Spatial 3D Hub (The Room)
- **Manual Navigation:** 3rd-person exploration of the room hub using standard walk/pan controls.
- **Interactive Objects:** Raycast-based triggers for room modules:
    - **Wooden Door**: Transition to "Infinite Road" gameplay.
    - **Laptop**: Opens the Kennel (Dog stats/roster).
    - **Training Book**: Opens Upgrades (Strength/Recall).
    - **Trophy Shelf**: Opens Records (Total distance/milestones).
- **Cinematic Transitions:** Camera smoothly lerps from free-look to object-focus when a module is selected.

### 4.2 HUD & Metadata
- **Expandable Profile:** Tapping the dog card reveals full metadata (Training Level, Characteristics, Mood, Size).
- **Contextual Overlays:** 2D React interfaces for specific room modules, using Zustand for real-time stat synchronization.
- **Walk Meter:** Progressive header using a 0.25m displacement threshold to filter jitter.

---

## 5. Level Design & Environments

- **The Room:** Fully enclosed 3D environment with walls, ceiling, and interactable furniture.
- **The Infinite Road:** Procedural environment using `InstancedMesh` for high-performance tree and foliage rendering.
- **Win Condition:** Accumulate 150m of walking distance in a single session.

---

## 6. Technical Implementation Notes

- **Performance:** 60fps physics via `useRef` and `InstancedMesh` optimization.
- **State Management:** Decoupled HUD and 3D scenes via Zustand `useGameStore`.
- **UI Responsiveness:** Dynamic scaling via `uiScale` and `edgeOffset` calculations.
- **Mobile Safety:** Global `user-select: none` and `WebkitTouchCallout: none` to prevent UI interference.
