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

import { vec3, mat4 } from 'gl-matrix';
import Level from './level.js';

var lastTick = 0;

const KEYS = {
  A: 65, LEFT: 37,
  D: 68, RIGHT: 39,
  W: 87, UP: 38,
  S: 83, DOWN: 40,
  SPACEBAR: 32
};

function translateWorldToLevel(vec) {
  return {
    x: Math.floor(vec[0]),
    y: Math.floor(vec[2])
  };
}

function translateLevelToWorld(point) {
  return vec3.fromValues(point.x+0.5, 0.8, point.y+0.5);
}

export default class Player {
  constructor(world) {
    this.state= 0;
    this.world = world;
    this.position = vec3.fromValues(1, 1, 1);
    this.direction = vec3.fromValues(1, 0, 1);
    this.up= vec3.fromValues(0, 10, 0);
    
    this.distanceWalked= 0.0;

    this.jumpStage = 0;
    this.jumpOffset = 0.0;
    this.sinceLastJumpFinished = 999;
    this.sinceLastJumpStarted = 999;

    this.speed = 1.5;
    this.god = 0;

    this.lastLP = {};
  };

  handleKeyDown(event) {
    
  }

  tick(world, keyboard) {
    const ellapsed = world.localTick - lastTick;
    lastTick = world.localTick;
    
    if (keyboard[KEYS.A] || keyboard[KEYS.LEFT]) {
      // Left cursor key
      vec3.transformMat4(this.direction, this.direction, mat4
          .rotateY({}, mat4.create(), 0.004 * ellapsed));
    }
    if (keyboard[KEYS.D] || keyboard[KEYS.RIGHT]) {
      // Right cursor key
      vec3.transformMat4(this.direction, this.direction, mat4
          .rotateY({}, mat4.create(), -0.004 * ellapsed));
    }

    var positionDelta = vec3.create();
    var farDelta = vec3.create();

    // Up
    if (keyboard[KEYS.W] || keyboard[KEYS.UP]) {
      const distance = this.speed / 1000 * ellapsed;
      vec3.scale(positionDelta, this.direction, distance);
      vec3.scale(farDelta, this.direction, distance+0.15);
    }

    // Down
    if (keyboard[KEYS.DOWN] || keyboard[KEYS.S]) {
      // Back walking is slightly slower
      const distance = (this.speed - 0) / 1000 * ellapsed;
      vec3.scale(positionDelta, this.direction, -distance);
      vec3.scale(farDelta, this.direction, -(distance+0.15));
    }

    const farWP = vec3.add({}, this.position, farDelta);
    const farLP = translateWorldToLevel(farWP);

    if(vec3.length(positionDelta) > 0) {
      const maze = this.world.level.maze;
      const lastLP = this.lastLP;
      
      if(!this.god && maze[farLP.x][farLP.y] !== Level.blocks.EMPTY) {
        if(lastLP.x != farLP.x && maze[lastLP.x][farLP.y] === Level.blocks.EMPTY) {
          // X-axis bound
          positionDelta = vec3.fromValues(0, positionDelta[1], positionDelta[2]);
        } else if(this.lastLP.y != farLP.y && maze[farLP.x][lastLP.y] === Level.blocks.EMPTY) {
          // Y-axis bound
          positionDelta = vec3.fromValues(positionDelta[0], positionDelta[1], 0);
        } else {
          // XY-axes bound
          positionDelta = vec3.fromValues(0, positionDelta[1], 0);
        }
      }

      vec3.add(this.position, this.position, positionDelta);
      this.distanceWalked += vec3.length(positionDelta);

      const newLP = translateWorldToLevel(this.position);

      if(this.lastLP.x !== newLP.x || this.lastLP.y !== newLP.y) {
        this.world.event(Player.Events.MOVED, newLP);
        this.lastLP = newLP;
      }

      const target = this.world.level.target;
      if(Math.abs(newLP.x-target.x) < 2 && Math.abs(newLP.y-target.y) < 2) {
        world.event(Player.Events.WON);
      }
    }

    // Spacebar
    if (keyboard[KEYS.SPACEBAR] && this.jumpStage == 0
        && this.sinceLastJumpFinished >= 300) {
      
      this.jumpStage = 1;
      this.sinceLastJumpStarted = 0;
      this.speed += 1.5;
    }

    /*
      * Jumping
      */
    if (this.jumpStage != 0) {
      this.sinceLastJumpStarted += ellapsed;

      var t = this.sinceLastJumpStarted;
      // Jumps 2m up and falls in 500ms.
      this.jumpOffset = Math.sin(t/500*Math.PI)*0.3;

      if (this.sinceLastJumpStarted > 500) {
        this.jumpStage = 0;
        this.sinceLastJumpFinished = 0;
        this.speed -= 1.5;
      }
    }

    this.sinceLastJumpFinished += ellapsed;
  }

  moveInLevel(newLP) {
    if(this.lastLP.x !== newLP.x || this.lastLP.y !== newLP.y) {
      this.world.event(Player.Events.MOVED, newLP);
      this.lastLP = newLP;
    }

    this.position = translateLevelToWorld(newLP);
  }
}



Player.Events = {
  MOVED: 'player-moved',
  WON: 'player-won'
};