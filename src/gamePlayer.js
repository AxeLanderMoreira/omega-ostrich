'use strict';

const PLAYER_TILE_SIZE_X = 16;  //14;
const PLAYER_TILE_SIZE_Y = 26;  //24;
const DYNAMITE_TILE_SIZE_X = 15; //13;
const DYNAMITE_TILE_SIZE_Y = 14; //12;
// TODO Move below to some file named atlas.js:
const PLAYER_HORZ_MOVE_SPD = .2;
const PLAYER_HOVER_UPWARDS_ACCELERATION = .02;

// Initial number of reserve dynamite sticks
const PLAYER_INITIAL_NUM_STICKS = 5;

const PLAYER_INITIAL_LIVES = 3;

const PLAYER_RESPAWN_TIME=1.5; // Time from DEAD to respawning

const PLAYER_INITIAL_FUEL=60; // In seconds

// Para deixar a jogabilidade mais ágil, permitir que os estados 
// STATE_CHARACTER_TURN e STATE_CHARACTER_LAND
// possam ser canceláveis para ações de walk, jump e punch e slide

const STATE_CHARACTER_STAND=0;
const STATE_CHARACTER_WALK=1;
const STATE_CHARACTER_TURN=2;
const STATE_CHARACTER_JUMP=3;
const STATE_CHARACTER_FALL=4;
const STATE_CHARACTER_HOVER=5;
const STATE_CHARACTER_TURNMIDAIR=6;
const STATE_CHARACTER_CROUCH=7;
const STATE_CHARACTER_TURNCROUCHING=8;
const STATE_CHARACTER_DEAD=9;
const STATE_CHARACTER_CHECKPOINT=10;
const STATE_CHARACTER_RESPAWN=11;
const STATE_CHARACTER_ASTRALFLIGHT=255;

class Character extends GameObject 
{
    constructor(pos, screen)
    { 
        super(pos, vec2(PLAYER_TILE_SIZE_X/WORLD_TILE_SIZE, PLAYER_TILE_SIZE_Y/WORLD_TILE_SIZE));
        this.screen = screen;
        this.tileInfo = new TileInfo(vec2(0, 0), vec2(PLAYER_TILE_SIZE_X, PLAYER_TILE_SIZE_Y), TEXTURE_INDEX_HERO, 1);
        this.mirror = false; // facing right
        this.lives = PLAYER_INITIAL_LIVES;
        this.animMap = [
            new GameAnimation(this, 0, [0], 1, true),          // STAND
            new GameAnimation(this, 0, [1,2,3,4], .3, true),   // WALK
            new GameAnimation(this, 0, [9], .05, false),       // TURN
            new GameAnimation(this, 0, [5], 1, false),         // JUMP
            new GameAnimation(this, 0, [6], 1, true),          // FALL
            new GameAnimation(this, 0, [6,7,8], .2, true),     // HOVER
            // TODO Change TURNMIDAIR sprite
            new GameAnimation(this, 0, [9], .05, false),      // TURNMIDAIR
            new GameAnimation(this, 0, [10], 1, true),         // CROUCH
            new GameAnimation(this, 0, [11], .05, false),      // TURNCROUCHING
            new GameAnimation(this, 0, [9], 1, false),        // DEAD
            undefined,  // CHECKPOINT (does not change current animation)
            new GameAnimation(this, 0, [6,7,8], .4, true),   // RESPAWN
        ];
        //this.setCollision(false, true);
//        this.createHitBox(3,0,7,24);
        this.createHitBox(0,0,12,24);
        this.changeState(STATE_CHARACTER_RESPAWN); // this.nextState will assume -1
        this.renderOrder = RENDER_ORDER_HERO;
        this.numSticks = PLAYER_INITIAL_NUM_STICKS;
        this.fuel = PLAYER_INITIAL_FUEL;
    }

