import * as THREE from "three";

import { level, changeLevel } from "./main.js";
import { rotateAroundWorldAxis, getRotatedClone, playAudio, twoPtRound, camOffset } from "./utils.js";

/**
 * Whether an animation is currently playing; Used to prevent concurrent animations
 */
let animationPlaying = false;

/**
 * Animate the rotation of the block around an axis in world space passing through a point
 *
 * @param {THREE.Vector3} rotPoint Point to be rotated around
 * @param {THREE.Vector3} axis Normalized axis vector
 * @param {number} angle Rotation angle in radians
 * @param {THREE.OrthographicCamera} camera Renderer camera
 */
function animateRotation(rotPoint, axis, angle, camera) {
    // Setup
    let futureBlock = getRotatedClone(level.block, rotPoint, axis, angle);
    let intervals = 0;
    animationPlaying = true;

    // Begin rotation animation
    let rotationAnimation = setInterval(() => {
        // Linear interpolation of camera pos between current & future block pos (1/18th dist along line per interval)
        // aka smooth camera tracking as the block rotates
        camera.position.lerp(futureBlock.position.add(camOffset), 1 / 18);
        // Rotate block +- 5deg per 15ms interval (angle = +- 90deg)
        rotateAroundWorldAxis(level.block, rotPoint, axis, angle / 18);

        // Stop animation AFTER 18 intervals (0-17)
        if (++intervals === 18) {
            clearInterval(rotationAnimation);
            animationPlaying = false;
            // Check for win condition
            if (_checkForWin()) {
                _animateWin();
            } else {
                playAudio("./src/assets/audio/click.wav", 1);
            }
        }
    }, 15); // 18 interval x 15ms = 270ms
}

/**
 * Animate the rotation of the block forward then backward around an axis in world space passing through a point
 *
 * @param {THREE.Vector3} rotPoint Point to be rotated around
 * @param {THREE.Vector3} axis Normalized axis vector
 * @param {number} angle Rotation angle in radians
 */
function animateFailedRotation(rotPoint, axis, angle) {
    // Setup
    let intervals = 0;
    animationPlaying = true;

    // Begin forward rotation animation
    let failAnimationForward = setInterval(() => {
        // Rotate block +- 1.66deg per 15ms interval (angle = +- 30deg)
        rotateAroundWorldAxis(level.block, rotPoint, axis, angle / 18);

        if (++intervals === 18) {
            clearInterval(failAnimationForward);
            intervals = 0;

            // Begin backward rotation animation (reverse forward animation)
            let failAnimationBackward = setInterval(() => {
                // Rotate block +- 1.66deg per 15ms interval (angle = - (+- 30deg))
                rotateAroundWorldAxis(level.block, rotPoint, axis, -angle / 18);

                if (++intervals === 18) {
                    clearInterval(failAnimationBackward);
                    animationPlaying = false;
                    playAudio("./src/assets/audio/error.mp3", 1);
                }
            }, 10);
        }
    }, 10); // (18 interval x 10ms) x 2 = 360ms
}

/**
 * Check if the block is standing on the winning tile
 *
 * @returns {boolean} Whether the block is standing on the winning tile
 */
function _checkForWin() {
    let win = false;
    let blockPos = level.blockPos;
    let winTilePos = level.winTile.position;
    // If block is vertical
    if (blockPos.length === 1) {
        // If block position matches winning tile position
        win = blockPos[0].x === winTilePos.x && blockPos[0].z === winTilePos.z;
    }
    return win;
}

/**
 * Animate the block sliding into the winning tile hole
 */
function _animateWin() {
    animationPlaying = true;
    setTimeout(() => {
        playAudio("./src/assets/audio/slide.mp3", 0.2);

        // Begin win animation
        let winAnimation = setInterval(() => {
            // Subtract 0.1 from block y position per interval until at -0.9 (-1.0 + 0.1 for tile width offset)
            if (twoPtRound(level.block.position.y) >= -0.9) {
                level.block.position.y -= 0.1;
            } else {
                clearInterval(winAnimation);
                playAudio("./src/assets/audio/win.mp3", 0.5);

                // Wait 100ms before transitioning between levels
                setTimeout(() => {
                    fadeOutInLevel(1);
                }, 100);
            }
        }, 30);
    }, 50);
}

/**
 * Smoothly transition between levels by hiding abrupt changes between gradual fade out & in of canvas opacity
 *
 * @param {number} offset Change in level relative to current level
 * @returns {void} Returns void & does nothing if requested level is invalid
 */
function fadeOutInLevel(offset) {
    // If requested level is invalid
    if (level.levelNum + offset < 0 || level.levelNum + offset > level.totalLevels) {
        return;
    }

    const canvas = document.getElementById("three-window");
    animationPlaying = true;
    let intervals = 20; // +- 0.05 opacity per interval

    // Fade out
    let fadeOutAnimation = setInterval(() => {
        canvas.style.opacity = intervals / 20;

        if (intervals-- === 0) {
            clearInterval(fadeOutAnimation);
            changeLevel(offset);

            // Fade in
            let fadeInAnimation = setInterval(() => {
                canvas.style.opacity = intervals / 20;

                if (intervals++ === 20) {
                    clearInterval(fadeInAnimation);
                    animationPlaying = false;
                }
            }, 25);
        }
    }, 25);
}

export { animationPlaying, animateRotation, animateFailedRotation, fadeOutInLevel };
