# Video Presentation Script: Ledger 3D – Coin Collector
**Course Evaluation: 3D Interactive & Game Development Project**  
*Evaluation Mode: Recorded Video Walkthrough (No Viva) • Maximum Duration: 10:00 (Target: 8:00 – 9:00)*

---

## 📋 Evaluation Guidelines & Pre-Recording Checklist

> [!IMPORTANT]
> - **Individual Submission**: Every student must record and submit their own video. Team/combined videos are strictly rejected.
> - **Working Output Demonstration**: Slides alone are not acceptable. You must capture your screen showing the Unity Editor, the running game in Game View, scene hierarchy, and source code.
> - **Time Limit**: Keep total runtime strictly under 10 minutes (Recommended pacing: ~1:30 to 1:45 per question).
> - **Submission**: Upload the video to Google Drive/YouTube (Unlisted) and test the link in an incognito window to ensure evaluator access.

### Recommended Screen Recording Setup
- **Resolution**: 1080p (1920x1080) at 30 or 60 fps.
- **Audio**: Clean microphone input with minimal background noise.
- **Layout**: Full-screen Unity Editor with the **Game View** maximized or docked alongside the **Scene View**, **Hierarchy**, and **Inspector**. Have your code editor (Visual Studio / VS Code) open in an adjacent tab or window.

---

## ⏱️ Video Time Allocation Overview

| Section | Topic | Target Time | Cumulative |
|---|---|---|---|
| **Intro & Q1** | Interactive Experience & Objective | 01:45 | 01:45 |
| **Q2** | Tools, Technologies & Project Structure | 01:45 | 03:30 |
| **Q3** | Interactions, Behavior & Script Logic | 01:45 | 05:15 |
| **Q4** | Visuals, Materials, Lighting & Assets | 01:45 | 07:00 |
| **Q5** | Technical Challenges, Debugging & Stability | 01:30 | 08:30 |
| **Outro** | Conclusion & Submission Wrap-Up | 00:30 | 09:00 |

---

# 🎬 Question-by-Question Recording Script

---

### 🟢 Question 1: What interactive experience did you create, and what is its purpose?
**Target Timestamp**: `00:00 – 01:45`

#### 🖥️ What to Show on Screen:
1. Start with the **Unity Editor** in focus with `MainScene.unity` loaded.
2. Press the **Play (▶)** button.
3. Show live gameplay in the **Game View**:
   - Move the player character across the starting platform using WASD.
   - Jump across the stepping stones using Spacebar.
   - Collect 2–3 floating gold coins (let the viewer hear the pickup chime and see the HUD update).
   - Jump over the red hazard hurdle on the ridge platform.
   - Ascend to the summit and reach the Golden Treasure Chest.
   - Highlight the **Victory Screen** displaying the final score and click **PLAY AGAIN**.

#### 🎙️ Spoken Dialogue:
> "Hello everyone and welcome. My name is **[Your Name]**, and today I am presenting my interactive 3D game development project: **Ledger 3D – Coin Collector**, built entirely in Unity 3D with C#.
>
> **What I Built & Its Objective:**  
> I created a stylized low-poly 3D platformer game set on floating islands in the sky. The primary objective is to guide an explorer character through a floating ledger world, collect spinning gold coins across floating stone steps, navigate past hazard obstacles, and reach the ancient Golden Treasure Chest at the summit to secure the ledger vault.
>
> **Main Features & Interactive Elements:**  
> 1. **Physics-Driven Player**: Fully responsive 3D movement using WASD/Arrow keys with single-jump physics and automatic ground-check detection.
> 2. **Dynamic Collectibles**: 12 rotating and floating gold coins that disappear upon collection, award points, and trigger real-time procedural audio chimes.
> 3. **Smooth 3rd-Person Follow Camera**: A damping follow camera that tracks the player's movement and keeps the action framed cleanly.
> 4. **Live TextMeshPro HUD**: An overlay card displaying collected coins (`Coins: X / 12`), real-time score, and gameplay hints.
> 5. **Fail-Safe Fall Respawn**: If the player misjudges a jump and falls into the abyss, they are automatically respawned back at the start island.
> 6. **Victory & Restart State**: Reaching the treasure chest triggers a celebratory victory screen with final score reporting and an interactive restart button.
>
> **Personal Contribution:**  
> I developed 100% of this project individually—from scene layout, low-poly primitive modeling, and custom material shaders, to the 4 core C# gameplay scripts, physics configurations, and TextMeshPro UI architecture."

---

### 🟢 Question 2: Which tools, technologies, and development concepts did you use?
**Target Timestamp**: `01:45 – 03:30`

