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
var upperArmHeight = 6.0;
var middleArmHeight = 6.0;
var lowerArmHeight = 3.0;
var upperArmWidth = 1.0;
var middleArmWidth = 0.95;
var lowerArmWidth = 0.85;
var headHeight = 4.0;
var headWidth = 4.0;

var numNodes = 7;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var moveX = 0;
var moveY = 0;

var canvasWidth;
var canvasHeight;

var octopusColor = vec4(0.831, 0.373, 0.349, 1.0);

var numVertices = 4;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++)
    figure[i] = createNode(null, null, null, null);

var vBuffer;
var cBuffer;
var bgBuffer;

var vTexCoord;

var textureObj;

var modelViewLoc;

var pointsArray = [];
var colorsArray = [];

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

    colorsArray.push(octopusColor);
    colorsArray.push(octopusColor);
    colorsArray.push(octopusColor);
    colorsArray.push(octopusColor);
}

function cube() {
    // Use different colors for each face
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    canvasHeight = canvas.height;
    canvasWidth = canvas.width;

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
    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.BACK);

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
    cBuffer = gl.createBuffer();
    bgBuffer = gl.createBuffer();

    // vertices buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // color buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // background color set up
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
        gl.STATIC_DRAW
    );

    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    gl.disable(gl.DEPTH_TEST);

    // Load and bind the texture
    var texture = gl.createTexture();
    var image = new Image();
    image.src = "./bg.jpg";
    image.onload = function () {
        console.log("loaded image");
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Set the texture uniform
        var textureLocation = gl.getUniformLocation(program, "u_texture");
        gl.uniform1i(textureLocation, 0);

        // Render the scene
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 8);
    };

    document.getElementById("slider-x").onchange = function () {
        moveX = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slider-y").onchange = function () {
        moveY = event.srcElement.value;
        initNodes(torsoId);
    };

    document.getElementById("slider0").onchange = function () {
        theta[torsoId] = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function () {
        theta[upperArmId1] = event.srcElement.value;
        initNodes(upperArmId1);
    };

    document.getElementById("slider2").onchange = function () {
        theta[middleArmId1] = event.srcElement.value;
        initNodes(middleArmId1);
    };
    document.getElementById("slider3").onchange = function () {
        theta[lowerArmId1] = event.srcElement.value;
        initNodes(lowerArmId1);
    };

    document.getElementById("slider4").onchange = function () {
        theta[upperArmId2] = event.srcElement.value;
        initNodes(upperArmId2);
    };
    document.getElementById("slider5").onchange = function () {
        theta[middleArmId2] = event.srcElement.value;
        initNodes(middleArmId2);
    };
    document.getElementById("slider6").onchange = function () {
        theta[lowerArmId2] = event.srcElement.value;
        initNodes(lowerArmId2);
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

    // Disable depth testing for the background
    gl.disable(gl.DEPTH_TEST);

    // Draw the background
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Enable depth testing for the octopus
    gl.enable(gl.DEPTH_TEST);

    traverse(torsoId);
    requestAnimFrame(render);
};
