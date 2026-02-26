# Project Specification: Barking Mad (Modular MVP)

---

## 0. Development Protocols

- **Approval Requirement:** Any large-scale changes, architectural shifts, or significant feature expansions **MUST** be proposed to the user and receive express approval before implementation.
- **Surgical Updates:** Minor bug fixes and UI polish (within existing patterns) can be performed autonomously, but must be communicated clearly.
- **Input Safety & NaN Protection:** All mouse/touch input handling MUST explicitly check for `undefined` or `0` before using fallbacks (e.g., `e.clientX !== undefined ? e.clientX : fallback`). Physics and camera loops MUST implement safety checks (e.g., division-by-zero guards) to prevent `NaN` propagation that causes scene blackouts.
- **Build Integrity:** Any UI component intended for use in the HUD or central scenes MUST be explicitly exported and verified via `npm run build` or `npm run lint` before finishing a task.

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
| **HUD (React)**       | Modular UI components: Profile Card and Overlays.                  | `KennelOverlay`, `RecordsOverlay`                      |

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
    - **South Wall:** Entrance door (4m height, 80% of wall) offset to the West. Improved doorknob and panel visuals. Trophy Shelf mounted at 2.2m height between door and bed.
    - **North Wall:** Features a physical aperture for a large 4m x 2.5m window. A detailed Calendar is mounted to its right.
- **Backyard (Outdoor View):** Fully enclosed backyard visible through the window, featuring a 1.2m wooden fence, fence posts, stylized trees, and a sky backdrop.
- **Furniture & Zoning:**
    - **Top-Left (North-West):** Desk (0.95m height) with Chair, Laptop (Kennel), and Training Manual.
    - **Top-Right (North-East):** Slim Gear Closet (3.8m height, 1.2m depth) with vertical golden handles and proximity-based transparency.
    - **Bottom-Right (South-East):** Single Bed (4.5m x 2.2m) and Nightstand with inset drawers and horizontal golden handles. Player spawns next to the bed facing the window (North).
    - **Corner (North-West):** 2.4m Standing Lamp with open shade and visible internal bulb.
- **Hanging Leash:** A red leash hangs from a hook beneath the trophy shelf on the South wall, providing visual context for the dog being "off-leash" in the hub.
- **Cinematic Transitions:** Camera smoothly lerps from free-look to object-focus when a module is selected.

### 4.2 HUD & Metadata
- **Lighting Model:** 
    - **Real-Time Sun:** Hub lighting (position, color, and intensity) dynamically matches the current system time on a 24-hour cycle. 
    - **Independent Lamps:** The Nightstand and Standing Lamp are individually toggleable interactables, casting warm point-light shadows.
    - **Physical Occlusion:** All walls, the floor (Minecraft voxel style), and the ceiling are shadow-casters that physically block outside light.
- **Interaction Feedback:** Gaze-based labels using `Billboard` components. Labels appear automatically when an object is in the center of the FOV or hovered, rendered with `depthTest: false` to prevent wall clipping.
- **Skill Tree:** Branching progression system at the Training Manual. Nodes include Player Strength, Dog Recall, and Economy (Grit Focus).
- **Return Home:** A functional button in the walking scene that allows players to end their walk early, finalizing current distance into Grit and returning to the Hub summary.
- **Walk Meter:** Progressive header using a 0.25m displacement threshold to filter jitter.
- **Smartwatch:** Displays real-time Minimap during walks and system Time/Date in the Hub.

---

## 5. Level Design & Environments

- **The Room:** Fully enclosed 3D environment with walls, ceiling, and interactable furniture. Dog movement is physically clamped within the room boundaries and includes collision detection for major furniture items (Desk, Closet, Bed, etc.) to prevent clipping during idle roaming.
- **The Infinite Road:** Procedural environment using `InstancedMesh` for high-performance tree and foliage rendering.
- **Session Conclusion:** A walk concludes automatically after accumulating 150m of distance, or manually at any point via the "Return Home" button. Both trigger the Mission Success screen and Grit rewards.

---

## 6. Technical Implementation Notes

- **Performance:** 60fps physics via `useRef` and `InstancedMesh` optimization.
- **State Management:** Decoupled HUD and 3D scenes via Zustand `useGameStore`.
- **UI Responsiveness:** Dynamic scaling via `uiScale` and `edgeOffset` calculations.
- **Mobile Safety:** Global `user-select: none` and `WebkitTouchCallout: none` to prevent UI interference.
