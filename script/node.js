var translateBack;

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    };
    return node;
}

function setUpperArmProperties(xPosition, armId, middleArmId, armFcn) {
    console.log("node1");
    var rotatePointY = torsoHeight / 2;

    // translating x position at this step, also traslates child arms
    // translate y position to the top of the arm so that the rotation can be done wrt the top of the arm
    m = translate(-xPosition, -rotatePointY, 0.0);

    // rotate the arms wrt x and z axis
    m = mult(m, rotate(theta[armId], 1, 0, 1));

    // translate the arm where it was before the rotation
    translateBack = translate(0.0, rotatePointY, 0.0);
    m = mult(m, translateBack);

    figure[armId] = createNode(m, armFcn, null, middleArmId);
}

function setMiddleArmProperties(armId, lowerArmId, armFcn) {
    console.log("middle");
    var rotatePointY = torsoHeight / 2 + upperArmHeight;

    m = translate(0, -rotatePointY, 0.0);
    m = mult(m, rotate(theta[armId], 1, 0, 1));

    translateBack = translate(0.0, rotatePointY, 0.0);
    m = mult(m, translateBack);

    figure[armId] = createNode(m, armFcn, null, lowerArmId);
}

function setLowerArmProperties(armId, armFcn) {
    console.log("lower");
    var rotatePointY = torsoHeight / 2 + middleArmHeight + upperArmHeight;

    m = translate(0.0, -rotatePointY, 0.0);
    m = mult(m, rotate(theta[armId], 1, 0, 1));

    translateBack = translate(0.0, rotatePointY, 0.0);
    m = mult(m, translateBack);

    figure[armId] = createNode(m, armFcn, null, null);
}

function initNodes(Id) {
    var m = mat4();

    switch (Id) {
        case torsoId:
            console.log("X", moveX);
            console.log("Y", moveY);
            m = translate(moveX, moveY, 0.0);
            m = mult(m, rotate(theta[torsoId], 0, 1, 0));
            figure[torsoId] = createNode(m, torso, null, [
                upperArmId1,
                upperArmId2,
                leftEyeId,
                rightEyeId,
                // upperArmId3,
                // upperArmId4,
                // upperArmId5,
                // upperArmId6,
                // upperArmId7,
                // upperArmId8,
            ]);
            break;

        // case headId:
        // case head1Id:
        // case head2Id:
        //     m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
        //     m = mult(m, rotate(theta[head1Id], 1, 0, 0));
        //     m = mult(m, rotate(theta[head2Id], 0, 1, 0));
        //     m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
        //     figure[headId] = createNode(m, head, leftUpperArmId, null);
        //     break;

        case leftEyeId:
            // var translateX = (torsoWidth - upperArmWidth) / 2;
            // something went wrong if octopus placement is changed since we did not set y position
            m = translate(-(torsoWidth / 2.5), 0.0, torsoWidth / 1.5);

            figure[leftEyeId] = createNode(m, eye1, rightEyeId, leftEyePupilId);
            break;
        case rightEyeId:
            // var translateX = (torsoWidth - upperArmWidth) / 2;
            // something went wrong if octopus placement is changed since we did not set y position
            m = translate(torsoWidth / 2.5, 0.0, torsoWidth / 1.5);

            figure[rightEyeId] = createNode(
                m,
                eye1,
                leftEyeId,
                rightEyePupilId
            );
            break;
        case leftEyePupilId:
            // var translateX = (torsoWidth - upperArmWidth) / 2;
            // something went wrong if octopus placement is changed since we did not set y position
            m = translate(0, 0.0, (torsoWidth + eyeSize / 1.5) / 4);
            m = mult(m, translate(pupilsMoveX, pupilsMoveY, 0.0));

            figure[leftEyePupilId] = createNode(
                m,
                pupil1,
                rightEyePupilId,
                null
            );
            break;
        case rightEyePupilId:
            // var translateX = (torsoWidth - upperArmWidth) / 2;
            // something went wrong if octopus placement is changed since we did not set y position
            m = translate(0, 0.0, (torsoWidth + eyeSize / 1.5) / 4);
            m = mult(m, translate(pupilsMoveX, pupilsMoveY, 0.0));

            figure[rightEyePupilId] = createNode(
                m,
                pupil1,
                leftEyePupilId,
                null
            );
            break;
        case upperArmId1:
            var translateX = (torsoWidth - upperArmWidth) / 2;
            setUpperArmProperties(
                translateX,
                upperArmId1,
                middleArmId1,
                upperArm1
            );
            break;
        case upperArmId2:
            var translateX = (torsoWidth - upperArmWidth) / 2;

            setUpperArmProperties(
                -translateX,
                upperArmId2,
                middleArmId2,
                upperArm1
            );
            break;

        case middleArmId1:
            setMiddleArmProperties(middleArmId1, lowerArmId1, middleArm1);
            break;
        case middleArmId2:
            setMiddleArmProperties(middleArmId2, lowerArmId2, middleArm1);
            break;
        case lowerArmId1:
            setLowerArmProperties(lowerArmId1, lowerArm1);
            break;
        case lowerArmId2:
            setLowerArmProperties(lowerArmId2, lowerArm1);
            break;

        // case rightUpperArmId:
        //     m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
        //     m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
        //     figure[rightUpperArmId] = createNode(
        //         m,
        //         rightUpperArm,
        //         leftUpperLegId,
        //         rightLowerArmId
        //     );
        //     break;

        // case leftUpperLegId:
        //     m = translate(
        //         -(torsoWidth + upperLegWidth),
        //         0.1 * upperLegHeight,
        //         0.0
        //     );
        //     m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
        //     figure[leftUpperLegId] = createNode(
        //         m,
        //         leftUpperLeg,
        //         rightUpperLegId,
        //         leftLowerLegId
        //     );
        //     break;

        // case rightUpperLegId:
        //     m = translate(
        //         torsoWidth + upperLegWidth,
        //         0.1 * upperLegHeight,
        //         0.0
        //     );
        //     m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
        //     figure[rightUpperLegId] = createNode(
        //         m,
        //         rightUpperLeg,
        //         null,
        //         rightLowerLegId
        //     );
        //     break;

        // case leftLowerArmId:
        //     m = translate(0.0, upperArmHeight, 0.0);
        //     m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
        //     figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
        //     break;

        // case rightLowerArmId:
        //     m = translate(0.0, upperArmHeight, 0.0);
        //     m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
        //     figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
        //     break;

        // case leftLowerLegId:
        //     m = translate(0.0, upperLegHeight, 0.0);
        //     m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
        //     figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
        //     break;

        // case rightLowerLegId:
        //     m = translate(0.0, upperLegHeight, 0.0);
        //     m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
        //     figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
        //     break;
    }
}

