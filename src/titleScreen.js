const PORTRAIT_W_PX = 157;
const PORTRAIT_H_PX = 198;
const VISOR_TILE_SIZE_X = 45;
const VISOR_TILE_SIZE_Y = 22;
const LOGO_W_PX=177;
const LOGO_H_PX=40;

const STATE_VISOR_ANIM_INVISIBLE = 0;
const STATE_VISOR_ANIM_SLIDING = 1;
const STATE_VISOR_ANIM_SPARK = 2;

const TITLE_ANIM_TIME = 6;

const RENDER_ORDER_HERO_PORTRAIT=-3;
const RENDER_ORDER_VISOR_FLASH=-2;
const RENDER_ORDER_GAME_LOGO=-1;

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
            ], .5, false), // SLIDING
            new GameAnimation(this, 0, [19,20,21,20,19,0], .25, false) // SPARK
        ];
        this.changeState(STATE_VISOR_ANIM_INVISIBLE);
        this.renderOrder = RENDER_ORDER_VISOR_FLASH;
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

    constructor(song)
    {
        super();
        this.song = song;
    }

    init()
    {
        this.levelSelect = 1;
        this.mainMenu = [            
            { label: 'START GAME', action: () => this.startGame() },
            { label: 'OPTIONS', action: () => this.showMenu(this.optionsMenu) },
        ];
        this.optionsMenu = [
             { label: 'LEVEL SELECT:', options: this.makeLevelSelectOptions(), index: 0, onfocus: (i) => this.setStartLevel(i) },
             { label: 'TUTORIAL:', options: ['ON', 'OFF'], index: gStorage.tutorialOff, onfocus: (i) => this.setTutorialOff(i) },
             { label: 'BACK', action: () => this.showMenu(this.mainMenu) }

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
        this.logo = new GameObject(
            vec2(-10,5),
            vec2(LOGO_W_PX/WORLD_TILE_SIZE, LOGO_H_PX/WORLD_TILE_SIZE),
            new TileInfo(
                vec2(0,0), 
                vec2(LOGO_W_PX,LOGO_H_PX), 
                TEXTURE_INDEX_TITLE_LOGO)            
        );
        this.visorAnim = new VisorAnimation(vec2(0,0));
        this.visorAnim.renderOrder = RENDER_ORDER_VISOR_FLASH;
        this.portrait.addChild(this.visorAnim, vec2(-5.5,10));
        this.portrait.renderOrder = RENDER_ORDER_HERO_PORTRAIT;
        this.nextTimeToFlash();
        this.topColor = BG_GRADIENT_COLOR_BRIGHT_TITLE;
    }
    
    start()
    {
        this.song.volume = 1;
        this.song.loop = true;
        this.song.play();
        super.start();
    }

    nextTimeToFlash()
    {
        // next time to flash between 5-10s
        this.timeToFlash = time + 5 + (Math.random() * 5);
    }

    makeLevelSelectOptions()
    {
        let max = Math.min(gStorage.levelsUnlocked, GAMEMAP.length);
        let ret = new Array(max);
        for (let i = 1; i <= max; i++) {
            ret[i-1] = i;
        }
        return ret;
    }

    /*setControlMode(i) {
        this.controlMode = i;
    }*/

    setTutorialOff(i) {
        this.tutorialOff = i;
        if (gStorage.tutorialOff != i) {
            gStorage.tutorialOff = i;
            saveStorage();
        }
    }

    setStartLevel(i) {
        this.levelSelect = (i + 1);
    }

    startGame() {
        let loading = (gMainLoopSong.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA);
        if (!loading) {
            showMainGameScreen(this.levelSelect, this.tutorialOff);
        } else {
            this.showLoading = true;
        }
    }
    
    showMenu(menu, index) {
        menu.index = index ? index : 0;
        this.currentMenu = menu;
    }

    navigateMenu(direction) {
        this.currentMenu.index += direction;
        new Sound(SOUND_MENU_FOCUS).play();
    }

    navigateItem(item, direction) {
        if (item.options) {
            item.index += direction;
            if (item.index < 0) {
                item.index = item.options.length -1; //wrap around
            } else if (item.index >= item.options.length) {
                item.index = 0; //wrap around
            }
            item.onfocus(item.index);
            new Sound(SOUND_MENU_FOCUS).play();
        }
    }

    doAction(action) {
        if (action) {
            // sound here
            action();
            new Sound(SOUND_MENU_ACTION).play();
        }
    }

    update()
    {
        if (this.showLoading) {
            let loading = (gMainLoopSong.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA);
            if (!loading) {
                this.showLoading = false;
                showMainGameScreen(this.levelSelect, this.tutorialOff);
            }
            return;
        }
        let menu = this.currentMenu;
        let item = menu[menu.index];
        if (gameInput.pressedUp() && menu.index > 0) {
            this.navigateMenu(-1);
        } else if (gameInput.pressedDown() && menu.index < menu.length-1) {
            this.navigateMenu(1);
        } else if (gameInput.pressedLeft()) {
            this.navigateItem(item, -1);
        } else if (gameInput.pressedRight()) {
            this.navigateItem(item, 1);
        } else if (gameInput.pressedAction()) {
            this.doAction(item.action);
        }
        if (time >= this.timeToFlash) {
            this.showFlash();
            this.nextTimeToFlash();
        }
        if (this.flashing) {
            let t = time - this.t0Flash;
            if (t <= 1) {
                this.topColor = lerpColorInts(BG_GRADIENT_COLOR_BRIGHT_TITLE, BG_GRADIENT_COLOR_BRIGHT_TITLE_2, t);
            } else {
                this.flashing = false;
                this.topColor = BG_GRADIENT_COLOR_BRIGHT_TITLE;
            }
        }
        if (this.stopping) {
            // fade out music
            let total = this.fadeOutT1 - time;
            if (total >= 0 && total <= 1) {
                this.song.volume = total;
            }
        }
        super.update();
    }

    showFlash() {
        this.flashing = true;
        this.timeToFlash = -1;
        this.t0Flash = time;
        this.visorAnim.changeState(STATE_VISOR_ANIM_SLIDING, STATE_VISOR_ANIM_SPARK);
    }
    
    updatePost()
    {
    
    }

    drawOutlineText(txt, pos, sz, fillColor, outlineColor)
    {
        drawTextScreen(txt, vec2(pos.x-1, pos.y-1), sz, outlineColor);
        drawTextScreen(txt, vec2(pos.x+1, pos.y-1), sz, outlineColor);
        drawTextScreen(txt, vec2(pos.x+1, pos.y+1), sz, outlineColor);
        drawTextScreen(txt, vec2(pos.x-1, pos.y+1), sz, outlineColor);
        drawTextScreen(txt, pos, 15, fillColor);
    }
    
    render()
    {
        drawBackground(this.topColor, BG_GRADIENT_COLOR_DARK);
        let hcenter = mainCanvasSize.x/4;
        let vbottom =  mainCanvasSize.y;
        let i = 0;
        let y = vbottom -50;
        if (this.showLoading) {
            this.drawOutlineText('LOADING...', vec2(hcenter, y), 15, new Color(1,1,1), new Color(0,0,0));
            return;
        }
        let menu = this.currentMenu;
        if (this.stopping) return;
        menu.forEach(element => {
            let label = element.label;
            let fgcolor = (i == menu.index) ? new Color(1,1,0) : new Color(1,1,1);
            let bgcolor = (i == menu.index) ? new Color(0,.5,0) : new Color(0,0,0);
            let options = element.options;
            if (options) {
                let subIndex = element.index || 0;
                label += ' < ' + options[subIndex] + ' > ';
            }
            i++;
            // outline
            this.drawOutlineText(label, vec2(hcenter, y), 15, fgcolor, bgcolor);
            y += 20;
        });
    }
    
    renderPost()
    {
        super.renderPost();
    }

    stop(fadeOutTime)
    {
        this.timeToFlash = -1;
        super.stop(fadeOutTime);
    }
    
    onEnd() 
    {
        this.song.volume = 0;
        this.song.pause();
        this.song.currentTime = 0;
        delete this.song;
        engineObjectsDestroy();
        delete this.portrait;
        delete this.logo;
        delete this.visorAnim;
        super.onEnd();
    }
    
    hide()
    {
    
    }
    
    show()
    {
    
    }
}
