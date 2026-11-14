# 06 - Deep Reinforcement Learning & Proximal Policy Optimization (PPO)

## 1. Markov Decision Process (MDP)
Reinforcement Learning models the interaction between an autonomous **Agent** and its virtual **Environment** as a Markov Decision Process defined by the tuple $\langle \mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R}, \gamma \rangle$:
- $\mathcal{S}$: State space (all possible configurations of agent and world).
- $\mathcal{A}$: Action space (continuous motor torques or discrete choices).
- $\mathcal{P}(s'|s, a)$: Transition probability from state $s$ to state $s'$ under action $a$.
- $\mathcal{R}(s, a, s')$: Scalar reward signal signaling immediate desirability.
- $\gamma \in [0, 1)$: Discount factor balancing immediate vs. future rewards.

### Objective:
Find an optimal policy $\pi^*(a|s)$ that maximizes expected cumulative discounted reward:
$$J(\pi) = \mathbb{E}_{\tau \sim \pi} \left[ \sum_{t=0}^\infty \gamma^t R(s_t, a_t) \right]$$

---

## 2. Proximal Policy Optimization (PPO)
Standard policy gradient algorithms (like REINFORCE) often suffer from unstable learning when policy updates take excessively large steps. **PPO** solves this via clipped surrogate objective functions.

### The Probability Ratio:
Let $r_t(\theta)$ be the probability ratio comparing the new policy $\pi_\theta$ to the old policy $\pi_{\theta_{old}}$:
$$r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{old}}(a_t | s_t)}$$

### Clipped Surrogate Objective:
$$L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min\left(r_t(\theta)\hat{A}_t, \, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right) \right]$$

Where:
- $\hat{A}_t$: Generalized Advantage Estimator (GAE) indicating whether an action was better than average.
- $\epsilon$: Clipping threshold (typically $\epsilon = 0.2$).
- The clipping penalty removes incentives for moving $r_t(\theta)$ outside the interval $[1-\epsilon, 1+\epsilon]$, ensuring stable, monotonic improvement across training iterations.

---

## 3. Evolutionary Strategies (ES) Comparison
- While PPO computes explicit analytical gradients using backpropagation, **Evolutionary Strategies** evaluate candidate policies by adding random parameter perturbations, ranking fitness rewards, and moving parameter vectors in directions of higher reward.
- Useful for non-differentiable or noisy physics environments in VR simulations.
