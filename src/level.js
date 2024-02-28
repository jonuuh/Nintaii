import * as THREE from "three";
import { getBlockPos, Vector2XZ } from "./utils.js";

export class Level {
    /**
     * Total levels
     */
    #totalLevels = _LEVELS;

    /**
     * Level number
     */
    #levelNum;

    /**
     * Board object
     */
    #board;

    /**
     * Block object
     */
    #block;

    /**
     * Block position (one or two vectors depending on orientation)
     * - Only updates when getter is called
     */
    #blockPos;

    /**
     * Winning tile object
     */
    #winTile;

    /**
     * Instantiates a new level
     *
     * @param {number} levelNum The level to be instantiated
     */
    constructor(levelNum) {
        this.#levelNum = levelNum;
        this.#board = this.#boardFromLayout(_LAYOUTS[levelNum]);
        this.#block = this.#createBlock(_BLOCK_POSITIONS[levelNum]);
    }

    /**
     * Gets total levels
     *
     * @returns {number} Total levels
     */
    get totalLevels() {
        return this.#totalLevels;
    }

    /**
     * Gets level number
     *
     * @returns {number} Level number
     */
    get levelNum() {
        return this.#levelNum;
    }

    /**
     * Gets board object
     *
     * @returns {THREE.Mesh[]} Board object
     */
    get board() {
        return this.#board;
    }

    /**
     * Gets block object
     *
     * @returns {THREE.Mesh} Block object
     */
    get block() {
        return this.#block;
    }

    /**
     * Gets updated block position
     *
     * @returns {Vector2XZ[]} Block position (one or two vectors depending on orientation)
     */
    get blockPos() {
        this.#blockPos = getBlockPos(this.#block);
        return this.#blockPos;
    }

    /**
     * Gets winning tile object
     *
     * @returns {THREE.Mesh} Winning tile object
     */
    get winTile() {
        return this.#winTile;
    }

    /**
     * Creates a board from a layout
     *
     * @param {string[][]} layout A layout (2D array representing positions of tiles on a board)
     * @returns {THREE.Mesh[]} A Board (array of tiles)
     */
    #boardFromLayout(layout) {
        let board = [];
        let color = 0xffffff;
        const stone = new THREE.TextureLoader().load("./src/assets/images/stone.png");

        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[i].length; j++) {
                if (layout[i][j] !== " ") {
                    color = (i + j) % 2 == 0 ? 0xc4c2be : 0xa384cc; // checkerboard pattern logic
                    if (layout[i][j] === "■") {
                        board.push(this.#createTile(j, i, color, stone));
                    } else if (layout[i][j] === "□") {
                        let hole = this.#createTile(j, i, color, stone);
                        hole.visible = false;
                        this.#winTile = hole;
                        board.push(hole);
                    }
                }
            }
        }
        return board;
    }

    /**
     * Creates a board tile
     *
     * @param {number} x Tile X position
     * @param {number} z Tile Z position
     * @param {number} color Tile color
     * @param {THREE.Texture} texture Tile texture
     * @returns {THREE.Mesh} Tile
     */
    #createTile(x, z, color, texture) {
        const tile = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.2, 1),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                map: texture,
                side: THREE.DoubleSide,
                // wireframe: true,
            })
        );
        tile.position.set(x, -0.1, z);
        return tile;
    }

    /**
     * Creates a block object
     *
     * @param {number[]} position Initial X and Z position of block
     * @returns {THREE.Mesh} Block object
     */
    #createBlock(position) {
        const woodPlank = new THREE.TextureLoader().load("./src/assets/images/wood.png");

        const block = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({
                color: 0x999999,
                map: woodPlank,
                clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.2)],
                // wireframe: true,
            })
        );
        block.position.y = 1;
        block.position.x = position[0];
        block.position.z = position[1];
        // block.add(new THREE.AxesHelper(2));
        return block;
    }
}

/// /// /// /// /// /// /// /// ///
///                             ///
///         LEVEL DATA          ///
///                             ///
/// /// /// /// /// /// /// /// ///

/**
 * Total levels
 */
