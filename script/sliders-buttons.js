var upperArmSlider;
var middleArmSlider;
var lowerArmSlider;

var moveXSlider;
var moveYSlider;

var rotateTorsoXSlider;
var rotateTorsoYSlider;

var movepupilXSlider;
var movepupilYSlider;

var armButtonArray = [];
var activeArmButtonId = 0;

var rotateYP;
var rotateXP;
const armOffsetForButtonArray = 5;

const selectedBG = "#1eb1d2";
const normalBG = "#026d8f";

function initSliders() {
    initSliderText();

    moveXSlider = document.getElementById("slider-move-x");
    moveXSlider.onchange = function () {
        moveX = this.value;
        initNodes(torsoId);
    };

    moveYSlider = document.getElementById("slider-move-y");
    moveXSlider.onchange = function () {
        moveY = this.value;
        initNodes(torsoId);
    };

    rotateTorsoXSlider = document.getElementById("slider-rotate-x");
    rotateTorsoXSlider.onchange = function () {
        rotateXP.innerHTML = this.value;
        theta[torsoIdX] = this.value;
        initNodes(torsoId);
    };

    rotateTorsoYSlider = document.getElementById("slider-rotate-y");
    rotateTorsoYSlider.onchange = function () {
        rotateYP.innerHTML = this.value;
        theta[torsoId] = this.value;
        initNodes(torsoId);
    };

    upperArmSlider = document.getElementById("slider-arm-up");
    upperArmSlider.onchange = function () {
        let thetaIndex = convertButtonIndexToThetaArrIndex(activeArmButtonId);
        theta[thetaIndex] = upperArmSlider.value;
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

function initSliderText() {
    rotateYP = document.getElementById("text-rotate-y");
    rotateXP = document.getElementById("text-rotate-x");
}

function initLegButtonsAndAddEventListeners() {
    for (let i = 0; i < armNumber; ++i) {
        armButtonArray.push(document.getElementById(`arm${i}`));
        armButtonArray[i].addEventListener("click", function () {
            // reset to normal background color
            armButtonArray[activeArmButtonId].style.backgroundColor = normalBG;

            activeArmButtonId = i;

            // change selected button's background color
            armButtonArray[activeArmButtonId].style.backgroundColor =
                selectedBG;

            // find theta index and update slider values with the active legs last values
            let thetaIndex =
                convertButtonIndexToThetaArrIndex(activeArmButtonId);

            upperArmSlider.value = theta[thetaIndex];
            middleArmSlider.value = theta[thetaIndex + 1];
            lowerArmSlider.value = theta[thetaIndex + 2];
        });
    }

    //set initial selected background color
    armButtonArray[activeArmButtonId].style.backgroundColor = selectedBG;
}

function convertButtonIndexToThetaArrIndex(buttonIndex) {
    return buttonIndex * 3 + armOffsetForButtonArray;
}
