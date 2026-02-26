# Project Context: Barking Mad - Main Menu (Home)

## 1. Concept Overview

The Main Menu is a **spatial 3D environment** set in the player’s room. It replaces traditional 2D menus with interactive objects that trigger the game’s core modules. This hub serves as the bridge between gameplay loops, allowing for dog management, stat progression, and customization.

---

## 2. Interactive Object Mapping

The following objects in the `RoomContainer` are interactable via `onClick` events to trigger state changes in the `useGameStore`.

| Object            | Logic Trigger    | Functional Destination                                                |
| :---------------- | :--------------- | :-------------------------------------------------------------------- |
| **Entrance Door** | Click Door/Leash | **Active Walk:** Transitions to the "Infinite Road" scene.            |
| **Laptop (Desk)** | Click Screen     | **The Kennel:** Manage dog roster and view individual stats.          |
| **Training Book** | Click Manual     | **Progression:** Upgrade Player Strength or Dog Training tiers.       |
| **Closet/Shelf**  | Click Gear       | **Customization:** Swap dog collars, hats, or leash colors.           |
| **Trophy Shelf**  | Click Photos     | **Records:** View total distance, tension efficiency, and milestones. |

---

## 3. Technical Specifications

### 3.1 Camera & View Management

- **Lerp Transitions:** The camera uses a `lerp` function to move between predefined focus coordinates rather than hard cuts.
- **Menu States:** Managed via `menuState` (e.g., `IDLE`, `KENNEL`, `TRAINING`).
- **UI Integration:** 2D React HUD elements (like the **Profile Card**) only render when the camera is locked onto a focus object.

### 3.2 Physics & AI Persistence

- **Leash Logic:** The leash is draped diegetically in the room using `useLeash` physics (Verlet Integration) with 0 tension.
- **Dog Behavior:** The dog remains in the room in a `SITTING` or `IDLING` state, performing procedural animations like ear twitches or sniffing.
- **Asset Optimization:** Environment objects and trees in the "outside" view use `InstancedMesh` for performance.

---

## 4. Progression & State Schema

To support the room-based hub and progression, the `useGameStore` (Zustand) is expanded to track player and dog attributes.

### 4.1 Player Attributes (The "Walker")

- **Strength:** Reduces the rate of `tension` buildup and mitigates `panSlowdown` impact.
- **Grit:** Currency earned via distance traveled, used for physical upgrades.

### 4.2 Dog Attributes (The "Companion")

- **Training Level:** Influences the `useDogAI` state machine to reduce `IDLING` (sniffing) frequency.
- **Trust:** Currency earned via "Clean Walks" (low tension), used for behavioral upgrades.
- **Recall Speed:** Modifies the `COMING` state velocity (default `12.0`).

---

## 5. Interaction Model & UX

- **Visual Cues:** Interactable objects utilize an emissive glow or outline on hover to indicate they are clickable.
- **Responsive Scaling:** All room UI components utilize the `useWindowSize` hook to maintain consistent `uiScale` across mobile and desktop.
- **Input Safety:** Mobile interactions utilize `WebkitUserSelect: none` to prevent context menus during room navigation.

---

## 6. Development Priorities for Agent

1. **Initialize `RoomContainer`**: Set up R3F scene with the Entrance Door and Laptop as primary raycast targets.
2. **Implement Camera Lerp**: Create a hook to interpolate camera `position` and `quaternion` based on `menuState`.
3. **Expand Zustand Store**: Add `playerStats` and `dogStats` objects to `useGameStore`.
4. **Link `useLeash`**: Ensure the leash remains physically active in the room scene at 0 tension.