#### 🖥️ What to Show on Screen:
1. Stop Play mode.
2. Open the **Project Window** and navigate through the project folders:
   - Expand `Assets/Scenes` (`MainScene.unity`).
   - Expand `Assets/Scripts` (show the 4 scripts).
   - Expand `Assets/Materials` (show the 11 materials).
   - Expand `Assets/Prefabs` (`Player`, `Coin`, `TreasureChest`).
3. Select the **Player** GameObject in the **Hierarchy**:
   - Highlight the **Rigidbody**, **CapsuleCollider**, and **PlayerController** script in the **Inspector**.
4. Select the **GameManager** GameObject:
   - Highlight the connected UI references (`coinsText`, `scoreText`, `victoryPanel`, `restartButton`).

#### 🎙️ Spoken Dialogue:
> "Now let's examine the development tools, technologies, and core concepts powering the project.
>
> **Engine & Tools Choice:**  
> I selected **Unity 3D (Unity 6 / 2022.3 LTS)** paired with **C#** and Visual Studio. Unity was chosen for its mature PhysX engine, fast iterative editor workflow, built-in TextMeshPro rendering pipeline, and robust component-based architecture which allowed me to build a clean, lightweight game without external bloated dependencies.
>
> **Project Structure & Organization:**  
> As you can see in the Project panel, the project is structured cleanly following industry standards:
> - `Assets/Scenes/`: Holds `MainScene.unity`, pre-configured in Editor Build Settings.
> - `Assets/Scripts/`: Contains exactly 4 modular, beginner-friendly C# scripts.
> - `Assets/Materials/`: 11 optimized low-poly PBR materials with defined metallic, smoothness, and emission channels.
> - `Assets/Prefabs/`: Reusable prefabs for the Player, Coin, and Treasure Chest.
> - `Packages/manifest.json`: Trimmed to standard Unity UI, physics, and input modules.
>
> **Course Concepts Implemented:**  
> Throughout this project, I applied several key concepts from our course:
> 1. **Component-Based Software Architecture**: Leveraging `MonoBehaviour`, `RequireComponent`, and explicit component decoupling.
> 2. **3D Transformations & Vector Math**: Applying `Vector3.Lerp` for camera damping, `Quaternion.Slerp` and `Quaternion.LookRotation` for player turning, and trigonometric sinusoidal functions for coin floating.
> 3. **Rigid Body Dynamics & Colliders**: Distinguishing between solid collision volumes for platforms and trigger volumes for pickups and goals.
> 4. **State Management & Singleton Pattern**: Implementing `GameManager.Instance` to coordinate game states between active gameplay, score tracking, and the victory sequence.
>
> **How Components Work Together:**  
> When the Player touches a Coin trigger, the `Coin` script detects the `Player` tag, invokes `GameManager.Instance.CollectCoin()`, plays an audio chime, and destroys the coin. The `GameManager` immediately updates the TextMeshPro UI elements. When the player reaches the Treasure Chest, the chest trigger calls `GameManager.Instance.WinGame()`, activating the victory canvas modal."

---

### 🟢 Question 3: How did you implement interactions and behavior in your project?
**Target Timestamp**: `03:30 – 05:15`

#### 🖥️ What to Show on Screen:
1. Switch to your Code Editor (Visual Studio / VS Code).
2. Open and walk through **`PlayerController.cs`**:
   - Highlight lines capturing `Input.GetAxisRaw("Horizontal")` and `"Vertical"`.
   - Highlight the ground-check raycast: `Physics.Raycast(transform.position, Vector3.down, groundCheckDistance, groundLayer)`.
   - Highlight `FixedUpdate()` applying horizontal velocity while preserving gravity.
   - Highlight `fallThreshold` respawning logic.
3. Open and show **`Coin.cs`**:
   - Show `transform.Rotate()` and sinusoidal bobbing: `Mathf.Sin(Time.time * bobFrequency) * bobAmplitude`.
   - Show `PlayPickupChime()` where an `AudioClip` is generated procedurally.
4. Open **`GameManager.cs`**:
   - Show `CollectCoin()`, `WinGame()`, and `RestartGame()`.

