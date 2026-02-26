# Player Progression System: Specialized Builds

## 1. Overview
Barking Mad uses a flexible, skill-driven progression system built upon a permanent **Race (Archetype)** foundation. A player's "Race" defines their starting base stats, while the skill tree allows for "Augments" to those stats and unique mechanical abilities.

Players can **Respec** their skill points at any time, but their **Race** is a fixed choice (set during character creation) that dictates their high-level potential and cannot be changed in the Training Manual.

---

## 2. Player Races (Base Stats)
Each Race provides a unique starting distribution of the four core attributes.

| Race | Strength | Agility | Focus | Bond | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Dwarf** | 4 | 1 | 2 | 2 | High control and leash snap resistance. |
| **Elf** | 1 | 4 | 2 | 2 | Maximum walk speed and movement efficiency. |
| **Human** | 2 | 2 | 2 | 3 | A solid all-rounder for any playstyle. |

---

## 3. Core Attributes & Scaling
Skill nodes add "Augments" (+1, +2, etc.) to the chosen Race's base values.

| Attribute | Mechanical Impact | Scaling Logic (Base + Augment) |
| :--- | :--- | :--- |
| **STRENGTH** | Increases tension threshold & Tug power. | `0.78 + (total_strength * 0.02)` threshold. |
| **AGILITY** | Increases base walk speed & pan stability. | `7.0 + (total_agility * 0.3)` m/s. |
| **FOCUS** | Multiplies Grit rewards & stabilizes camera. | `1.0 + (total_focus * 0.05)` multiplier. |
| **BOND** | Increases Recall speed & reduces Dog IDLE frequency. | `12.0 + (total_bond * 1.5)` m/s. |

---

## 3. The Economy (SP & Grit)
*   **Rank Up:** Triggered every 1,000 XP.
*   **Skill Points (SP):** 2 points awarded per Rank. Used to unlock nodes in the SKILLS tree.
*   **Grit (Currency):** Required as a secondary cost for high-tier nodes.
*   **Respec Cost:** 250 Grit. Resets all SP and allows for full reallocation.

---

## 4. Specialization Paths (The Builds)
Nodes are grouped into four thematic paths. Higher-tier nodes in a path often provide larger attribute augments.

### 4.1 The Handler (Strength-focused)
*   **Node I:** *Power Grip* (+1 Strength).
*   **Node II:** *Steady Hand* (+2 Strength).
*   **Node III:** *Power Reel* (Tugs pull the dog 0.7m instead of 0.35m).
*   **Capstone:** *Iron Grip* (Requires 10 Total Strength). Leash is unbreakable for 5s after a Tug.

### 4.2 The Athlete (Agility-focused)
*   **Node I:** *Fast Footwork* (+1 Agility).
*   **Node II:** *Endurance* (+2 Agility).
*   **Node III:** *Steady Pace* (No Grit penalty for rapid camera panning).
*   **Capstone:** *Sprint* (Requires 10 Total Agility). Double walk speed for 100m (once per walk).

### 4.3 The Analyst (Focus-focused)
*   **Node I:** *Sharp Eye* (+1 Focus).
*   **Node II:** *Deep Concentration* (+2 Focus).
*   **Node III:** *Scent Vision* (Distractions appear as icons on the Minimap).
*   **Capstone:** *Grit Flow* (Requires 10 Total Focus). Triple all Grit earned during the current walk.

### 4.4 The Whisperer (Bond-focused)
*   **Node I:** *Calming Voice* (+1 Bond).
*   **Node II:** *Deep Connection* (+2 Bond).
*   **Node III:** *Soul Bond* (Dog automatically SITs if tension exceeds 90%).
*   **Capstone:** *Zen Walk* (Requires 10 Total Bond). Dog never enters IDLE or SNIFFING state.

---

## 5. Technical Implementation Goals
1.  **useGameStore:** Implement `respecSkills` action and calculate `totalAttributes` dynamically from `baseAttributes` + `activeSkillAugments`.
2.  **TrainingOverlay:** Add "RESPEC" button and update skill nodes to display attribute bonuses.
3.  **RoadScene:** Update all physics and AI loops to consume the dynamically calculated `totalAttributes`.
