# 04 - 3D Content Creation (Blender) & Mobile VR SDKs

## 1. 3D Asset Pipeline with Blender
Creating lightweight, performant 3D assets is critical for maintaining high frame rates ($60\text{ FPS}$) on mobile VR hardware:
- **Mesh Editing Primitives:** Vertices, edges, and polygons; box modeling, edge extrusion (`E`), loop cutting (`Ctrl+R`), and face insetting (`I`).
- **Modifiers:**
  - *Mirror Modifier:* Enforces symmetry across axis planes for vehicles and characters.
  - *Bevel & Subdivision:* Refining edges while controlling poly-count budgets.
  - *Decimate:* Reducing polygon counts for mobile LOD (Level of Detail) models.
- **UV Unwrapping & Texturing:** Unwrapping 3D surfaces onto 2D coordinate space ($(u, v) \in [0, 1]$), texture baking, and atlas packing.
- **Exporting for Unity:** Exporting via `.fbx` with embedded transforms, materials, and normal maps.

---

## 2. Google VR (GVR) SDK Integration
- **Google Cardboard XR Package:** Lightweight SDK providing head tracking, lens distortion rendering, and user input handling on Android and iOS.
- **Gaze-Based Reticle Pointer:**
  - A dynamic crosshair rendered in 3D camera space that projects a raycast into the virtual scene.
  - Expands upon hovering over interactive objects implementing `IPointerEnterHandler` and `IPointerExitHandler`.
- **Trigger Inputs:**
  - Cardboard magnetic/conductive button presses mapped to `Input.GetButtonDown("Fire1")` or capacitive touch events.
  - Dwell-time / timed gaze triggers where maintaining focus for 2 seconds activates an action without physical touch.

---

## 3. Practical Case Studies

### A. VR Flappy Bird
- Continuous horizontal movement across procedural pipes.
- Gaze reticle controls jump flaps or vertical steering.
- Collision detection with pipes triggers score count and restart interface.

### B. VR First-Person Shooter (FPS)
- Stationary or rail-shooter viewpoint with 360-degree enemy spawns.
- Target acquisition via head rotation; firing upon button press or timed reticle locking.
- Raycasting for hitscan weapons, bullet trail particles, and audio spatialization.

### C. VR Kart Racing
- 3D circuit track with banked turns and checkpoint triggers.
- Physics-based wheel colliders, motor torque, and suspension simulation.
- Real-time lap timer, speed HUD fixed to user's peripheral field of view.
