const PORTRAIT_W_PX = 157;
const PORTRAIT_H_PX = 198;
const VISOR_TILE_SIZE_X = 45;
const VISOR_TILE_SIZE_Y = 22;

const STATE_VISOR_ANIM_INVISIBLE = 0;
const STATE_VISOR_ANIM_SLIDING = 1;
const STATE_VISOR_ANIM_SPARK = 2;

class VisorAnimation extends GameObject {
    constructor(pos) {
        super(
            pos,
            vec2(VISOR_TILE_SIZE_X/WORLD_TILE_SIZE, VISOR_TILE_SIZE_Y/WORLD_TILE_SIZE),
            new TileInfo(vec2(0,0), vec2(VISOR_TILE_SIZE_X, VISOR_TILE_SIZE_Y), TEXTURE_INDEX_VISOR_ANIM)
        );
        this.animMap = [
            new GameAnimation(this, 0, [0], 1, true), // INVISIBLE
            new GameAnimation(this, 0, [
                1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18
            ], 1, false), // SLIDING
            new GameAnimation(this, 0, [19,20,21,20,19,0], .25, false) // SPARK
        ];
        this.changeState(STATE_VISOR_ANIM_INVISIBLE);
    }

    changeState(newState, followingState = -1)
    {
        this.t0 = time; // TODO Unify in base class (as stateElapsed?)
        super.changeState(newState, followingState);
    }

    updateState()
    {
        super.updateState();
        switch(this.state) {
            case STATE_VISOR_ANIM_INVISIBLE:
                if (time - this.t0 >= 2) {
                    this.changeState(STATE_VISOR_ANIM_SLIDING, STATE_VISOR_ANIM_SPARK);
                }
                break;
            case STATE_VISOR_ANIM_SPARK:
                if (time - this.t0 >= 1) {
                    this.changeState(STATE_VISOR_ANIM_INVISIBLE);
                }
                break;
        }
    }
}

class TitleScreen extends GameScreen
{
    /*init()
    {
        this.levelSelect = 1;
        this.mainMenu = [            
            { label: 'OPTIONS', action: () => this.showMenu(this.optionsMenu) },
            { label: 'START GAME', action: () => this.startGame() }
        ];
        this.optionsMenu = [
            { label: 'CONTROL MODE:', options: ['1 BUTTON', '2 BUTTONS'], index: 0, onfocus: (i) => this.setControlMode(i) },
            { label: 'LEVEL SELECT:', options: this.makeLevelSelectOptions(), index: 0, onfocus: (i) => this.setStartLevel(i) },
            { label: 'BACK', action: () => this.showMenu(this.mainMenu) }

        ]
        this.showMenu(this.mainMenu);
    }*/

    // Simplified implementation - instead of allowing select a different control scheme,
    // we allow (for now) both UP arrow and button 2 to work as jump/fly;

    init()
    {
        this.levelSelect = 1;
        this.mainMenu = [            
            { label: 'START GAME', action: () => this.startGame() },
            { label: 'LEVEL SELECT:', options: this.makeLevelSelectOptions(), index: 0, onfocus: (i) => this.setStartLevel(i) }
        ];
        this.showMenu(this.mainMenu);
        this.portrait = new GameObject(
            vec2(12,-2), 
            vec2(PORTRAIT_W_PX/WORLD_TILE_SIZE, PORTRAIT_H_PX/WORLD_TILE_SIZE),
            new TileInfo(
                vec2(0,0), 
                vec2(PORTRAIT_W_PX,PORTRAIT_H_PX), 
                TEXTURE_INDEX_PORTRAIT)            
        );
        this.visorAnim = new VisorAnimation(vec2(0,0));
        this.portrait.addChild(this.visorAnim, vec2(-5.5,10));
    }
    
    start()
    {

    }

    makeLevelSelectOptions()
    {
        let ret = new Array(GAMEMAP.length);
        for (let i = 1; i <= GAMEMAP.length; i++) {
            ret[i-1] = i;
        }
        return ret;
    }

    /*setControlMode(i) {
        this.controlMode = i;
    }*/

    setStartLevel(i) {
        this.levelSelect = (i + 1);
    }

    startGame() {
        showMainGameScreen(this.levelSelect, this.controlMode);
    }
    
    showMenu(menu, index) {
        menu.index = index ? index : 0;
        this.currentMenu = menu;
    }

    update()
    {
       let menu = this.currentMenu;
       let item = menu[menu.index];
        if (gameInput.pressedUp() && menu.index > 0) {
            menu.index--;
        } else if (gameInput.pressedDown() && menu.index < menu.length-1) {
            menu.index++;
        } else if (gameInput.pressedLeft()) {
            if (item.options) {
                item.index--;
                if (item.index < 0) {
                    item.index = item.options.length -1; //wrap around
                }
                item.onfocus(item.index);
            }
        } else if (gameInput.pressedRight()) {
            if (item.options) {
                item.index++;
                if (item.index >= item.options.length) {
                    item.index = 0; //wrap around
                }
                item.onfocus(item.index);
            }
        } else if (gameInput.pressedAction()) {
            let action = item.action;
            if (action) {
                action();
            }
        }
        super.update();
    }
    
    updatePost()
    {
    
    }
    
    render()
    {
        drawBackground(BG_GRADIENT_COLOR_BRIGHT, BG_GRADIENT_COLOR_DARK);
        let hcenter = mainCanvasSize.x/4;
        let vbottom =  mainCanvasSize.y;
	// replace by use of FontImage
        drawTextScreen('OMEGA\nOSTRICH', vec2(hcenter, 40), 36, new Color(1,1,1,1));
        let i = 0;
        let menu = this.currentMenu;
        let y = vbottom -40;
        menu.forEach(element => {
            let label = element.label;
            let color = (i == menu.index) ? new Color(1,1,0,1) : new Color(.75,.75,.75,1);
            let options = element.options;
            if (options) {
                let subIndex = element.index || 0;
                label += ' < ' + options[subIndex] + ' > ';
            }
            i++;
            drawTextScreen(label, vec2(hcenter, y), 15, color);
            y += 20;
        });
    }
    
    renderPost()
    {
    }
    
    stop()
    {
        engineObjectsDestroy();
    }
    
    hide()
    {
    
    }
    
    show()
    {
    
    }
}
