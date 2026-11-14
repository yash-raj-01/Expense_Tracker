# 07 - Unity ML-Agents Architecture & TensorBoard Analysis

## 1. Unity ML-Agents Toolkit Architecture
The **Unity ML-Agents Toolkit** enables Unity simulations to serve as training grounds for intelligent agents via a Python-based PyTorch backend:

- **Academy:** Global orchestrator managing physics stepping, simulation speed (`Time.timeScale`), and environment resets.
- **Agent:** C# script class attached to the virtual character/vehicle:
  - `Initialize()`: Pre-allocates buffers and references.
  - `OnEpisodeBegin()`: Resets positions, obstacles, and agent state for a new episode.
  - `CollectObservations(VectorSensor sensor)`: Passes continuous states (speed, angular velocity, track distance).
  - `OnActionReceived(ActionBuffers actions)`: Applies received continuous/discrete actions to physics motors and calculates step rewards.
  - `Heuristic(in ActionBuffers actionsOut)`: Enables human keyboard/VR manual control for debugging and imitation demonstration recording.
- **Ray Perception Sensor:** Projects virtual raycasts in defined radial fans (e.g., $180^\circ$ forward arc) to detect track edges, obstacles, and opponent karts with zero sensor overhead.
- **Behavior Parameters:** Controls whether the agent runs in **Inference Only**, **Default / Heuristic**, or connects to the external Python trainer.

---

## 2. Reward Engineering for Mobile VR
Reward design directly dictates the emergent behavior of the trained agent:

| Event | Reward Signal | Purpose |
|---|---|---|
| Progress along track centerline | $+0.1 \times \text{Speed}$ | Incentivizes fast, forward progress |
| Crossing a checkpoint | $+1.0$ | Ensures circuit completion |
| Drifting off-track | $-0.01$ per frame | Discourages straying from navigable zones |
| Collision with track wall | $-1.0$ (Episode Ends) | Enforces collision avoidance |
| Stalling / Zero speed | $-0.05$ per second | Prevents infinite waiting traps |

---

## 3. Training & TensorBoard Monitoring
Training is executed via the CLI:
```bash
mlagents-learn config/kart_ppo.yaml --run-id=Kart_PPO_Run01
```

### Key TensorBoard Metrics:
- **Cumulative Reward:** The mean reward per episode across all agents. A healthy run displays a smooth, steadily ascending sigmoid curve.
- **Episode Length:** Mean number of timesteps before an episode terminates. For racing, this increases as agents learn to avoid early wall crashes.
- **Policy Loss:** Measures the magnitude of policy network updates; indicates convergence stability.
- **Entropy:** Reflects action randomness. Should start high ($\approx 1.0$) during exploration and gradually decay as the agent gains certainty.

---

## 4. Mobile Deployment via Unity Barracuda
Once training converges, the resulting `.onnx` neural network model file is dragged into Unity's **Model** slot inside `Behavior Parameters`.
- **Unity Barracuda:** A lightweight cross-platform neural network inference engine that compiles models into native mobile bytecode (NEON / ARM64 / GPU compute shaders).
- Enables 60+ FPS inference on mobile devices with zero server latency and zero network dependency.
