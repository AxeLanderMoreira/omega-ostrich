///////////////////////////////////////////////////////////////////////////////
// level generation

const OBJECT_TYPE_WALL = 0;
const OBJECT_TYPE_ENEMY = 1;
const OBJECT_TYPE_FLUID = 2;
const OBJECT_TYPE_CHECKPOINT = 3;
const OBJECT_TYPE_START_POSITION = 4;
const OBJECT_TYPE_HINT = 5;

class GameLevel
{
    constructor(map, screen, tutorialOff) {
        this.map = map;
        this.screen = screen;
        this.parseIdx = 0;
        this.walls= []; // Array of GameObjects
        this.enemies = [];
        this.fluids = [];
        this.hints = [];
        this.tutorialOff = tutorialOff;
        this._parseMapArray(map);
    }

    /**
     * 
     * @returns next value in map array
     */
    _next() {
        //console.log('[gameLevel._next] IN - parseIdx = ' + this.parseIdx);
        return this.map[this.parseIdx++];
    }

    _eof() {
        //console.log('[gameLevel._eof] IN - parseIdx = ' + this.parseIdx + ', length = ' + this.map.length);
        return this.parseIdx >= this.map.length - 1; 
    }

    _parseMapArray(map) {
        this.mapWidth = this._next();
        this.mapHeight = this._next();
        let obj, objType;
        while (!this._eof()) {
            objType = this._next();
            switch(objType) {
                case OBJECT_TYPE_WALL:
                    obj = this._parseWall();
                    break;
                case OBJECT_TYPE_ENEMY:
                    obj = this._parseEnemy();
                    break;
                case OBJECT_TYPE_FLUID:
                    obj = this._parseFluid();
                    break;
                case OBJECT_TYPE_CHECKPOINT:
                    obj = this._parseCheckpoint();
                    break;
                case OBJECT_TYPE_START_POSITION:
                    obj = this._parseStartPosition();
                    break;
                case OBJECT_TYPE_HINT:
                    obj = this._parseHint();
                    break;
            }
            if (obj) {
                obj.gravityScale = 0;
            } 
        }
    }

    _parseWall() {
        let x = this._next();
        let y = this._next();
        let width = this._next();
        let height = this._next();
        let flag = this._next();
        let hot = (flag & 1) == 1;
        let breakable = (flag & 2) == 2;
        let xmove = this._next()/WORLD_TILE_SIZE;
        let ymove = this._next()/WORLD_TILE_SIZE;
        let color;
        if (breakable) {
            color = new Color(1,1,1,1);
        } else {
            color = randColor(new Color(.5,.5,.5), new Color(.9,.9,.9));
        }
        let pos = this._translatePos(x, y, width, height, true);
        let size = vec2(width, height).divide(vec2(8));
        let obj = new Wall(pos, size, this.screen, color, breakable, hot, xmove, ymove);
        if (obj) {
            this.walls.push(obj);
        }        
        return obj;
    }

    _parseEnemy() {
        let obj;
        let id = this._next();
        let x = this._next();
        let y = this._next();
        let pos = this._translatePos(x, y, ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y);
        // TODO Serialize 'Horizontal Flipping' flag, and acquire as mirror below
        let mirror = !!(this._next());
        switch(id) {
            case ENEMY_ID_SPIDER:
                obj = new Spider(pos, this.screen);
                break;
            case ENEMY_ID_MOTH:
                obj = new Moth(pos, this.screen);
                break;
            case ENEMY_ID_BAT:
                obj = new Bat(pos, this.screen);
                break;
            case ENEMY_ID_SNAKE:
                obj = new Snake(pos, this.screen, mirror);
                break;
            case ENEMY_ID_TENTACLE:
                let leftEdge = Math.floor(this._next()  / WORLD_TILE_SIZE);
                let rightEdge = Math.floor(this._next()  / WORLD_TILE_SIZE);
                obj = new Tentacle(pos, this.screen, leftEdge, rightEdge);
                break;
        }
        if (obj) {
            this.enemies.push(obj);
        }
    }

    _parseFluid() {
        let x = this._next();
        let y = this._next();
        let width = this._next();
        let height = this._next();
        let color = new Color();
        color.setHex(this._next());
        let pos = this._translatePos(x, y, width, height, true);
        let size = vec2(width, height).divide(vec2(8));
        let obj = new Fluid(pos, size, color, this.screen);
        if (obj) {
            this.fluids.push(obj);
        }
    }

    _parseCheckpoint() {
        let x = this._next();
        let y = this._next();
        let pos = this._translatePos(x, y, ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y);
        let mirror = !!(this._next());
        this.checkpoint = new Checkpoint(pos, this.screen, mirror);
        // Do something about it?
    }

    _parseStartPosition() {
        let x = this._next();
        let y = this._next();
        let pos = this._translatePos(x, y, 1, 1);
        this.screen.respawnPosition = pos.copy();
        // TODO Allow mirrored startPosition ?
    }

    _parseHint() {
        let x = this._next();
        let y = this._next();
        let pos = this._translatePos(x, y, ENEMY_TILE_SIZE_X, ENEMY_TILE_SIZE_Y);
        let text= this._next();
        let hintX = this._next();
        let hintY = this._next();
        let hintW = this._next();
        let hintH = this._next();
        if (!this.tutorialOff) {
            let obj = new Hint(pos, this.screen, text, vec2(hintX, hintY), vec2(hintW, hintH));
            if (obj) {
                this.hints.push(obj);
            }
        }
    }

    /**
     * 
     * @param {Vector2} pos in pixels (0,0@top,left)
     * @return {Vector2} pos in game world coordinates
     */

    /**
     * 
     * @param {int} x x-coordinate
     * @param {int} y y-coordinate
     * @param {int} w width
     * @param {int} h height
     * @param {boolean} isTopLeft true if x,y position is anchored to top left; false or undefined if centered.
     * @returns {Vector2} pos in game world coordinates
     */
    _translatePos(x, y, w, h, isTopLeft) {
        // adjust from screen coordinates to cartesian
        let tx = x - GAME_RESOLUTION_W / 2;
        let ty = -y + GAME_RESOLUTION_H / 2;
        // adjust pivot position in object (from top/left to center)
        if (isTopLeft) {
            tx += w/2;
            ty -= h/2;
        }
        // divide by tile size (camera scale).
        tx /= WORLD_TILE_SIZE;
        ty /= WORLD_TILE_SIZE;
        return vec2(tx, ty);
    }

    _translateSize(size) {
        return size.divide(vec2(8)); // TODO IMPLEMENT
    }

    getWalls()
    {
        return this.walls;
    }

    getEnemies()
    {
        return this.enemies;
    }

    getFluids()
    {
        return this.fluids;
    }

    getHints()
    {
        return this.hints;
    }
     

     /*
      * @return vector with farthest possible top-left camera position
      */
     getCameraUpperLimit() {
        return vec2(0, 0);
     }


     /*
      * @return vector with farthest possible bottom-right camera position
      */
     getCameraLowerLimit() {
        let mapw = this.mapWidth;
        let maph = this.mapHeight;
        //console.log('[getCameraLowerLimit] mapw = ' + mapw);
        //console.log('[getCameraLowerLimit] maph = ' + mapw);
        let scrw = GAME_RESOLUTION_W / 8;
        let scrh = GAME_RESOLUTION_H / 8;
        //console.log('[getCameraLowerLimit] scrw = ' + scrw);
        //console.log('[getCameraLowerLimit] scrh = ' + scrh);
        //return vec2(mapw - (scrw/2), -maph + (scrh/2));
        return vec2(mapw - scrw, -maph + scrh);
     }
}
