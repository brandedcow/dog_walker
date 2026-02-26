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
- **Geometry:** 10m x 8m square layout (5m ceiling).
- **Structural Layout:**
    - **South Wall:** Entrance door (4m height, 80% of wall) offset to the West.
    - **North Wall:** Large 4m x 2.5m window centered over the desk.
- **Furniture & Zoning:**
    - **Top-Left (North-West):** Desk (0.95m height) with Chair, Laptop (Kennel), and Training Manual.
    - **Top-Right (North-East):** Slim Gear Closet (3.8m height, 1.2m depth) with proximity-based transparency.
    - **Bottom-Right (South-East):** Single Bed (4.5m x 2.2m) and Nightstand.
    - **West Wall:** Trophy Shelf mounted at 1.5m height.
- **Cinematic Transitions:** Camera smoothly lerps from free-look to object-focus when a module is selected.

### 4.2 HUD & Metadata
- **Interaction Feedback:** Gaze-based labels using `Billboard` components. Labels appear automatically when an object is in the center of the FOV or hovered, rendered with `depthTest: false` to prevent wall clipping.
- **Skill Tree:** Branching progression system at the Training Manual. Nodes include Player Strength, Dog Recall, and Economy (Grit Focus).
- **Return Home:** A button in the walking scene that allows players to end their walk early, finalizing current distance into Grit and returning to the Hub summary.
- **Walk Meter:** Progressive header using a 0.25m displacement threshold to filter jitter.
- **Smartwatch:** Displays real-time Minimap during walks and system Time/Date in the Hub.

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
