# Project Specification: Barking Mad (MVP)

---

## 1. Project Vision

**Barking Mad** is a third-person dog walking simulation focusing on the mechanical and physical relationship between a human walker and a Dachshund. The game features manual movement, physics-based leash constraints, and a command-driven AI.

---

## 2. Systems Architecture

### 2.1 Component Breakdown

| System                | Responsibility                                                     | Key Variables                                          |
| :-------------------- | :----------------------------------------------------------------- | :----------------------------------------------------- |
| **Locomotion Engine** | Manages player/dog velocity and 3rd-person camera positioning.     | `PLAYER_BASE_SPEED` (7.0), `panSlowdown`, `uiScale`    |
| **Physics Engine**    | Verlet Integration + Position-Based Dynamics (PBD) for leash.      | `LEASH_NODES` (60), `MAX_LEASH_LENGTH` (15m)           |
| **Canine Logic (AI)** | State machine managing dog behavior and autonomous pathing.        | `dogFacingYaw`, `dogDistance`, `COMING`, `IDLING`      |
| **Responsive UI**     | HUD with dynamic scaling and integrated tension feedback.          | `edgeOffset`, `tensionMeter` (GO background)           |

---

## 3. Core Mechanics & Logic

### 3.1 Leash Physics (Verlet Integration)
The leash is simulated as a chain of 60 nodes using Verlet Integration and PBD distance constraints.
- **Tension Visuals:** The leash transitions from Dark Gray to Yellow (75%) to Bright Red (90%) as it stretches.
- **Player Impact:** Non-linear slowdown occurs as tension increases. Full speed up to 75% tension, ramping down to 10% speed at 100% tension.
- **Physical Limits:** The dog is physically constrained to a 15m radius. If the player exceeds this, they are pulled back; if the dog exceeds it while walking, its position is clamped.

### 3.2 Command System (The "Paw" Controls)
The player interacts with the dog through a cluster of 3 main command buttons:
- **GO / TUG:** 
    - **GO:** Sets the dog to `WALKING` and captures the player's current facing direction as the dog's path.
    - **TUG:** Active when the dog is `WALKING`, `COMING`, or `SNIFFING`. Moves the dog 0.35m towards the player and releases 10% tension.
- **COME:** Commands the dog to move directly towards the player at high speed (`12.0`) until within `1.2m`.
- **SIT:** Anchors the dog to its current position.

### 3.3 Dog AI & State Machine
- **WALKING:** Dog moves autonomously along the captured yaw direction.
- **IDLING:** After 5 seconds of the player being stationary, the dog roams randomly within a slack-leash radius.
- **COMING:** Dog prioritizes returning to the player over its current path.
- **STANDING/SITTING:** Stationary states used for control and anchoring.

---

## 4. Interaction Model

### 4.1 Movement
- **Walk Toggle:** A single tap on the large central button toggles the player's walking state.
- **3rd Person POV:** Camera is positioned `6m` behind and `2.5m` above the player.
- **POV Panning:** Swipe anywhere on the screen to look around. 
- **Pan Slowdown:** Player's move speed is reduced by up to `70%` during rapid camera panning to simulate loss of forward momentum.

### 4.2 HUD (Profile Card)
- **Walk Meter:** A single-line horizontal header showing progress. Driven by the actual physical distance the dog travels while in the `WALKING` state, using a `0.25m` update threshold to filter jitter.
- **Status Emojis:** Visual feedback for dog states (🐾 WALKING, 🐕 COMING, 🪑 SITTING, 💤 IDLING, 🧍 STANDING).
- **Layout:** Compact card (`115px`) with vertically stacked dog head and name.
- **Integrated Tension:** The GO/TUG button's background acts as a vertical progress meter for leash tension.

---

## 5. Level Design: "The Infinite Road"

- **Environment:** 3D sidewalk with depth, grass, and procedural trees.
- **Win Condition:** Dog travels a total of **150 meters** in the `WALKING` state.
- **Success State:** Reaching 150m triggers the "Mission Success" screen.

---

## 6. Technical Implementation Notes

### 6.1 State Management
- **Verlet Data:** Handled using `useRef` for 60fps physics stability without React re-render overhead.
- **Responsive Logic:** `useWindowSize` hook calculates dynamic scaling for UI components to support mobile and desktop aspect ratios.
- **Safety:** All UI elements use `WebkitUserSelect: none` and `WebkitTouchCallout: none` to prevent long-press context menus on mobile devices.
