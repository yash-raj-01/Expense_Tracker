# 05 - Machine Learning in Virtual Reality & Imitation Learning

## 1. The Role of Machine Learning in Virtual Reality
Traditional rule-based systems (finite state machines, behavior trees) often produce predictable, brittle NPC behaviors. Integrating Machine Learning (ML) enables:
- **Adaptive Gameplay:** NPCs that dynamically adjust difficulty based on player proficiency.
- **Natural Interactions:** Non-verbal communication, gesture recognition, and responsive avatars.
- **Complex Continuous Control:** Steering, throttle, and locomotion behaviors that respond smoothly to unscripted dynamic environments.

---

## 2. Neural Networks for Game AI
- **Multilayer Perceptrons (MLPs):**
  - Input layer accepting sensor readings (raycast distances, velocities, relative headings).
  - Hidden layers with non-linear activation functions (ReLU: $f(x) = \max(0, x)$).
  - Output layer producing steering angle and acceleration commands.
- **Convolutional Layers:** Used when agents perceive the virtual world through a visual camera sensor (depth maps or RGB pixel grids).
- **Optimization:** Minimizing loss functions using backpropagation and modern gradient descent optimizers (Adam: Adaptive Moment Estimation).

---

## 3. Imitation Learning (IL) & Behavioral Cloning
When designing reward functions is difficult or complex, **Imitation Learning** teaches agents by observing human gameplay demonstrations.

### Methodology:
1. **Demonstration Recording:** A human player controls the vehicle/avatar in the VR environment. State-action pairs are recorded at each physics timestep $t$:
   $$\mathcal{D} = \{(s_1, a_1), (s_2, a_2), \dots, (s_N, a_N)\}$$
   Where state $s_t$ includes forward speed, track distance, and raycast hits; action $a_t$ represents steering $\in [-1, 1]$ and throttle $\in [0, 1]$.
2. **Supervised Policy Training:** Train a policy $\pi_\theta(a|s)$ parameterized by weights $\theta$ to minimize deviation from human demonstrations:
   $$\mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^N \| a_i - \pi_\theta(s_i) \|^2$$
3. **Model Validation:** Exporting the trained policy network and evaluating driving performance across curved and straight track segments.

### Case Study: Kart Driving via Imitation
- Human driving recordings capture smooth braking before apexes and acceleration on straightaways.
- The cloned policy successfully navigates standard tracks without human intervention.
- Limitation: Compounding errors when the agent enters novel states not observed in demonstration data (addressed via Reinforcement Learning).
