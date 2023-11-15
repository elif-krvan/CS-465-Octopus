var upperArmSlider;
var middleArmSlider;
var lowerArmSlider;

// UI related variables
var armButtonArray = [];
var activeArmButtonId = 0;
const armOffsetForButtonArray = 5;

function initSliders() {
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

    upperArmSlider = document.getElementById("slider-arm-up");
    upperArmSlider.onchange = function () {
        let thetaIndex = convertButtonIndexToThetaArrIndex(activeArmButtonId);
        theta[thetaIndex] = event.srcElement.value;
        initNodes(thetaIndex);
    };

    middleArmSlider = document.getElementById("slider-arm-mid");
    middleArmSlider.onchange = function () {
        let thetaIndex =
            convertButtonIndexToThetaArrIndex(activeArmButtonId) + 1;
        theta[thetaIndex] = event.srcElement.value;
        initNodes(thetaIndex);
    };

    lowerArmSlider = document.getElementById("slider-arm-low");
    lowerArmSlider.onchange = function () {
        let thetaIndex =
            convertButtonIndexToThetaArrIndex(activeArmButtonId) + 2;
        theta[thetaIndex] = event.srcElement.value;
        initNodes(thetaIndex);
    };
}

function initLegButtonsAndAddEventListeners() {
    for (let i = 0; i < armNumber; ++i) {
        armButtonArray.push(document.getElementById(`arm${i}`));
        armButtonArray[i].addEventListener("click", function () {
            activeArmButtonId = i;

            let thetaIndex =
                convertButtonIndexToThetaArrIndex(activeArmButtonId);

            upperArmSlider.value = theta[thetaIndex];
            middleArmSlider.value = theta[thetaIndex + 1];
            lowerArmSlider.value = theta[thetaIndex + 2];
        });
    }
}

function convertButtonIndexToThetaArrIndex(buttonIndex) {
    return buttonIndex * 3 + armOffsetForButtonArray;
}
