var gl;

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}

	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
        return false;
	}

    return true;
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
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
}

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

function loadTexture(path, id) {
	var image = new Image();

	var texture = gl.createTexture();
	texture.image = image;
	textures[id] = texture;

	(function(texture) {
		image.onload = function() {
			handleLoadedTexture(texture);
		}
	})(texture);

	image.src = path;
}

function initTexture() {
	loadTexture("img/floor.jpg", "floor");
	loadTexture("img/skybox.jpg", "skybox");
	loadTexture("img/player.png", "player");
	loadTexture("img/wall1.jpg", "wall1");
	loadTexture("img/wall2.jpg", "wall2");
	loadTexture("img/wall3.jpg", "wall3");
	loadTexture("img/wall4.jpg", "wall4");
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

var floorVertexPositionBuffer;
var floorVertexTextureCoordBuffer;

var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;
var cubeVertexColorBuffer;

function initBuffers() {
	floorVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);

	var vertices = [ -1.0, 0.0, 1.0, 
	                 1.0, 0.0, 1.0, 
	                 -1.0, 0.0, -1.0,
			1.0, 0.0, -1.0, ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	floorVertexPositionBuffer.itemSize = 3;
	floorVertexPositionBuffer.numItems = 4;

	floorVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer);

	var textureCoords = [ 0.0, 30.0, 15.0, 30.0, 0.0, 0.0, 15.0, 0.0 ];

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

var currentlyPressedKeys = {};

var player = {

	state: 0,
	
	position : vec3.fromValues(-88, 4, -88),
	direction : vec3.fromValues(0, 0, 1),
	up: vec3.fromValues(0, 10, 0),
	
	distanceWalked: 0.0,

	jumpStage : 0,
	jumpOffset : 0.0,
	sinceLastJumpFinished : 999,
	sinceLastJumpStarted : 999,

	speed : 20.00,

	tick : (function(world, pressedKeys, ellapsed) {
		
		if(world.localTick < 10000 && player.state == 0) {
			player.position = vec3.fromValues(0, 90, 0);
			player.up = vec3.fromValues(0, 90, 10);
			player.direction = vec3.fromValues(0, -1, 0);
			player.state = 1;
		} else if(world.localTick > 10000 && player.state == 1) {
			player.position = vec3.fromValues(-88, 4, -88);
			player.up = vec3.fromValues(0, 10, 0);
			player.direction = vec3.fromValues(0, 0, 1);
			player.state = 2;
		}
		
		if (pressedKeys[37] || pressedKeys[65]) {
			// Left cursor key
			vec3.transformMat4(player.direction, player.direction, mat4
					.rotateY({}, mat4.create(), 0.004 * ellapsed));
		}
		if (pressedKeys[39] || pressedKeys[68]) {
			// Right cursor key
			vec3.transformMat4(player.direction, player.direction, mat4
					.rotateY({}, mat4.create(), -0.004 * ellapsed));
		}

		// Up
		if (pressedKeys[38] || pressedKeys[87]) {
			
			// The speed is in m/s.
			var distance = player.speed / 1000 * ellapsed;
			var newPosition = vec3.add({}, player.position, vec3.scale({}, player.direction, distance));
			
			var farDistance = distance + 0.7;
			farPosition = vec3.add({}, player.position, vec3.scale({}, 
					player.direction, farDistance));
			
			var x = Math.floor((farPosition[0]+100)/8);
			var y = Math.floor((farPosition[2]+100)/8);
			
			if(world.level[x][y] == 0) {
				player.position = newPosition;
				
				player.distanceWalked += distance;
				
				if(x == 23 && y == 23) {
					var soundHandle = document.getElementById('soundHandle');
					if(!soundHandle.endMusic) {
						soundHandle.src = 'sounds/end.mp3';
						soundHandle.play();
						soundHandle.endMusic = true;
					}
				}
			}
		}

		// Down
		if (pressedKeys[40] || pressedKeys[83]) {
			// Back walking is slightly slower
			var distance = (player.speed - 1.5) / 1000 * ellapsed;
			vec3.add(player.position, player.position, vec3.scale({},
					player.direction, -distance));
		}

		// Spacebar
		if (pressedKeys[32] && player.jumpStage == 0
				&& player.sinceLastJumpFinished >= 300) {
			
			player.jumpStage = 1;
			player.sinceLastJumpStarted = 0;
			player.speed += 10.5;
		}

		/*
		 * Jumping
		 */
		if (player.jumpStage != 0) {
			player.sinceLastJumpStarted += ellapsed;

			var t = player.sinceLastJumpStarted;
			// Jumps 2m up and falls in 500ms.
			player.jumpOffset = -0.000032 * t * t + 0.016 * t;

			if (player.sinceLastJumpStarted > 500) {
				player.jumpStage = 0;
				player.sinceLastJumpFinished = 0;
				player.speed -= 10.5;
			}
		}

		player.sinceLastJumpFinished += ellapsed;
	})
};

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

var mMatrixStack = [];
var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();

var cubeAngle = 0;

function drawFloor() {
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
			floorVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindTexture(gl.TEXTURE_2D, textures.floor);
	gl.activeTexture(gl.TEXTURE0);
	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	
	mMatrixStack.push(mat4.clone(mMatrix));
	mat4.scale(mMatrix, mMatrix, [ 100, 0, 100 ]);
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, floorVertexPositionBuffer.numItems);
	mMatrix = mMatrixStack.pop();
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
	mat4.scale(mMatrix, mMatrix, [ 100, 100, 100 ]);
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mMatrix = mMatrixStack.pop();
}

