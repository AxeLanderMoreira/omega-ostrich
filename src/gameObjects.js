const WORLD_TILE_SIZE = 8;

// "HP" of a breakable wall actually corresponds to how long (in seconds) it 
// can withstand a continuous laser beam 
const BREAKABLE_WALL_HP = 6;

const SPRITE_INDEX_CHECKPOINT = 14;
const SPRITE_INDEX_HINT = 16;

const RING_TILE_SIZE_X = 8; // 6
const RING_TILE_SIZE_Y = 34; // 32

class GameObject extends EngineObject 
{
    constructor(pos, size, tileInfo, angle, color)
    {
        super(pos, size, tileInfo, angle, color);
        this.damping = 1;  // simple retro arcade physics
        this.friction = 1;
        this.gravityScale = 0; // characters change gravityScale to 1 when jumping or falling, return to 0 at the end
        this.w = this.size.x;
        this.h = this.size.y;
        this.visible = true;
    }

    /**
     * Create a Hitbox game object with the pixel coordinates passed.
     * @param {integer} px x-offset in pixels, in relation to the full frame center
     * @param {integer} py y-offset in pixels, in relation to the full frame center
     * @param {integer} pw width in pixels of the hitbox
     * @param {integer} ph height in pixels of the hitbox
     */
    updateHitBox(px, py, pw, ph) {
        if (!this.box) { // create
            let box = new EngineObject(
                vec2(0,0),
                vec2(pw/WORLD_TILE_SIZE, ph/WORLD_TILE_SIZE)
            );
            //box.color = new Color(0,1,0,.5); // debug
            box.color = new Color(0,0,0,0);
            this.addChild(box,vec2(px/WORLD_TILE_SIZE, py/WORLD_TILE_SIZE));
            this.box = box;
        } else { // update
            this.box.size.x = pw/WORLD_TILE_SIZE;
            this.box.size.y = ph/WORLD_TILE_SIZE;
            this.box.localPos.set(px/WORLD_TILE_SIZE, py/WORLD_TILE_SIZE);
        }
    }

    update() 
    {
        if (!this.visible) return;
        if (this.paused) return;
        this.updateState();
        super.update();
    }

    render()
    {
        if (!this.visible) return;        
        super.render();
    }

    changeState(newState, followingState = -1)
    {
        if (this.currentAnim) {
            this.currentAnim.stop();
        }
        this.currentAnim = this.animMap[newState];
        if (this.currentAnim) {
            this.currentAnim.start();
        }
        this.state = newState;
        this.nextState = followingState;
    }

    updateState()
    {
        if (this.currentAnim) {
            this.currentAnim.update();
        }
        if (this.nextState >= 0 && this.currentAnim.ended()) {
            this.changeState(this.nextState);
        }
        // fields below used for custom collision detection
        this.x = this.pos.x;
        this.y = this.pos.y;
    }

    /**
     * Checks if this GameObject collides with another
     * @param {EngineObject} o 
     * @returns 
     */
    collideWith(o) {
        return isOverlapping(
            this.pos,
            this.size,
            o.pos,
            o.size);     
    }

    /**
     * Changes the visibility on this GameObject.
     * @param {Boolean} on new visibility
     */
    setVisible(on)
    {
        this.visible = on;
    }

    setFrame(index)
    {
        this.tileInfo.pos.x = (index * this.tileInfo.size.x);
    }
}

/**
 * Representation of a simple GameAnimation, attached to an arbitrary GameObject.
 * 
 * The animation is represented by a sequence of frames, and has a total duration, 
 * where the intervals are distributed uniformly between each. We can also specify
 * whether the animation loops or freezes at the last frame.
 * 
 * More complex animations, with varying intervals between each frame, or different
 * patterns, are not supported.
 * 
 * TODO Use a Timer object instantiated at start(), instead of the global variable
 * time.
 */
