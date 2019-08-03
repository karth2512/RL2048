#Deep Q-network for learning to play 2048

A value based reinforcement learning appraoch to learn to play the game 2048
Rules of the game can be found [here](https://en.wikipedia.org/wiki/2048_(video_game))

##Assumptions
1. Positional Independence - The tile's position in no way alters the state. The rewarding system only considers the total count of each value (0,2,4,8 etc ) in the grid and not their position. Since there is an addition of a tile (value=2) after each move we can assume that the agent will not idle.
2. Exponential Rewarding - The rewarding is assumed to be exponential. For example ,creating a 2048 tile is exponentially better than creating a 256 tile.
##Features
1. The RL Agent consists of 16 state variables that denote the value of all the tiles 
