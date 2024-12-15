/*
    Little JS H.E.R.O. II: Full Rescue
*/

'use strict';


// Constants
const GAME_RESOLUTION_W = 352; // 44 8x8 tiles
const GAME_RESOLUTION_H = 198; // 25 8x8 tiles

const RENDER_ORDER_ENEMIES=-3;
const RENDER_ORDER_HERO=-2;
const RENDER_ORDER_LASER=-1;
const RENDER_ORDER_WALL=0; // default
const RENDER_ORDER_DYNAMITE=1;
const RENDER_ORDER_FLUID=2;

const TEXTURE_INDEX_HERO=0;
const TEXTURE_INDEX_DYNAMITE=1;
const TEXTURE_INDEX_ENEMIES=2;
const TEXTURE_INDEX_HUD_ICONS=3;

const PIXEL_UNIT_Y = .125;

const SOUND_DYNAMITE_BLOW = [,,49,.08,.06,.43,4,1.3,,-9,,,,.8,,.4,,.48,.12];

// Program-defined globals
let gameInput;
let currentScreen;
let mainGameScreen;
var gRandom; 
let gPrevTime;

// LittleJS globals
touchGamepadEnable = true;
touchGamepadAnalog = false;
touchGamepadSize = 45;
glEnable = true;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    canvasFixedSize = vec2(GAME_RESOLUTION_W, GAME_RESOLUTION_H); // 352x198 virtual coordinate system
    gravity = -.01; 
    cameraScale = WORLD_TILE_SIZE;    //8;
    canvasPixelated = true;
    enablePhysicsSolver = false;
    objectMaxSpeed = .5;    //2;
    gRandom = new RandomGenerator(randInt(1e9));
    //const tileSize = vec2(14,24);
    //const tileInfo = new TileInfo(pos, tileSize, 0);
    //const object = new GameObject(pos, undefined, tileInfo);
    gameInput = new GameInput();
    //currentScreen = new MainGameScreen();
    showTitleScreen();
}

function showTitleScreen()
{
    if (mainGameScreen) {
        mainGameScreen.stop();
        mainGameScreen = null;
    }
    if (currentScreen) {
        currentScreen.stop();
    }
    currentScreen = new TitleScreen();
    currentScreen.init();
    currentScreen.start();
}

function showMainGameScreen(startLevel)
{
    if (currentScreen) {
        currentScreen.stop();
    }
    currentScreen = mainGameScreen = new MainGameScreen(startLevel);
    currentScreen.init();
    currentScreen.start();
}


function showGameOverScreen(victory)
{
    currentScreen = new GameOverScreen(victory);
    currentScreen.init();
    currentScreen.start();
}

function showPauseScreen()
{
    setPaused(true);
    currentScreen = new PauseScreen();
    currentScreen.init();
    currentScreen.start();
    gameInput.clear();
}

function hidePauseScreen()
{
    currentScreen.stop();
    currentScreen = mainGameScreen;
    setPaused(false);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    gameInput.update();
    currentScreen.update();
}

/**
 * 
 * @returns duration in (fractionary) seconds elapsed between current and past
 * frames.
 */
function frameElapsed()
{
    return time - gPrevTime;
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    currentScreen.updatePost();
    gPrevTime = time;
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    currentScreen.render();
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    //console.log('[gameRenderPost] IN');
    currentScreen.renderPost();
    //console.log('[gameRenderPost] OUT');
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(
    gameInit, 
    gameUpdate, 
    gameUpdatePost, 
    gameRender, 
    gameRenderPost, 
    [
        './images/Ostrich.png', /*HERO*/
        './images/EggBomb.png',
        './images/Enemies.png',
        './images/HudIcons.png'
    ]
);