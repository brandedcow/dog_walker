# The Resonance System: UI & HUD Specification

This document defines the visual architecture for **The Resonance System**. The interface is designed to provide "Clarity at a Glance," prioritizing the relationship between organic **Trait** growth and **Affinity** filtering.

---

## 1. The Resonance Hexagram (Central Hub)

The primary interface for character progression is an interactive, glowing radar chart. It serves as a visual "Aura" readout.

### Visual Components:

- **The Blueprint (Static):** A faint, geometric outline representing the player's **Primary Affinity** (e.g., a sharp Top-vertex focus for an Anchor).
- **The Neural Pulse (Dynamic):** A bright, shifting fill that expands toward the six vertices (**Strength, Bond, Focus, Speed, Awareness, Mastery**) as Traits level up.
- **Secondary Glow:** The vertex corresponding to the current **Secondary Focus** (second-highest XP) pulses in a contrasting color (e.g., Gold for Primary, Cyan for Secondary).
- **Mastery Rings:** Concentric circles around each vertex that fill as you gain XP from specific dog categories (e.g., "The Titans" fill the Strength ring).

---

## 2. Vector & Modifier Readout

Located adjacent to the Hexagram, this table breaks down the "Neural Filter" math, showing how **Primary Affinity** limits or boosts raw **Traits**.

| Trait        | Raw Level | Resonance Filter | Final Output | Status        |
| :----------- | :-------- | :--------------- | :----------- | :------------ |
| **Strength** | 45        | x1.0 (Primary)   | **45.0**     | **Pure**      |
| **Bond**     | 32        | x0.8 (Adjacent)  | **25.6**     | **Harmonic**  |
| **Speed**    | 15        | x0.4 (Opposite)  | **6.0**      | **Dissonant** |

- **Color Grading:** Numbers are color-coded based on efficiency: **Gold** (100%), **Silver** (80%), **Bronze** (60%), and **Fractured Grey** (40%).
- **Mastery Progress:** A micro-bar beneath each Trait shows the distance to **Level 10 (Hatsu Unlock)**.

---

## 3. Contract Preview: "Neural Flux"

When selecting a dog from the Client Portfolio, the UI overlays the potential impact on the player's Hexagram.

- **Ghosting:** Hovering over a "Sprinter" (Nomad XP) shows a translucent "Ghost Vertex" stretching toward the **Speed** node, visualizing exactly how the walk will reshape the player's profile.
- **Focus Shift Warning:** A "System Instability" icon appears if the contract will cause the **Secondary Focus** to flip to a different Affinity.

---

## 4. Hatsu & Hybrid Slotting

This menu manages active abilities and the "Vows" required to maintain them.

- **The Apex Slot:** A large, central icon for the **Primary Hatsu** (e.g., _Event Horizon_).
- **Resonant Hybrid Slots:** Two smaller slots that "unlock" when a Secondary Focus reaches Mastery Level 5.
- **Synergy Tags:** Hybrid skills are tagged as **"Harmonic"** (Adjacent Affinity) or **"Unstable"** (Opposite Affinity), indicating their stamina cost and cooldown modifiers.

---

## 5. In-Walk "Pulse" HUD

During gameplay, the UI minimizes to a "Neural Sync" display at the bottom of the screen.

- **Dual-Wave Monitor:** Two oscillating waves represent the player's output and the dog's internal state.
  - **Player Wave:** Fluctuates based on active **Trait** usage (e.g., frequent leash corrections spike the **Focus** wave).
  - **Canine Wave:** Represents stress and energy levels.
- **Resonance Zone:** When the two waves align in frequency and color, the player enters **"Neural Synchrony,"** granting a 1.5x multiplier to all XP gained during that state.

---

**Next Step:** Would you like me to generate a **Mock Technical Profile** for an **Urbanist-Specialist** hybrid to see how these UI values would calculate in a "High-Chaos" city mission?