function drawMark() {
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
			cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	gl.bindTexture(gl.TEXTURE_2D, textures.player);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
	mMatrixStack.push(mat4.clone(mMatrix));
	mat4.translate(mMatrix, mMatrix, [ 88, 4.1, 88 ]);
	mat4.scale(mMatrix, mMatrix, [ 4, 4, 4 ]);
	gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mMatrix = mMatrixStack.pop();
}

function drawScene(world) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.identity(mMatrix);
	mat4.identity(vMatrix);

	var cameraMat = mat4.translate({}, mat4.create(),
			[ 0, player.jumpOffset, 0 ]);
	var camera = vec3.transformMat4({}, player.position, cameraMat);
	var target = vec3.add({}, camera, player.direction);
	mat4.lookAt(vMatrix, camera, target, player.up);
	gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
	
	drawFloor();
	drawSkybox();
	drawMark();

	mMatrixStack.push(mat4.clone(mMatrix));
	mat4.translate(mMatrix, mMatrix, [-96, 4, -96]);
	mat4.scale(mMatrix, mMatrix, [ 4, 4, 4 ]);
	gl.activeTexture(gl.TEXTURE0);	
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	for ( var x = 0; x < world.level.length; x++) {
		for ( var y = 0; y < world.level[0].length; y++) {

			if (world.level[x][y] == 0)
				continue;
			
			var texture;
			if((x + y) % 7 != 0) {
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

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		cubeAngle += 0.002 * elapsed;
	}
	lastTime = timeNow;
}

function generateCallback(world) {
	return (function(then) {
		return (function() {
			world.tick((new Date()).getTime() - then);
		});
	})(new Date());
}



function loadLevel(world) {
	var request = new XMLHttpRequest();
	request.open("GET", "./api/level?gameId=" + gameId, false);
	request.send();

	world.level = JSON.parse(request.responseText).maze;
}

var world = {width: 100, height: 100, cubeSize: 4,
		tick: function tick(ellapsed) {
			requestAnimFrame(generateCallback(this));

			world.localTick += ellapsed;
			
			player.tick(this, currentlyPressedKeys, ellapsed);

			document.getElementById("location").innerHTML = sprintf("%.2f, %.2f, %.2f",
					player.position[0], player.position[1], player.position[2]);
			
			document.getElementById("distanceWalked").innerHTML = sprintf("%.2f",
					player.distanceWalked);

			drawScene(this);
			animate();
		},
		localTick: 0
};

function webGLStart() {
	var canvas = document.getElementById("canvas");

	var result = initGL(canvas);

    if(!result) {
        return;
    }

	initShaders();
	loadLevel(world);
	initBuffers();
	initTexture();
	
	var soundHandle = document.getElementById('soundHandle');
	soundHandle.src = 'sounds/welcome.mp3';
	soundHandle.play();

	mat4.perspective(pMatrix, -80.0, gl.viewportWidth / gl.viewportHeight, 0.1,
			300.0);
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	world.tick(1);
}