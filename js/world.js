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

import Level from './level.js';
import Player from './player.js';

export default class World {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.cubeSize = 2;
		this.localTick = 0;

		this.paused = false;
		this.listeners = [];

		// Is this bad?
		this.player = new Player(this);
  }

	get level() {
		return this._level;
	}

	set level(newLevel) {
		this.event(World.Events.LEVEL_CHANGE, newLevel);
		this._level = newLevel;
	}

	pause() {
		this.paused = true;
	}

	unpause() {
		this.paused = false;
	}

	isPaused() {
		return this.paused;
	}
	
  tick(ellapsed, keyboard) {
		if(this.isPaused()) {
			return;
		}
		this.player.tick(this, keyboard);
		this.localTick += ellapsed;
	}

	addEventListener(listener) {
		this.listeners.push(listener);
	}

	removeEventListener(listener) {
		this.listeners = this.listeners.filter(a => a !== listener);
	}

	event(name, opts) {
		for(let listener of this.listeners) {
			listener(name, opts);
		}
	}
}

World.Events = {
	LEVEL_CHANGE: 'world-level-change'
};