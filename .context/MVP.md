# MVP Summary: Barking Mad

**Barking Mad** is a 3rd-person simulation that explores the physical and mechanical relationship between a walker and a dog. The MVP focuses on high-fidelity leash physics, responsive movement, and a minimalist command-driven AI.

---

## 1. Gameplay Core

### Locomotion & Control
- **Manual Movement:** Player movement is a single-tap toggle (WALK/STOP).
- **Directional POV:** The player moves exactly where the camera is facing.
- **Pan Slowdown:** Moving while rapidly looking around reduces speed by up to 70%, simulating the difficulty of maintaining momentum while distracted.
- **Tension Resistance:** The player maintains full speed until the leash is 75% taut, then slows down non-linearly to 10% speed as it reaches 100% tension.

### Canine AI (Buster)
- **Walking:** autonomous movement along a compass direction set when the player last issued a "GO" command.
- **Coming:** A dedicated "COME" command makes the dog sprint back to the player's side.
- **Idling:** If the player stands still for 5 seconds, the dog enters a random roaming state within the slack of the leash.
- **States:** WALKING (🐾), STANDING (🧍), SITTING (🪑), IDLING (💤), COMING (🐕).

---

## 2. Physics & Mechanics

### Verlet Leash System
- **Simulation:** 15-meter leash simulated using 60 physical nodes with Verlet Integration and Position-Based Dynamics (PBD).
- **Tension Visuals:** Real-time color interpolation based on stress:
  - **0-75%:** Slack/Normal (Dark Gray).
  - **75%:** Warning (Yellow).
  - **90-100%:** Taut (Bright Red).
- **Physical Tugging:** Clicking the Dog Profile Card or the TUG button physically yanks the dog 0.35m towards the player, releasing ~10% of the tension meter.

---

## 3. Interface (HUD)

### Dog Profile Card (Bottom-Left)
- **Compact Layout:** 115px wide card optimized for mobile and desktop.
- **Walk Meter:** Single-line progress header driven by the dog's actual physical displacement (0.25m update threshold to filter jitter).
- **Identity Column:** Dog head illustration and name ("BUSTER") stacked vertically.
- **Status Emoji:** High-visibility state feedback shown to the right of the head.

### Paw Controls (Bottom-Right)
- **GO / TUG Button:** A dual-purpose control where the background serves as the vertical tension meter.
- **COME & SIT:** Tactical AI overrides arranged in a paw-shaped cluster.
- **Responsive Scaling:** All UI elements dynamically scale and move further from screen edges as the viewport expands.

---

## 4. Technical Specs
- **Stack:** React 19, Three.js, React Three Fiber.
- **Target:** Web (Mobile/Desktop compatible).
- **Performance:** 60fps physics calculated via `useRef` to bypass React's render cycle.
- **Win Condition:** Dog completes 150 meters of total walking distance.
