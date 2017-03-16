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

import Canvas from './canvas.js';
import MiniMap from './mini-map.js';
import World from './world.js';
import Player from './player.js';
//const jQuery = require('jquery');
//const co = require('co');
import path from 'path';

function asyncLoadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', e => resolve(image));
    image.addEventListener('error', e => reject(e));
    image.src = PREFIX+'/'+path;
  });
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      welcome: true,
      percent: 0,
    };

    this._onMiniMapToggle = this._onMiniMapToggle.bind(this);
  }


  componentDidMount() {
    this._startPromise = new Promise(resolve => {
      this._onStart = resolve;
    });

    this.script();
  }

  async script() {
    try {
      await this._loadTextures();
    } catch(err) {
      this.setState({error: 'Unable to load the texture files! :('});
      console.error(err);
      return;
    }

    // Waiting for the player's approval to start
    await this._startPromise;

    this.world = new World();
    this.world.pause();

    this.setState({
      welcome: false, 
      miniMap: true
    });
  }

  async _loadTextures() {
    
    var textures = [
      "floor.jpg", 
      "skybox.jpg", 
      "player.png", 
      "wall1.jpg", 
      "wall2.jpg", 
      "wall3.jpg",
      "wall4.jpg"
    ].map(asyncLoadImage);

    // Updating progress bar each time a resource is loaded
    var loadedCounter = 0;
    textures.forEach(promise => {
      promise.then(image => {
        if(loadedCounter === null) return;
        loadedCounter++;
        this.setState({percent: Math.floor(loadedCounter/textures.length*100)});
      }).catch(err => {
        loadedCounter = null;
      });
    });


    // Waiting for all textures to load here
    textures = await Promise.all(textures);

    this.textures = {};
    for(let image of textures) {
      const name = path.basename(image.src).split('.')[0];
      this.textures[name] = image;
    }
  }

  _onMiniMapToggle() {
    this.setState({miniMap: !this.state.miniMap});
  }

  render() {
    if(this.state.welcome) {
      return this._renderWelcome();
    } else {
      return this._renderGame();
    }
  }

  _renderWelcome() {
    const {percent, error} = this.state;
    return (
      <main className="welcome">
        {error}
        {!error && <div className="progress">{percent+'%'}</div>}
        <button className={percent===100 ? 'play' : 'wait'} onClick={_ => this._onStart()}>Play</button>
      </main>
    );
  }

  _renderGame() {
    return (
      <main className="game">
        <Canvas key="canvas" world={this.world} textures={this.textures}
          onMiniMapToggle={this._onMiniMapToggle} />
        <aside>
          <div className="rules">
            <section>
              <h2>Keyboard Controls</h2>
              <p>
                 Move: WASD ↑→↓← &lt;space&gt;<br/>
                 Mini-Map: Q
              </p>
            </section>
            <section>
              <h2>Goal</h2>
              <p>Find Danylo's photo</p>
            </section>
          </div>
          <MiniMap hidden={!this.state.miniMap} world={this.world}/>
        </aside>
      </main>
    );
  }
}

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(<App/>, document.getElementById('app'));
});
