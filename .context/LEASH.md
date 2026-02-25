# Specification: Dog-Walking Leash Physics System (JavaScript/Web)

**Objective:** Implement a 2D leash system using **Verlet Integration** and **Position-Based Dynamics (PBD)**. The system must manage a flexible rope that transitions between slack and taut states, handles environmental wrapping, and applies physical constraints between the Player and Dog entities.

---

## 1. Core Physics & Data Structure

Implement a `Leash` class managing an array of "nodes" to simulate rope physics.

- **Node Properties:** Each node must store `x, y, oldX, oldY` (for velocity calculation) and `isPinned`.
- **Resolution:** Use 15–20 nodes for a standard leash length.
- **Constants:** \* `segmentLength`: The fixed distance between any two nodes.
  - `totalMaxLeashLength`: `segmentLength * nodes.length`.
  - `stiffness`: Constraint iterations (suggested: 10–15 per frame).
  - `gravity`: Vector applied to every non-pinned node each frame.

---

## 2. The Simulation Loop (requestAnimationFrame)

The `update(dt)` method must execute the following logic in strict order:

### A. Verlet Integration

For every node (except pinned nodes):

1.  Calculate velocity: `vx = (x - oldX) * friction`, `vy = (y - oldY) * friction`.
2.  Update previous position: `oldX = x`, `oldY = y`.
3.  Apply gravity and velocity: `x += vx`, `y += vy + (gravity * dt^2)`.

### B. Pinning & Anchors

1.  Set `node[0].pos = Player.handAnchor`.
2.  Set `node[last].pos = Dog.neckAnchor`.

### C. Distance Constraint Solver

Loop `stiffness` times to converge on the correct length:

1.  Calculate `distance` between `node[i]` and `node[i+1]`.
2.  Calculate `error = (distance - segmentLength) / distance`.
3.  Adjust positions: `node[i].pos += vector * error * 0.5` and `node[i+1].pos -= vector * error * 0.5`.

---

## 3. Environmental Wrapping (Pivots)

Handle collision with static world geometry (Poles, Corners) using a **Pivot Stack**.

1.  **Collision Check:** Perform a `LineCast` between `node[0]` and `node[last]`.
2.  **Pivot Injection:** If the line intersects a collider edge, store the intersection point in a `pivots[]` array.
3.  **Pathing Logic:** The leash physics must now resolve segments from `Player -> Pivot[n] -> Dog`.
4.  **Unwrapping:** Monitor the interior angle at the pivot point. If the angle between the Player-side segment and Dog-side segment approaches 180°, `pop()` the pivot from the stack.

---

## 4. Game Logic & State Output

The system must expose a `getLeashState()` method for the AI/UI to consume:

| State      | Condition                     | Effect                                                                  |
| :--------- | :---------------------------- | :---------------------------------------------------------------------- |
| **SLACK**  | `currentDist < maxDist * 0.8` | Visual sag; no force applied to Player/Dog.                             |
| **TAUT**   | `currentDist >= maxDist`      | Apply restorative force to Dog velocity; trigger haptic/visual tension. |
| **LOCKED** | `isLocked == true`            | `maxLeashLength` is temporarily set to current distance.                |

---

## 5. Rendering Requirements (Canvas2D)

- **Visuals:** Draw the leash using `ctx.bezierCurveTo()` or `ctx.quadraticCurveTo()` for a smooth appearance during slack states.
- **Tension Color:** Transition the stroke style from `Brown/Black` to `Bright Red` as tension approaches 100%.
