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
const TEXTURE_INDEX_BREAKABLE_WALL=4;
const TEXTURE_INDEX_PARTICLES=5;
const TEXTURE_INDEX_PORTRAIT=6;
const TEXTURE_INDEX_VISOR_ANIM=7;
const TEXTURE_INDEX_TITLE_LOGO=8;

const PIXEL_UNIT = .125; // 1/8

const SOUND_DYNAMITE_BLOW = [,,49,.08,.06,.43,4,1.3,,-9,,,,.8,,.4,,.48,.12];
const SOUND_SOFT_BLOW = [2.2,,100,.03,.09,.03,3,3.5,-4,3,,,.09,1.7,,.3,.15,.46,.03,.19];
const SOUND_CHECKPOINT = [.5,,80,.3,.4,.7,2,.1,-0.73,3.42,-430,.09,.17,,,,.19];
const SOUND_LASER_BEAM = [1.7,0,294,.11,.01,.005,,2.5,-16,,,,.01,,137,1,.01,.92,,,240]; // Random 28
const SOUND_DRILLING = [1.1,,24,.05,.22,.004,3,.8,90,,,,,.5,,,.15,.97]; // Random 50
const SOUND_MENU_FOCUS = [,0,830,,.06,.24,1,1.82,,,837,.06];//[,,123.4708,.02,.08,.23,1,.4,-5,40,419,.1,,,389,,,.76,,,-1476]; // Random 70
const SOUND_MENU_ACTION = [,,1675,,.06,.24,1,1.82,,,837,.06];//[.4,,23,,.45,.17,3,.1,,,-463,,.05,.1,,,,.73,.01,.08,187]; // Random 73

const LOCAL_STORAGE_KEY = 'amoreira.omega-ostrich.state';

// Unified/merged control modes
//const CONTROL_MODE_RETRO = 0; // 1-BUTTON
//const CONTROL_MODE_MODERN = 1; // 2-BUTTON

// Program-defined globals
let gameInput;
let currentScreen;
let nextScreen;
let mainGameScreen;
var gRandom; 
let gPrevTime;

// LittleJS globals
touchGamepadEnable = true;
touchGamepadAnalog = false;
touchGamepadSize = 45;
glEnable = true;

var gStorage;

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
    gameInput = new GameInput();
    loadStorage();
    showDisclaimerScreen();
}

/**
 * 
 * It is stored as array to prevent mangling from terser/uglifyjs/roadroller
 */
function parseStorageData(raw)
{
    // data taken as a raw string (stringified array)
    let arr = JSON.parse(raw); // de-stringify back into array
    return {
        levelsUnlocked: arr[0],
        tutorialOff: arr[1]
    }
}

function loadStorage()
{
    let data;
    try {
        data = localStorage.getItem(LOCAL_STORAGE_KEY);
    } catch (e) {
        console.warn('failed to loadStorage: ' + e);
    }    
    //console.log('[loadStorage] IN - data = ' + data);
    if (!data) {
        gStorage = { // initial values
            levelsUnlocked: 1,
            tutorialOff: 0
        };
    } else {
        gStorage = parseStorageData(data);
        //console.log('[loadStorage] gStorage = ' + JSON.stringify(gStorage));
    }
}

function saveStorage()
{
    let data = [
        gStorage.levelsUnlocked,
        gStorage.tutorialOff
    ]
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('failed to saveStorage: ' + e);
    } 
}

function showDisclaimerScreen()
{
    currentScreen = new DisclaimerScreen();
    currentScreen.init();
    currentScreen.start();
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

function showMainGameScreen(startLevel, tutorialOff)
{
    if (currentScreen) {
        currentScreen.stop(1); // 1 second fadeout
    }
    nextScreen = mainGameScreen = new MainGameScreen(startLevel, tutorialOff);
    // will be started on 'onEnd()'
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
        './Ostrich.png', /*HERO*/
        './EggBomb.png',
        './Enemies.png',
        './HudIcons.png',
        './BreakableWall.png',
        './Particles.png',
        './OstrichBg-1.png',
        './VisorAnim.png',
        './TitleLogo-Dashed.png'
    ]
);