    collideWallLR(walls)
    {
        for (var i = 0; i < walls.length; i++) {
            if (collideLR(this.box, walls[i])) {
                return walls[i];
            }
        }
    }
    
    collideWallRL(walls)
    {
        for (var i = 0; i < walls.length; i++) {
            if (collideRL(this.box, walls[i])) {
                return walls[i];
            }
        }
    }

    collideCeiling(walls)
    {
        for (var i = 0; i < walls.length; i++) {
            if (collideTB(this.box, walls[i])) {
                return walls[i];
            }
        }
    }

    collideFloor(walls)
    {
        //console.log('[collideFloor] IN');
        for (var i = 0; i < walls.length; i++) {
            if (collideBT(this.box, walls[i])) {
                //console.log('[collideFloor] OUT - collided');
                return walls[i];
            }
        }
        //console.log('[collideFloor] OUT - no collision');
    }

    /**
     * 
     * @param {Number} newState 
     * @param {Number} followingState 
     */
    changeState(newState, followingState = -1)
    {
        if (this.state == STATE_CHARACTER_CROUCH) {
            // reset hitbox to normal
            this.updateHitBox(0,0,12,24);
        }
        switch(newState) {
            case STATE_CHARACTER_STAND:
            case STATE_CHARACTER_TURN:
                // TODO Implement TURNCROUCHING state
                this.velocity.x = 0;
                break;
            case STATE_CHARACTER_WALK: 
                this.velocity.x = this.getMirrorSign() * PLAYER_HORZ_MOVE_SPD;
                break;
            case STATE_CHARACTER_JUMP: 
                this.floorY = this.pos.y;
                this.velocity.y = .2; // TODO .15?
                this.gravityScale = 1;
                this.airborne = true;
                if (this.diagonalJump) {
                    this.velocity.x = this.getMirrorSign() * PLAYER_HORZ_MOVE_SPD;
                    this.diagonalJump = false; // reset flag
                }
                break;
            case STATE_CHARACTER_FALL:
                this.gravityScale = 1;
                this.airborne = true;
                break;
            case STATE_CHARACTER_HOVER:
                this.applyAcceleration(vec2(0, PLAYER_HOVER_UPWARDS_ACCELERATION));
                this.gravityScale = 1;
                this.airborne = true;
                break;
            case STATE_CHARACTER_CROUCH:
                this.velocity.x = 0;
                this.updateHitBox(0,-4,12,16)
                break;
            case STATE_CHARACTER_ASTRALFLIGHT:
                this.color  = randColor(new Color(.5,.5,.5), new Color(.9,.9,.9));
                this.gravityScale = 0;
                this.velocity = vec2(0, 0);
                break;
            case STATE_CHARACTER_CHECKPOINT:
                new Sound(SOUND_CHECKPOINT).play();
                this.t0Checkpoint = time;
                this.gravityScale = 0;
                this.velocity = vec2(0, 0);
                this.airborne = false;
                // TODO Proceed to next level after timer
                break;
            case STATE_CHARACTER_DEAD:
                new Sound([1.3,,80,.37,.01,.009,3,3.4,,,194,.35,,,,,.29,.95,.02,.46,-1370]).play(); // Random 34
                this.t0Dead = time;
                this.gravityScale = 0;
                this.velocity = vec2(0, 0);
                this.airborne = false;
                this._shootLaser(false);
                break;
            case STATE_CHARACTER_RESPAWN:
                this.gravityScale = 0;
                this.velocity = vec2(0, 0);
                this.airborne = false;
                this._shootLaser(false);
                break;            
        }
        super.changeState(newState, followingState);
    }