#### 🎙️ Spoken Dialogue:
> "In this section, I will explain how interactions and behaviors are implemented through code.
>
> **User Input & Character Responsiveness:**  
> Player movement is controlled via standard WASD or Arrow Keys, with Spacebar for jumping. In `PlayerController.cs`, input is captured in `Update()` using `Input.GetAxisRaw()`, ensuring immediate, snappy response times. 
> 
> In `FixedUpdate()`, the movement direction vector is normalized and multiplied by `moveSpeed`. Notice that we explicitly preserve the vertical velocity (`targetVel.y = currentVel.y`), allowing Unity's gravity engine to operate naturally while we control horizontal velocity. To make the character face its travel direction, we smoothly rotate it using `Quaternion.Slerp` towards `Quaternion.LookRotation(moveDirection)`.
>
> **Ground Detection & Single-Jump Physics:**  
> To prevent infinite jumping or glitching on platform ledges, I implemented a downward raycast:
> ```csharp
> isGrounded = Physics.Raycast(transform.position, Vector3.down, groundCheckDistance, groundLayer);
> ```
> Jumping is only permitted when `isGrounded` is true. When Space is pressed, an upward impulse velocity is applied directly to the Rigidbody.
>
> **Interactive Coin Behavior & Procedural Audio:**  
> In `Coin.cs`, every coin performs two simultaneous transformations each frame:
> 1. Continuous spin around the world Y-axis at 120 degrees per second.
> 2. Smooth vertical bobbing using `Mathf.Sin(Time.time * bobFrequency) * bobAmplitude`.
> 
> When the player enters the coin's trigger collider, `OnTriggerEnter` fires. Instead of relying on external audio files that could fail to load, I wrote `PlayPickupChime()`, which generates a clean, procedural two-tone arpeggiated audio clip (880Hz to 1320Hz) directly in memory using mathematical sine waves.
>
> **Scene State Management:**  
> Application state is managed centrally in `GameManager.cs`. It stores total coins, current coins collected, and score. When the player collides with the treasure chest, `WinGame()` activates the victory panel and plays a 4-note victory fanfare. Pressing the 'R' key or clicking the 'Play Again' button invokes `SceneManager.LoadScene()`, cleanly reloading the level."

---

### 🟢 Question 4: How did you create and integrate the visual or interactive elements?
**Target Timestamp**: `05:15 – 07:00`

#### 🖥️ What to Show on Screen:
1. Switch back to Unity in **Scene View** (not Play mode).
2. Select **Shaded Wireframe** mode to display the low-poly topology.
3. Zoom in on:
   - **Starting Haven**: Show the platform base and green grass top slab.
   - **Low-Poly Trees**: Show trunk cylinder and cone/sphere foliage meshes.
   - **Stepping Stones**: Show placement and spacing across the gap.
   - **Hazard Hurdles**: Show the red obstacle blocks on the ridge.
   - **The Treasure Chest**: Zoom in on the detailed chest construction (wood base, lid, gold straps, lock, and green wireframe BoxCollider trigger).
4. Select the **Directional Light**:
   - Show the light color, intensity (1.25), and **Soft Shadows** enabled.
5. Select a material like `Mat_Gold_Coin`:
   - Show Metallic (0.95), Smoothness (0.85), and Emission enabled in Inspector.

#### 🎙️ Spoken Dialogue:
> "Here is how the visual and interactive elements were created, configured, and integrated into the scene.
>
> **Low-Poly Art Style & Modeling:**  
> To adhere to the project requirements of creating a clean, high-performance low-poly aesthetic without unnecessary external asset dependencies, I modeled the environment entirely using optimized 3D primitive geometries:
> - **Floating Platforms**: Composed of dark slate earthen base blocks topped with emerald green grass slabs.
> - **Natural Props**: Decorative pine trees constructed from tapered trunk cylinders and layered low-poly foliage spheres.
> - **Treasure Chest**: A multi-part structure featuring a mahogany wood chest body and lid, accented with gold binding strips and a golden front lock.
>
> **Material & Shader Configuration:**  
> I created 11 distinct materials with calibrated PBR surface properties:
> - `Mat_Grass`: A matte forest green (`#38A169`) with low smoothness (0.2) to simulate soft turf.
> - `Mat_Gold_Coin`: High metallic (0.95) and high smoothness (0.85) combined with subtle golden emission so coins catch the sunlight and glow even in shaded areas.
> - `Mat_Obstacle`: Bold hazard red (`#E53E3E`) to instantly signal danger and test the player's timing.
> - `Mat_Water_Void`: Calm turquoise teal placed far below (`Y = -12`) to give depth to the floating island sky world.
>
> **Lighting & Atmosphere:**  
> The scene uses a warm sun Directional Light (`RGB: 1.0, 0.96, 0.88`) with Soft Shadows enabled, paired with balanced ambient sky illumination. This provides soft, realistic shadows beneath the floating islands and player character, making depth perception intuitive for platforming jumps.
>
> **Integration & Testing:**  
> All interactive visual elements have appropriate colliders: solid Box/Capsule Colliders for walkable platforms and obstacles, and Trigger Colliders for coins and the treasure chest. In testing, I verified collision bounds using the Scene wireframe view to ensure the player cannot fall through corners or snag on geometry."

