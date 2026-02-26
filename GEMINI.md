# Project Specification: Barking Mad (Modular MVP)

---

## 0. Development Protocols

- **Approval Requirement:** Any large-scale changes, architectural shifts, or significant feature expansions **MUST** be proposed to the user and receive express approval before implementation.
- **Surgical Updates:** Minor bug fixes and UI polish (within existing patterns) can be performed autonomously, but must be communicated clearly.
- **Input Safety & NaN Protection:** All mouse/touch input handling MUST explicitly check for `undefined` or `0` before using fallbacks (e.g., `e.clientX !== undefined ? e.clientX : fallback`). Physics and camera loops MUST implement safety checks (e.g., division-by-zero guards) to prevent `NaN` propagation that causes scene blackouts.
- **Mobile Layout & Viewport Safety:** 
    - Always use `100dvh` (Dynamic Viewport Height) for the main application container to account for mobile browser chrome (address bars, nav controls).
    - HUD elements MUST use `env(safe-area-inset-*)` combined with base offsets via `calc()` to prevent clipping by hardware notches, home indicators, or rounded screen corners.
- **Build Integrity:** Any UI component intended for use in the HUD or central scenes MUST be explicitly exported and verified via `npm run build` or `npm run lint` before finishing a task.

---

## 1. Project Vision

**Barking Mad** is a third-person simulation focusing on the mechanical and physical relationship between a human walker and a Dachshund. The game features a spatial 3D hub for progression and management, transitioning seamlessly into physics-based "Infinite Road" gameplay.

---

## 2. Systems Architecture (Modular)

### 2.1 Component Breakdown

| System                | Responsibility                                                     | Key Variables                                          |
| :-------------------- | :----------------------------------------------------------------- | :----------------------------------------------------- |
| **Locomotion Engine** | Manages player/dog velocity and 3rd-person camera positioning.     | `PLAYER_BASE_SPEED`, `attributes.agility/focus`        |
| **Physics (useLeash)**| Verlet Integration + PBD. Handles collar attachment & tension.     | `LEASH_NODES` (60), `MAX_LEASH_LENGTH` (15m)           |
| **Canine AI (useDogAI)**| Displacement-driven rotation & state transitions.                | `dogFacingYaw`, `COMING`, `attributes.bond`            |
| **Menu (useMenuCamera)**| Cinematic camera transitions between 3D room objects.            | `CAMERA_TARGETS`, `lerp`, `slerp`                      |
| **State (Zustand)**   | Centralized event-driven state for HUD and scene sync.             | `useGameStore`: `attributes.strength`, `progression`   |
| **HUD (React)**       | Scalable, modular UI components using a primitive-first library. | `MissionSuccessOverlay`, `barkos/PrimitiveComponents` |

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

### 3.4 Attribute Scaling
Player attributes dynamically modify physical gameplay values:
- **Strength:** Increases the tension threshold before the leash strains (`0.78 + (strength * 0.02)`).
- **Focus:** Multiplies final Grit earned (`1.0 + (focus * 0.05)`) and stabilizes the camera pan window (`0.3 + (focus * 0.035)`).
- **Agility:** Increases base player movement speed on the road (`PLAYER_BASE_SPEED + (agility * 0.3)`).
- **Bond:** Accelerates the dog's recall speed when executing the COME command (`12.0 + (bond * 1.5)`).

---

## 4. Interaction Model

### 4.1 Spatial 3D Hub (The Room)
- **Geometry:** 10m x 8m square layout (5m ceiling).
- **Structural Layout:**
    - **South Wall:** Entrance door (4m height, 80% of wall) offset to the West. Improved doorknob and panel visuals. Trophy Shelf mounted at 2.2m height between door and bed.
    - **North Wall:** Features a physical aperture for a large 4m x 2.5m window. A detailed Calendar is mounted to its right.
