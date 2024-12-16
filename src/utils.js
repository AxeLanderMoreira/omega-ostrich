//const TOLERANCE_THICKNESS = 1/WORLD_TILE_SIZE; // 1 pixel tolerance

//const TOLERANCE_THICKNESS = 2/WORLD_TILE_SIZE; // 2 pixel tolerance

const TOLERANCE_THICKNESS = 3/WORLD_TILE_SIZE; // 3 pixel tolerance

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
