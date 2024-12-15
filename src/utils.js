// Copyright 2024 alexandre
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*
function collide(r1, r2) {
    let r1x1 = r1.x - r1.w/2;
    let r1x2 = r1x1 + r1.w;
    let r1y2 = r1.y + r1.h/2;
    let r1y1 = r1y2 - r1.h;
    let r2x1 = r2.x - r2.w/2;
    let r2x2 = r2x1 + r2.w;
    let r2y2 = r2.y + r2.h/2;
    let r2y1 = r2y2 - r2.h;
    if ((r1y2 > r2y1 && r1y2 < r2y2) || (r1y1 > r2y1 && r1y1 < r2y2)) {
        // vertical overlap confirmed
        if ((r1x2 > r2x1 && r1x2 < r2x2) || (r1x1 > r2x1 && r1x1 < r2x2)) {
            // horizontal overlap confirmed
            return true;
        }
    }
    return false;
}*/


//const TOLERANCE_THICKNESS = 1/WORLD_TILE_SIZE; // 1 pixel tolerance

//const TOLERANCE_THICKNESS = 2/WORLD_TILE_SIZE; // 1 pixel tolerance


const TOLERANCE_THICKNESS = 3/WORLD_TILE_SIZE; // 1 pixel tolerance


/**
 * @brief checks if an R1s LEFT edge touches R2's RIGHT edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideLR(r1, r2) {
    let r1Left = r1.x - r1.w/2;
    let r2Right = r2.x + r2.w/2;
    return isOverlapping(
        vec2(r1Left, r1.y),
        vec2(TOLERANCE_THICKNESS, r1.h),
        vec2(r2Right, r2.y),
        vec2(TOLERANCE_THICKNESS, r2.h)
    );
}
/*function collideLR(r1, r2) {
    let r1x1 = r1.x - r1.w/2;
    let r1x2 = r1x1 + r1.w;
    let r1y2 = r1.y + r1.h/2;
    let r1y1 = r1y2 - r1.h;
    let r2x1 = r2.x - r2.w/2;
    let r2x2 = r2x1 + r2.w;
    let r2y2 = r2.y + r2.h/2;
    let r2y1 = r2y2 - r2.h;
    if ((r1y2 > r2y1 && r1y2 < r2y2) || (r1y1 > r2y1 && r1y1 < r2y2)) {
        // vertical overlap confirmed
        if ((r2x2 >r1x1) && (r2x2 < r1x2)) {
            // touch left confirmed
            return true;
        }
    }
    return false;
}*/

/**
 * @brief checks if an R1s RIGHT edge touches R2's LEFT edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideRL(r1, r2) {
    let r1Right = r1.x + r1.w/2;
    let r2Left = r2.x - r2.w/2;
    return isOverlapping(
        vec2(r1Right, r1.y),
        vec2(TOLERANCE_THICKNESS, r1.h),
        vec2(r2Left, r2.y),
        vec2(TOLERANCE_THICKNESS, r2.h)
    );
}
/*function collideRL(r1, r2) {
    let r1x1 = r1.x - r1.w/2;
    let r1x2 = r1x1 + r1.w;
    let r1y2 = r1.y + r1.h/2;
    let r1y1 = r1y2 - r1.h;
    let r2x1 = r2.x - r2.w/2;
    let r2x2 = r2x1 + r2.w;
    let r2y2 = r2.y + r2.h/2;
    let r2y1 = r2y2 - r2.h;
    if ((r1y2 > r2y1 && r1y2 < r2y2) || (r1y1 > r2y1 && r1y1 < r2y2)) {
        // vertical overlap confirmed
        if ((r1x2 > r2x1) && (r1x2 < r2x2)) {
            // touch right confirmed
            return true;
        }
    }
    return false;
}*/

/**
 * @brief checks if an R1's TOP edge touches R2's BOTTOM edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
/*function collideTB(r1, r2)  {
    let r1x1 = r1.x - r1.w/2;
    let r1x2 = r1x1 + r1.w;
    let r2x1 = r2.x - r2.w/2;
    let r2x2 = r2x1 + r2.w;

    let r1y1 = r1.y + r1.h/2;
    let r1y2 = r1y1 - r1.h; // y2 < y1 per cartesian coordinate system
    let r2y1 = r2.y + r2.h/2;
    let r2y2 = r2y1 - r2.h;

    if ((r1x2 > r2x1 && r1x2 < r2x2) || (r1x1 > r2x1 && r1x1 < r2x2)) {
        // horizontal overlap confirmed
        if ((r1y1 > r2y2) && (r1y2 < r2y2)) {
            // touch top confirmed
            return true;
        }
    }
    return false;
}*/

/**
 * @brief checks if an R1's TOP edge touches R2's BOTTOM edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideTB(r1, r2) {
    let r1Top = r1.y + r1.h/2;
    let r2Bottom = r2.y - r2.h/2;
    return isOverlapping(
        vec2(r1.x, r1Top),
        vec2(r1.w, TOLERANCE_THICKNESS),
        vec2(r2.x, r2Bottom),
        vec2(r2.w, TOLERANCE_THICKNESS)
    );
}

/**
 * @brief checks if an R1s BOTTOM edge touches R2's TOP edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
function collideBT(r1, r2) {
    let r1Bottom = r1.y - r1.h/2;
    let r2Top = r2.y + r2.h/2;
    return isOverlapping(
        vec2(r1.x, r1Bottom),
        vec2(r1.w, TOLERANCE_THICKNESS),
        vec2(r2.x, r2Top),
        vec2(r2.w, TOLERANCE_THICKNESS)
    );
}

/**
 * @brief checks if an R1s BOTTOM edge touches R2's TOP edge.
 * @return true in case check is successful
 * @note takes into account cartesian (world) coordinate system where (0,0) is
 * at the center of the rectangle and increases toward top-right
 */
/*function collideBT(r1, r2)  {
    let r1x1 = r1.x - r1.w/2;
    let r1x2 = r1x1 + r1.w;
    let r2x1 = r2.x - r2.w/2;
    let r2x2 = r2x1 + r2.w;

    let r1y1 = r1.y + r1.h/2;
    let r1y2 = r1y1 - r1.h; // y2 < y1 per cartesian coordinate system
    let r2y1 = r2.y + r2.h/2;
    let r2y2 = r2y1 - r2.h;

    if ((r1x2 >= r2x1 && r1x2 <= r2x2) || (r1x1 >= r2x1 && r1x1 <= r2x2)) {
        // horizontal overlap confirmed
        if ((r1y2 <= r2y1) && (r1y1 >= r2y1)) {
            // touch bottom confirmed
            return true;
        }
    }
    return false;
}*/