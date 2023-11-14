function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    };
    return node;
}

function initNodes(Id) {
    var m = mat4();
    var translateBack;

    switch (Id) {
        case torsoId:
            console.log("node0");
            m = rotate(theta[torsoId], 0, 1, 0);
            figure[torsoId] = createNode(m, torso, null, [
                upperArmId1,
                // upperArmId2,
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

        case upperArmId1:
            console.log("node1");
            var rotatePointY = torsoHeight / 2;
            var translateX = (torsoWidth - upperArmWidth) / 2;

            m = translate(-translateX, -rotatePointY, 0.0);
            m = mult(m, rotate(theta[upperArmId1], 1, 0, 1));

            translateBack = translate(0.0, rotatePointY, 0.0);
            m = mult(m, translateBack);
            figure[upperArmId1] = createNode(m, upperArm1, null, middleArmId1);
            break;

        case middleArmId1:
            console.log("node2");
            var rotatePointY = torsoHeight / 2 + upperArmHeight;

            m = translate(0, -rotatePointY, 0.0);
            m = mult(m, rotate(theta[middleArmId1], 1, 0, 1));

            translateBack = translate(0.0, rotatePointY, 0.0);
            m = mult(m, translateBack);

            figure[middleArmId1] = createNode(m, middleArm1, null, lowerArmId1);
            break;

        case lowerArmId1:
            console.log("node3");
            var rotatePointY = 0;
            var rotatePointY =
                torsoHeight / 2 + middleArmHeight + upperArmHeight;

            m = translate(0.0, -rotatePointY, 0.0);
            m = mult(m, rotate(theta[lowerArmId1], 1, 0, 1));

            translateBack = translate(0.0, rotatePointY, 0.0);
            m = mult(m, translateBack);

            figure[lowerArmId1] = createNode(m, lowerArm1, null, null);
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

    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0, 0.0));
    instanceMatrix = mult(
        instanceMatrix,
        scale4(torsoWidth, torsoHeight, torsoWidth)
    );

    gl.uniform4fv(
        gl.getUniformLocation(program, "vColor"),
        flatten(vec4(1.0, 1.0, 0.0, 1.0))
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

// function head() {
//     instanceMatrix = mult(
//         modelViewMatrix,
//         translate(0.0, 0.5 * headHeight, 0.0)
//     );
//     instanceMatrix = mult(
//         instanceMatrix,
//         scale4(headWidth, headHeight, headWidth)
//     );
//     gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
//     for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
// }

function upperArm1() {
    var d = (upperArmHeight + torsoHeight) / 2;

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -translateY, 0.0));
    instanceMatrix = mult(
        instanceMatrix,
        scale4(upperArmWidth, upperArmHeight, upperArmWidth)
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function middleArm1() {
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
    var translateY =
        (torsoHeight + lowerArmHeight) / 2 + middleArmHeight + upperArmHeight;
    // var translateY = (lowerArmHeight + torsoHeight) / 2 + 2 * middleArmHeight;

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
