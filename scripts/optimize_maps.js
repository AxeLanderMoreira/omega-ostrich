// Optimize JSON maps to simple array structure

const fs = require('fs');

// From 'enemies.js'
// TODO Centralize / require
const SPRITE_INDEX_SPIDER = 0;
const SPRITE_INDEX_MOTH = 2;
const SPRITE_INDEX_BAT = 5;
const SPRITE_INDEX_SNAKE = 7;
const SPRITE_INDEX_TENTACLE = 10;

// gid from the map generated in the 'Tiled' tool:
const ENEMY_GID_SPIDER = SPRITE_INDEX_SPIDER+1;
const ENEMY_GID_MOTH = SPRITE_INDEX_MOTH+1;
const ENEMY_GID_BAT = SPRITE_INDEX_BAT+1;
const ENEMY_GID_SNAKE = SPRITE_INDEX_SNAKE+1;
const ENEMY_GID_TENTACLE = SPRITE_INDEX_TENTACLE+1;

const ENEMY_ID_SPIDER = 0;
const ENEMY_ID_MOTH = 1;
const ENEMY_ID_BAT = 2;
const ENEMY_ID_SNAKE = 3;
const ENEMY_ID_TENTACLE = 4;

const SPIKE_TYPE_ALWAYS = 0; /**< spike is always on (protracted) */
const SPIKE_TYPE_TIMER = 1; /**< spike will retract and protract in a preset interval */
const SPIKE_TYPE_SENSOR = 2; /** spike will protract if player comes inside a proximity sensor */

const SPIKE_POINTING_UP = 0;
const SPIKE_POINTING_DOWN = 1;
const SPIKE_POINTING_LEFT = 2;
const SPIKE_POINTING_RIGHT = 3;

// USE THE FOLLOWING CONSTANTS
// Represent level width and height in # of screens, not tiles.
const GAME_RESOLUTION_W = 352; // 44 8x8 tiles
const GAME_RESOLUTION_H = 198; // 25 8x8 tiles
const WORLD_TILE_SIZE = 8;

let jsString;

function serializeWall(obj) {
    jsString += ',0';    // Object type for Wall is 0
    // TODO Put coordinates already in the LittleJS's world coordinates?
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    jsString += ',' + Math.round(obj.width);
    jsString += ',' + Math.round(obj.height);
    let flag = 0;
    let xmove = 0;
    let ymove = 0;
    if (obj.properties) {
        obj.properties.forEach(prop => {
            if (prop.name == 'hot') {
                flag += 1 * prop.value;
            }
            if (prop.name == 'subtype') {
                switch (prop.value) {
                    case 'breakable':
                        flag += 2; // 010
                        break;
                    case 'ringdoor':
                        flag += 4; // 100
                        break;
                    default:
                        // do nothing 000
                        break;
                }
            }
            if (prop.name == 'xmove') {
                xmove = prop.value;
            }
            if (prop.name == 'ymove') {
                ymove = prop.value;
            }
            // TODO color?
        });
    }
    jsString += ',' + flag;
    jsString += ',' + xmove;
    jsString += ',' + ymove;
}

function gidToEnemyId(gid) {
    let agid = gid & 0x0000FFFF;
    console.error('AGID: ' + agid);
    switch (agid) { // eliminate flags
        case ENEMY_GID_SPIDER:
            return ENEMY_ID_SPIDER;
        case ENEMY_GID_MOTH:
            return ENEMY_ID_MOTH;
        case ENEMY_GID_BAT:
            return ENEMY_ID_BAT;
        case ENEMY_GID_SNAKE:
            return ENEMY_ID_SNAKE;
        case ENEMY_GID_TENTACLE:
            return ENEMY_ID_TENTACLE;
        default:
            console.error('UNKNOWN ENEMY GID: ' + agid);
            return 0;
    }
}

function serializeEnemy(obj) {
    jsString += ',1';    // Object type for Enemy is 1
    jsString += ',' + gidToEnemyId(obj.gid);
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let hflip = (obj.gid >> 31) & 1;
    jsString += ',' + hflip; // TODO vflip too?
    // specialized cases
    if (obj.gid == ENEMY_GID_TENTACLE) {
        let leftEdge = 0, rightEdge = 0;
        if (obj.properties) {
            obj.properties.forEach(prop => {
                if (prop.name == 'leftEdge') {
                    leftEdge = prop.value;
                } else if (prop.name == 'rightEdge') {
                    rightEdge = prop.value;
                }
            });
        }    
        jsString += ',' + Math.round(leftEdge);
        jsString += ',' + Math.round(rightEdge);
    }    
    // TODO mirror/flip? rotation/angle?
}

function serializeFluid(obj) {
    jsString += ',2';    // Object type for Fluid is 2
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    jsString += ',' + Math.round(obj.width);
    jsString += ',' + Math.round(obj.height);
    let color; // may be undefined?
    if (obj.properties) {
        obj.properties.forEach(prop => {
            if (prop.name == 'color') {
                color = prop.value;
            }
        });
    }
    jsString += ',"' + color + '"';
}