class GameAnimation 
{
    /**
     * 
     * @param {GameObject} gameObj GameObject to be attached to this GameAnimation
     * @param {Number} frameOffset if > 0, all frame numbers in the next parameter are added to this
     * @param {Array} sequence sequence of frame numbers to be followed by the GameAnimation
     * @param {Number} duration total duration in seconds, to play all the animation 
     *                          (the interval is distributed evenly between the frames to be presented)
     * @param {Boolean} loop true for loop always, false for freezing at the last frame
     */
    constructor(gameObj, frameOffset, sequence, duration, loop)
    {
        this.gameObj = gameObj;
        if (frameOffset <= 0) {
            this.sequence = [...sequence]; // make sure it's a copy, not a reference
        } else {
            this.sequence = [];
             for (let i = 0; i < sequence.length; i++) {
                 this.sequence.push(frameOffset + sequence[i]);
             }
        }
        this.duration = duration;
        this.loop = loop;
        this.t0 = -1000;
        this.frameIndex = 0;        
    }

    start()
    {
        this.t0 = time;
    }

    stop()
    {
        this.t0 = -1000;
    }

    ended()
    {
        return (!this.loop && time > this.t0 + this.duration);
    }

    loops()
    {
        if (!this.loop) return 0;
        return Math.floor(time - this.t0 / this.duration);
    }

    /**
     * 
     * @returns total time elapsed since the beginning of the animation.
     * 
     * The time keeps incrementing regardless of loops or animation freeze at the end.
     */
    elapsed()
    {
        return time - this.t0;
    }

    /**
     * @returns Index of the current animation frame.
     * 
     * For accurate results, must have first called animation.update() in the current frame.
     */
    frame()
    {
        return this.frameIndex;
    }

    /* Has to be called at every frame */
    update()
    {
        let numFrames = this.sequence.length;
        let animTime;
        
        if (this.loop) {
            animTime = (time - this.t0) % this.duration;
        } else {
            animTime = min(time - this.t0, this.duration);
        }
        let frameIndex = Math.floor(animTime / this.duration * numFrames);
        this.frameIndex = clamp(frameIndex, 0, numFrames - 1);
        this.gameObj.setFrame(this.sequence[this.frameIndex]);
    }
}

const hotWallColor0 = new Color(1, 0, 0);
const hotWallColor1 = new Color(.5, .15, .05);

const WALL_MOVE_SPEED = 6; // tiles per second
const BREAKABLE_WALL_NUM_FRAMES = 6;

const RINGDOOR_TIME_TO_OPEN = 1;

class Wall extends GameObject
{
    constructor(pos, size, screen, color, subtype, hot, xmove, ymove) {
        super(pos, 
              size, 
              (subtype != 0) ? new TileInfo(vec2(0,0), vec2(24,60), TEXTURE_INDEX_BREAKABLE_WALL) : undefined, 
              0, 
              color);
        this.subtype = subtype;
        this.breakable = (subtype == 1); // quick compatibility
        if (this.breakable) {
            this.hp = BREAKABLE_WALL_HP;
            this.dmgFrame = 0;
            this.initialY = pos.y;
        }
        this.ringdoor = (subtype == 2);
        if (this.ringdoor) {
            this.setFrame(6);
            this.ringsOn = 0;
            this.horizontal = (this.size.x > this.size.y);
            this.renderOrder--;
        }
        this.hot = hot;
        if (hot) {
            this.t0 = time;
        }
        if (xmove != 0) {
            this.xmove = xmove;
            this.initialX = this.pos.x;
            this.initialW = this.size.x;
            this.growDirection = 1;
        }
        if (ymove != 0) {
            this.ymove = ymove;
            this.initialY = this.pos.y;
            this.initialH = this.size.y;
            this.growDirection = 1;
        }
        this.t0 = time;
        this.screen = screen;
        this.player = screen.player;
    }

