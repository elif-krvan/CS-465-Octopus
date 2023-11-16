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

const numArms = 6;
// arms no * arms segments + num eyes + num pupils + head
const numNodes = numArms * 3 + 5;
const numAngles = 11;
const angle = 0;
const armNumber = 8;

// initialize theta array with zeroes
var theta = Array(numNodes).fill(0);

var canvasWidth;
var canvasHeight;

var octopusColor = vec4(0.831, 0.373, 0.349, 1.0);
var eyeColor = vec4(1.0, 1.0, 1.0, 1.0);
var pupilColor = vec4(0.0, 0.0, 0.0, 1.0);

var numVertices = 24;

var stack = [];
var figure = [];
var keyFrames = [];
var animationSpeed = 2;
var animationKeyFrameDivider = 6;

for (var i = 0; i < numNodes; i++)
    figure[i] = createNode(null, null, null, null);

var vBuffer;
var cBuffer;
var bgBuffer;
var indexBuffer;

var eyeBuffer;
var eyeColorBuffer;

var vTexCoord;
var textureObj;

var modelViewLoc;

var pointsArray = [];
var eyesArray = [];

var octopusArmsColorArray = [];
var octopusHeadColorsArray = [];
var eyeColorsArray = [];
var pupilColorsArray = [];

var sphereArray = [];
var sphereIndexArray = [];

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);

    octopusArmsColorArray.push(octopusColor);
    octopusArmsColorArray.push(octopusColor);
    octopusArmsColorArray.push(octopusColor);
    octopusArmsColorArray.push(octopusColor);
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

function sphere() {
    const radius = 1.0;
    const latitudeBands = 400;
    // const latitudeBands = 200;
    const longitudeBands = 400;

    for (var lat = 0; lat < latitudeBands; lat++) {
        // for (var lat = 0; lat < latitudeBands / 2; lat++) {
        var theta = (lat * Math.PI) / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var lon = 0; lon < longitudeBands; lon++) {
            var phi = (lon * 2 * Math.PI) / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = radius * cosPhi * sinTheta;
            var y = radius * cosTheta;
            var z = radius * sinPhi * sinTheta;

            sphereArray.push(vec4(x, y, z, 1.0));

            octopusHeadColorsArray.push(octopusColor);
            eyeColorsArray.push(eyeColor);
            pupilColorsArray.push(pupilColor);
        }
    }

    for (var lat = 0; lat < latitudeBands; ++lat) {
        for (var lon = 0; lon < longitudeBands; ++lon) {
            var vA = lat * (longitudeBands + 1) + lon;
            var vB = vA + (latitudeBands + 1);
            var vC = vA + 1;
            var vD = vB + 1;

            sphereIndexArray.push(vA);
            sphereIndexArray.push(vB);
            sphereIndexArray.push(vC);
            sphereIndexArray.push(vB);
            sphereIndexArray.push(vD);
            sphereIndexArray.push(vC);
        }
    }
}

function setArrayForDrawing(vertexArray) {
    // vertices buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexArray), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);
}

function setColorArrayForDrawing(colorArray) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);

    // use the eyeColorBuffer for eye color
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

function handleAnimate() {
    if (keyFrames.length === 0) {
        console.log("ERROR: No animation keyframe is saved to animate.");
        return;
    }

    var currentKeyFrameIndex = 0;

    const animate = () => {
        if (currentKeyFrameIndex >= keyFrames.length) {
            clearInterval(animationInterval);
            currentKeyFrameIndex = 0;
            return;
        }

        theta = keyFrames[currentKeyFrameIndex];
        currentKeyFrameIndex++;
        for (i = 0; i < numNodes; i++) initNodes(i);
    };

    var animationInterval = setInterval(animate, animationSpeed);
}

function handleClearKeyframes() {
    if (keyFrames.length !== 0) {
        // If keyFrames is not empty
        keyFrames = [];
    }
}

function handleSaveKeyframe() {
    if (keyFrames.length !== 0) {
        // If keyFrames is not empty
        // Store a new keyFrame for each angle of difference between new keyframe
        var currentKeyFrame = theta.slice();
        var lastKeyFrame = keyFrames.slice(keyFrames.length - 1)[0];

        // Calculate difference
        var difference = [];
        for (var i = 0; i < lastKeyFrame.length; i++) {
            difference.push(lastKeyFrame[i] - currentKeyFrame[i]);
        }

        var maxDifferenceInTheta = findAbsoluteMaximumInArray(difference);

        if (maxDifferenceInTheta === 0) {
            console.log(
                "ERROR: Max difference of theta is 0. Perhaps you tried to save the same keyframe?"
            );
            return;
        }

        maxDifferenceInTheta = Math.ceil(
            maxDifferenceInTheta / animationKeyFrameDivider
        );

        // Normalize the differences
        for (var i = 0; i < difference.length; i++) {
            difference[i] = difference[i] / maxDifferenceInTheta;
        }

        // Smoothly place keyFrames between each difference in angle
        for (var j = 0; j < maxDifferenceInTheta; j++) {
            lastKeyFrame = lastKeyFrame.map(
                (num, index) => num - difference[index]
            );
            keyFrames.push(lastKeyFrame);
        }
    } else {
        // else if keyFrames is empty
        keyFrames.push(theta.slice());
    }
}

function findAbsoluteMaximumInArray(array) {
    var duplicateArray = array.map((num) => Math.abs(num));
    return Math.max(...duplicateArray.filter(Boolean)); // .filter(Boolean) removes zeros
}

function findAbsoluteMinimumInArray(array) {
    var duplicateArray = array.map((num) => Math.abs(num));
    return Math.min(...duplicateArray.filter(Boolean)); // .filter(Boolean) removes zeros
}

function loadFile(file) {
    if (file) {
        console.log("me likes reading file");
        var reader = new FileReader();

        // Callback function to run after the file is read
        reader.onload = function (event) {
            var jsonContent = event.target.result;

            // Parse the JSON data
            try {
                var jsonData = JSON.parse(jsonContent);

                // set data

                render();
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };

        // Read the file
        reader.readAsText(file);
        render();
    }
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
    sphere();

    indexBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    bgBuffer = gl.createBuffer();
    eyeBuffer = gl.createBuffer();
    eyeColorBuffer = gl.createBuffer();

    // vertices buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // color buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        flatten(octopusArmsColorArray),
        gl.STATIC_DRAW
    );

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        flatten(sphereIndexArray),
        gl.STATIC_DRAW
    );

    // eye buffer set up
    gl.bindBuffer(gl.ARRAY_BUFFER, eyeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(eyesArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, eyeColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(eyeColorsArray), gl.STATIC_DRAW);

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
    image.src = "./img/bg.jpg";
    image.onload = function () {
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

        // Set the color as transparent
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 8);
    };

    initSliders();
    initButtons();

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
