import * as THREE from "three";

/**
 * Rotate an object around an axis in world space passing through a point
 *
 * @param {THREE.Object3D} object Object to be rotated
 * @param {THREE.Vector3} point Point to be rotated around
 * @param {THREE.Vector3} axis Normalized axis vector
 * @param {number} angle Rotation angle in radians
 */
function rotateAroundWorldAxis(object, point, axis, angle) {
    var q = new THREE.Quaternion();

    q.setFromAxisAngle(axis, angle);

    object.applyQuaternion(q);

    object.position.sub(point);
    object.position.applyQuaternion(q);
    object.position.add(point);
}

/**
 * Gets current block position(s)
 *
 * @param {THREE.Mesh} block A block
 * @returns {Vector2XZ[]} An array of either one or two Vector2XZ objects, depending on orientation of block
 */
function getBlockPos(block) {
    // lots of floating point madness in here..
    let blockPos;
    if (isInt(halfRound(block.position.x)) && isInt(halfRound(block.position.z))) {
        blockPos = [new Vector2XZ(block.position.x, block.position.z).halfRound()];
    } else {
        blockPos = [
            new Vector2XZ(block.position.x, block.position.z).halfRound().floor(),
            new Vector2XZ(block.position.x, block.position.z).halfRound().ceil(),
        ];
    }
    return blockPos;
}

/**
 * Get a clone of the block rotated around an axis in world space passing through a point
 * - Used to get info about the future state of the block after a rotation,
 *   without affecting the real block
 *
 * @param {THREE.Mesh} block Block to be cloned and rotated
 * @param {THREE.Vector3} point Point to be rotated around
 * @param {THREE.Vector3} axis Normalized axis vector
 * @param {number} angle Rotation angle in radians
 * @returns {THREE.Mesh} A Cloned block
 */
function getRotatedClone(block, point, axis, angle) {
    let blockClone = block.clone();
    rotateAroundWorldAxis(blockClone, point, axis, angle);
    return blockClone;
}

/**
 * Array of 5 Audio objects
 */
const _audioObjects = [new Audio(), new Audio(), new Audio(), new Audio(), new Audio()];

/**
 * Loop through audioObjects, find one that is unused, use that object to play the src audio
 *
 * @param {string} src Audio src
 * @param {number} vol Audio volume
 */
function playAudio(src, vol) {
    for (const audio of _audioObjects) {
        if (audio.paused || audio.ended) {
            audio.src = src;
            audio.volume = vol;
            audio.play();
            break;
        }
    }
}

/**
 * Rounds a number to 2 decimal places
 *
 * @param {number} num A number
 * @returns {number} A rounded number
 */
function twoPtRound(num) {
    return Math.round(num * 100) / 100;
}

/**
 * Rounds a number to the nearest 0.5
 *
 * @param {number} num A number
 * @returns {number} A rounded number
 */
function halfRound(num) {
    return Math.round(num * 2) / 2;
}

/**
 * Checks if a number is an integer (% 1)
 *
 * @param {number} num A number
 * @returns {boolean} Whether the number is an integer
 */
function isInt(num) {
    return num % 1 === 0;
}

/**
 * Constant camera offset relative to block (-7, 20, 25)
 */
const camOffset = new THREE.Vector3(-7, 20, 25);

/**
 * X-Axis unit vector
 */
const xAxis = new THREE.Vector3(1, 0, 0);

/**
 * Y-Axis unit vector
 */
const yAxis = new THREE.Vector3(0, 1, 0);

/**
 * Z-Axis unit vector
 */
const zAxis = new THREE.Vector3(0, 0, 1);

/**
 * 90 degrees in radians
 */
const ninetyDegRad = Math.PI / 2;

/**
 * 2D Direction enum (X/Z)
 */
const dirEnum = {
    posX: 0,
    negX: 1,
    posZ: 2,
    negZ: 3,
};

/**
 * 2D Vector with X and Z coordinates
 */
class Vector2XZ {
    x;
    z;

    constructor(x, z) {
        this.x = x;
        this.z = z;
    }

    /**
     * Rounds components of this vector down to nearest int
     */
    floor() {
        this.x = Math.floor(this.x);
        this.z = Math.floor(this.z);
        return this;
    }

    /**
     * Rounds components of this vector up to nearest int
     */
    ceil() {
        this.x = Math.ceil(this.x);
        this.z = Math.ceil(this.z);
        return this;
    }

    /**
     * Rounds components of this vector to the nearest 0.5
     */
    halfRound() {
        this.x = halfRound(this.x);
        this.z = halfRound(this.z);
        return this;
    }
}

export {
    rotateAroundWorldAxis,
    getBlockPos,
    getRotatedClone,
    playAudio,
    twoPtRound,
    isInt,
    camOffset,
    xAxis,
    yAxis,
    zAxis,
    ninetyDegRad,
    dirEnum,
    Vector2XZ,
};