function serializeCheckpoint(obj) {
    jsString += ',3';   // Object type for Checkpoint
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let hflip = (obj.gid >> 31) & 1;
    jsString += ',' + hflip;
}

function serializeStartPosition(obj) {
    jsString += ',4';   // Object type for StartPosition
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let flag = 0;
    if (obj.properties) {        
        obj.properties.forEach(prop => {
            if (prop.name == 'hflip') {
                flag += 1 * prop.value;
            }
            if (prop.name == 'stand') {
                flag += 2 * prop.value;
            }
        });
    }
    jsString += ',' + flag;
}

function serializeHint(obj) {
    jsString += ',5';   // Object type for Hint
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let text, hintX, hintY, hintW, hintH;
    if (obj.properties) {
        obj.properties.forEach(prop => {
            if (prop.name == 'text') {
                text = prop.value.replaceAll('\n', '\\n');
            } else if (prop.name == 'hintX') {
                hintX = prop.value;
            } else if (prop.name == 'hintY') {
                hintY = prop.value;
            } else if (prop.name == 'hintW') {
                hintW = prop.value;
            } else if (prop.name == 'hintH') {
                hintH = prop.value;
            }
        });
    }
    jsString += ',"' + text + '"';
    jsString += ',' + hintX;
    jsString += ',' + hintY;
    jsString += ',' + hintW
    jsString += ',' + hintH;
}

function serializeSpike(obj) {
    jsString += ',6';   // Object type for Spike
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let subtype = SPIKE_TYPE_ALWAYS;
    let details = {};
    if (obj.properties) {
        obj.properties.forEach(prop => {
            if (prop.name == 'subtype') {
                switch (prop.value) {
                    case 'timer':
                        subtype = SPIKE_TYPE_TIMER;
                        break;
                    case 'sensor':
                        subtype = SPIKE_TYPE_SENSOR;
                        break;
                }
            } else {
                details[prop.name] = prop.value;
            }
        });
    }
    let vflip = (obj.gid >> 30) & 1;
    let direction;
    if (obj.rotation == 90) {
        direction = vflip ? SPIKE_POINTING_LEFT : SPIKE_POINTING_RIGHT;
    } else {
        direction = vflip ? SPIKE_POINTING_DOWN : SPIKE_POINTING_UP;
    }
    jsString += ',' + direction;
    jsString += ',' + subtype;
    switch (subtype) {
        case SPIKE_TYPE_TIMER:
            jsString += ',' + details.interval;
            jsString += ',' + details.beginOn;
            jsString += ',' + details.endOn;
            break;
        case SPIKE_TYPE_SENSOR:
            jsString += ',' + details.sensorW;
            jsString += ',' + details.sensorH;
            break;
    }
}

function serializeRing(obj) {
    jsString += ',7';   // Object type for Ring
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let horizontal = (obj.rotation == 90);
    jsString += ',' + horizontal;
}

function serializeRingDoor(obj) {
    jsString += ',8';   // Object type for RingDoor
    jsString += ',' + Math.round(obj.x);
    jsString += ',' + Math.round(obj.y);
    let horizontal = (obj.rotation == 90);
    jsString += ',' + horizontal;
}

/**
 * 
 * @param {string} mapPath File name for the .tmj file to be processed.
 */
function processMapFile(mapPath) {
    const payload = fs.readFileSync(mapPath);
    const map = JSON.parse(payload);
    jsString +='\t[' + map.width;
    jsString += ',' + map.height;
    let layer = map.layers[0];
    // TODO Handle dynamically
/*
 "tilesets":[
        {
         "firstgid":1,
         "source":"Ring.tsx"
        }, 
        {
         "firstgid":2,
         "source":"Enemies.tsx"
        }],
*/
    layer.objects.forEach(obj => {        
        console.log('seralize obj ' + obj.type);
        switch(obj.type) {
            case 'Wall':
                serializeWall(obj);
                break;
            case 'Enemy':
                serializeEnemy(obj);
                break;
            case 'Fluid':
                serializeFluid(obj);
                break;
            case 'Checkpoint':
                serializeCheckpoint(obj);
                break;
            case 'StartPosition':
                serializeStartPosition(obj);
                break;
            case 'Hint':
                serializeHint(obj);
                break;
            case 'Spike':
                serializeSpike(obj);
                break;
            case 'Ring':
                serializeRing(obj);
                break;
            case 'RingDoor':
                serializeRingDoor(obj);
                break;
        }
    });
    jsString += '],\n';
}

/**
 * 
 */
function processMapDirectory() {
    let files = fs.readdirSync('../maps').filter(fn => fn.endsWith('.tmj'));

    jsString = 'const GAMEMAP = [\n';        
    files.forEach(file => {
        processMapFile('../maps/' + file);
    });
    jsString += '];';
    fs.writeFileSync('../maps/maps_optimized.js', jsString);
}

processMapDirectory();
