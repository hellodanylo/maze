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
import { sprintf } from 'sprintf-js';
import Level from './level.js';
import { createShaderProgram } from './shaders.js';
import Player from './player.js';
import { randomOf } from './utils.js';

var gl;
var world;

export default class Canvas extends React.Component {
  constructor(props) {
    super();
		this.props = props;
		this.state = { track: 0 };

		world = this.props.world;
		this.world = this.props.world;
		this.setup = this.setup.bind(this);
		this.currentlyPressedKeys = {};
  }

	componentDidMount() {
		setTimeout(_ => this.script(), 0);
	}

	afterLevelFinished() {
		return new Promise((resolve, reject) => {
			const handler = (name, event) => {
				if(name === Player.Events.WON) {
					resolve();
					this.world.removeEventListener(handler);
				}
			};
			this.world.addEventListener(handler);
		});
	}

	async script() {
		while(true) {
			this.world.level = new Level(35,35);
			this.world.player.moveInLevel({x:1,y:1});			
			await this.overlayTimer(5);

			this.world.unpause();			

			// Waiting for the game to finish
			await this.afterLevelFinished();

			this.world.pause();
			await new Promise(resolve => {
				this.setState({overlay: [<span key="smile">:)</span>, <button key="new" onClick={resolve}>New Game</button>]});
			});
			this.setState({overlay: false, track: (this.state.track+1)%3});
		}
	}

	overlayTimer(duration) {
		return new Promise((resolve,reject) => {
			this.setState({overlay: duration});
			[...Array(duration).keys()].forEach(time => setTimeout(_ =>  {
				if(time === 0) {
					this.setState({overlay: undefined});
					resolve();
				} else {
					this.setState({overlay: time});
				}
			}, (duration-time)*1000));
		});
	}

  setup(canvasDOM) {
    try {
		  gl = canvasDOM.getContext("webgl");
		  gl.viewportWidth = canvasDOM.width;
		  gl.viewportHeight = canvasDOM.height;
	  } catch (err) { 
      console.error(err);
    }

    if (!gl) {
      this.setState({error: true});
      return;
    }

    shaderProgram = createShaderProgram(gl);
    initBuffers();

		for(let name in this.props.textures) {
			const texture = gl.createTexture();
			texture.image = this.props.textures[name];
			textures[name] = texture;
			handleLoadedTexture(texture);
		}
    
    mat4.perspective(pMatrix, -80.0, gl.viewportWidth / gl.viewportHeight, 0.01,
        600.0);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);

		requestAnimationFrame(this.setupLoop());
  }

	setupLoop() {
		const then = new Date().getTime();
		return _ => {
			requestAnimationFrame(this.setupLoop());
			if(!this.world.isPaused()) {
				this.world.tick((new Date()).getTime() - then, this.currentlyPressedKeys);
				drawScene(this.world);
			}
		};
	}

  render() {
    if(this.state.error) {
      return <div className="error">Error</div>;
    }

    return (
			<div className="screen">
				<canvas width="800" height="600" ref={this.setup}/>
				{this.state.overlay && <div className="overlay">{this.state.overlay}</div>}
				<audio src={`./track${this.state.track}.mp3`} autoPlay={true}/>
			</div>
		);
  }

	handleKeyDown(event) {
		if(event.repeat) return;

		this.currentlyPressedKeys[event.keyCode] = true;
		event.preventDefault();
	}

	handleKeyUp(event) {
		this.currentlyPressedKeys[event.keyCode] = false;
		event.preventDefault();

		if(event.keyCode === 81 && !this.toggling) {
			this.toggling = true;
			setTimeout(this.props.onMiniMapToggle, 0);
			setTimeout(() => {
				this.toggling = false;
			}, 1);
		}
	}
}

var shaderProgram;


function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);

	console.log("Loaded", texture);
}

var textures = {};

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var floorVertexPositionBuffer;
var floorVertexTextureCoordBuffer;

var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;
var cubeVertexColorBuffer;
var cubeVertexTextureCoordBuffer;