function traverse(Id) {
    if (Id == null) return;

    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();

    if (Array.isArray(figure[Id].child)) {
        figure[Id].child.forEach(function (childId) {
            traverse(childId);
        });
    } else if (figure[Id].child != null) {
        traverse(figure[Id].child);
    }

    modelViewMatrix = stack.pop();

    // how to use sibling???
    // if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    // set color and vertex array
    // setColorArrayForDrawing(colorsArray);
    // setArrayForDrawing(pointsArray);

    // instanceMatrix = mult(modelViewMatrix, translate(0.0, 0, 0.0));
    // instanceMatrix = mult(
    //     instanceMatrix,
    //     scale4(torsoWidth, torsoHeight, torsoWidth)
    // );

    // gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    // for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

    setColorArrayForDrawing(octopusHeadColorsArray);
    setArrayForDrawing(sphereArray);

    // scale the sphere to the pupil size
    instanceMatrix = mult(
        modelViewMatrix,
        scale4(torsoWidth, torsoHeight, torsoWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, sphereArray.length);
}

function eye1() {
    setColorArrayForDrawing(eyeColorsArray);
    setArrayForDrawing(sphereArray);
    // gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    // // Fill the vertex buffer with data
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereArray), gl.STATIC_DRAW);

    // // Get the attribute location for the vertex position
    // var positionAttribLocation = gl.getAttribLocation(program, "vPosition");
    // gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(positionAttribLocation);

    instanceMatrix = mult(modelViewMatrix, scale4(eyeSize, eyeSize, eyeSize));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    // works reallllly weirdly
    // Create and bind the index buffer
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(
    //     gl.ELEMENT_ARRAY_BUFFER,
    //     flatten(sphereIndexArray),
    //     gl.STATIC_DRAW
    // );
    // positionAttribLocation = gl.getAttribLocation(program, "vPosition");
    // gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(positionAttribLocation);
    // // Draw the sphere with elements
    // gl.drawElements(
    //     gl.TRIANGLES,
    //     sphereIndexArray.length,
    //     gl.UNSIGNED_SHORT,
    //     0
    // );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, sphereArray.length);
}

function pupil1() {
    // make sure that eye color array is filled with color vectors
    setColorArrayForDrawing(pupilColorsArray);
    setArrayForDrawing(sphereArray);

    // scale the sphere to the pupil size
    instanceMatrix = mult(
        modelViewMatrix,
        scale4(pupilSize, pupilSize, pupilSize)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

    // when we enable cullface weird things happen, weird things happen anyway tho
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.CCW);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, sphereArray.length);
}

function upperArm1() {
    setColorArrayForDrawing(octopusArmsColorArray);
    setArrayForDrawing(pointsArray);

    var translateY = (upperArmHeight + torsoHeight) / 2;

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -translateY, 0.0));
    instanceMatrix = mult(
        instanceMatrix,
        scale4(upperArmWidth, upperArmHeight, upperArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function middleArm1() {
    setColorArrayForDrawing(octopusArmsColorArray);
    setArrayForDrawing(pointsArray);

    var translateY = (middleArmHeight + torsoHeight) / 2 + upperArmHeight;

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -translateY, 0.0));
    instanceMatrix = mult(
        instanceMatrix,
        scale4(middleArmWidth, middleArmHeight, middleArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerArm1() {
    setColorArrayForDrawing(octopusArmsColorArray);
    setArrayForDrawing(pointsArray);

    var translateY =
        (torsoHeight + lowerArmHeight) / 2 + middleArmHeight + upperArmHeight;

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -translateY, 0.0));
    instanceMatrix = mult(
        instanceMatrix,
        scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * upperArmHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(upperArmWidth, upperArmHeight, upperArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * lowerArmHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * upperLegHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(upperLegWidth, upperLegHeight, upperLegWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * lowerLegHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * upperLegHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(upperLegWidth, upperLegHeight, upperLegWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(
        modelViewMatrix,
        translate(0.0, 0.5 * lowerLegHeight, 0.0)
    );
    instanceMatrix = mult(
        instanceMatrix,
        scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}
