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

import Player from './player.js';
import World from './world.js';

export default class MiniMap extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {level: props.world.level};

    this._onWorldEvent = this._onWorldEvent.bind(this);
    this.props.world.addEventListener(this._onWorldEvent);
  }

  _onWorldEvent(name, opts) {
    if(name === World.Events.LEVEL_CHANGE) {
      this.setState({level: opts});
      return;
    }

    if(name !== Player.Events.MOVED || this.dom === undefined) {
      return;
    }

    const last = Object.assign({}, this.props.world.player.lastLP);
    last.x = this.props.world.level.height - last.x-1;
    last.y = this.props.world.level.height - last.y-1;
    const current = Object.assign({}, opts);
    current.x =  this.props.world.level.height - current.x-1;
    current.y = this.props.world.level.height - current.y-1;

    if(last.x && last.y) {
      this.dom.children[last.x].children[last.y].classList.remove('cell--player');
    }
    this.dom.children[current.x].children[current.y].classList.add('cell--player');
  }

  render(){
    if(this.state.level === undefined) {
      return <div/>;
    }

    const rows = [];
    for(let x = this.state.level.maze.length-1;x >= 0;x--) {
      let ys = this.state.level.maze[x];
      let column = [];
      for(let y = ys.length-1;y >= 0;y--) {
        column.push(<div key={y} className={`cell cell--${ys[y]}`}/>);
      }
      rows.push(<div key={x} className="column">{column}</div>);
    }

    return (<article ref={dom => this.dom=dom} className="minimap">{rows}</article>);
  }
}