# 03 - Pathfinding Algorithms & Game AI Simulation

## 1. Grid Representation & Node Graphs
To enable autonomous agents to navigate 3D game environments, continuous coordinate space is discretized into a graph:
- **Grid Mapping:** 2D/3D array of discrete cells where each cell is either traversable (`walkable = true`) or an obstacle (`walkable = false`).
- **Graph Nodes:** Each node $n$ holds spatial coordinates $(x, y, z)$, cost attributes, and adjacent neighbor pointers (4-directional or 8-directional connectivity).

---

## 2. A* (A-Star) Pathfinding Algorithm
The $A^*$ algorithm combines Dijkstra's shortest-path search with greedy best-first evaluation to find optimal paths efficiently.

### Cost Function:
$$f(n) = g(n) + h(n)$$

Where:
- $g(n)$: Exact movement cost from the starting node to current node $n$.
- $h(n)$: Admissible heuristic estimate of the lowest cost from $n$ to the goal target.
- $f(n)$: Total estimated path cost through node $n$.

### Heuristic Functions:
- **Manhattan Distance (4-directional movement):**
  $$h(n) = D \cdot (|n.x - \text{goal}.x| + |n.y - \text{goal}.y|)$$
- **Euclidean Distance (Straight line / any-angle):**
  $$h(n) = D \cdot \sqrt{(n.x - \text{goal}.x)^2 + (n.y - \text{goal}.y)^2}$$
- **Diagonal Distance (8-directional movement):**
  $$h(n) = D \cdot \max(|n.x - \text{goal}.x|, |n.y - \text{goal}.y|)$$

### Algorithm Flow:
1. Maintain two sets: `OpenSet` (priority queue of discovered nodes to evaluate) and `ClosedSet` (nodes already visited).
2. Pop node $n$ from `OpenSet` with the lowest $f(n)$.
3. If $n = \text{Goal}$, reconstruct path backwards using parent pointers.
4. For each neighbor $m$: compute tentative $g(m)$. If lower than previously recorded, update parent pointer, recalculate $f(m)$, and insert/update into `OpenSet`.

---

## 3. Game Mechanics Implementation
- **Agent Movement:** Smooth position interpolation using `Vector3.MoveTowards` or `Vector3.Lerp` along waypoints calculated by $A^*$.
- **Rotational Alignment:** Computing target heading $\theta = \text{atan2}(\Delta y, \Delta x)$ and rotating smoothly via `Quaternion.RotateTowards`.
- **Dynamic Spawning & Pooling:** Pre-allocating crate/enemy GameObjects in an object pool to avoid runtime garbage collection hiccups on mobile CPUs.
- **Game State Machine:** Managing Start, Active Gameplay, Paused, and Game Over states with 3D spatial audio triggers.
