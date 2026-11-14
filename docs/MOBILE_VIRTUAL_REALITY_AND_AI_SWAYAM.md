# Mobile Virtual Reality and Artificial Intelligence

**Course Source:** SWAYAM / NPTEL Portal  
**Course Code:** CS 662  
**Offering Institute:** Indian Institute of Technology Mandi (IIT Mandi)  
**Instructor:** Prof. Varun Dutt (Associate Professor, School of Computing and Electrical Engineering)

---

## 1. Course Overview & Objectives

The **Mobile Virtual Reality and Artificial Intelligence** course bridges the gap between **Extended Reality (XR)**, **Human-Computer Interaction (HCI)**, and **Modern Artificial Intelligence (AI)**. It focuses on the end-to-end design, development, and deployment of interactive virtual reality applications on mobile platforms, powered by machine learning algorithms and reinforcement learning agents.

### Key Objectives:
- Master mobile Virtual Reality application design principles and interaction mechanics.
- Develop interactive 3D simulations using **Unity 3D** and **Blender**.
- Integrate intelligent agents using **A\* Pathfinding**, **Imitation Learning**, and **Deep Reinforcement Learning (DRL)**.
- Deploy smart mobile VR experiences utilizing **Google VR (GVR) SDK** and **Unity ML-Agents**.

---

## 2. Course Modules Directory

| # | Chapter / Module | Topic Description |
|---|---|---|
| **01** | [Course Overview & Objectives](mobile_vr_ai/01_course_overview.md) | Course context, SWAYAM/NPTEL portal overview, and prerequisites |
| **02** | [Virtual Reality Foundations & Unity 3D Setup](mobile_vr_ai/02_vr_foundations_unity.md) | VR history, human visual perception, stereoscopy, and Unity engine rigging |
| **03** | [Pathfinding Algorithms & Game AI Simulation](mobile_vr_ai/03_a_star_pathfinding_game_ai.md) | Grid graphs, $A^*$ algorithm formulation, heuristics, and vehicle movement |
| **04** | [3D Modeling (Blender) & Mobile VR SDKs](mobile_vr_ai/04_blender_modeling_mobile_vr.md) | Blender asset pipeline, Google Cardboard / GVR SDK, and case studies |
| **05** | [Machine Learning in VR & Imitation Learning](mobile_vr_ai/05_machine_learning_vr.md) | Neural networks, behavioral cloning, and kart driving demonstration policies |
| **06** | [Deep Reinforcement Learning & PPO](mobile_vr_ai/06_deep_reinforcement_learning_ppo.md) | Markov Decision Process (MDP), policy gradients, and PPO clipping mathematics |
| **07** | [Unity ML-Agents & TensorBoard Analysis](mobile_vr_ai/07_unity_ml_agents_tensorboard.md) | Agent scripts, ray sensors, reward engineering, and Barracuda mobile inference |

---

## 3. Detailed Course Curriculum & Topics

### Module 1: Introduction to Virtual Reality & VR Programming
- **History & Foundations:** Evolution of VR from early stereoscopy to Sensorama, Ivan Sutherland's Sword of Damocles, and modern standalone/mobile HMDs.
- **Human Perception & VR Ergonomics:** Field of view (FOV), stereoscopic rendering, interpupillary distance (IPD), motion parallax, and addressing simulator/motion sickness.
- **Unity 3D Engine Setup:**
  - Navigating the Unity Editor, Scene view, Game view, Inspector, and Hierarchy.
  - Primitive GameObjects, Transform components (Position, Rotation, Scale).
  - Physics engine: Rigidbodies, Colliders, Physic Materials, and trigger zones.
  - Lighting models: Directional, Point, Spot, and Ambient lighting; lightmapping and shadows.
- **VR Camera Rigging:** Configuring dual-camera stereoscopic rendering, head tracking via smartphone IMUs (accelerometer + gyroscope).

---

### Module 2: AI Simulation, Pathfinding & Game Mechanics
- **Grid Representations:** Tilemaps, nodes, coordinate mapping, and traversable vs. obstructed cells.
- **A\* (A-Star) Pathfinding Algorithm:**
  - Open and closed sets, path cost calculation:  
    $$f(n) = g(n) + h(n)$$  
    where $g(n)$ is the exact cost from the start node to $n$, and $h(n)$ is the heuristic estimated cost to the goal (Manhattan or Euclidean distance).
  - Tie-breaking, node expansion, and dynamic obstacle handling.
- **Game Mechanics & State Logic:**
  - Vehicle/Tank movement: Smooth interpolations (`Vector3.Lerp` / `Mathf.MoveTowards`), speed curves, angular rotation (`Quaternion.RotateTowards`).
  - Spawning logic, object pooling for performant mobile execution.
  - Collectible crates, score counters, HUD integration, and 3D spatial sound effects.
  - Game lifecycle: Start menu, gameplay loop, pause states, and game over screens.