    // Snap back if out of bounds
    outOfBounds()
    {
        /*if (!this.screen.level) {
            console.warn('[gamePlayer.outOfBounds] level not assigned');
            return;
        }*/
        let upperLimit = this.screen.level.getCameraUpperLimit().add(vec2(-22,12.5));
        let lowerLimit = this.screen.level.getCameraLowerLimit().add(vec2(22, -12.5));
        // 44 x 25
        if (this.pos.y > upperLimit.y) {
            this.pos.y = upperLimit.y;//this.oldy;
        }
        if (this.pos.x < upperLimit.x) {
            this.pos.x = upperLimit.x;//this.oldx;
        }
        if (this.pos.y < lowerLimit.y) {
            this.pos.y = lowerLimit.y;//this.oldy;
        }
        if (this.pos.x > lowerLimit.x) {
            this.pos.x = lowerLimit.x;//this.oldx;
        }
    }

    // process current state
    updateState()
    {        
        // check collisions with walls
        let walls = this.screen.getLevel().getWalls();
        
        switch(this.state) {
            case STATE_CHARACTER_STAND:
                if (!this.collideFloor(walls)) {
                    // TODO REUSE WITH WALK
                    // TODO have a pre-conditions-based code for checks
                    // check if still on top of floor
                    return this.changeState(STATE_CHARACTER_FALL);                      
                }
            case STATE_CHARACTER_WALK:
                // TODO STILL NEED TO IMPROVE
                if (!this.collideFloor(walls)) {
                    // check if still on top of floor
                    return this.changeState(STATE_CHARACTER_FALL);                      
                }
                if (this.mirror) { // walking left
                    let wall = this.collideWallLR(walls);
                    // check collision with wall to the left
                    if (wall && !wall.hot) {
                        // snap back position
                        this.pos.x = (this.x = wall.x + wall.w/2 + this.w/2) - PIXEL_UNIT; // compensate for padding
                        this.changeState(STATE_CHARACTER_STAND);
                    } 
                } else { // walking right
                    let wall = this.collideWallRL(walls);                                        
                    // check collision with wall to the right
                    if (wall && !wall.hot) {
                        // snap back position
                        this.pos.x = this.x = (wall.x - wall.w/2 - this.w/2) + PIXEL_UNIT; // compensate for padding
                        this.changeState(STATE_CHARACTER_STAND);
                    }
                }                
                break;
            case STATE_CHARACTER_TURN: 
            case STATE_CHARACTER_TURNCROUCHING:
                if (this.currentAnim.ended()) {
                    this.mirror = !this.mirror;
                }
                break;  
            case STATE_CHARACTER_FALL:
            case STATE_CHARACTER_JUMP:
            case STATE_CHARACTER_HOVER:
            case STATE_CHARACTER_TURNMIDAIR:
                // TODO Remove the airborne check (and assignment?)
                if (this.airborne) { // process jump/jumppunch/endjumppunch states
                    if (this.velocity.y < 0) { 
                        // descending - check if landed
                        let floor = this.collideFloor(walls);
                        if (floor && !floor.hot) {
                            this.pos.y = this.y = (floor.y + floor.h/2 + this.h / 2) - PIXEL_UNIT; // compensate for padding
                            this.velocity = vec2(0,0);
                            this.gravityScale = 0;
                            this.airborne = false;
                            this.changeState(STATE_CHARACTER_STAND);
                            
                        }
                    } else if (this.velocity.y > 0) {
                        // ascending - check if bumped on ceiling
                        let ceiling = this.collideCeiling(walls);
                        if (ceiling && !ceiling.hot) {
                            this.pos.y = this.y = (ceiling.y - ceiling.h/2 - this.h / 2) + PIXEL_UNIT; // compensate for padding
                            this.velocity.y = 0;
                        }
                    }
                    if (this.velocity.x < 0) {
                        // check collision with wall to the left
                        // TODO Reuse code with WALK
                        let wall = this.collideWallLR(walls);
                        if (wall && !wall.hot) {
                            // snap back position and nullify horizontal speed
                            this.velocity.x = 0;
                            this.pos.x = (this.x = wall.x + wall.w/2 + this.w/2) - PIXEL_UNIT; // compensate for padding
                        }
                    } else if (this.velocity.x > 0) {
                        // check collision with wall to the right
                        // TODO Reuse code with WALK
                        let wall = this.collideWallRL(walls);
                        if (wall && !wall.hot) {
                            // snap back position and nullify horizontal speed
                            this.velocity.x = 0;
                            this.pos.x = (this.x = wall.x - wall.w/2 - this.w/2) + PIXEL_UNIT; // compensate for padding
                        }
                    }

                }
                break;
            case STATE_CHARACTER_DEAD:
                if (time - this.t0Dead >= PLAYER_RESPAWN_TIME) {
                    this.loseLife();
                }
                break;
            case STATE_CHARACTER_CHECKPOINT:
                if (time - this.t0Checkpoint >= PLAYER_RESPAWN_TIME) {
                    this.nextLevel();
                }
                break;

        }
        this.outOfBounds();
        super.updateState(); // update actual animation frame        
    }

