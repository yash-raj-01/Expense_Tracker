# Ledger 3D – Coin Collector

A lightweight, visually attractive low-poly 3D platformer game built in Unity 3D with C#.

---

## 🎮 Game Overview

**Ledger 3D – Coin Collector** is a beginner-friendly 3D platformer where you guide an adventurer across floating low-poly islands, collecting floating gold coins, navigating past hazard obstacles, and reaching the legendary Golden Treasure Chest to secure the ledger vault.

### Core Features:
- **Low-Poly 3D Environment**: Emerald grass floating islands, stepping stones across a sky chasm, decorative trees, hazard pillars, and a summit sanctuary.
- **Player Physics**: Rigidbody-based WASD / Arrow movement with responsive Spacebar jumping, smooth rotation towards input direction, and automatic fall-recovery respawning.
- **Floating Gold Coins**: Rotating and bobbing gold coins with metallic shine and glowing highlights that disappear upon touch, granting points and triggering a procedural audio chime.
- **Live TextMeshPro HUD**: Minimalist, modern dark glassmorphism card tracking collected coins (`Coins: X / 12`), score, and control hints.
- **Smooth Follow Camera**: 3rd-person camera dynamically interpolating behind and above the player with gentle damping.
- **Treasure Chest & Victory Screen**: Reaching the Golden Treasure Chest triggers an celebratory victory modal popup displaying the final score and a one-click **Play Again** restart button.

---

## 🕹️ Controls

| Action | Key / Control |
|---|---|
| **Move** | `W`, `A`, `S`, `D` or Arrow Keys |
| **Jump** | `Space` (Grounded) |
| **Restart** | `R` key or click **Play Again** button |

---

## 🚀 How to Open and Play in Unity Hub

1. Open **Unity Hub**.
2. Click **Add** -> **Add project from disk**.
3. Select the `isd_online/` folder inside the `Expense_Tracker` repository.
4. Open the project using **Unity 2022.3 LTS** or **Unity 6** (e.g., `6000.6.7f1`).
5. In the **Project** window at the bottom, navigate to:
   ```
   Assets / Scenes / MainScene.unity
   ```
6. Double-click **MainScene** to open it.
7. Click the **Play** button (▶) at the top of the Unity Editor.

*(Optional)* You can also rebuild or reset the scene at any time via the editor menu:
- Click top menu: **Ledger 3D** → **Build Complete Game Scene**.

---

## 📁 Project Architecture & Scripts

The game is deliberately built with exactly **4 core, beginner-friendly C# scripts**:

1. [`Assets/Scripts/PlayerController.cs`](Assets/Scripts/PlayerController.cs):
   - Handles horizontal Rigidbody physics velocity and orientation.
   - Detects ground contact via Raycast for single-jump mechanics.
   - Resets player back to starting position if falling off islands (`Y < -8`).
   - Detects reaching the Treasure Chest to trigger victory.

2. [`Assets/Scripts/CameraController.cs`](Assets/Scripts/CameraController.cs):
   - Smoothly tracks the player using `Vector3.Lerp` with configurable offset.
   - Keeps focus on the player's upper body.

3. [`Assets/Scripts/Coin.cs`](Assets/Scripts/Coin.cs):
   - Rotates and bobs up and down using sinusoidal oscillation.
   - Triggers pickup events, awards score points to `GameManager`, plays a synthesized chime, and destroys itself.

4. [`Assets/Scripts/GameManager.cs`](Assets/Scripts/GameManager.cs):
   - Singleton managing coin counts, score, and state.
   - Dynamically updates TextMeshPro HUD labels.
   - Displays the Victory modal panel with fanfare and reloads the scene upon restart.
