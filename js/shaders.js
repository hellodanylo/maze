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

const shaders = {
  fragment: {
    type: 'x-shader/x-fragment',
    source: `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void) {
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        }`
  },
  vertex: {
    type: 'x-shader/x-vertex',
    source: `
      attribute vec3 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat4 uMMatrix;
      uniform mat4 uVMatrix;
      uniform mat4 uPMatrix;
      varying vec2 vTextureCoord;
      void main(void) {
          gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
          vTextureCoord = aTextureCoord;
      }`
  }
};

export function createShaderProgram(gl) {
  const fragmentShader = getShader(gl, shaders.fragment);
  const vertexShader = getShader(gl, shaders.vertex);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('Could not initialise shaders!');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
      "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram,
      "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram,
      "uMMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram,
      "uVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
      "uPMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram,
      "uSampler");

  return shaderProgram;
}

function getShader(gl, meta) {
	var shader;

	if (meta.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (meta.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, meta.source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}

	return shader;
}