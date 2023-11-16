var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;
var modelViewMatrixLoc;

var framebuffer;
var thetaLoc;
var color = new Uint8Array(4);

var lightAmbientModifier = 0.15;
var lightDiffuseModifier = 0.75;
var lightSpecularModifier = 0.95;

var lightPosition = vec4(1.0, 1.0, -1.0, 0.0 );
var lightAmbient = vec4(lightAmbientModifier, lightAmbientModifier, lightAmbientModifier, 1.0);
var lightDiffuse = vec4(lightDiffuseModifier, lightDiffuseModifier, lightDiffuseModifier, 1.0);
var lightSpecular = vec4(lightSpecularModifier, lightSpecularModifier, lightSpecularModifier, 1.0);

var materialAmbientModifier = 1.0;
var materialDiffuseModifier = 0.48;
var materialSpecularModifier = 0.25;

var materialAmbient = vec4(materialAmbientModifier, -0.25, materialAmbientModifier, 1.0);
var materialDiffuse = vec4(materialDiffuseModifier, materialDiffuseModifier * 0.8, 0.2, 0.5);
var materialSpecular = vec4(materialSpecularModifier, materialSpecularModifier * 0.8, 0.3, 1.0);
var materialShininess = 250.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
// var modelView, projection;
var viewerPos;

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
var keyFramesPX = [];
var keyFramesPY = [];
var keyFramesBX = [];
var keyFramesBY = [];
var singlePupilXKeyFrames = [];
var singlePupilYKeyFrames = [];
var singleBodyXKeyFrames = [];
var singleBodyYKeyFrames = [];
var singleKeyFrames = [];
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
var normalsArray = [];
var sphereNormalsArray = [];
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
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);
    
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);

    normalsArray.push(normal); 
    normalsArray.push(normal); 
    normalsArray.push(normal); 
    normalsArray.push(normal); 

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
    const longitudeBands = 400;

    for (var lat = 0; lat <= latitudeBands; lat++) {
        var theta = (lat * Math.PI) / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var lon = 0; lon <= longitudeBands; lon++) {
            var phi = (lon * 2 * Math.PI) / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = radius * cosPhi * sinTheta;
            var y = radius * cosTheta;
            var z = radius * sinPhi * sinTheta;

            var normal = vec3(x, y, z);
            normal = normalize(normal);

            sphereArray.push(vec4(x, y, z, 1.0));
            sphereNormalsArray.push(normal); // Add normal to the normals array

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
    if (singleKeyFrames.length === 0) {
        console.log("ERROR: No animation keyframe is saved to animate.");
        return;
    }

    var currentKeyFrameIndex = 0;
    handleKeyFramesInterpolation();

    const animate = () => {
        if (currentKeyFrameIndex >= keyFrames.length) {
            clearInterval(animationInterval);
            keyFrames = [];
            keyFramesPX = [];
            keyFramesPY = [];
            keyFramesBX = [];
            keyFramesBY = [];
            currentKeyFrameIndex = 0;
            return;
        }

        theta = keyFrames[currentKeyFrameIndex];
        pupilsMoveX = keyFramesPX[currentKeyFrameIndex][0];
        pupilsMoveY = keyFramesPY[currentKeyFrameIndex][0];
        moveX = keyFramesBX[currentKeyFrameIndex][0];
        moveY = keyFramesBY[currentKeyFrameIndex][0];

        currentKeyFrameIndex++;
        for (i = 0; i < theta.length; i++) initNodes(i);
    };

    var animationInterval = setInterval(animate, animationSpeed);
}

function handleClearKeyframes() {
    keyFrames = [];
    keyFramesPX = [];
    keyFramesPY = [];
    keyFramesBX = [];
    keyFramesBY = [];
    singlePupilXKeyFrames = [];
    singlePupilYKeyFrames = [];
    singleBodyXKeyFrames = [];
    singleBodyYKeyFrames = [];
    singleKeyFrames = [];
}

function handleSingleKeyFrameSave() {
    singleKeyFrames.push(theta.slice());
    singlePupilXKeyFrames.push(createRepeatingArray(parseFloat(pupilsMoveX), theta.slice().length));
    singlePupilYKeyFrames.push(createRepeatingArray(parseFloat(pupilsMoveY), theta.slice().length));
    singleBodyXKeyFrames.push(createRepeatingArray(parseFloat(moveX), theta.slice().length));
    singleBodyYKeyFrames.push(createRepeatingArray(parseFloat(moveY), theta.slice().length));
}

function createRepeatingArray(item, repeatTimes) {
    var result = [];

    for (var i = 0; i < repeatTimes; i++) {
        result.push(item);
    }

    return result;
}

