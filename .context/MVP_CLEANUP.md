# MVP Scaling & Cleanup Plan: Barking Mad

The current MVP is a high-performance monolithic implementation. To scale effectively for larger environments, more complex AI, and additional breeds, the following architectural improvements are recommended.

---

## 1. Architectural Code Splitting
Move away from the single-file `App.tsx` towards a modular directory structure:

- **`src/components/world/`**: Separate world geometry (Trees, Ground, Sidewalk) and physics models (Leash, DogModel).
- **`src/systems/physics/`**: Extract Verlet integration into a custom `useLeash` hook to manage physical nodes and expose a tension API.
- **`src/systems/ai/`**: Create a `useDogAI` hook to manage state transitions (WALKING, COMING, IDLING) and pathing logic independently.
- **`src/config/constants.ts`**: Centralize all balancing variables (`MAX_LEASH_LENGTH`, `PLAYER_BASE_SPEED`, `DOG_MOVE_SPEED`) for easier tuning.

---

## 2. Performance: Instanced Rendering
To support long-distance walks (kilometers instead of meters) without performance degradation:

- **InstancedMesh**: Transition from mapping individual components to using `InstancedMesh` for trees, grass, and sidewalk tiles. This reduces thousands of draw calls into a single call.

---

## 3. Stability: Physics Sub-stepping
Ensure leash stability across variable framerates (especially on mobile):

- **Fixed Timestep**: Implement sub-stepping inside the `useFrame` loop. Run the physics calculations multiple times per frame using a small, fixed `dt` (e.g., 5 iterations at 1/300s).

---

## 4. State Management: Event-Driven UI
Reduce prop-drilling and coupling between the 3D scene and HUD:

- **Zustand Store**: Implement a lightweight state store. Allow HUD components to subscribe directly to tension, distance, and dog state updates without involving `SceneContent` callbacks.

---

## 5. Infinite Level Generation
Move from a fixed 150m road to a procedurally generated "Infinite Road":

- **Chunking System**: Divide the environment into reusable 50m chunks. Implement a spawning/pooling system that creates chunks ahead of the player and recycles chunks left far behind to keep memory usage constant.
