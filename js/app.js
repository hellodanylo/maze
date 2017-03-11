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

import React from 'react';
import ReactDOM from 'react-dom';
import { generate } from './maze.js';

import GameCanvas from './game-canvas.js';
import MiniMap from './mini-map.js';

import { epc } from './helpers.js';

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {level: generate(25, 25), minimap: false };
    
    this.onWorldChange = this.onWorldChange.bind(this);
    this.onMinimapToggle = this.onMinimapToggle.bind(this);
    this.onLevelFinished = this.onLevelFinished.bind(this);
  }

  componentDidMount() {
    this.audioDOM.src = './sounds/welcome.mp3';
    this.audioDOM.play();
  }
  
  onWorldChange(player) {
    this.setState({player});
  }

  onMinimapToggle() {
    this.setState({minimap: !this.state.minimap});
  }

  onLevelFinished() {
    if(!this.levelFinished) {
		  this.audioDOM.src = 'sounds/end.mp3';
			this.audioDOM.play();
			this.levelFinished = true;
    }
  }

  render() {
    const children = [
      epc(GameCanvas, {
        key: 'canvas', 
        level: this.state.level,
        onWorldChange: this.onWorldChange,
        onMinimapToggle: this.onMinimapToggle,
        onLevelFinished: this.onLevelFinished
      }, null),
      epc('audio', {
        key: 'audio',
        ref: (audioDOM) => { this.audioDOM = audioDOM },
      }, null)
    ];
    if(this.state.minimap) {
      children.push(epc(MiniMap, {
        key: 'minimap', 
        level: this.state.level,
        player: this.state.player
      }, null));
    }
    return epc('main', {}, children);
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
	ReactDOM.render(epc(App, {}, null), document.getElementById('root'));
});