    /**
     * 
     * @param {boolean} on 
     * @param {Vector2} pos 
     */
    emitSparks(on, pos, mirror) {
        if (on) {
            if (!this.sparkEmitter) {
                this.sparkEmitter = new ParticleEmitter(
                    pos, //position
                    (mirror ? 1 : -1) * (Math.PI/2),    // angle
                    0.2,	// emitSize
                    0,	// emitTime
                    70,	// emitRate
                    0.25,	// emitConeAngle
                    new TileInfo(vec2(0,0), vec2(8,8), TEXTURE_INDEX_PARTICLES),	// tileInfo
                    new Color(1, 0, 0, 1),	// colorStartA
                    new Color(0.502, 0.502, 0.502, 1),	// colorStartB
                    new Color(1, 1, 0, 0),	// colorEndA
                    new Color(0.961, 0.706, 0, 0),	// colorEndB
                    0.3,	// particleTime
                    0.1,	// sizeStart
                    1,	// sizeEnd
                    0.2,	// speed
                    0.05,	// angleSpeed
                    1,	// damping
                    1,	// angleDamping
                    .5,	// gravityScale
                    0,	// particleConeAngle
                    0.1,	// fadeRate
                    0.2,	// randomness
                    0,	// collideTiles
                    1,	// additive
                    1,	// randomColorLinear
                    RENDER_ORDER_LASER
                  ); // particle emitter
                this.drillSound = new Sound(SOUND_DRILLING);
                this.drillSound.play(null,1,1,1,true);
            } else {
                this.sparkEmitter.pos.y = pos.y; // update pos
            }         
        } else if (!on && this.sparkEmitter) {
            this.sparkEmitter.destroy();
            delete this.sparkEmitter;
            this.drillSound.stop();
            this.drillSound.setVolume(0);
            delete this.drillSound;
        }
    }

    checkHitByLaser() {
        let laser = this.player.laser;
        if (laser) {
            if (isOverlapping(
                this.pos,
                this.size,
                laser.pos,
                laser.size)) {
                    let standing = this.partialDamage(frameElapsed());
                    // if wall is not standing anymore, let laser go back to full length
                    laser.resize(standing ? this : undefined);
                    if (standing) {
                        this.emitSparks(true, vec2(this.pos.x, laser.pos.y), this.player.mirror);
                    }
                    return;
            } 
        }
        this.emitSparks(false);
    }

    /**
     * Apply partial damage (from laser beam) to this Wall
     * @param {float} dmg amount of damage to apply
     * @returns true if Wall is still standing, false if it was destroyed.
     */
    partialDamage(dmg) {
        this.hp -= dmg;
        if (this.hp > 0) {
            let numFrame = Math.floor(BREAKABLE_WALL_HP-this.hp);
            if (numFrame > this.dmgFrame) {
                this.dmgFrame = numFrame;
                this.tileInfo.pos.x = numFrame * 24;
                new Sound(SOUND_SOFT_BLOW).play();
            }
            this.pos.y = this.initialY + (randInt(-1,2) * PIXEL_UNIT);
            return true;
        } else {
            this.emitSparks(false);
            this.screen.destroyWall(this);
            new Sound(SOUND_DYNAMITE_BLOW).play();
            return false;
        }
    }

    fullDamage() {
        this.screen.destroyWall(this);
    }

    render() {
        if (this.subtype == 0 && !this.hot) {
            // "Regular" walls are rendered with a 9-patch approach
            let xOffset = 0;
            let yOffset = 0;
            let x0Pos = this.pos.x - (this.size.x / 2) + .5;
            for (let x = 0; x < this.size.x; x++) { // horizontal
                if (this.size.x - x < 1) {
                    x = this.size.x - 1;
                }
                if (x == 0) {
                    xOffset = 0 * WORLD_TILE_SIZE;
                } else if (x == this.size.x - 1) {
                    xOffset = 2 * WORLD_TILE_SIZE;
                } else {
                    xOffset = 1 * WORLD_TILE_SIZE;
                }
                let y0Pos = this.pos.y + (this.size.y / 2) - .5;
                for (let y = 0; y < this.size.y; y++) {
                    if (this.size.y - y < 1) {
                        y = this.size.y - 1;
                    }
                    if (y == 0) {
                        yOffset = 0 * WORLD_TILE_SIZE;
                    } else if (y == this.size.y - 1) {
                        yOffset = 2 * WORLD_TILE_SIZE;
                    } else {
                        yOffset = 1 * WORLD_TILE_SIZE;
                    }
                    drawTile(
                        vec2(x0Pos + x, y0Pos - y),
                        vec2(1),
                        new TileInfo(
                            vec2(xOffset, yOffset),
                            vec2(WORLD_TILE_SIZE, WORLD_TILE_SIZE),
                            TEXTURE_INDEX_WALL_TILES
                        ),
                        this.color
                    );
                }
            }
        } else {
            if (this.ringdoor && this.horizontal) {
                drawTile(
                    this.pos,
                    vec2(this.size.y, this.size.x),
                    this.tileInfo,
                    new Color(1,1,1,1),
                    -Math.PI/2
                );
            } else {
                super.render();
            }
        }
    }