- **Backyard (Outdoor View):** Fully enclosed backyard visible through the window, featuring a 1.2m wooden fence, fence posts, stylized trees, and a sky backdrop.
- **Furniture & Zoning:**
    - **Top-Left (North-West):** Desk (0.95m height) with Chair, Laptop (Kennel), and **Field Notes** (Training Manual). 
    - **Training Manual:** Modeled as an army green spiral notebook with an animated flip-cover and brass binding. Features a 1:1 pixel-mapped UI on the first page.
    - **Desk Lighting:** An IKEA RANARP-inspired work lamp with brass joints and an open conical shade, providing focused lighting on the manual.
    - **Top-Right (North-East):** Slim Gear Closet (3.8m height, 1.2m depth) with vertical golden handles and proximity-based transparency.
    - **Bottom-Right (South-East):** Single Bed (4.5m x 2.2m) and Nightstand with inset drawers and horizontal golden handles. Player spawns next to the bed facing the window (North).
    - **Corner (North-West):** 2.4m Standing Lamp with open shade and visible internal bulb.
- **Cinematic Transitions:** Camera smoothly lerps to a top-down perpendicular view when selecting the Training Manual. The manual cover physically opens to reveal the UI once the camera arrives.

### 4.2 Tabbed Progression System (Training Overlay)
The Training Manual is implemented as a full-screen 2D React overlay (`TrainingOverlay.tsx`) for maximum legibility on mobile devices.
- **Coordination:** The overlay only renders after the 3D camera transition completes, signaled by the `isMenuReady` state in the `useGameStore`.
- **DASHBOARD (Stats):** Tracks the player's numerical growth.
- **FIELD NOTES (Skills):** A branching progression tree.
- **COMMANDS (Reference):** A diegetic guide explaining core walk mechanics.

### 4.3 HUD & Metadata
- **Architecture:** HUD is organized into a modular tree. Large overlays (e.g., Mission Success, Training) are extracted into standalone components.
- **Responsive Logic:** Uses `useHUDLayout` hook for centralized window resizing, scale calculation, and CSS safe-area management.
- **UI Library (BarkOS):** A foundation for reusable primitives (containers, buttons) is established in `src/components/ui/barkos/` to ensure visual consistency.
- **Lighting Model:** Hub lighting dynamically matches system time. Hub interactables (Lamps) are individually toggleable.
- **Interaction Feedback:** Gaze-based Billboard labels.
- **Return Home:** Finalizes current distance into Grit and XP, returning the player to the hub summary.
- **Smartwatch:** Displays real-time Minimap during walks and system Time/Date in the Hub.

---

## 5. Level Design & Environments

- **The Room:** Fully enclosed 3D environment. Dog movement is physically clamped within room boundaries with furniture collision.
- **The Infinite Road:** Procedural environment using `InstancedMesh`.
- **Session Conclusion:** Walk concludes at 150m or via manual Return Home. Triggering Mission Success awards Grit and XP.

---

## 6. Technical Implementation Notes

- **Performance:** 60fps physics via `useRef` and `InstancedMesh` optimization.
- **State Management:** Decoupled HUD and 3D scenes via Zustand `useGameStore`.
- **Camera-UI Coordination:** Implemented a `isMenuReady` handshake between the `useMenuCamera` physics loop and the React HUD to prevent UI "pop-in" before cinematic transitions finish.
- **HUD Scalability:** Adopted a "Research -> Strategy -> Execution" approach to UI refactoring, moving logic into custom hooks and primitive components to prevent `HUD.tsx` bloat.
- **UI Mapping:** The Field Notes UI uses a full-screen overlay for accessibility, replacing the previous 3D-mapped HTML to ensure perfect legibility across all phone display ratios.
- **Camera Stability & Framing:** Implemented micro-offsets, locking thresholds, and aspect-ratio aware dynamic zoom in `useMenuCamera` to ensure 3D menus (like the Training Manual) remain perfectly framed on both mobile portrait and desktop landscape viewports.
- **Global HUD Controls:** High-priority menu interactions (like the "X" Close button) are promoted from 3D space to the global React HUD to ensure accessibility and consistent positioning across all devices.
