# Project Specification: Barking Mad (MVP)

---

## 1. Project Vision

**Barking Mad** is a first-person simulation focusing on the mechanical relationship between a human walker and a reactive Dachshund.
 The game challenges the player to manage a variable physical constraint (the leash) while the dog autonomously seeks out distractions.

---

## 2. Systems Architecture

The MVP is built using React, Three.js, and React Three Fiber, leveraging a centralized state management pattern for physical and AI synchronization.

### 2.1 Component Breakdown

| System                | Responsibility                                                     | Key Variables                                          |
| :-------------------- | :----------------------------------------------------------------- | :----------------------------------------------------- |
| **Locomotion Engine** | Manages player forward velocity and camera positioning.            | `PLAYER_BASE_SPEED`, `TensionValue`, `Progress`        |
| **Canine Logic (AI)** | Determines dog movement, pulling patterns, and sniff interactions. | `DOG_BASE_SPEED`, `DetectionRadius`, `PullStrength`    |
| **Physics Bridge**    | Calculates tension and enforces leash constraints in 2D space.     | `MaxLeashLength`, `TensionFormula`, `LateralSteering` |

---

## 3. Core Mechanics & Logic

### 3.1 Leash Tension Physics
The leash acts as a dynamic modifier to movement. Tension is calculated on a 2D plane (XZ) to prevent vertical pulling.
- **Tension Formula:** $T = \max(0, \min(\frac{	ext{Dist}(P, D) - 1.5}{MAX\_LEASH - 1.5}, 1.0))$
- **Movement Impact:** $	ext{Velocity}_{final} = 	ext{Velocity}_{base} 	imes (1 - T)$
- **Constraint:** The dog is physically clamped to stay within `MAX_LEASH_LENGTH` of the player.

### 3.2 Dog AI & Autonomous Steering
The dog actively seeks distractions along the path.
- **Detection:** Dog identifies the nearest active scent point within a **25m radius**.
- **Autonomous Pull:** Dog steers its lateral position towards the nearest scent with ramping intensity as it nears the target.
- **Sniff State:** Triggered when distance to scent is $< 2.5	ext{m}$. Forward movement stops.
- **Multi-Tug Mechanic:** Distractions require **2 tugs** to clear. Once cleared, the scent point is removed, and the dog pivots to the next available distraction.

---

## 4. Interaction Model

### 4.1 Input Mapping
- **Lateral Steering:** 
  - **Mouse/Touch:** Click/Tap left or right side of the screen.
  - **Keyboard:** A/D or Left/Right Arrow keys.
- **Tug Mechanic:** 
  - **Mouse/Touch:** Any click/tap while the dog is in the `SNIFFING` state.
  - **Keyboard:** Spacebar.

---

## 5. Level Design: "The Suburban Sidewalk"

- **Total Length:** 150 meters.
- **Obstacles:** Alternating scent points on the left (-3.5) and right (3.5) edges of the sidewalk.
- **Environment:** 3D sidewalk with depth, grass, and procedural trees.
- **UI:** Tension meter (0-100%) and Progress to Park indicator.
- **Win Condition:** Reaching the 150m mark triggers the "Mission Success" screen.

---

## 6. Technical Implementation Notes

### 6.1 Rendering & POV
- **Camera:** First-person POV locked to player head height (2.2m).
- **Stability:** `camera.lookAt` target is calculated 10m ahead of the player for maximum horizon stability.
- **Dog Model:** Custom Dachshund model with procedural walking bob, tail, and floppy ears.
- **Leash:** Dynamic Catmull-Rom spline that sags when tension is low.

### 6.2 State Management
- **Persistence:** Uses a combination of `useState` for UI/Rendering and `useRef` for physics/input handling to prevent stale closures and ensure 60fps responsiveness.