    update() {        
        if (this.xmove) {
            let growth = frameElapsed() * WALL_MOVE_SPEED;
            let left = this.initialX - this.initialW/2;
            let right = this.initialX + this.initialW/2;
            this.size.x += growth * this.growDirection;
            if (this.xmove > 0) {
                this.pos.x = left + (this.size.x/2);
            } else {
                this.pos.x = right - (this.size.x/2);
            }
            if (this.growDirection > 0) {
                if ((this.size.x - this.initialW) > Math.abs(this.xmove)) {
                    this.growDirection = -1;
                }
            } else {
                if (this.size.x - this.initialW <= 0) {
                    this.growDirection = 1;
                }
            }
        }
        if (this.ymove) {
            let growth = frameElapsed() * WALL_MOVE_SPEED;
            let top = this.initialY + this.initialH/2;
            let bottom = this.initialY - this.initialH/2;
            this.size.y += growth * this.growDirection;
            if (this.ymove > 0) {
                this.pos.y = bottom + (this.size.y/2);
            } else {
                this.pos.y = top - (this.size.y/2);
            }
            if (this.growDirection > 0) {
                if ((this.size.y - this.initialH) > Math.abs(this.ymove)) {
                    this.growDirection = -1;
                }
            } else {
                if (this.size.y - this.initialH <= 0) {
                    this.growDirection = 1;
                }
            }
        }
        if (this.hot) {
            if (this.collideWith(this.player.box))  {
                this.player.damage();                
            } else {
                let n = Math.PI * ((time - this.t0) / BAT_FLY_PERIOD);
                let y = Math.abs(Math.sin(n));
                this.color = hotWallColor0.lerp(hotWallColor1, y);
            }            
        }
        if (this.breakable) {
            this.checkHitByLaser();
        }
        if (this.ringdoor && this.t0Open) {
            let t = time - this.t0Open;
            if (t >= RINGDOOR_TIME_TO_OPEN) {
                this.screen.destroyWall(this);
            }
            if (this.horizontal) {
                this.pos.x = this.originalPos.x - this.size.x * t;
            } else {
                this.pos.y = this.originalPos.y - this.size.y * t;
            }
            
        }
        super.update();
    }

    nextRing() {
        if (this.ringsOn < 4) {
            new Sound(SOUND_MENU_ACTION).play();
            this.ringsOn++;
            this.setFrame(6 + this.ringsOn);
            if (this.ringsOn == 4) {
                this.openRingDoor();
            }
        }        
    }

    openRingDoor() {
        new Sound(SOUND_OPEN_DOOR).play();
        this.t0Open = time;
        this.originalPos = this.pos.copy();
        this.rings.forEach(ring => {
            ring.disable();
        });
        this.rings = [];
    }

    clearRings() {
        if (this.ringsOn > 0) {
            new Sound(SOUND_MISS_RING).play();
            this.ringsOn = 0;
            this.setFrame(6);
        }        
    }

    addRing(ring) {
        if (!this.rings) {
            this.rings = [];
        }
        this.rings.push(ring);
    }
}

const STATE_CHECKPOINT_WAIT = 0;
const STATE_CHECKPOINT_PASS = 1;

class Checkpoint extends GameObject {

    /**
     * 
     * @param {*} pos 
     * @param {boolean[opt]} mirror true for facing left.
     */
    constructor(pos, screen, mirror) {
        super(
            pos, 
            vec2(ENEMY_TILE_SIZE_X/WORLD_TILE_SIZE, ENEMY_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0, 0), vec2(ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y), TEXTURE_INDEX_ENEMIES, 1)
        );
        this.mirror = mirror;
        this.player = screen.player;
        this.renderOrder = RENDER_ORDER_ENEMIES;
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_CHECKPOINT, [0], 1, true), //WAIT
            new GameAnimation(this, SPRITE_INDEX_CHECKPOINT, [1], 1, true), //PASS
        ];
        this.changeState(STATE_CHECKPOINT_WAIT);
    }

    update() {
        if (this.state == STATE_CHECKPOINT_WAIT && this.collideWith(this.player.box))  {
            this.changeState(STATE_CHECKPOINT_PASS);
            this.player.changeState(STATE_CHARACTER_CHECKPOINT);
        }
        super.update();
    }
}

