const ENEMY_TILE_SIZE_X = 15;
const ENEMY_TILE_SIZE_Y = 15;

const SPRITE_INDEX_SPIDER = 0;
const SPRITE_INDEX_MOTH = 2;
const SPRITE_INDEX_BAT = 5;
const SPRITE_INDEX_SNAKE = 7;
const SPRITE_INDEX_TENTACLE = 9;

const ENEMY_ID_SPIDER = 0;
const ENEMY_ID_MOTH = 1;
const ENEMY_ID_BAT = 2;
const ENEMY_ID_SNAKE = 3;
const ENEMY_ID_TENTACLE = 4;

const STATE_BAT_FLY = 0;
const STATE_MOTH_FLY = 0;
const STATE_SNAKE_ATTACK = 0;
const STATE_SPIDER_ATTACK = 0;
const STATE_TENTACLE_ATTACK = 0;

class Enemy extends GameObject
{
    /**
     * 
     */
    constructor(pos, screen)
    {
        super(
            pos, 
            vec2(ENEMY_TILE_SIZE_X/WORLD_TILE_SIZE, ENEMY_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0, 0), vec2(ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y), TEXTURE_INDEX_ENEMIES, 1)
        );        
        this.screen = screen;
        this.player = screen.player;
        this.renderOrder = RENDER_ORDER_ENEMIES;
    }

    hitPlayer() {
        if (!this.player) return;
        let o = this.box ? this.box : this;
        let p = this.player.box ? this.player.box : this.player;
        return isOverlapping(
            o.pos,
            o.size,
            p.pos,
            p.size
        )
        // TODO custom hitbox for player
    }

    hitByLaser() {
        if (!this.player) return false;
        let laser = this.player.laser;
        let o = this.box ? this.box : this;
        if (laser) {
            return isOverlapping(
                o.pos,
                o.size,
                laser.pos,
                laser.size); 
        }
    }

    updateState() {
        if (this.hitPlayer()) {
            this.player.damage(this);
        } else if (this.hitByLaser()) {
            this.damage();
        }
        super.updateState();
    }

    damage() {
        this.explod();
        new Sound(SOUND_SOFT_BLOW).play();
        this.screen.destroyEnemy(this);
    }

    explod() {
        new ParticleEmitter(
            this.pos, 0,	//position, angle
            0,	// emitSize
            .1,	// emitTime
            40,	// emitRate
            3.14,	// emitConeAngle
            new TileInfo(vec2(8,0), vec2(8,8), TEXTURE_INDEX_PARTICLES),	// tileInfo
            new Color(0, 0.431, 1, 1),	// colorStartA
            new Color(0.78, 0.816, 1, 1),	// colorStartB
            new Color(0, 0.2, 1, 0),	// colorEndA
            new Color(0.745, 0.753, 0.914, 0),	// colorEndB
            0.4,	// particleTime
            1,	// sizeStart
            0.1,	// sizeEnd
            0.04,	// speed
            0.05,	// angleSpeed
            1,	// damping
            1,	// angleDamping
            -0.2,	// gravityScale
            3.14,	// particleConeAngle
            0.1,	// fadeRate
            0.2,	// randomness
            0,	// collideTiles
            0,	// additive
            1,	// randomColorLinear
          ); // particle emitter
    }

}

const BAT_FLY_PERIOD = 1;
const BAT_FLY_RANGE = 2;

class Bat extends Enemy
{
    constructor(pos, screen)
    {
        super(pos, screen);
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_BAT, [0, 1], .2, true)    // FLY
        ];
        this.initialY = pos.y;
        this.t0 = time;
        this.updateHitBox(0,-.5,13,6);
        this.changeState(STATE_BAT_FLY);
    }

    updateState()
    {
        super.updateState();
        let n = Math.PI * ((time - this.t0) / BAT_FLY_PERIOD);
        let y = Math.sin(n);
        this.pos.y = this.initialY + (y * BAT_FLY_RANGE);
    }
}

const MOTH_FLY_PERIOD_Y = 1;
const MOTH_FLY_RANGE_Y = 2;
const MOTH_FLY_PERIOD_X = 2;
const MOTH_FLY_RANGE_X = 4;