---

### Module 3: 3D Asset Modeling (Blender) & Mobile VR Development
- **3D Modeling with Blender:**
  - Mesh primitives, vertex/edge/face manipulations, loop cuts, and extrusions.
  - Modifiers: Mirror modifier, Subdivision Surface, and Bevel.
  - UV unwrapping and texture baking for mobile optimization (low-poly modeling).
  - Exporting assets via FBX/OBJ into Unity with materials and textures.
- **Mobile VR Input & SDK Integration:**
  - **Google VR (GVR) SDK** setup for Android.
  - Gaze-based reticle pointer and cardboard button triggers (`IGvrPointerHoverHandler`, `IPointerClickHandler`).
  - Spatial audio listener and 3D sound attenuation.
- **Interactive Case Studies:**
  - **VR Flappy Bird:** Continuous obstacle generation with gaze-controlled flap mechanics.
  - **VR First-Person Shooter (FPS):** Look-to-aim reticle, enemy tracking, hitscan/projectile raycasting.
  - **VR Kart Racing:** Physics-based steering, track boundaries, and checkpoint system.

---

### Module 4: Machine Learning in Virtual Reality
- **Motivation:** Dynamic, responsive, and lifelike non-player characters (NPCs) that adapt to human behavior in immersive spaces.
- **Machine Learning Paradigms:** Supervised learning, unsupervised clustering, and interactive learning.
- **Neural Networks for Game AI:**
  - Multilayer Perceptrons (MLPs) and feedforward architecture.
  - Convolutional layers for visual feature extraction from camera sensors.
  - Activation functions (ReLU, Sigmoid, Tanh) and optimizers (Adam, SGD).
- **Imitation Learning (IL) & Behavioral Cloning:**
  - Recording human gameplay trajectories (state-action pairs $(s_t, a_t)$).
  - Supervised policy training using demonstrations.
  - **Case Study:** Training an autonomous racing kart using human demonstration data and testing AI driving efficiency against track curves.

---

### Module 5: Deep Reinforcement Learning & Unity ML-Agents
- **Reinforcement Learning Foundations:**
  - Markov Decision Processes (MDP): State space $\mathcal{S}$, Action space $\mathcal{A}$, Transition probability $\mathcal{P}$, Reward function $\mathcal{R}$, and discount factor $\gamma$.
  - Exploration vs. Exploitation, Value functions, and Policy $\pi(a|s)$.
- **Advanced Policy Algorithms:**
  - **Proximal Policy Optimization (PPO):** Clipped objective function preventing destructive large policy updates:
    $$L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min\left(r_t(\theta)\hat{A}_t, \, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right) \right]$$
  - Evolutionary Strategies (ES) for non-differentiable environments.
- **Unity ML-Agents Architecture:**
  - **Academy:** Coordinates training environment and global time scaling.
  - **Agent:** Collects observations (Ray Perception Sensors, Vector observations), executes discrete/continuous actions, and receives rewards.
  - **Behavior Parameters:** Configures vector observation size, action branches, and inference models (`.onnx`).
  - **Python Communicator:** Connects Unity to PyTorch backend via `mlagents-learn`.
- **Reward Engineering & Evaluation:**
  - Designing progress rewards, collision penalties, and speed incentives.
  - Monitoring training health in **TensorBoard**: Cumulative reward progression, episode length, policy loss, and entropy bonus.
  - Exporting trained neural network models (`.onnx`) into Unity Barracuda for zero-latency local mobile inference.

---

## 3. Technology Stack & Tools

| Component | Technology / Platform |
|---|---|
| **Platform** | SWAYAM / NPTEL (Government of India) |
| **Engine** | Unity 3D (2020 LTS / 2022 LTS) |
| **3D Modeling** | Blender 3.x |
| **AI / ML Framework** | Unity ML-Agents Toolkit, PyTorch, Python 3.9+ |
| **VR SDK** | Google VR (GVR) SDK, Google Cardboard XR Plugin |
| **Mobile Target** | Android (APK / Android XR) |
| **Monitoring** | TensorBoard |

---

## 4. Textbooks & Reference Materials

1. **Unity Game Development Cookbook: Essentials for Every Game**  
   *Authors:* Paris Buttfield-Addison, Jon Manning, Tim Nugent  
   *Publisher:* O'Reilly Media  

2. **Cardboard VR Projects for Android**  
   *Authors:* Jonathan Linowes, Mathew Schoen  
   *Publisher:* Packt Publishing  

3. **Hands-On Deep Learning for Games**  
   *Author:* Micheal Lanham  
   *Publisher:* Packt Publishing  

4. **Reinforcement Learning: An Introduction**  
   *Authors:* Richard S. Sutton and Andrew G. Barto  
   *Publisher:* MIT Press  
