//const TOLERANCE_THICKNESS = 1/WORLD_TILE_SIZE; // 1 pixel tolerance

//const TOLERANCE_THICKNESS = 2/WORLD_TILE_SIZE; // 2 pixel tolerance

const TOLERANCE_THICKNESS = 3/WORLD_TILE_SIZE; // 3 pixel tolerance

const BG_GRADIENT_COLOR_BRIGHT_CAVE = 0x5c4000;
const BG_GRADIENT_COLOR_BRIGHT_TITLE = 0x5c00ff;
const BG_GRADIENT_COLOR_BRIGHT_TITLE_2 = 0x00ffff;
const BG_GRADIENT_COLOR_DARK = 0x000000;

/**
 * Convert int color to rgb format (used in CSS and JS Canvas API)
 * @param {int} color Int in 0xRRGGBB format
 */
function colorInt2Css(color) {
    let r = (color >> 16) & 0xFF;
    let g = (color >> 8) & 0xFF;
    let b = color & 0xFF;
    return ('rgb(' + r + ' ' + g + ' ' + b + ')');
}

/**
 * Calculates lerp between two colors in hex format
 * @param {int} c1 Color 1 to blend
 * @param {int} c2 Color 2 to blend
 * @param {float} pct percentage to combine c1 upon c2
 * @returns 
 */
function lerpColorInts(c1, c2, pct) {
    let r1 = (c1 >> 16) & 0xFF;
    let g1 = (c1 >> 8) & 0xFF;
    let b1 = c1 & 0xFF;
    let r2 = (c2 >> 16) & 0xFF;
    let g2 = (c2 >> 8) & 0xFF;
    let b2 = c2 & 0xFF;
    let r = Math.round((pct*r1) + ((1-pct)*r2));
    let g = Math.round((pct*g1) + ((1-pct)*g2));
    let b = Math.round((pct*b1) + ((1-pct)*b2));
    return (r << 16) | (g << 8) | (b);
}

/**
 * @brief checks if an R1s LEFT edge touches R2's RIGHT edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideLR(r1, r2) {
    let r1Left = r1.pos.x - r1.size.x/2;
    let r2Right = r2.pos.x + r2.size.x/2;
    return isOverlapping(
        vec2(r1Left, r1.pos.y),
        vec2(TOLERANCE_THICKNESS, r1.size.y),
        vec2(r2Right, r2.pos.y),
        vec2(TOLERANCE_THICKNESS, r2.size.y)
    );
}

/**
 * @brief checks if an R1s RIGHT edge touches R2's LEFT edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideRL(r1, r2) {
    let r1Right = r1.pos.x + r1.size.x/2;
    let r2Left = r2.pos.x - r2.size.x/2;
    return isOverlapping(
        vec2(r1Right, r1.pos.y),
        vec2(TOLERANCE_THICKNESS, r1.size.y),
        vec2(r2Left, r2.pos.y),
        vec2(TOLERANCE_THICKNESS, r2.size.y)
    );
}

/**
 * @brief checks if an R1's TOP edge touches R2's BOTTOM edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideTB(r1, r2) {
    let r1Top = r1.pos.y + r1.size.y/2;
    let r2Bottom = r2.pos.y - r2.size.y/2;
    return isOverlapping(
        vec2(r1.pos.x, r1Top),
        vec2(r1.size.x, TOLERANCE_THICKNESS),
        vec2(r2.pos.x, r2Bottom),
        vec2(r2.size.x, TOLERANCE_THICKNESS)
    );
}

/**
 * @brief checks if an R1s BOTTOM edge touches R2's TOP edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideBT(r1, r2) {
    let r1Bottom = r1.pos.y - r1.size.y/2;
    let r2Top = r2.pos.y + r2.size.y/2;
    return isOverlapping(
        vec2(r1.pos.x, r1Bottom),
        vec2(r1.size.x, TOLERANCE_THICKNESS),
        vec2(r2.pos.x, r2Top),
        vec2(r2.size.x, TOLERANCE_THICKNESS)
    );
}

function drawBackground(color1, color2)
{
    const gradient = mainContext.fillStyle = mainContext.createLinearGradient(0, 0, 0, mainCanvas.height);
    let rgb1 = colorInt2Css(color1);
    let rgb2 = colorInt2Css(color2);
    gradient.addColorStop(0, rgb1);
    gradient.addColorStop(0.5, rgb2);
    gradient.addColorStop(1, rgb1);
    mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

/**
 * 
 * @param {*} v1 
 * @param {*} v2 
 * @return true if vectors are equal
 */
function compareVectors(v1, v2) {
    return (v1.x == v2.x && v1.y == v2.y);
}