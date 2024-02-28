import * as THREE from "three";

import { Level } from "./level.js";
import { camOffset, dirEnum, playAudio } from "./utils.js";
import { handleBlockMovement } from "./movement.js";
import { fadeOutInLevel } from "./animations.js";

/**
 * Three.js components
 */
let renderer, scene, camera;
/**
 * Contains current level object
 */
let level;
/**
 * Whether html buttons can be clicked
 */
let buttonLock = false;

/**
 * Initialize everything
 */
initScene();
animationLoop();
initLevel();
initButtonInput();
initKeyboardInput();
console.log(`%c ESC to pause, WASD/ARROWS to move...`, "color: #00ff00");

/// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// /// ///

/**
 * Initialize the three.js scene
 * - Set up scene, renderer, camera, lighting, & canvas resizing
 */
function initScene() {
    // Scene
    scene = new THREE.Scene();

    // Renderer
    const canvas = document.getElementById("three-window");
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0); // default
    renderer.localClippingEnabled = true;

    // Camera
    const frustumSize = 10;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        500
    );
    camera.position.copy(camOffset);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));

    // Dynamic canvas resizing
    window.addEventListener("resize", () => {
        let aspect = canvas.clientWidth / canvas.clientHeight;
        camera.left = (frustumSize * aspect) / -2;
        camera.right = (frustumSize * aspect) / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    });
}

/**
 * Infinite recursive animation loop re-renders the scene every time the screen refreshes (often 60 or 120fps)
 */
function animationLoop() {
    requestAnimationFrame(animationLoop);
    renderer.render(scene, camera);
}

/**
 * Create a new level object at level 0 & accordingly update the scene
 */
function initLevel() {
    level = new Level(0);
    // Center camera on the block
    camera.position.copy(level.block.position).add(camOffset);
    // Add components of level to the scene
    scene.add(...level.board);
    scene.add(level.block);

    // Debug stuff
    // scene.add(new THREE.AxesHelper(20));
    // scene.add(new THREE.PlaneHelper(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.2), 20, 0xffffff));
}

/**
 * Initialize event listeners & functions for pause menu buttons
 */
function initButtonInput() {
    document.getElementById("resume-button").onclick = () => {
        if (!buttonLock) {
            buttonLock = true;
            document.getElementById("pause-window-box").style.visibility = "hidden";
            playAudio("./src/assets/audio/interface.mp3", 0.5);
            setTimeout(unlockButton, 1000);
        }
    };

    document.getElementById("previous-level-button").onclick = () => {
        clickLevelButton(-1);
    };

    document.getElementById("restart-level-button").onclick = () => {
        clickLevelButton(0);
    };

    document.getElementById("next-level-button").onclick = () => {
        clickLevelButton(1);
    };

    function clickLevelButton(offset) {
        if (!buttonLock) {
            buttonLock = true;
            fadeOutInLevel(offset);
            playAudio("./src/assets/audio/interface.mp3", 0.5);
            setTimeout(unlockButton, 1000);
        }
    }

    function unlockButton() {
        buttonLock = false;
    }
}

/**
 * Initialize keyboard input functionality
 */
function initKeyboardInput() {
    document.addEventListener("keydown", (event) => {
        console.log("--- key down ---");

        switch (event.code) {
            // Block movement
            case "KeyD":
            case "ArrowRight":
                handleBlockMovement(dirEnum.posX, camera);
                break;

            case "KeyA":
            case "ArrowLeft":
                handleBlockMovement(dirEnum.negX, camera);
                break;

            case "KeyS":
            case "ArrowDown":
                handleBlockMovement(dirEnum.posZ, camera);
                break;

            case "KeyW":
            case "ArrowUp":
                handleBlockMovement(dirEnum.negZ, camera);
                break;

            // Toggle visibility of pause menu
            case "Escape":
                let pauseWindowBox = document.getElementById("pause-window-box");
                let pauseWindowBoxVis = getComputedStyle(pauseWindowBox).visibility;
                pauseWindowBox.style.visibility = pauseWindowBoxVis === "hidden" ? "visible" : "hidden";
                break;

            // For debugging
            // case "Backquote":
            //     console.log(level.block);
            //     console.log(level.block.position);
            //     break;

            default:
                break;
        }
    });
}

/**
 * Overwrite global level var with a new level object & accordingly update scene
 *
 * @param {number} offset Change in level relative to current level
 */
function changeLevel(offset) {
    // Remove components of previous level from the scene
    scene.remove(...level.board);
    scene.remove(level.block);

    // Create new level object
    level = new Level(level.levelNum + offset);

    // Center camera on the block
    camera.position.copy(level.block.position).add(camOffset);
    // Add components of new level to the scene
    scene.add(...level.board);
    scene.add(level.block);
}

export { level, changeLevel };