    loseLife() {
        this.droppedDynamite = false; // reset flags
        if (this.enemyTouched) {
            this.enemyTouched.damage();
            delete this.enemyTouched;
        }
        if (--this.lives > 0) {
            this.pos = this.screen.respawnPosition.copy();
            this.changeState(this.screen.respawnAirborne ? STATE_CHARACTER_RESPAWN : STATE_CHARACTER_STAND);
        } else {
            showGameOverScreen();
        }        
    }

    nextLevel() {
        if (this.screen.nextLevel()) {
            this.mirror = false;
            this.numSticks = PLAYER_INITIAL_NUM_STICKS;
            this.fuel = PLAYER_INITIAL_FUEL;
            this.pos = this.screen.respawnPosition.copy();
            this.changeState(STATE_CHARACTER_RESPAWN);
        } else {
            showGameOverScreen(true); // victory
        }        
    }

    /**
     * 
     * @param {*} enemy enemy instance that collided and caused the damage
     * (should disappear upon next respawn)
     */
    damage(enemy) {
        if (this.state != STATE_CHARACTER_DEAD) {
            this.changeState(STATE_CHARACTER_DEAD);
            this.enemyTouched = enemy;
        }        
    }
}

const LASER_MAX_LENGTH = 4;

class Laser extends GameObject
{
    constructor(hero)
    {
        super(vec2(0, 0), vec2(LASER_MAX_LENGTH, .125));
        this.hero = hero; // 'parent' field is reserved in EngineObject class
        this.renderOrder = RENDER_ORDER_LASER;
        //hero.addChild(this, vec2(2.375, .875));
        hero.addChild(this, vec2(2.375, 1.25));
    }

    update()
    {
        this.color = randColor(new Color(1,.6,.6,.6), new Color(.8,0,0,1));
        super.update();
    }

    /**
     * Limit length of laser when hitting a breakable wall
     * @param {Wall} wall hit by laser
     */
    resize(wall) {
        if (!wall) {
            this.size.x = LASER_MAX_LENGTH;
            this.localPos.x = 2.375;
            return;
        }
        
        let left = this.pos.x - (this.size.x / 2);
        let right = wall.pos.x;// -  (this.size.x / 2);
        let newLength = Math.abs(right - left);
        if (newLength < LASER_MAX_LENGTH) {
            this.size.x = newLength;
            this.localPos.x = (.75 + newLength) / 2;
        }
    }
}

const STATE_DYNAMITE_FUSE=0;
const STATE_DYNAMITE_BLOW=1;
const DYNAMITE_FUSE_TIME=1; // Time from FUSE to BLOW
const DYNAMITE_BLOW_TIME=.5; // Time from BLOW to disappearing
const DYNAMITE_BLOW_RADIUS=2;

