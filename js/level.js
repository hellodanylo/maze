// Copyright 2012-2017 Danylo Vashchilenko
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { randomOf } from './utils.js';

export default class Level {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  
    // 2D array!
    const maze = [];
    
    for(let x = 0;x < width;x++) {
      maze[x] = [];
      maze[x].length = height;
      maze[x].fill(blocks.WALL);
    }	
    
    const visited = [];
    for(let i = 0;i < width;i++) {
      visited[i] = [];
      visited[i].length = height;
      visited[i].fill(false);
    }
    
    const backtrack = [];
    
    var point = {x:1, y:1};
    backtrack.push(point);
    
    while(backtrack.length > 0) {
      visited[point.x][point.y] = true;
      maze[point.x][point.y] = blocks.EMPTY;
      
      const directions = Array.from(Directions.all);
      let deadEnd = true;
      
      while(directions.length > 0) {
        let direction = directions[randomOf(directions.length)];
        
        if(direction === Directions.UP) {
          if(point.y+2 < height && !visited[point.x][point.y+2]) {
            maze[point.x][point.y+2] = blocks.EMPTY;
            maze[point.x][point.y+1] = blocks.EMPTY;
            point = {x: point.x, y: point.y+2};
            backtrack.push(point);
            deadEnd = false;
            directions.splice(0);
          }
        } else if(direction === Directions.DOWN) {
          if(point.y-2 >= 0 && !visited[point.x][point.y-2]) {
            maze[point.x][point.y-2] = blocks.EMPTY;
            maze[point.x][point.y-1] = blocks.EMPTY;
            point = {x: point.x, y: point.y-2};
            backtrack.push(point);
            deadEnd = false;
            directions.splice(0);
          }
        } else if(direction === Directions.LEFT) {
          if(point.x-2 >= 0 && !visited[point.x-2][point.y]) {
            maze[point.x-2][point.y] = blocks.EMPTY;
            maze[point.x-1][point.y] = blocks.EMPTY;
            point = {x: point.x-2, y: point.y};
            backtrack.push(point);
            deadEnd = false;
            directions.splice(0);
          }
        } else if(direction === Directions.RIGHT) {
          if(point.x+2 < width && !visited[point.x+2][point.y]) {
            maze[point.x+2][point.y] = blocks.EMPTY;
            maze[point.x+1][point.y] = blocks.EMPTY;
            point = {x: point.x+2, y: point.y};
            backtrack.push(point);
            deadEnd = false;
            directions.splice(0);
          }
        }
        
        directions.splice(directions.indexOf(direction),1);
      }
      
      if(deadEnd) {
        point = backtrack.pop();
      }
    }

    this.maze = maze;
    this.target = {x:width-2,y:height-2};//{x: randomOf(width-2)+1, y: randomOf(height-2)+1};
    this.maze[this.target.x][this.target.y] = Level.blocks.TARGET;
  }
}

const Directions = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  all: [0, 1, 2, 3]
};

const blocks = {
  WALL: 'wall',
  EMPTY: 'empty',
  TARGET: 'target'
};

Level.blocks = blocks;