function handleKeyFramesInterpolation() {
    if (singleKeyFrames.length <= 1) {
        console.log("ERROR: You need more keyframes to animate.");
        return;
    }
    
    console.log("STARTING INTERPOLATION");

    for (var curSingleKeyFrame = 0; curSingleKeyFrame < singleKeyFrames.length - 1; curSingleKeyFrame++) {
        // vars for theta
        var lastKeyFrame = singleKeyFrames[curSingleKeyFrame];
        var currentKeyFrame = singleKeyFrames[curSingleKeyFrame + 1];

        // vars for pupilX
        var lastKeyFramePX = singlePupilXKeyFrames[curSingleKeyFrame];
        var currentKeyFramePX = singlePupilXKeyFrames[curSingleKeyFrame + 1];

        // vars for pupilY
        var lastKeyFramePY = singlePupilYKeyFrames[curSingleKeyFrame];
        var currentKeyFramePY = singlePupilYKeyFrames[curSingleKeyFrame + 1];

        // vars for bodyX
        var lastKeyFrameBX = singleBodyXKeyFrames[curSingleKeyFrame];
        var currentKeyFrameBX = singleBodyXKeyFrames[curSingleKeyFrame + 1];

        // vars for bodyY
        var lastKeyFrameBY = singleBodyYKeyFrames[curSingleKeyFrame];
        var currentKeyFrameBY = singleBodyYKeyFrames[curSingleKeyFrame + 1];

        // If keyFrames is not empty
        // Store a new keyFrame for each angle of difference between new keyframe
        // Calculate difference
        var difference = [];
        var differencePX = [];
        var differencePY = [];
        var differenceBX = [];
        var differenceBY = [];
        for (var i = 0; i < lastKeyFrame.length; i++) {
            difference.push(lastKeyFrame[i] - currentKeyFrame[i]);
            differencePX.push(lastKeyFramePX[i] - currentKeyFramePX[i]);
            differencePY.push(lastKeyFramePY[i] - currentKeyFramePY[i]);
            differenceBX.push(lastKeyFrameBX[i] - currentKeyFrameBX[i]);
            differenceBY.push(lastKeyFrameBY[i] - currentKeyFrameBY[i]);
        }

        var maxDifferenceInTheta = findAbsoluteMaximumInArray(difference);
        var maxDifferenceInThetaPX = findAbsoluteMaximumInArray(differencePX);
        var maxDifferenceInThetaPY = findAbsoluteMaximumInArray(differencePY);
        var maxDifferenceInThetaBX = findAbsoluteMaximumInArray(differenceBX);
        var maxDifferenceInThetaBY = findAbsoluteMaximumInArray(differenceBY);

        if (maxDifferenceInTheta === 0) {
            console.log("ERROR: Max difference of theta is 0. Perhaps you tried to save the same keyframe?");
            return;
        }

        maxDifferenceInTheta = Math.ceil(maxDifferenceInTheta / animationKeyFrameDivider);
        maxDifferenceInThetaPX = Math.ceil(maxDifferenceInThetaPX / animationKeyFrameDivider);
        maxDifferenceInThetaPY = Math.ceil(maxDifferenceInThetaPY / animationKeyFrameDivider);
        maxDifferenceInThetaBX = Math.ceil(maxDifferenceInThetaBX / animationKeyFrameDivider);
        maxDifferenceInThetaBY = Math.ceil(maxDifferenceInThetaBY / animationKeyFrameDivider);

        // Normalize the differences
        for (var i = 0; i < difference.length; i++) {
            difference[i] = difference[i] / maxDifferenceInTheta;
            differencePX[i] = differencePX[i] / maxDifferenceInThetaPX;
            differencePY[i] = differencePY[i] / maxDifferenceInThetaPY;
            differenceBX[i] = differenceBX[i] / maxDifferenceInThetaBX;
            differenceBY[i] = differenceBY[i] / maxDifferenceInThetaBY;
        }

        // Smoothly place keyFrames between each difference in angle
        var maxDif = Math.max(
            maxDifferenceInTheta,
            maxDifferenceInThetaPX,
            maxDifferenceInThetaPY,
            maxDifferenceInThetaBX,
            maxDifferenceInThetaBY
        );

        // if (maxDif != maxDifferenceInTheta) maxDif *= 2;

        for (
        var j = 0; j < maxDif; j++) {
            lastKeyFrame = lastKeyFrame.map((num, index) => num - difference[index]);
            lastKeyFramePX = lastKeyFramePX.map((num, index) => num - differencePX[index]);
            lastKeyFramePY = lastKeyFramePY.map((num, index) => num - differencePY[index]);
            lastKeyFrameBX = lastKeyFrameBX.map((num, index) => num - differenceBX[index]);
            lastKeyFrameBY = lastKeyFrameBY.map((num, index) => num - differenceBY[index]);
            keyFrames.push(lastKeyFrame);
            keyFramesPX.push(lastKeyFramePX);
            keyFramesPY.push(lastKeyFramePY);
            keyFramesBX.push(lastKeyFrameBX);
            keyFramesBY.push(lastKeyFrameBY);
        }
    }

    console.log("INTERPOLATION COMPLETE");
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
        var reader = new FileReader();

        // Callback function to run after the file is read
        reader.onload = function (event) {
            var jsonContent = event.target.result;

            // Parse the JSON data
            try {
                var jsonData = JSON.parse(jsonContent);

                // set data
                handleClearKeyframes();
                singlePupilXKeyFrames = jsonData.singlePupilXKeyFrames;
                singlePupilYKeyFrames = jsonData.singlePupilYKeyFrames;
                singleBodyXKeyFrames = jsonData.singleBodyXKeyFrames;
                singleBodyYKeyFrames = jsonData.singleBodyYKeyFrames;
                singleKeyFrames = jsonData.singleKeyFrames;
                // theta = jsonData.theta;
                keyFrames = jsonData.keyFrames;
                keyFramesPX = jsonData.keyFramesPX;
                keyFramesPY = jsonData.keyFramesPY;
                keyFramesBX = jsonData.keyFramesBX;
                keyFramesBY = jsonData.keyFramesBY;
                // moveX = jsonData.moveX;
                // moveY = jsonData.moveY;
                // pupilsMoveX = jsonData.pupilsMoveX;
                // pupilsMoveY = jsonData.pupilsMoveY;

                for (var i = 0; i < numNodes; i++) {
                    figure[i] = createNode(null, null, null, null);
                } 

                for (i = 0; i < theta.length; i++) {
                    initNodes(i);
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };

        // Read the file
        reader.readAsText(file);
    }
}

function setPresetAnimation(absolutePath) {
    fetch(absolutePath)
    .then(response => response.json())
    .then(jsonData => {
        // set data
        handleClearKeyframes();
        singlePupilXKeyFrames = jsonData.singlePupilXKeyFrames;
        singlePupilYKeyFrames = jsonData.singlePupilYKeyFrames;
        singleBodyXKeyFrames = jsonData.singleBodyXKeyFrames;
        singleBodyYKeyFrames = jsonData.singleBodyYKeyFrames;
        singleKeyFrames = jsonData.singleKeyFrames;
        // theta = jsonData.theta;
        keyFrames = jsonData.keyFrames;
        keyFramesPX = jsonData.keyFramesPX;
        keyFramesPY = jsonData.keyFramesPY;
        keyFramesBX = jsonData.keyFramesBX;
        keyFramesBY = jsonData.keyFramesBY;
        // moveX = jsonData.moveX;
        // moveY = jsonData.moveY;
        // pupilsMoveX = jsonData.pupilsMoveX;
        // pupilsMoveY = jsonData.pupilsMoveY;

        for (var i = 0; i < numNodes; i++) {
            figure[i] = createNode(null, null, null, null);
        } 

        for (i = 0; i < theta.length; i++) {
            initNodes(i);
        }

        handleAnimate();
    })
    .catch(error => {
        console.error('Error fetching or parsing JSON:', error);
    });
}

function createSaveData() {
    var data = {
        singlePupilXKeyFrames: singlePupilXKeyFrames,
        singlePupilYKeyFrames: singlePupilYKeyFrames,
        singleBodyXKeyFrames: singleBodyXKeyFrames,
        singleBodyYKeyFrames: singleBodyYKeyFrames,
        singleKeyFrames: singleKeyFrames,
        theta: theta,
        keyFrames: keyFrames,
        keyFramesPX: keyFramesPX,
        keyFramesPY: keyFramesPY,
        keyFramesBX: keyFramesBX,
        keyFramesBY: keyFramesBY,
        moveX: moveX,
        moveY: moveY,
        pupilsMoveX: pupilsMoveX,
        pupilsMoveY: pupilsMoveY
    };

    return data;
}

function handleSaveAnimation() {
    createAndDownloadJSONFile();
}

function createAndDownloadJSONFile() {
    var jsonData = createSaveData();

    // Convert the object to a JSON string          // number of spaces before json values
    var jsonContent = JSON.stringify(jsonData, null, 2);
    var blob = new Blob([jsonContent], { type: 'application/json' });

    // Create a URL for the Blob
    var url = window.URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    var a = document.createElement('a');
    a.href = url;
    a.download = "animation.octop"; // Set the desired file name
    document.body.appendChild(a);

    // Click the anchor to start the download
    a.click();

    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.BACK);

    /*
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    */

    // Allocate a frame buffer object
    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);

    // Attach color buffer
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // check for completeness
    //var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    //if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-20.0, 20.0, -20.0, 20.0, -20.0, 20.0);
    // projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "modelViewMatrix"),
        false,
        flatten(modelViewMatrix)
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

    var mergedNormals = [...normalsArray, ...sphereNormalsArray];
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mergedNormals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular); 
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projectionMatrix));

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
    var txture = gl.createTexture();
    var image = new Image();
    image.src = "./img/bg.jpg";
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, txture);
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