function initBuffers() {
	floorVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);

	var vertices = [ 
		-1.0, 0.0,  1.0,
		 1.0, 0.0,  1.0, 
	  -1.0, 0.0, -1.0,
		 1.0, 0.0, -1.0, 
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	floorVertexPositionBuffer.itemSize = 3;
	floorVertexPositionBuffer.numItems = 4;

	floorVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer);

	var textureCoords = [ 
		0.0, 1.0, 
		1.0, 1.0, 
		0.0, 0.0, 
		1.0, 0.0 
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
			gl.STATIC_DRAW);
	floorVertexTextureCoordBuffer.itemSize = 2;
	floorVertexTextureCoordBuffer.numItems = 4;

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [
	// Front face
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

	// Back face
	-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

	// Top face
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

	// Right face
	1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

	// Left face
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	cubeVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	var textureCoords = [
	// Front face
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

	// Back face
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

	// Top face
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,

	// Bottom face
	1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

	// Right face
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

	// Left face
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
			gl.STATIC_DRAW);
	cubeVertexTextureCoordBuffer.itemSize = 2;
	cubeVertexTextureCoordBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = [ 0, 1, 2, 0, 2, 3, // Front face
	4, 5, 6, 4, 6, 7, // Back face
	8, 9, 10, 8, 10, 11, // Top face
	12, 13, 14, 12, 14, 15, // Bottom face
	16, 17, 18, 16, 18, 19, // Right face
	20, 21, 22, 20, 22, 23 // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
			gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

var mMatrixStack = [];
var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();

var cubeAngle = 0;

function drawFloor() {
	let mMatrix = mat4.create();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
			floorVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindTexture(gl.TEXTURE_2D, textures.floor);
	gl.activeTexture(gl.TEXTURE0);
	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	//gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	
	

	mat4.translate(mMatrix, mMatrix, [ 0.5, 0, 0.5 ]);	
	mat4.scale(mMatrix, mMatrix, [ 0.5, 0, 0.5 ]);	


	for(let x = 0; x < world.level.width; x++) {
		mMatrixStack.push(mat4.clone(mMatrix));
		for( let y = 0; y < world.level.height; y++) {
			gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, floorVertexPositionBuffer.numItems);		
			mat4.translate(mMatrix, mMatrix, [0, 0, 2]);//x%2===0?1:-1]);
		}
		mMatrix = mMatrixStack.pop();
		mat4.translate(mMatrix, mMatrix, [2, 0, 0]);
	}
}

function drawSkybox() {
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
			cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	gl.bindTexture(gl.TEXTURE_2D, textures.skybox);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
	mMatrixStack.push(mat4.clone(mMatrix));
	mat4.translate(mMatrix, mMatrix, [ 0, 60, 0 ]);
	mat4.scale(mMatrix, mMatrix, [ 200, 200, 200 ]);
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mMatrix = mMatrixStack.pop();
}

function drawScene(world) {
	const player = world.player;

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.identity(mMatrix);
	mat4.identity(vMatrix);

	var cameraMat = mat4.translate({}, mat4.create(),
			[ 0, player.jumpOffset + Math.sin(((player.distanceWalked*100) % 100)/100*2*Math.PI)*0.05, 0 ]);
	var camera = vec3.transformMat4({}, player.position, cameraMat);
	var target = vec3.add({}, camera, player.direction);
	mat4.lookAt(vMatrix, camera, target, player.up);
	gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
	
	drawFloor();
	drawSkybox();

	mMatrixStack.push(mat4.clone(mMatrix));
	
	// Making the level and world coordinates match
	mat4.translate(mMatrix, mMatrix, [0.5, 0.5, 0.5]); //-96
	mat4.scale(mMatrix, mMatrix, [0.5, 0.5, 0.5]);

	gl.activeTexture(gl.TEXTURE0);	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	for ( let x = 0; x < world.level.maze.length; x++) {
		for ( let y = 0; y < world.level.maze[0].length; y++) {

			if (world.level.maze[x][y] === Level.blocks.EMPTY)
				continue;
			
			var texture;
			if(world.level.maze[x][y] === Level.blocks.TARGET) {
				texture = textures.player;
			} else if((x + y) % 7 != 0) {
				texture = textures.wall1;
			} else if((x * 5 + y * 3) % 5 == 1) {
				texture = textures.wall2;
			} else if((x * 5 + y * 3 ) % 5 == 2) {
				texture = textures.wall3;
			} else if((x * 5 + y * 3) % 5 == 3){
				texture = textures.wall4;
			}

			gl.bindTexture(gl.TEXTURE_2D, texture);
			
			mMatrixStack.push(mat4.clone(mMatrix));
			mat4.translate(mMatrix, mMatrix, [x*2, 0, y*2]);
			gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
			gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
					gl.UNSIGNED_SHORT, 0);
			mMatrix = mMatrixStack.pop();
		}
	}
	mMatrix = mMatrixStack.pop();
}

var lastTime = 0;