class Hint extends GameObject {
    constructor(pos, screen, text, panelPos, panelSize) {
        super(
            pos,
            vec2(ENEMY_TILE_SIZE_X/WORLD_TILE_SIZE, ENEMY_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0, 0), vec2(ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y), TEXTURE_INDEX_ENEMIES, 1)
        );
        this.screen = screen;
        this.player = screen.player;
        this.renderOrder = RENDER_ORDER_ENEMIES;
        this.setFrame(SPRITE_INDEX_HINT);
        this.text = text;
        //this.lines = text.split('\n');
        //console.log('[Hint constructor] this.lines.length = ' + this.lines.length);
        this.panelPos = panelPos.copy();
        this.panelSize = panelSize.copy();
        this.showing = false;
    }

    update() {
        let overlap = this.collideWith(this.player.box); // TODO Remove box when dead
        if (!this.showing && overlap) {
            this.showHint();
        } else if (this.showing && !overlap) {
            this.hideHint();
        }
    }

    showHint() {
        this.showing = true;
        this.screen.showHint(this.text, this.panelPos, this.panelSize);
    }

    hideHint() {
        this.showing = false;
        this.screen.hideHint();
    }
}

class Ring {
    constructor(pos, screen, horizontal) {
        let angle = horizontal ? Math.PI / 2 : 0;
        this.pos = pos;
        this.screen = screen;
        this.player = this.screen.player;
        let xshift = horizontal ? 0 : .3;
        let yshift = !horizontal ? 0 : .3;
        this.front = new EngineObject(
            vec2(pos.x-xshift, pos.y+yshift),
            vec2(RING_TILE_SIZE_X/WORLD_TILE_SIZE, RING_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0, 0), vec2(RING_TILE_SIZE_X, RING_TILE_SIZE_Y), TEXTURE_INDEX_RING, 1),
            angle,
            new Color(1,1,0,1),
            RENDER_ORDER_HERO + 1
        );
        this.back = new EngineObject(
            vec2(pos.x+xshift, pos.y-yshift),
            vec2(RING_TILE_SIZE_X/WORLD_TILE_SIZE, RING_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(RING_TILE_SIZE_X, 0), vec2(RING_TILE_SIZE_X, RING_TILE_SIZE_Y), TEXTURE_INDEX_RING, 1),
            angle,
            new Color(.6,.6,0,1),
            RENDER_ORDER_HERO -1
        );
        this.front.gravityScale = 0;
        this.front.controller = this;
        this.back.gravityScale = 0;
        this.front.update = function() {
            // TODO Check collision
            this.controller.update();
        }
    }

    passByPlayer() {
        if (!this.player) return;
        let p = this.player.box ? this.player.box : this.player;
        let ret = isOverlapping(
            this.pos,
            //vec2(PIXEL_UNIT,PIXEL_UNIT),
            vec2(1,1),
            p.pos,
            p.size
        );
        return ret;
    }

    activate(flag) {
        if (this.activated != flag) {
            if (!this.wall) {
                this.wall = this.screen.level.getRingDoor(this);
                this.wall.addRing(this);
            }            
            // handle change
            if (flag) {
                this.front.color = new Color(0,1,0,1); // green
                this.back.color = new Color(0,.6,0,1);
                this.wall.nextRing();
            } else {
                this.front.color = new Color(1,0,0,1); // red
                this.back.color = new Color(.6,0,0,1);
                this.wall.clearRings();
            }
            this.activated = flag; // commit change
        }        
    }

    update() {
        if (this.disabled) {
            return;
        }
        if (this.passByPlayer()) {
            this.activate(true);
        } else if (this.player.state == STATE_CHARACTER_STAND) {
            // TODO Must have a trigger for touch walls
            // TODO Must link to a Wall of subtype == ringdoor
            this.activate(false);
        }
    }

    disable() {
        this.disabled = true;
        this.front.color = new Color(1,1,1,1); // green
        this.back.color = new Color(.6,.6,.6,1);
    }

    destroy() {
        this.front.destroy();
        this.back.destroy();
    }
}
