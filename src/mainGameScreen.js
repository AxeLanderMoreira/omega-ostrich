
const INITIAL_LEVEL = 1;

const CLASSIC_SCREEN_TRANSITION=true; /* use false for scrolling instead */

const HUD_ICON_X = 10;
const HUD_ICON_LEVEL = 11;
const HUD_ICON_HERO = 12;
const HUD_ICON_DYNAMITE = 13;

class MainGameScreen extends GameScreen
{
    /**
     * 
     */
     constructor(startLevel, controlMode)
     {
        super();
        this.startLevel = startLevel;
        gameInput.setControlMode(controlMode);
     }

    /**
     * Called just once. Makes general initialization, and loads resources that
     * are never expected to be unloaded.
     */
    init()
    {
        this.respawnPosition = vec2(-10, 10);   // default respawnPosition
        this.respawnAirborne = true;
        this.player = new Player(this.respawnPosition, this); // position of middle floor
        this.currLevelNum = this.startLevel;
        this.level = new GameLevel(GAMEMAP[this.currLevelNum-1], this);
        this.player.pos = this.respawnPosition.copy();
        this.enemies = this.level.getEnemies();
        this.fluids = this.level.getFluids();
        this.quadrant = vec2(0,0);
    }

    getQuadrantCenterPos(quad) {
        return vec2(
            quad.x * (GAME_RESOLUTION_W / WORLD_TILE_SIZE),
            -quad.y * (GAME_RESOLUTION_H / WORLD_TILE_SIZE));
    }

    getQuadrantFromPos(pos) {
        // TODO Implement here and call at every start cycle.
        let px = pos.x + (GAME_RESOLUTION_W / WORLD_TILE_SIZE / 2);
        let py = -(pos.y - (GAME_RESOLUTION_H / WORLD_TILE_SIZE / 2));
        //console.log("px=(" + px + "," + py + ")");
        return vec2(
            Math.floor(px/(GAME_RESOLUTION_W/WORLD_TILE_SIZE)), 
            Math.floor(py/(GAME_RESOLUTION_H/WORLD_TILE_SIZE)));
    }

    /**
     * Called at every transition into this screen
     */
    start()
    {
        this.player.setControlEnabled(true);
    }

    /**
     * Called from gameUpdate callback registered via engineInit
     */
    update()
    {
        //console.log("[MainGameScreen.update] time = " + time);
        let camX;
        let camY;

        if (gameInput.pressedPause()) {
            showPauseScreen();
        }

        if (CLASSIC_SCREEN_TRANSITION) { // screen by screen
            let quad = this.getQuadrantFromPos(this.player.pos);
            if (quad.x != this.quadrant.x ||
                quad.y != this.quadrant.y) {
                this.quadrant = quad;
                this.respawnPosition = this.player.pos.copy();
                this.respawnAirborne = this.player.airborne;
            } 
            //console.log('[MainGameScreen.update] quad = (' + quad.x + ',' + quad.y + ')');
            let cpos = this.getQuadrantCenterPos(quad);
            camX = cpos.x;
            camY = cpos.y;            
        } else { // scroll
            camX = this.player.pos.x;
            camY = this.player.pos.x;
        }

        let upperLimit = this.level.getCameraUpperLimit();
        let lowerLimit = this.level.getCameraLowerLimit();
        
        if (camX < upperLimit.x) {
            camX = upperLimit.x;
        }
        if (camY > upperLimit.y) {
            camY = upperLimit.y;
        }
        if (camX > lowerLimit.x) {
            camX = lowerLimit.x;
        }
        if (camY < lowerLimit.y) {
            camY = lowerLimit.y;
        }
        if (this.shakeRange > 0) {
            if (this.flashFXEnd > 0) {
                if (time < this.flashFXEnd) {
                    if (this.flashFXFrame) {
                        camX += gRandom.float(-this.shakeRange, this.shakeRange);
                        camY += gRandom.float(-this.shakeRange, this.shakeRange);
                    }
                    this.flashFXFrame = !this.flashFXFrame;
                } else {
                    this.flashFXEnd = -1;
                    this.flashFXFrame = false;
                    this.shakeRange = 0;
                    delete this.flashColor;
                }                
            }        
        }
        //console.log("[MainGameScreen.update] adjusted playerPos = " + camX + "," + camY);
        cameraPos = vec2(camX, camY);
        super.update();
    }

    /**
     * Called from gameUpdatePost callback registered via engineInit
     */
    updatePost()
    {
    }

    /**
     * Called from gameRender callback registered via engineInit
     */
    render()
    {
        if (this.flashFXEnd > 0 && 
            time < this.flashFXEnd && 
            this.flashColor &&
            this.flashFXFrame) {
            mainContext.fillStyle = mainContext.fillStyle = this.flashColor;
            mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        } else {
            drawBackground(BG_GRADIENT_COLOR_BRIGHT_CAVE, BG_GRADIENT_COLOR_DARK);
        }
        super.render();
    }

    /**
     * 
     * @param {*} iconIndex 
     * @param {*} pos 
     */
    drawHUDIcon(iconIndex, pos) {
        drawTile(pos, // pos
                 vec2(10,10), // size
                 new TileInfo(vec2(iconIndex*10,0), vec2(10,10), TEXTURE_INDEX_HUD_ICONS, 1), // tile info
                 undefined, 0, false, undefined, // color, angle, mirror, additiveColor
                 glEnable, true); // useWebGL, screenSpace
    }


