var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
];

var torsoHeight = 5.0;
var torsoWidth = 5.0;
var upperArmHeight = 5.0;
var middleArmHeight = 6.5;
var lowerArmHeight = 3.0;
var upperArmWidth = 1.0;
var middleArmWidth = 0.95;
var lowerArmWidth = 0.85;
var headHeight = 4.0;
var headWidth = 4.0;

var numNodes = 4;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++)
    figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------

function quad(a, b, c, d, color) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);

    // Assign the same color to all vertices of the quad
    for (let i = 0; i < 4; i++) {
        pointsArray.push(color);
    }
}

function cube() {
    // Use different colors for each face
    quad(1, 0, 3, 2, vec4(1.0, 0.0, 0.0, 1.0)); // Red
    quad(2, 3, 7, 6, vec4(0.0, 1.0, 0.0, 1.0)); // Green
    quad(3, 0, 4, 7, vec4(0.0, 0.0, 1.0, 1.0)); // Blue
    quad(6, 5, 1, 2, vec4(1.0, 1.0, 0.0, 1.0)); // Yellow
    quad(4, 5, 6, 7, vec4(1.0, 0.0, 1.0, 1.0)); // Magenta
    quad(5, 4, 0, 1, vec4(0.0, 1.0, 1.0, 1.0)); // Cyan
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-20.0, 20.0, -20.0, 20.0, -20.0, 20.0);

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "modelViewMatrix"),
        false,
        flatten(modelViewMatrix)
    );
    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "projectionMatrix"),
        false,
        flatten(projectionMatrix)
    );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(
        vColor,
        4,
        gl.FLOAT,
        false,
        0,
        sizeof.vec4 * numVertices
    );
    gl.enableVertexAttribArray(vColor);

    document.getElementById("slider0").onchange = function () {
        theta[torsoId] = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function () {
        theta[upperArmId1] = event.srcElement.value;
        initNodes(upperArmId1);
    };

    document.getElementById("slider2").onchange = function () {
        theta[torsoId] = event.srcElement.value;
        initNodes(middleArmId1);
    };
    document.getElementById("slider3").onchange = function () {
        theta[torsoId] = event.srcElement.value;
        initNodes(lowerArmId1);
    };

    document.getElementById("slider4").onchange = function () {
        theta[rightUpperArmId] = event.srcElement.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function () {
        theta[rightLowerArmId] = event.srcElement.value;
        initNodes(rightLowerArmId);
    };
    document.getElementById("slider6").onchange = function () {
        theta[leftUpperLegId] = event.srcElement.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function () {
        theta[leftLowerLegId] = event.srcElement.value;
        initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function () {
        theta[rightUpperLegId] = event.srcElement.value;
        initNodes(rightUpperLegId);
    };
    document.getElementById("slider9").onchange = function () {
        theta[rightLowerLegId] = event.srcElement.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function () {
        theta[head2Id] = event.srcElement.value;
        initNodes(head2Id);
    };

    for (i = 0; i < numNodes; i++) initNodes(i);

    render();
};

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    traverse(torsoId);
    requestAnimFrame(render);
};
