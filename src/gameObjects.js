const WORLD_TILE_SIZE = 8;


// "HP" of a breakable wall actually corresponds to how long (in seconds) it 
// can withstand a continuous laser beam 
const BREAKABLE_WALL_HP = 6;

const SPRITE_INDEX_CHECKPOINT = 14;

class GameObject extends EngineObject 
{
    constructor(pos, size, tileInfo, angle, color)
    {
        super(pos, size, tileInfo, angle, color);
        this.damping = 1;  // simple retro arcade physics
        this.friction = 1;
        this.gravityScale = 0; // characters change gravityScale to 1 when jumping or falling, return to 0 at the end
        this.xOffset = 0;
        this.yOffset = 0;
        this.w = this.size.x;
        this.h = this.size.y;
        this.visible = true;
    }

    update() 
    {
        if (!this.visible) return;
        this.updateState();
        super.update();
        // TODO if need to flash when damaged, use this.additiveColor
    }

    render()
    {
        //let mul = this.mirror ? -1 : 1;
        if (!this.visible) return;
        let mul = this.getMirrorSign();
        let x = this.pos.x;
        let y = this.pos.y;
        this.pos.x += mul * (this.xOffset / cameraScale);
        this.pos.y += this.yOffset / cameraScale;
        super.render();    
        this.pos.x = x;
        this.pos.y = y;
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
        this.oldx = this.x;
        this.oldy = this.y;
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
     * @param {Array} xOffsets Horizontal position adjustment for each frame in the sequence
     */
    constructor(gameObj, frameOffset, sequence, duration, loop, xOffsets)
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
        this.xOffsets = xOffsets;
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
        //this.gameObj.tileIndex = this.sequence[this.frameIndex];
        this.gameObj.setFrame(this.sequence[this.frameIndex]);
        this.gameObj.xOffset = this.xOffsets ? this.xOffsets[this.frameIndex] : 0;
    }
}

const hotWallColor0 = new Color(1, 0, 0);
const hotWallColor1 = new Color(.5, .15, .05);

const WALL_MOVE_SPEED = 6; // tiles per second

class Wall extends GameObject
{
    constructor(pos, size, screen, color, breakable, hot, xmove, ymove) {
        super(pos, size, undefined, 0, color);
        this.breakable = breakable;
        if (breakable) {
            this.hp = BREAKABLE_WALL_HP;
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
                }
        }
    }

    /**
     * Apply partial damage (from laser beam) to this Wall
     * @param {float} dmg amount of damage to apply
     * @returns true if Wall is still standing, false if it was destroyed.
     */
    partialDamage(dmg) {
        this.hp -= dmg;
        if (this.hp > 0) {
            //let s = .25 + .75*(this.hp/BREAKABLE_WALL_HP);
            //this.color = new Color(s,s,s,1);
            this.color.a = .25 + .75*(this.hp/BREAKABLE_WALL_HP);
            return true;
        } else {
            this.screen.destroyWall(this);
            new Sound(SOUND_DYNAMITE_BLOW).play();
            return false;
        }
    }

    fullDamage() {
        this.screen.destroyWall(this);
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
            if (this.collideWith(this.player))  {
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
        super.update();
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
            new TileInfo(vec2(0, 0), vec2(ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y), TEXTURE_INDEX_ENEMIES)
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
        if (this.state == STATE_CHECKPOINT_WAIT && this.collideWith(this.player))  {
            this.changeState(STATE_CHECKPOINT_PASS);
            this.player.changeState(STATE_CHARACTER_CHECKPOINT);
        }
        super.update();
    }
}