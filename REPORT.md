Project: Slither

Team Members:
Amy He - 305517906
Lily Zhou - 505750593
Yichun Li - 205536811
Ryan Chen - 905343772

Project Description:
We implemented a single player version of the game, slither.io. The player controls a snake with the goal of collecting the randomly generated objects to grow bigger. We created a simple environment for the snake to explore with obstacles that must be avoided. The snake can overlap itself, but hitting an obstacle will result in the game ending. The goal of the game is to obtain as high of a score as possible. There are power ups which move around and either speed up the player or add three points.

Algorithms: 
Collision detection: collision detection is used to determine if the snake hits an obstacle or if it collected food (snake.js)
Ease in ease out: collectibles spawn with an ease in and ease out animation applied to the collectible’s size (obstacles.js)
Splines navigation: we use splines as navigation paths for power ups which move through the map (paths.js)
Spring Particle System: we use springs to simulate the movement of the snake (particle_spring_sim.js)
Friction: we implemented friction to help the snake move realistically (particle_spring_sim.js)
Inverse Kinematics and Articulated Joints: we used inverse kinematics to create snake antennas to point in direction of desired movement (snake_head.js)

External Code:
We used some code from our 174A projects for some components including the score overlay and textures.