class Dynamite extends GameObject
{
    constructor(player)
    {
        let mirror = player.getMirrorSign();
        super(
            //vec2(player.pos.x + mirror * 1, player.pos.y - .75),
            vec2(player.pos.x - mirror * 1, player.pos.y - .75), // EggBomb is laid behind
            vec2(DYNAMITE_TILE_SIZE_X/WORLD_TILE_SIZE,DYNAMITE_TILE_SIZE_Y/WORLD_TILE_SIZE), 
            new TileInfo(vec2(0, 0), vec2(DYNAMITE_TILE_SIZE_X, DYNAMITE_TILE_SIZE_Y), TEXTURE_INDEX_DYNAMITE, 1)
        );
        this.player = player;
        this.mirror = mirror;
        this.animMap = [
            new GameAnimation(this, 0, [0,1,2], .15, true),      // FUSE
            new GameAnimation(this, 0, [3,4,5,6], .2, true),    // BLOW
        ];
        this.changeState(STATE_DYNAMITE_FUSE);
        this.renderOrder = RENDER_ORDER_DYNAMITE;
        this.hitbox = {
            x: this.pos.x,
            y: this.pos.y,
            w: DYNAMITE_BLOW_RADIUS,
            h: DYNAMITE_BLOW_RADIUS
        }
    }

    changeState(newState, followingState = -1)
    {
        switch(newState) {
            case STATE_DYNAMITE_FUSE:
                this.fuseSound = new Sound([.4,.4,105,,.44,0,4,1.4,,,,,,.2,3.4,,,.4,,.02]);
                this.t0Dynamite = time;
                this.fuseSound.play(null,1,1,1,true);
                break;
            case STATE_DYNAMITE_BLOW:
                if (this.fuseSound) {
                    this.fuseSound.stop();
                    this.fuseSound.setVolume(0);
                    delete this.fuseSound;
                }
                new Sound(SOUND_DYNAMITE_BLOW).play();
                this.player.screen.startFlashFX(DYNAMITE_BLOW_TIME, "white", .2);
                break;
        }
        super.changeState(newState, followingState);
    }

    // custom - uses hitbox
    collideWith(o) {
        return isOverlapping(
            vec2(this.hitbox.x, this.hitbox.y),
            vec2(this.hitbox.w, this.hitbox.h),
            o.pos,
            o.size);     
    }

    collideWithBreakableWall() {
        let walls = this.player.screen.level.getWalls();
        for (var i = 0; i < walls.length; i++) {
            if (walls[i].breakable &&
                isOverlapping(
                    vec2(this.hitbox.x, this.hitbox.y),
                    vec2(this.hitbox.w, this.hitbox.h),
                    walls[i].pos,
                    walls[i].size)
                ) {
                return walls[i];
            }
        }
    }

    update()
    {
        switch((this.state)) {
            case STATE_DYNAMITE_FUSE:
                if (time - this.t0Dynamite >= DYNAMITE_FUSE_TIME) {
                    this.changeState(STATE_DYNAMITE_BLOW);
                    this.t0Dynamite = time;
                }                
                break;
            case STATE_DYNAMITE_BLOW:
                if (time - this.t0Dynamite >= DYNAMITE_BLOW_TIME) {
                    this.player.droppedDynamite = false;
                    this.destroy();             
                } else {
                    let wall = this.collideWithBreakableWall();
                    if (wall) {
                        wall.fullDamage();
                    }
                    if (this.collideWith(this.player.box)) {
                        this.player.damage();
                    }
                }
                break;
        }
        super.update();
    }
}

///////////////////////////////////////////////////////////////////////////////

class Player extends Character
{
    update() 
    {
        if (this.controlEnabled) {
            this._processInputs();
        }
        super.update();
    }

    /**
     * 
     * @param {Boolean} on toggles whether input control is enabled or not for this Player
     */
    setControlEnabled(on)
    {
        this.controlEnabled = on;
    }

    /**
     * 
     * @param {float} f amount of fuel to drain
     */
    _drainFuel() {
        this.fuel -= frameElapsed();
        if (this.fuel <= 0) {
            // straight game over
            this.lives = 1; 
            this.damage(undefined);
        }
    }