    /**
     * Called from gameRenderPost callback registered via engineInit
     */
    drawHUD()
    {
        // draw HUD
        //- dimensions: 40x64 pixels (5x8 tiles)
	    //- top, left: 4,4 (.5, .5 tiles)
        // center: 3, 4.5

        // 1. draw HUD background
        let pos = vec2(24, 36);
        const size = vec2(40,64);
        drawRect(pos, size, new Color(0,0,0,.75), 0, glEnable, true);

        // 2. draw FUEL bar
        let left = 8; //11;
        let topYellow = 6;  //11;
        let width = 4;
        // TODO Ratio-based calculation (breaks if PLAYER_INITIAL_FUEL is changed)
        let heightYellow = this.player.fuel; 
        let topRed = topYellow + heightYellow;
        let heightRed = 60 - this.player.fuel;
        
        let posX = left + width - (width/2);
        let posY = topYellow + heightYellow - (heightYellow/2);
        drawRect(vec2(posX, posY), vec2(width, heightYellow), new Color(1,1,0,1), 0, glEnable, true);
        
        posY = topRed + heightRed - (heightRed/2);
        drawRect(vec2(posX, posY), vec2(width, heightRed), new Color(1,0,0,1), 0, glEnable, true);

        // 3. draw HUD icons        
        let initialX = 19;
        let initialY = 11;
        pos=vec2(initialX, initialY);

        // 3.1 draw lives
        this.drawHUDIcon(HUD_ICON_HERO, pos);
        pos.x += 8;
        this.drawHUDIcon(HUD_ICON_X, pos);
        pos.x += 8;
        this.drawHUDIcon(this.player.lives, pos);

        // 3.2 draw dynamite stock
        pos.x = initialX;
        pos.y += 10;
        this.drawHUDIcon(HUD_ICON_DYNAMITE, pos);
        pos.x += 8;
        this.drawHUDIcon(HUD_ICON_X, pos);
        pos.x += 8;
        this.drawHUDIcon(this.player.numSticks, pos);

        // 3.3 draw level number
        pos.x = initialX;
        pos.y += 10;
        this.drawHUDIcon(HUD_ICON_LEVEL, pos);
        pos.x += 8;
        this.drawHUDIcon(Math.floor(this.currLevelNum / 10), pos);
        pos.x += 8;
        this.drawHUDIcon(Math.floor(this.currLevelNum % 10), pos, true);
    }

    drawHint()
    {
        drawRect(this.hintPos, this.hintSize, new Color(1,1,1,1), 0, glEnable, true);
        drawRect(this.hintPos, this.hintSize.add(vec2(-2)), new Color(0,0,0,1), 0, glEnable, true);
        let y = this.hintPos.y - ((this.hintLines.length * 12) / 2) + 6;
        for (let i = 0; i < this.hintLines.length; i++) {
            drawTextScreen(this.hintLines[i], vec2(this.hintPos.x, y), 10, new Color(1,1,1,1));
            y += 12;
        }
    }

    renderPost()
    {
        this.drawHUD();
        if (this.hintVisible) {
            this.drawHint();
        }
    }

    /**
     * Called at every transition out of this screen, when the current state can be discarded.
     */
    stop()
    {
        delete this.level;
        this.enemies = [];
        delete this.player;
        engineObjectsDestroy();
    }

    /**
     * Called at every transition out of this screen, when the current state has to be preserved.
     */
    hide()
    {
        
    }

    /**
     * Called to show this screen again after hide().
     */
    show()
    {
        
    }

    getLevel()
    {
        return this.level; // level map
    }

    /**
     * Initiate "dynamite blow up" special FX, which will flash for "duration" seconds.
     * @param {*} duration 
     */
    startFlashFX(duration, flashColor, shakeRange)
    {
        this.flashFXEnd = time + duration;
        this.flashFXFrame = true;
        this.flashColor = flashColor;
        this.shakeRange = shakeRange;
    }

    destroyEnemy(enemy)
    {
        let index = this.enemies.indexOf(enemy);
        if (index >= 0) {
            this.enemies.splice(index, 1);
            enemy.destroy();
        }
    }

    destroyWall(wall)
    {
        //let index = this.walls.indexOf(wall);
        let walls = this.level.getWalls();
        let index = walls.indexOf(wall);
        if (index >= 0) {
            walls.splice(index, 1);
            wall.destroy();
        }
    }

    nextLevel()
    {
        if (this.currLevelNum == GAMEMAP.length) {
            // End of game - show game over screen
            return false;
        }

        // destroy current level entities
        this.enemies.forEach(enemy => {
            enemy.destroy();
        });
        this.level.checkpoint.destroy();
        let walls = this.level.getWalls();
        walls.forEach(wall => {
            wall.destroy();
        });
        let fluids = this.level.getFluids();
        fluids.forEach(fluid => {
            fluid.destroy();
        });
        let hints = this.level.getHints();
        hints.forEach(hint => {
            hint.destroy();
        });
        this.enemies = [];
        delete this.level;

        // prepare next level
        this.currLevelNum++;
        this.respawnPosition = vec2(-10, 10);   // default respawnPosition
        this.respawnAirborne = true;
        this.level = new GameLevel(GAMEMAP[this.currLevelNum-1], this);
        this.enemies = this.level.getEnemies();
        this.quadrant = vec2(0,0);
        return true;
    }

    showHint(text, hintPos, hintSize) {
        this.hintLines = text.split('\n');
        this.hintPos = hintPos;
        this.hintSize = hintSize;
        this.hintVisible = true;
    }

    hideHint() {
        this.hintVisible = false;
    }
}