const _LEVELS = 11;

/**
 * Array of initial block positions (X,Z position)
 */
const _BLOCK_POSITIONS = [
    [5, 1], // level 0
    [1, 1], // level 1
    [1, 1], // level 2
    [3, 0], // level 3
    [1, 0], // level 4
    [0, 0], // level 5
    [1, 3], // level 6
    [13, 3], // level 7
    [0, 3], // level 8
    [2, 7], // level 9
    [0, 5], // level 10
    [9, 14], // level 11
];

/**
 * Array of layouts (2D arrays representing positions of tiles on a board)
 */
const _LAYOUTS = [
    // level 0
    [
        [" ", " ", "■", "■", "■", "■", "■"],
        [" ", " ", "■", "■", "■", "■", "■"],
        [" ", " ", "■", "■", "■", "■", "■"],
        [" ", "■", "■", "■", "■", "■", " "],
        [" ", "■", "■", "■", "■", "■", " "],
        [" ", "■", "■", "■", "■", "■", " "],
        ["■", "■", "■", "■", "■", " ", " "],
        ["■", "□", "■", "■", "■", " ", " "],
        ["■", "■", "■", "■", "■", " ", " "],
    ],

    // level 1
    [
        ["■", "■", "■", "■", "■", " ", "■", "■", "■", "■", "■"],
        ["■", "■", "■", "■", "■", " ", "■", "■", "□", "■", "■"],
        [" ", "■", "■", "■", " ", " ", " ", "■", "■", "■", " "],
        [" ", "■", "■", "■", " ", " ", " ", "■", "■", "■", " "],
        [" ", "■", "■", "■", " ", " ", " ", "■", "■", "■", " "],
        [" ", "■", "■", "■", "■", " ", "■", "■", "■", "■", " "],
        [" ", " ", " ", "■", "■", "■", "■", "■", " ", " ", " "],
        [" ", " ", " ", " ", "■", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", "■", " ", " ", " ", " ", " "],
    ],

    // level 2
    [
        [" ", "■", "■", " ", " "],
        ["■", "■", "■", "■", " "],
        ["■", "■", "□", "■", "■"],
        [" ", "■", "■", "■", "■"],
        [" ", " ", "■", "■", " "],
    ],

    // level 3
    [
        ["■", "■", "■", "■", "■", " ", " ", " "],
        ["■", "■", "■", "■", " ", " ", " ", " "],
        ["■", "■", "■", " ", " ", "■", "■", "■"],
        ["■", "■", " ", " ", " ", "■", "□", "■"],
        ["■", "■", "■", "■", "■", "■", "■", "■"],
        [" ", " ", " ", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", " ", "■", "■", "■"],
    ],

    // level 4
    [
        [" ", "■", "■", "■", "■"],
        [" ", " ", " ", " ", "■"],
        ["■", "■", "■", " ", "■"],
        ["■", "■", "■", "■", "■"],
        ["■", "□", "■", " ", " "],
        ["■", "■", "■", " ", " "],
    ],

    // level 5
    [
        ["■", "■", "■", " ", " ", " "],
        ["■", "■", "■", " ", " ", " "],
        ["■", "■", "■", "■", "■", " "],
        [" ", " ", " ", "■", "■", " "],
        ["■", "■", "■", "■", "■", " "],
        ["■", "■", "■", " ", " ", " "],
        ["■", "■", "■", "■", "■", "■"],
        [" ", " ", " ", "■", "□", "■"],
        [" ", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", "■", "■"],
    ],

    // level 6
    [
        [" ", " ", " ", " ", " ", " ", "■", "■", "■", "■", "■", "■", "■", " ", " "],
        ["■", "■", "■", "■", " ", " ", "■", "■", " ", " ", " ", "■", "■", " ", " "],
        ["■", "■", "■", "■", "■", "■", "■", "■", "■", " ", " ", "■", "■", "■", "■"],
        ["■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", "■", "■", "□", "■"],
        ["■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■"],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    ],

    // level 7
    [
        [" ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■", " ", " ", " "],
        ["■", "■", "■", " ", " ", " ", " ", "■", "■", " ", " ", "■", "■", "■", "■"],
        ["■", "□", "■", " ", " ", " ", " ", "■", "■", " ", " ", " ", "■", "■", "■"],
        ["■", "■", "■", " ", " ", " ", "■", "■", "■", " ", " ", " ", "■", "■", "■"],
        ["■", "■", "■", " ", " ", " ", "■", "■", "■", " ", " ", " ", "■", "■", "■"],
        [" ", "■", "■", "■", " ", " ", " ", "■", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", "■", "■", "■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " "],
    ],

    // level 8
    [
        [" ", " ", " ", " ", " ", "■", "■", "■", "■", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", "■", " ", " ", "■", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", "■", " ", " ", "■", "■", "■", "■", "■", " ", " "],
        ["■", "■", "■", "■", "■", "■", " ", " ", " ", " ", " ", "■", "■", "■", "■"],
        [" ", " ", " ", " ", "■", "■", "■", " ", " ", " ", " ", "■", "■", "□", "■"],
        [" ", " ", " ", " ", "■", "■", "■", " ", " ", " ", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", " ", " ", "■", " ", " ", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", "■", "■", "■", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", "■", "■", "■", "■", "■", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", "■", "■", "■", " ", " ", " ", " ", " "],
    ],

    // level 9
    [
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■", " "],
        ["■", "■", "■", "■", "■", "■", "■", "■", "■", "■", "■", "■", "□", "■", " "],
        ["■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", " "],
        ["■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", "■", "■", "■", "■", "■", "■", "■", "■", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■", "■", "■", "■", "■"],
        [" ", "■", "■", "■", "■", " ", " ", " ", " ", " ", "■", "■", "■", "■", "■"],
        [" ", "■", "■", "■", "■", "■", "■", "■", "■", "■", "■", " ", " ", " ", " "],
        [" ", "■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    ],

    // level 10
    [
        [" ", "■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " "],
        [" ", "■", "□", "■", "■", " ", " ", " ", " ", " ", " ", " "],
        [" ", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", "■", " ", " ", " ", "■", "■", "■", "■", "■", "■", " "],
        [" ", "■", " ", " ", " ", "■", "■", " ", " ", "■", "■", " "],
        ["■", "■", "■", "■", "■", "■", "■", " ", " ", "■", "■", "■"],
        [" ", " ", " ", " ", " ", "■", " ", " ", " ", " ", " ", "■"],
        [" ", " ", " ", " ", " ", "■", "■", "■", "■", " ", " ", "■"],
        [" ", " ", " ", " ", " ", "■", "■", "■", "■", "■", "■", "■"],
        [" ", " ", " ", " ", " ", " ", " ", " ", "■", "■", "■", " "],
    ],

    // level 11
    [
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", "■", "■", "■", "■", " ", "■", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", "■", "■", "■", "■", "■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", "■", " ", " ", "■", "■", "■", "■", "■", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", "■", " ", " ", " ", " ", "■", " ", "■", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", "■", " ", " ", " ", " ", " ", " ", "■", "■", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", "■", " ", " ", " ", " ", "■", " ", " ", " ", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", "■", " ", " ", " ", "■", "■", "■", " ", " ", " ", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", "■", "■", " ", "■", "■", "□", "■", "■", " ", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", "■", " ", " ", " ", "■", "■", "■", " ", " ", " ", "■", "■", "■", " ", " ", " "],
        [" ", " ", " ", " ", "■", "■", "■", " ", " ", "■", " ", " ", "■", "■", "■", "■", "■", " ", " ", " "],
        [" ", " ", " ", "■", "■", "■", "■", " ", " ", "■", " ", " ", "■", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", "■", "■", "■", " ", " ", "■", " ", " ", " ", " ", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", " ", " ", " ", " ", "■", "■", "■", " ", " ", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", "■", "■", "■", "■", "■", "■", "■", "■", " ", " ", "■", "■", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", "■", " ", "■", "■", "■", "■", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    ],
];

// // 20x20 template
// [
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
//     [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
// ];
