const SPIKE_POINTING_UP = 0;
const SPIKE_POINTING_DOWN = 1;
const SPIKE_POINTING_LEFT = 2;
const SPIKE_POINTING_RIGHT = 3;

const SPIKE_TYPE_ALWAYS = 0; /**< spike is always on (protracted) */
const SPIKE_TYPE_TIMER = 1; /**< spike will retract and protract in a preset interval */
const SPIKE_TYPE_SENSOR = 2; /** spike will protract if player comes inside a proximity sensor */

const SPIKE_TILE_SIZE_X = 15;
const SPIKE_TILE_SIZE_Y = 26;

const STATE_SPIKE_OFF = 0;
const STATE_SPIKE_ON = 1;
const STATE_SPIKE_PROTRACTING = 2;
const STATE_SPIKE_RETRACTING = 3;

const SPIKE_PROTRACT_TIME = .25; // Half-a-second to protract and retract

const COLOR_CYAN = new Color(.5,1,1,1);
const COLOR_GOLD = new Color(1,.8,0,1);

class Spike extends GameObject
{
    /**
     * 
     * @param {Vector2} pos 
     * @param {int} direction 
     * @param {Object} details 
     */
    constructor(pos, screen, direction, subtype, details) {
        //console.log('[Spike constructor] IN - pos = ' + pos.x + ',' + pos.y);
        //console.log('[Spike constructor] direction ' + direction);
        let angle = 0;
        switch (direction) {
            case SPIKE_POINTING_RIGHT:
                angle = Math.PI / 2;
                break;
            case SPIKE_POINTING_DOWN:
                angle = Math.PI;
                break;
            case SPIKE_POINTING_LEFT:
                angle = 3  * (Math.PI / 2);
                break;
        }
        super(
            pos,
            vec2(SPIKE_TILE_SIZE_X/WORLD_TILE_SIZE, SPIKE_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0,0), vec2(SPIKE_TILE_SIZE_X, SPIKE_TILE_SIZE_Y), TEXTURE_INDEX_SPIKE, 1),
            angle
        );
        this.direction = direction;
        this.animMap = []; // only 1 frame, animations are not handled in the usual way
        this.screen = screen;
        this.player = screen.player;
        this.subtype = subtype;
        switch(subtype) {
            case SPIKE_TYPE_ALWAYS:
                this.changeState(STATE_SPIKE_ON);
                break;
            case SPIKE_TYPE_TIMER:
                this.color = COLOR_CYAN;
                this.interval = details.interval;
                this.beginOn = details.beginOn ? details.beginOn : 0;
                this.endOn = details.endOn ? details.endOn : this.interval;
                this.t0Creation = time;
                this.changeState(this.beginOn == 0 ? STATE_SPIKE_ON : STATE_SPIKE_OFF);
                break;
            case SPIKE_TYPE_SENSOR:
                this.color = COLOR_GOLD;
                let box = new EngineObject(
                    vec2(0,0),
                    vec2(details.sensorW/WORLD_TILE_SIZE, details.sensorH/WORLD_TILE_SIZE)
                );
                box.color = new Color(0,0,0,0);
                this.addChild(box, vec2(0,0));
                this.sensorBox  = box;
                this.changeState(STATE_SPIKE_OFF);
                break;
        }
        this.renderOrder = RENDER_ORDER_SPIKE;
    }


    /**
     * 
     * @param {int} newState 
     * @param {int} followingState 
     */
    changeState(newState, followingState = -1)
    {
        switch(newState) {
            case STATE_SPIKE_OFF:
                this.protraction = 0;
                break;
            case STATE_SPIKE_ON:
                this.updateHitBox(0,0,11,25);
                this.protraction = 1;
                break;
            case STATE_SPIKE_PROTRACTING:
                break;
            case STATE_SPIKE_RETRACTING:
                break;
        }
        super.changeState(newState, followingState);
    }

    detectPlayer() {
        if (!this.player || !this.sensorBox) return;
        let o = this.sensorBox;
        let p = this.player.box ? this.player.box : this.player;
        return isOverlapping(
            o.pos,
            o.size,
            p.pos,
            p.size
        )
    }

    updateState()
    {
        // TODO Lógica tá funcionando parcialmente
        // Ajustar posição e implementar colisão
        if (this.hitPlayer()) {
            this.player.damage();
        }
        switch(this.state) {
            case STATE_SPIKE_OFF:
                switch (this.subtype) {
                    case SPIKE_TYPE_SENSOR:
                        if (this.detectPlayer()) {                            
                            this.protract();
                        }
                        break;
                    case SPIKE_TYPE_TIMER:
                        let t = (time - this.t0Creation) % this.interval;
                        //console.log('[Spike.update] t = ' + t);
                        if (t >= this.beginOn && t < this.endOn) {
                            this.protract();
                        }
                        break;
                }
                break;
            case STATE_SPIKE_ON:
                switch (this.subtype) {
                    case SPIKE_TYPE_SENSOR:
                        if (!this.detectPlayer()) {                            
                            this.retract();
                        }
                        break;
                    case SPIKE_TYPE_TIMER:
                        let t = (time - this.t0Creation) % this.interval;
                        if (t < this.beginOn || t >= this.endOn) {
                            this.retract();
                        }
                        break;
                }
                break;
            case STATE_SPIKE_PROTRACTING:
                if (time - this.t0 <= SPIKE_PROTRACT_TIME) {
                    this.protraction = (time - this.t0) / SPIKE_PROTRACT_TIME;
                } else {
                    this.changeState(STATE_SPIKE_ON);
                }
                break;
            case STATE_SPIKE_RETRACTING:
                if (time - this.t0 <= SPIKE_PROTRACT_TIME) {
                    this.protraction = 1 - (time - this.t0) / SPIKE_PROTRACT_TIME;
                } else {
                    this.changeState(STATE_SPIKE_OFF);
                }
                break;
        }        
        // update hitbox
        if (this.protraction > 0 && this.protraction < 1) {
            let pos = vec2(0,0);
            let size = vec2(11,25);
            let boxW, boxH;
            pos.y -= (size.y / 2) * (1 - this.protraction);
            boxW = 11;
            boxH = 25 * this.protraction;           
           this.updateHitBox(pos.x, pos.y, boxW, boxH);
        }
        super.updateState();
    }

    render()
    {
        if (this.protraction == 1) {
            super.render();
        } else if (this.protraction > 0) {
            let pos = this.pos.copy();
            switch (this.direction) {
                case SPIKE_POINTING_UP:
                    pos.y -= (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2) * (1 - this.protraction);
                    break;
                case SPIKE_POINTING_DOWN:
                    pos.y += (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2) * (1 - this.protraction);
                    break;
                case SPIKE_POINTING_RIGHT:
                    pos.x -= (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2) * (1 - this.protraction);
                    break;
                case SPIKE_POINTING_LEFT:
                    pos.x += (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2) * (1 - this.protraction);
                    break;
           }
            drawTile(
                pos, // TODO Adjust here
                vec2(this.size.x, this.size.y * this.protraction),
                new TileInfo(
                    vec2(0,0),
                    vec2(SPIKE_TILE_SIZE_X, SPIKE_TILE_SIZE_Y * this.protraction), 
                    TEXTURE_INDEX_SPIKE,
                    1
                ),
                this.color,
                this.angle
            );
        }
        // draw sheath
        let pos = this.pos.copy(); // reset        
        switch (this.direction) { // this.angle?
            case SPIKE_POINTING_UP:
                pos.y -= (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2);
                break;
            case SPIKE_POINTING_DOWN:
                pos.y += (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2);
                break;
            case SPIKE_POINTING_RIGHT:
                pos.x -= (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2);
                break;
            case SPIKE_POINTING_LEFT:
                pos.x += (SPIKE_TILE_SIZE_Y / WORLD_TILE_SIZE / 2);
                break;
       }
        drawTile(
            pos,
            vec2(this.size.x, 4 / WORLD_TILE_SIZE),
            new TileInfo(
                vec2(0,26),
                vec2(SPIKE_TILE_SIZE_X, 4),
                TEXTURE_INDEX_SPIKE,
                1
            ),
            this.color,
            this.angle
        );
    }

    protract()
    {
        this.changeState(STATE_SPIKE_PROTRACTING);
        this.t0 = time;
    }

    retract()
    {
        this.changeState(STATE_SPIKE_RETRACTING);
        this.t0 = time;
    }

    hitPlayer() {
        if (!this.player) return;
        if (this.protraction <= 0) return;
        let o = this.box ? this.box : this;
        let p = this.player.box ? this.player.box : this.player;
        return isOverlapping(
            o.pos,
            o.size,
            p.pos,
            p.size
        )
    }
}