class Moth extends Enemy
{
    constructor(pos, screen)
    {
        super(pos, screen);
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_MOTH, [0, 1, 2], .3, true)    // FLY
        ];
        this.initialX = pos.x;
        this.initialY = pos.y;
        this.t0 = time;
        this.updateHitBox(0,.5,13,10);
        this.changeState(STATE_MOTH_FLY);        
    }

    updateState()
    {
        super.updateState();
        let ny = Math.PI * ((time - this.t0) / MOTH_FLY_PERIOD_Y);
        let nx = Math.PI * ((time - this.t0) / MOTH_FLY_PERIOD_X);
        let y = Math.sin(ny);
        let x = Math.cos(nx);
        this.pos.y = this.initialY + (y * MOTH_FLY_RANGE_Y);
        this.pos.x = this.initialX + (x * MOTH_FLY_RANGE_X);
    }
}

const SNAKE_ATTACK_TIME = 1;
const SNAKE_ATTACK_RANGE = (ENEMY_TILE_SIZE_X-2)/WORLD_TILE_SIZE; // adjusted for padding

class Snake extends Enemy
{
    constructor(pos, screen, mirror)
    {
        super(pos, screen);
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_SNAKE, [0, 1], .2, true)    // ATTACk
        ];
        this.mirror = mirror;
        this.initialX = pos.x;
        this.t0 = time;
        this.updateHitBox(0,0,12,10);
        this.changeState(STATE_SNAKE_ATTACK);        
    }

    updateState()
    {
        super.updateState();
        let elapsed = time - this.t0;
        let rounded = Math.floor(elapsed);
        let t = (elapsed - rounded) / SNAKE_ATTACK_TIME;

        if (t <= .5) {
            t = t / .5;
        } else {
            t = (1-t) / .5;
        }
        this.pos.x = this.initialX + (this.getMirrorSign() * t * SNAKE_ATTACK_RANGE);
    }
}

class Spider extends Enemy
{
    constructor(pos, screen)
    {
        super(pos, screen);
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_SPIDER, [0,1], .2, true)   // ATTACK
        ];
        this.updateHitBox(0,-1,9,12);
        this.changeState(STATE_SPIDER_ATTACK);
    }

}

const TENTACLE_HORZ_MOV_SPD = PLAYER_HORZ_MOVE_SPD / 2;
const TENTACLE_VERT_DETECT_DISTANCE = 8;
const TENTACLE_HITBOX_PER_FRAME = [
    [0,-4,11, 5],
    [0,-3,11, 7],
    [0,-2,11, 9],
    [0,-1,11,11],
    [0, 0,11,13]
];

class Tentacle extends Enemy
{
    constructor(pos, screen, leftEdge, rightEdge)
    {
        super(pos, screen, undefined);
        this.animMap = [
            new GameAnimation(this, SPRITE_INDEX_TENTACLE, [0,1,2,3,4,3,2,1,0], 1.8, true)   // ATTACK
        ]
        this.player = screen.player;
        // consider this.mirror
        this.leftEdge = leftEdge + this.pos.x;
        this.rightEdge = rightEdge + this.pos.x;
        this.changeState(STATE_TENTACLE_ATTACK);
    }

    update()
    {
        super.update();
        let playerposy = this.player.pos.y;
        let selfposy = this.pos.y;
        // under detectable vertical distance?
        if (Math.abs(selfposy - playerposy) <= TENTACLE_VERT_DETECT_DISTANCE) {    
            if (this.pos.x < this.rightEdge &&
                this.player.pos.x > this.pos.x) {
                // chase player to the right
                this.velocity.x = TENTACLE_HORZ_MOV_SPD;
            } else if (this.pos.x > this.leftEdge &&
                this.player.pos.x < this.pos.x) {
                // chase player to the left
                this.velocity.x = -TENTACLE_HORZ_MOV_SPD;
            } else {
                this.velocity.x = 0;
            }
        } else {
            this.velocity.x = 0;
        }
    }

    setFrame(index)
    {
        super.setFrame(index);
        let i = index - SPRITE_INDEX_TENTACLE;
        let f = TENTACLE_HITBOX_PER_FRAME[i];
        this.updateHitBox(f[0], f[1], f[2], f[3]);
    }
}
