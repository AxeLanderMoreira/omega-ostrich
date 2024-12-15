const FLUID_UNIT_WIDTH = 1; // 8 pixels
const FLUID_WAVE_PERIOD = 2; // in seconds
const FLUID_WAVE_RANGE = .5;
const FLUID_WAVE_OFFSET = .25; // offset between wave units

class Fluid extends GameObject
{
    // TODO Pass color
    constructor(pos, size, color, screen) {
        //console.log('[Fluid constructor] IN');
        let limit = size.x; /*GAME_RESOLUTION_W/WORLD_TILE_SIZE;*/
        //console.log('[Fluid constructor] limit = ' + limit);
        super(pos, vec2(limit, 2), undefined, 0, new Color(0,0,0,0));
        let x = -(limit/2) + .5;
        this.t0 = time;
        this.initialY = 0;
        //console.log('[Fluid constructor] this.initialY = ' + this.initialY);
        for (var i = 0; i < limit; i++) {
            //console.log('[Fluid constructor] x = ' + x + ', i = ' + i);
            let unit =new GameObject(
                vec2(0,0),
                vec2(1, 2),
                undefined,
                0,
                color,
                RENDER_ORDER_FLUID
            );
            this.addChild(unit, vec2(x, 0));
            x += 1.0;
        }
        this.player = screen.player;
        //console.log('[Fluid constructor] OUT');
    }

    update()
    {
        if (this.collideWith(this.player)) {
            this.player.damage();
        }
        let t = time - this.t0;
        let limit = this.children.length;  
        // TODO Usar parent.height
        //let bottom =  this.initialY - FLUID_WAVE_RANGE;
        let bottom = -2;//-(parent.size.y);
        for (var i = 0; i < limit; i++) {
            let n = Math.PI * (t / FLUID_WAVE_PERIOD);
            let y = Math.abs(Math.sin(n));
            //console.log('[Fluid.update] y = ' + y);
            //let top = this.initialY + (y * FLUID_WAVE_RANGE);
            let top = y * FLUID_WAVE_RANGE;
            this.children[i].size.y = top - bottom;
            this.children[i].pos.y = (top - bottom) / 2;
            t += .25;
        }
        super.update();
    }
}