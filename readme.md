# Deep Q-network for learning to play 2048

-A value based reinforcement learning approach to learn to play the game 2048.
-Rules of the game can be found [here](https://en.wikipedia.org/wiki/2048_(video_game))

## Intro
1. The RL Agent consists of 16 state variables that denote the value of all the tiles at each position of the 4x4 grid.
2. There are 4 moves that the agent can chose from : (swipe up,swipe down, swipe left, swipe right)
3. Rewarding system is based on the count of each tile value after a move.
4. Epsilon is reduced manually based on performance

## Usage and Credits
1. 2048 JS base from [wxsms](https://github.com/wxsms/jquery-2048/blob/master/index.html)
2. Reinforce.js framework by [karpathy](https://github.com/karpathy/reinforcejs)

## Assumptions/Features
1. Positional Independence - The tile's position in no way alters the state. The rewarding system only considers the total count of each value (0,2,4,8 etc ) in the grid and not their position.

2. Exponential Rewarding - The rewarding is assumed to be exponential. For example ,creating a 2048 tile is exponentially better than creating a 256 tile.

3. Penalizing Idling - The game adds no tile if the move made does not alter the postion of the tiles. Thus the agent might be stuck idling. This barrier in progress of the game is avoided by penalizing the agent while reaching such states.

4. Reporting - The performance of the agent is visualized by counting the maximum tile value reached and the number of idle moves made in each game. The graph for the same is presented

## Results
- Coming Up Soon!
