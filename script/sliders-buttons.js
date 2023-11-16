var upperArmSlider;
var middleArmSlider;
var lowerArmSlider;

var moveXSlider;
var moveYSlider;

var rotateTorsoXSlider;
var rotateTorsoYSlider;

var movePupilXSlider;
var movePupilYSlider;

var animationSpeedSlider;

var armButtonArray = [];
var activeArmButtonId = 0;

// move variables for the octopus body
var moveX = 0;
var moveY = 0;

// move variables for the pupils
var pupilsMoveX = 0;
var pupilsMoveY = 0;

// p tags for slide data
var rotateYP;
var rotateXP;
var armUpperP;
var armMiddleP;
var armLowerP;
var pupilXP;
var pupilYP;
var moveXP;
var moveYP;
var animSpeedP;
var defaultAnimationKeyFrameMultiplier = 3;

const armOffsetForButtonArray = 5;

// arm selection button backgrounds
const selectedBG = "#2980b9";
const normalBG = "#3498db";

function initSliders() {
    initSliderText();

    moveXSlider = document.getElementById("slider-move-x");
    moveXSlider.onchange = function () {
        moveXP.innerHTML = this.value;

        moveX = this.value;
        initNodes(torsoId);
    };

    moveYSlider = document.getElementById("slider-move-y");
    moveYSlider.onchange = function () {
        moveYP.innerHTML = this.value;

        moveY = this.value;
        initNodes(torsoId);
    };

    rotateTorsoXSlider = document.getElementById("slider-rotate-x");
    rotateTorsoXSlider.onchange = function () {
        rotateXP.innerHTML = `${this.value}°`;
        theta[torsoIdX] = this.value;
        initNodes(torsoId);
    };

    rotateTorsoYSlider = document.getElementById("slider-rotate-y");
    rotateTorsoYSlider.onchange = function () {
        rotateYP.innerHTML = `${this.value}°`;
        theta[torsoId] = this.value;
        initNodes(torsoId);
    };

    upperArmSlider = document.getElementById("slider-arm-up");
    upperArmSlider.onchange = function () {
        armUpperP.innerHTML = `${this.value}°`;

        let thetaIndex = convertButtonIndexToThetaArrIndex(activeArmButtonId);
        theta[thetaIndex] = upperArmSlider.value;
        initNodes(thetaIndex);
    };

    middleArmSlider = document.getElementById("slider-arm-mid");
    middleArmSlider.onchange = function () {
        armMiddleP.innerHTML = `${this.value}°`;

        let thetaIndex =
            convertButtonIndexToThetaArrIndex(activeArmButtonId) + 1;
        theta[thetaIndex] = middleArmSlider.value;
        initNodes(thetaIndex);
    };

    lowerArmSlider = document.getElementById("slider-arm-low");
    lowerArmSlider.onchange = function () {
        armLowerP.innerHTML = `${this.value}°`;

        let thetaIndex =
            convertButtonIndexToThetaArrIndex(activeArmButtonId) + 2;
        theta[thetaIndex] = lowerArmSlider.value;
        initNodes(thetaIndex);
    };

    movePupilXSlider = document.getElementById("slider-pupil-x");
    movePupilXSlider.onchange = function () {
        pupilXP.innerHTML = this.value;

        pupilsMoveX = this.value;
        initNodes(leftEyePupilId);
        initNodes(rightEyePupilId);
    };

    movePupilYSlider = document.getElementById("slider-pupil-y");
    movePupilYSlider.onchange = function () {
        pupilYP.innerHTML = this.value;

        pupilsMoveY = this.value;
        initNodes(leftEyePupilId);
        initNodes(rightEyePupilId);
    };

    animationSpeedSlider = document.getElementById("slider-anim-speed");
    animationSpeedSlider.onchange = function () {
        animSpeedP.innerHTML = this.value;

        animationKeyFrameDivider =
            this.value * defaultAnimationKeyFrameMultiplier;
    };
}

function initSliderText() {
    rotateYP = document.getElementById("text-rotate-y");
    rotateXP = document.getElementById("text-rotate-x");

    armUpperP = document.getElementById("text-up-arm");
    armMiddleP = document.getElementById("text-mid-arm");
    armLowerP = document.getElementById("text-low-arm");

    pupilXP = document.getElementById("text-pupil-x");
    pupilYP = document.getElementById("text-pupil-y");

    moveXP = document.getElementById("text-move-x");
    moveYP = document.getElementById("text-move-y");

    animSpeedP = document.getElementById("text-anim-speed");
}

function initAnimationButtonsAndAddEventListeners() {
    document.getElementById("save-kf").addEventListener("click", () => {
        console.log("Starting keyframe save...");
        handleSingleKeyFrameSave();
        console.log("Keyframe saved.");
    });

    document.getElementById("clear-kf-list").addEventListener("click", () => {
        console.log("Starting keyframe clear...");
        handleClearKeyframes();
        console.log("Keyframes cleared.");
    });

    document.getElementById("run-anim").addEventListener("click", () => {
        console.log("Starting animation...");
        handleAnimate();
    });

    document.getElementById("save-anim").addEventListener("click", () => {
        console.log("Saving animation...");
        handleSaveAnimation();
        console.log("Animation saved.");
    });

    // event listener for the button that clicks the file input
    document.getElementById("load-anim").addEventListener("click", () => {
        document.getElementById("octop-input").click();
    });

    // event listener for the actual file input
    document
        .getElementById("octop-input")
        .addEventListener("change", function () {
            var selectedFile = this.files[0];
            loadFile(selectedFile);

            this.value = null;
        });
}

function initLegButtonsAndAddEventListeners() {
    for (let i = 0; i < numArms; ++i) {
        armButtonArray.push(document.getElementById(`arm${i}`));
        armButtonArray[i].addEventListener("click", () => {
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

            armUpperP.innerHTML = upperArmSlider.value;
            armMiddleP.innerHTML = middleArmSlider.value;
            armLowerP.innerHTML = lowerArmSlider.value;
        });
    }

    //set initial selected background color
    armButtonArray[activeArmButtonId].style.backgroundColor = selectedBG;

    addHoverEffectToButtons();
}

function addHoverEffectToButtons() {
    armButtonArray.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
            btn.style.backgroundColor = selectedBG;
        });
    });

    // Add mouse leave event to change the button background back if the button is not clicked
    armButtonArray.forEach((btn, index) => {
        btn.addEventListener("mouseleave", () => {
            if (index != activeArmButtonId) {
                btn.style.backgroundColor = normalBG;
            }
        });
    });
}

function initPreDefinedAnimationButtons() {
    document.getElementById("run-swim-anim").addEventListener("click", () => {
        setPresetAnimation("../swim.octop");
    });

    document.getElementById("run-shy-anim").addEventListener("click", () => {
        setPresetAnimation("../shy.octop");
    });

    document.getElementById("run-anger-anim").addEventListener("click", () => {
        setPresetAnimation("../anger.octop");
    });
}

function initButtons() {
    initLegButtonsAndAddEventListeners();
    initAnimationButtonsAndAddEventListeners();
    initPreDefinedAnimationButtons();
}

function convertButtonIndexToThetaArrIndex(buttonIndex) {
    return buttonIndex * 3 + armOffsetForButtonArray;
}