    _shootLaser(on)
    {
        if (on) {
            if (!this.laser) {
                this.laser= new Laser(this);
                this.laserSound = new Sound([1.7,0,294,.11,.01,.005,,2.5,-16,,,,.01,,137,1,.01,.92,,,240]); // Random 28
                this.laserSound.play(null,1,1,1,true);
            }
            this._drainFuel();
        } else {
            if (this.laser) {
                this.laserSound.stop();
                this.laserSound.setVolume(0);
                delete this.laserSound;
                this.laser.destroy();
                delete this.laser;
            }
        }
    }

    _dropDynamite()
    {
        if (!this.droppedDynamite) {
            this.droppedDynamite = true;
            new Dynamite(this);
            this.numSticks--;
        }        
    }

    _processInputs()
    {
        let walls = this.screen.getLevel().getWalls();
        //console.log("[Player._processInputs] player pos.x = " + this.pos.x);
        //console.log("[Player._processInputs] player state = " + this.state);

        let holdingLeft = gameInput.holdingLeft();
        //console.log("[Player._processInputs] holdingLeft = " + holdingLeft);        
        let holdingRight = gameInput.holdingRight();
        //console.log("[Player._processInputs] holdingRight = " + holdingRight);
        let holdingUp = gameInput.holdingUp();
        //console.log("[Player._processInputs] holdingUp = " + holdingUp);
        let holdingDown = gameInput.holdingDown();
        let holdingAction = gameInput.holdingAction();
        let pressedLeft = gameInput.pressedLeft();
        let pressedRight = gameInput.pressedRight();
        let pressedUp = gameInput.pressedUp();
        let pressedDown = gameInput.pressedDown();
        //console.log("[Player._processInputs] holdingDown = " + holdingDown);
        let pressedAction = gameInput.pressedAction();
        //console.log("[Player._processInputs] pressedAction = " + pressedAction);
        let newMirror;
        // have states and transitions mapped in a more declarative way
        let accx = 0;
        let accy = 0;
        this._shootLaser(holdingAction && 
            this.state != STATE_CHARACTER_TURN && 
            this.state != STATE_CHARACTER_TURNMIDAIR && 
            this.state != STATE_CHARACTER_CROUCH &&
            this.state != STATE_CHARACTER_DEAD &&
            this.state != STATE_CHARACTER_RESPAWN
        );
        switch(this.state) {
            case STATE_CHARACTER_STAND:
                if (holdingDown) { // crouch action has precedence
                    this.changeState(STATE_CHARACTER_CROUCH);
                } else if (holdingLeft || holdingRight) { // lateral movement? check for need to turn, and other combinations
                    newMirror = holdingLeft;
                    let endState;
                    if (pressedUp) {
                        this.diagonalJump = true;
                        endState = STATE_CHARACTER_JUMP;
                    } else {
                        endState = STATE_CHARACTER_WALK;
                    }                    
                    if (newMirror != this.mirror) {
                        this.changeState(STATE_CHARACTER_TURN, endState);
                    } else {
                        this.changeState(endState);
                    }
                } else if (pressedUp) {
                    this.changeState(STATE_CHARACTER_JUMP);  // jump from neutral input
                }
                break;
            case STATE_CHARACTER_WALK:
                if ( (this.mirror && !holdingLeft) ||
                     (!this.mirror && !holdingRight) )
                {
                    this.changeState(STATE_CHARACTER_STAND);
                } else if ( (!this.mirror && holdingLeft) || 
                            (this.mirror && holdingRight) )
                {
                    this.changeState(STATE_CHARACTER_TURN, STATE_CHARACTER_WALK); 
                } else if (holdingUp) {
                    this.diagonalJump = true;
                    this.changeState(STATE_CHARACTER_JUMP); // diagonal jump
                } else if (holdingDown) {
                    this.changeState(STATE_CHARACTER_CROUCH);
                }
                break;
            case STATE_CHARACTER_FALL:
                if (pressedUp) {
                    this.changeState(STATE_CHARACTER_HOVER);
                }
                // TODO Reuse with  STATE_CHARACTER_HOVER?              
                if (holdingLeft && this.velocity.x > -PLAYER_HORZ_MOVE_SPD) {
                    if (!this.mirror) {
                        this.mirror = true;
                        this.changeState(STATE_CHARACTER_TURNMIDAIR, STATE_CHARACTER_FALL);
                    }
                    accx = -PLAYER_HOVER_UPWARDS_ACCELERATION;
                } else if (holdingRight && this.velocity.x < PLAYER_HORZ_MOVE_SPD) {
                    if (this.mirror) {
                        this.mirror = false;
                        this.changeState(STATE_CHARACTER_TURNMIDAIR, STATE_CHARACTER_FALL);
                    }
                    accx = PLAYER_HOVER_UPWARDS_ACCELERATION;
                }
                this.applyAcceleration(vec2(accx, accy));
                break;
            case STATE_CHARACTER_JUMP:
                /*if (pressedUp) {*/
                if (holdingUp && this.velocity.y <= 0) {
                    this.changeState(STATE_CHARACTER_HOVER);
                }
                break;
            case STATE_CHARACTER_HOVER:
            case STATE_CHARACTER_TURNMIDAIR:
                if (!holdingUp) {
                    this.changeState(STATE_CHARACTER_FALL);
                } else {
                    accy = PLAYER_HOVER_UPWARDS_ACCELERATION;
                    this._drainFuel();
                }                
                if (holdingLeft && this.velocity.x > -PLAYER_HORZ_MOVE_SPD) {
                    if (!this.mirror) {
                        this.mirror = true;
                        this.changeState(STATE_CHARACTER_TURNMIDAIR, STATE_CHARACTER_HOVER);
                    }
                    accx = -PLAYER_HOVER_UPWARDS_ACCELERATION;
                } else if (holdingRight && this.velocity.x < PLAYER_HORZ_MOVE_SPD) {
                    if (this.mirror) {
                        this.mirror = false;
                        this.changeState(STATE_CHARACTER_TURNMIDAIR, STATE_CHARACTER_HOVER);
                    }
                    accx = PLAYER_HOVER_UPWARDS_ACCELERATION;
                }
                this.applyAcceleration(vec2(accx, accy));
                break;
            case STATE_CHARACTER_CROUCH:
                if (!holdingDown) {
                    this.changeState(STATE_CHARACTER_STAND);
                } else if (pressedAction && this.numSticks > 0) {
                    this._dropDynamite();
                } else if (holdingLeft || holdingRight) { // lateral movement? check for need to turn
                    newMirror = holdingLeft;                    
                    if (newMirror != this.mirror) {
                        this.changeState(STATE_CHARACTER_TURNCROUCHING, STATE_CHARACTER_CROUCH);
                    }
                }
                break;
            case STATE_CHARACTER_RESPAWN:
                if (holdingUp || holdingDown || holdingLeft || holdingRight) {
                    this.changeState(STATE_CHARACTER_FALL);
                }
                break;
            case STATE_CHARACTER_ASTRALFLIGHT:
                if (holdingUp) {
                    if (!this.collideCeiling(walls)) {
                        this.pos.y += .2;
                    }
                }
                if (holdingDown) {
                    if (!this.collideFloor(walls)) {
                        this.pos.y -= .2;
                    }                    
                }
                if (holdingLeft) {
                    if (!this.collideWallLR(walls)) {
                        this.pos.x -= .2;
                    }                    
                }
                if (holdingRight) {
                    if (!this.collideWallRL(walls)) {
                        this.pos.x += .2;
                    }
                }
                break;
        }
    }
}
