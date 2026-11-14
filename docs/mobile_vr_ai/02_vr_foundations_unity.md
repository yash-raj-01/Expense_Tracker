# 02 - Virtual Reality Foundations & Unity 3D Setup

## 1. History & Milestones of Virtual Reality
- **Early Stereoscopy (1838):** Charles Wheatstone's stereoscope proving that binocular disparity creates depth perception.
- **Sensorama (1962):** Morton Heilig's multisensory arcade cabinet with 3D video, stereo sound, wind, and aroma.
- **The Sword of Damocles (1968):** Ivan Sutherland's head-mounted display tracking user perspective.
- **Modern Era (2010s–Present):** Commercial mobile headsets, low-persistence displays, and smartphone-based Google Cardboard bringing VR to consumer hardware.

---

## 2. Human Perception & Immersion
- **Stereoscopic Vision:** Horizontal separation between the human eyes (Interpupillary Distance, IPD $\approx 64\text{ mm}$) produces two slightly different 2D retinal projections that the brain fuses into a 3D percept.
- **Motion Parallax & Depth Cues:** Relative apparent movement of objects based on distance from the observer.
- **Field of View (FOV):** Typical human horizontal FOV is $\approx 200^\circ$; mobile VR lenses typically cover $90^\circ - 110^\circ$.
- **Latency & Simulator Sickness:**
  - *Motion-to-Photon Latency:* Must remain $< 20\text{ ms}$ to prevent vestibular dissonance.
  - Mitigating simulator sickness through fixed reference points, teleportation locomotion, and maintaining $60\text{ FPS}$ on mobile.

---

## 3. Unity 3D Architecture
- **Scene Hierarchy & GameObjects:** Every element in a Unity scene is a `GameObject` that acts as a container for components.
- **Core Components:**
  - `Transform`: Defines position, rotation, and scale in 3D Euclidean space.
  - `MeshFilter` & `MeshRenderer`: Define 3D geometry and visual appearance via materials and shaders.
  - `Rigidbody`: Integrates Nvidia PhysX simulation (gravity, mass, velocity, drag).
  - `Collider` (`Box`, `Sphere`, `Capsule`, `Mesh`): Geometric boundary for collision detection and triggers.
- **Lighting Models:** Real-time directional lighting, point lights, baked lightmaps for mobile performance, and ambient occlusion.

---

## 4. VR Camera Rigging
- Setting up dual cameras with offset corresponding to human IPD.
- Screen barrel distortion shaders compensating for mobile optical lens pincushion distortion.
- Attaching smartphone Inertial Measurement Unit (IMU) tracking via accelerometer and gyroscope for 3-Degrees-of-Freedom (3-DoF) orientation tracking.
