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
import { epc } from './helpers.js';

export default class MiniMap extends React.Component {
  render() {
    var px, py;
    if(this.props.player) {
      px = this.props.player.position.x;
	    py = this.props.player.position.y;
    }

    const rows = [];
    for(let x = this.props.level.length-1;x >= 0;x--) {
      let ys = this.props.level[x];
      let column = [];
      for(let y = ys.length-1;y >= 0;y--) {
        let cell = ys[y];
        let classes = ['cell'];
        if(px === x && py === y) {
          classes.push('cell--player');
        } else {
          classes.push('cell--'+cell);
        }
        column.push(epc('div', {key: y, className: classes.join(' ')}, null));
      }
      rows.push(epc('div', {key: x, className: 'column'}, column));
    }

    return epc('article', {className: 'minimap'}, rows);
  }
}