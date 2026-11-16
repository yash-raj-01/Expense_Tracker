# Standalone Unity 3D / Mobile VR Expense Tracker

A standalone Unity 2022.3 LTS project visualizing personal finances in an immersive 3D futuristic room. Connects directly to the existing Express/Prisma PostgreSQL backend API with seamless offline fallback data.

---

## 1. Prerequisites & Unity Installation

To open and run this project, you need **Unity 2022.3 LTS**:

1. Download and install **Unity Hub** from [unity.com/download](https://unity.com/download).
2. Open Unity Hub, navigate to **Installs** → **Install Editor**.
3. Select **Unity 2022.3 LTS** (e.g., `2022.3.20f1` or any latest 2022.3 LTS release).
4. *(Optional for Mobile VR)*: In the install options, check:
   - **Android Build Support** (including Android SDK & NDK Tools and OpenJDK) for Android / Google Cardboard / Meta Quest.
   - **iOS Build Support** for Apple iOS Cardboard evaluation.

---

## 2. Opening the Project in Unity Hub

1. Launch **Unity Hub**.
2. Click the **Add** dropdown in the top-right corner and choose **Add project from disk**.
3. Select the folder:
   ```
   ./isd_online
   ```
4. Verify the editor version shows `2022.3 LTS` and click the project to open it.
5. On the first launch, Unity will import the packages declared in `Packages/manifest.json` (`TextMeshPro`, `Unity UI`, `XR Plugin Management`, `OpenXR`, and `Newtonsoft.Json`).

---

## 3. How to Run the Project

### Option A: Open the Pre-Saved Playable Scene (Recommended)
1. In the **Project** window at the bottom, navigate to:
   ```
   Assets / Scenes / MainFinancialRoom.unity
   ```
2. Double-click **MainFinancialRoom** to open it.
3. Click the **Play** button (▶) at the top center of the Unity Editor.
4. The 3D scene will initialize:
   - The dark matte grid floor and futuristic directional lighting load.
   - The red translucent budget warning plane appears at `Y = 3.0m`.
   - The 3D Expense Pillars smoothly rise from the floor with ease-out animations.
   - The glowing cyan AI Advisor Orb begins harmonic floating and displays spending insights on its 3D info board.

### Option B: Rebuild Scene via Editor Menu
You can rebuild or reset the entire 3D environment at any time using the included editor automation tool:
- Click the top menu bar: **Expense Tracker** → **Build Financial Room Scene**.
- The script automatically rebuilds the complete hierarchy and saves `Assets/Scenes/MainFinancialRoom.unity`.

---

## 4. Configuring the Backend API Connection

The project is designed to communicate directly with your existing Express backend API:

- **Default API Endpoint**: `http://localhost:5001`
- **Category Analytics**: `GET /api/analytics/categories`
- **Transactions List**: `GET /api/expenses`
- **Portfolio Summary**: `GET /api/analytics/summary`
- **Health Check**: `GET /api/health`

### Starting the Local Backend
In a separate terminal, start the existing backend server:
```bash
cd server
npm start
# Server listens on http://localhost:5001
```

### Changing the Backend URL or Enabling Auth in Unity
1. In the **Hierarchy** window, select the **ExpenseApiService** GameObject.
2. In the **Inspector** window:
   - **Base Url**: Change to your remote server or deployment (e.g., `https://your-api.vercel.app` or `http://10.0.2.2:5001` for Android Emulator).
   - **Auth Token**: If your backend requires JWT authentication, paste the token into the `Auth Token` field.
   - **Force Offline Mode**: Check this box if you want to bypass network calls and strictly use the academic benchmark dataset.

### Offline Fallback Resilience
If the backend server is not running or unreachable, the system **automatically falls back** to the 5 standard evaluation categories:
- **Food**: ₹4,200 *(Exceeds ₹3,000 budget by ₹1,200 — marked with red highlight & warning ring)*
- **Travel**: ₹1,800 *(Within budget — ₹1,200 remaining)*
- **Bills**: ₹3,500 *(Exceeds ₹3,000 budget by ₹500 — marked with red highlight & warning ring)*
- **Shopping**: ₹2,100 *(Within budget — ₹900 remaining)*
- **Entertainment**: ₹1,500 *(Within budget — ₹1,500 remaining)*

---

## 5. Mobile VR Configuration & Testing

The project is structured with XR Plug-in Management and supports Mobile VR (Google Cardboard, Meta Quest, OpenXR):

### A. Desktop Stereo Preview (Instant Cardboard Simulation)
You do **not** need a physical VR headset plugged in to evaluate the mobile VR experience:
1. Press **Play** in the Unity Editor.
2. Press the **`V`** key on your keyboard.
3. The camera instantly toggles into **Side-by-Side Stereo View** (Split-screen Left/Right eyes with standard 64mm IPD separation).
4. Press **`V`** again to return to mono desktop view.

### B. Building for Mobile VR (Android / Google Cardboard / Meta Quest)
1. Go to **File** → **Build Settings...**
2. Select **Android** and click **Switch Platform**.
3. Open **Edit** → **Project Settings** → **XR Plug-in Management**.
4. Under the **Android** tab:
   - For Google Cardboard: Check **Cardboard XR Plugin** or **OpenXR**.
   - For Meta Quest: Check **Oculus** or **OpenXR**.
5. Return to **Build Settings**, ensure `Assets/Scenes/MainFinancialRoom.unity` is checked, and click **Build and Run**.

---

## 6. Controls Reference

| Input Action | Desktop Controls | Mobile / Touch Controls |
|---|---|---|
| **Move Forward / Backward** | `W` / `S` or `Up` / `Down` Arrow | Two-finger vertical drag |
| **Move Left / Right** | `A` / `D` or `Left` / `Right` Arrow | Two-finger horizontal drag |
| **Elevate Up / Down** | `E` / `Space` (Up), `Q` / `Ctrl` (Down) | — |
| **Sprint Movement** | Hold `Left Shift` | — |
| **Freelook / Look Around** | Hold **Right Mouse Button** and drag | Single-finger touch drag |
| **Head Tracking** | Mouse / XR Headset | Device Gyroscope (auto-enabled) |
| **Select / Inspect Pillar** | **Left Click** on pillar | Tap on pillar / Gaze dwell (1.5s) |
| **Dismiss Transaction HUD** | **Right Click** or `Escape` | Tap outside HUD card |
| **Toggle Stereo Split-Screen** | Press **`V`** key | XR Stereo native rendering |

---

## 7. Project Architecture & Components

```
isd_online/
├── Assets/
│   ├── Materials/           # Standard PBR shaders (Navy floor, cyan/warning pillars, translucent budget plane)
│   ├── Prefabs/             # Modular prefabs for Pillar, AI Advisor Orb, and Transaction HUD
│   ├── Scenes/
│   │   └── MainFinancialRoom.unity  # Complete playable 3D financial scene
│   └── Scripts/
│       ├── API/             # ExpenseApiService (UnityWebRequest + CORS + error handling)
│       ├── AI/              # AIAdvisorOrb (floating animation) + IAIFinancialAdvisorEngine (heuristics)
│       ├── Camera/          # CameraController (WASD, mouse, gyro, stereo preview toggle)
│       ├── Editor/          # SceneAutoBuilder (one-click menu generator)
│       ├── Interaction/     # PillarInteraction (raycasting hover/click) + TransactionHUD (3D modal)
│       ├── Models/          # FinancialModels (Prisma schema mapping, paise-to-Rupee conversion)
│       ├── Visualization/   # ExpenseVisualizer (pillar procedural generation) + BudgetPlaneVisualizer (Y=3)
│       └── VR/              # XRDeviceController (subsystem detection & tracking setup)
├── Packages/
│   └── manifest.json        # Unity package dependencies (UGUI, TextMeshPro, XR, OpenXR, Newtonsoft)
└── ProjectSettings/         # ProjectVersion.txt, Graphics, Quality, XR, and Input settings
```

---

## 8. Verification & Academic Evaluation Notes

1. **Standalone Isolation**: The entire Unity project resides strictly in `./isd_online/`. The web frontend (`client/`) and Node.js backend (`server/`) remain completely unmodified.
2. **API Alignment**: Data mapping corresponds directly with `server/prisma/schema.prisma` and Express controllers (`/api/analytics/categories` and `/api/expenses`).
3. **Hardware Independence**: Full functionality (navigation, data rendering, pillar animation, over-budget detection, AI advice, and stereo preview) is testable immediately in the Unity Editor without physical VR hardware.
