<html>

<head>
<title>Maze Game</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">

<link rel="stylesheet" type="text/css" href="css/core.css">

<script type="text/javascript" src="js/sprintf-0.7-beta1.js"></script>
<script type="text/javascript" src="js/gl-matrix-min.js"></script>
<script type="text/javascript" src="js/webgl-utils.js"></script>
<script type="text/javascript" src="js/core.js"></script>

<script type="text/javascript">
	var gameId = ${gameId};
</script>

<script id="shader-fs" type="x-shader/x-fragment">
    precision mediump float;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }
</script>

<script id="shader-vs" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;

    varying vec2 vTextureCoord;


    void main(void) {
        gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }
</script>

</head>


<body onload="webGLStart();">
	<table>
		<tr>
			<td><canvas id="canvas" width="800" height="600"></canvas></td>
			<td id="info-panel">
				<table id="info-table">
					<tr>
						<td class="label">Game ID:</td>
						<td class="value" id="gameId">${gameId}</td>
					</tr>
					<tr>
						<td class="label">Location:</td>
						<td class="value" id="location"></td>
					</tr>
					<tr>
						<td class="label">Distance:</td>
						<td class="value" id="distanceWalked"></td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	<audio id="soundHandle" style="display: none;" preload="auto"></audio>
	Danylo Vashchilenko (c)

</body>

</html>
