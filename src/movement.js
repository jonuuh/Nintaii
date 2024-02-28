import * as THREE from "three";

import { level } from "./main.js";
import {
    getBlockPos,
    getRotatedClone,
    twoPtRound,
    isInt,
    ninetyDegRad,
    Vector2XZ,
    dirEnum,
    zAxis,
    xAxis,
} from "./utils.js";
import { animationPlaying, animateRotation, animateFailedRotation } from "./animations.js";

/**
 * Rotate the block in a specified direction
 *
 * @param {number} rotDir Direction block will rotate
 * @param {THREE.OrthographicCamera} camera Renderer camera
 * @returns {void} Returns void & does nothing if an animation is playing or pause menu is visible
 */
function handleBlockMovement(rotDir, camera) {
    if (animationPlaying || getComputedStyle(document.getElementById("pause-window-box")).visibility === "visible") {
        return;
    }

    let rotPoint = new THREE.Vector3(); // default (0, 0, 0)
    let rotAxis;
    let rotAngleMod;

    // Set the relevant rotation point coordinate (block position +- offset)
    // Set axis to rotate around (perpendicular to rotation direction)
    // Set rotation angle modifier (1 or -1, to be multiplied with hard coded rotation angle)
    switch (rotDir) {
        case dirEnum.posX:
            rotPoint.x = twoPtRound(level.block.position.x) + offsetRotPointX();
            rotAxis = zAxis;
            rotAngleMod = -1;
            break;
        case dirEnum.negX:
            rotPoint.x = twoPtRound(level.block.position.x) - offsetRotPointX();
            rotAxis = zAxis;
            rotAngleMod = 1;
            break;
        case dirEnum.posZ:
            rotPoint.z = twoPtRound(level.block.position.z) + offsetRotPointZ();
            rotAxis = xAxis;
            rotAngleMod = 1;
            break;
        case dirEnum.negZ:
            rotPoint.z = twoPtRound(level.block.position.z) - offsetRotPointZ();
            rotAxis = xAxis;
            rotAngleMod = -1;
            break;
        default:
            break;
    }

    // Animate block based on whether the attempted rotation is valid
    if (isValidRotation(rotPoint, rotAxis, ninetyDegRad * rotAngleMod)) {
        animateRotation(rotPoint, rotAxis, ninetyDegRad * rotAngleMod, camera);
    } else {
        animateFailedRotation(rotPoint, rotAxis, Math.PI / (6 * rotAngleMod));
    }
}

/**
 * Check if an an attempted rotation is valid
 *
 * @param {THREE.Vector3} point Point to be rotated around
 * @param {THREE.Vector3} axis Normalized axis vector
 * @param {number} angle Rotation angle in radians
 * @returns {boolean} Whether the attempted rotation is valid
 */
function isValidRotation(point, axis, angle) {
    // Future position(s) of block after the attempted rotation (1 position if vertical, 2 if horizontal)
    let blockFuturePositions = getBlockPos(getRotatedClone(level.block, point, axis, angle));
    // Board tile positions
    let tilePositions = level.board.map((tile) => new Vector2XZ(tile.position.x, tile.position.z));

    let isValid = true;
    // Loop through block future positions
    blockFuturePositions.forEach((blockPos) => {
        // Test if at least one tile's position matches the future block position
        let validTile = tilePositions.some((tilePos) => tilePos.x === blockPos.x && tilePos.z === blockPos.z);
        // If any future block position matches with no tile positions, the rotation cannot be valid
        if (!validTile) {
            isValid = false;
        }
    });
    return isValid;
}

// yapping.

/**
 * Calculate an offset for a point used in an x-directed rotation based on state of the block
 *
 * - If the block is lying horizontal along the x axis, a rotation along the x axis should be
 *   around a point whose x coordinate is +- 1 unit from the center of the block.
 *
 * - Else, the block must be either standing vertical, or lying horizontal along the z axis,
 *   in both of which cases a rotation along the x axis should be around a point whose x
 *   coordinate is +- 0.5 units from the center of the block
 *
 * @returns {1 | 0.5} A rotation point offset
 */
function offsetRotPointX() {
    return twoPtRound(level.block.position.y) === 0.5 && isInt(twoPtRound(level.block.position.z)) ? 1 : 0.5;
}

/**
 * Calculate an offset for a point used in an z-directed rotation based on state of the block
 *
 * - If the block is lying horizontal along the z axis, a rotation along the z axis should be
 *   around a point whose z coordinate is +- 1 unit from the center of the block.
 *
 * - Else, the block must be either standing vertical, or lying horizontal along the x axis,
 *   in both of which cases a rotation along the z axis should be around a point whose z
 *   coordinate is +- 0.5 units from the center of the block
 *
 * @returns {1 | 0.5} A rotation point offset
 */
function offsetRotPointZ() {
    return twoPtRound(level.block.position.y) === 0.5 && isInt(twoPtRound(level.block.position.x)) ? 1 : 0.5;
}

export { handleBlockMovement };