---

### 🟢 Question 5: What technical challenges did you face, and how did you ensure your project works correctly?
**Target Timestamp**: `07:00 – 08:30`

#### 🖥️ What to Show on Screen:
1. Switch to Unity and enter **Play mode**.
2. **Demonstrate Fall Respawn**: Intentionally run off the side of the platform into the void—show the player instantly resetting back to the start platform with zero momentum.
3. Show the **Unity Console Window**: Highlight that there are **0 Errors and 0 Warnings**.
4. Complete the level:
   - Collect coins, jump over obstacles, reach the chest.
   - Show the **Victory Screen** popping up.
   - Click the **Play Again (R)** button with the mouse or press the **R** key to show seamless reload.

#### 🎙️ Spoken Dialogue:
> "Finally, let's discuss the technical challenges encountered during development and how they were resolved.
>
> **Challenge 1: Grounded Check & Jump Consistency**  
> *Problem*: Initially, checking collision via simple collision callbacks caused intermittent failures—the player would either double-jump while sliding off platform edges or fail to jump when landing quickly.  
> *Solution*: I resolved this by implementing a dedicated downward Raycast (`Physics.Raycast`) with a customized distance offset (`1.15f`). Additionally, in `FixedUpdate()`, the vertical velocity is reset immediately before applying the jump impulse, ensuring every jump reaches the exact same predictable height regardless of current momentum.
>
> **Challenge 2: Camera & Rigidbody Synchronization**  
> *Problem*: When following a Rigidbody moving in `FixedUpdate()`, traditional camera movement in `Update()` caused visual stuttering or micro-jitter due to mismatched update frequencies.  
> *Solution*: I placed the camera interpolation in `LateUpdate()` using `Vector3.Lerp` with a damping factor of `6.0f`, while setting the player Rigidbody's collision detection mode to `ContinuousDynamic` and freezing rotation on X and Z axes. This resulted in buttery-smooth tracking.
>
> **Challenge 3: Cross-Version Unity API Compatibility**  
> *Problem*: Unity 6 introduced `linearVelocity` on Rigidbodies, deprecating `velocity`. Running the project across different Unity LTS versions would produce compiler warnings or errors.  
> *Solution*: I implemented C# preprocessor directives (`#if UNITY_6000_0_OR_NEWER`) so the codebase automatically compiles natively with zero warnings in both Unity 6 and Unity 2022 LTS.
>
> **Challenge 4: Eliminating Missing Asset Dependencies**  
> *Problem*: External audio files often suffer from broken paths or import mismatches when moving projects between computers.  
> *Solution*: I wrote procedural audio synthesis functions for both the coin chime and the victory fanfare, generating audio waveforms directly in C# memory.
>
> **Project Stability & Completeness:**  
> As seen in the console, the project compiles and runs with zero errors and zero warnings. All coin counts, scoring, respawn mechanics, and UI dialogues perform reliably. For future iterations, the system could easily be extended with moving hazard platforms and multi-stage levels."

---

### 🟢 Conclusion & Wrap-Up
**Target Timestamp**: `08:30 – 09:00`

#### 🖥️ What to Show on Screen:
1. Return to the starting view of the game or the victory screen.
2. Show the final HUD score and player character.

#### 🎙️ Spoken Dialogue:
> "In conclusion, **Ledger 3D – Coin Collector** successfully demonstrates the integration of 3D modeling, physics simulation, vector transformations, state management, and interactive UI systems in a cohesive, polished game experience.
>
> Thank you for watching my presentation. The project files, documentation, and source code are available in the repository."

---

## 📤 Post-Recording & Submission Steps

1. **Check Recording Duration**: Ensure the final video is **between 7 and 9.5 minutes** (must NOT exceed 10:00).
2. **Review Video Quality**:
   - Is your voice clearly audible throughout?
   - Is code and UI text crisp and readable in 1080p?
   - Did you demonstrate actual working gameplay rather than just static slides?
3. **Upload**:
   - Upload to **Google Drive** (set permission to *"Anyone with the link can view"*) or **YouTube** (set to *"Unlisted"*).
4. **Link Test**: Open the shared link in a private/incognito browser tab to confirm evaluators can open and play it without permission barriers.
5. **Submit**: Paste your link into the shared course submission form before the deadline.
