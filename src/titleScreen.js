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
            { label: 'LEVEL SELECT:', options: this.makeLevelSelectOptions(), index: 0, onfocus: (i) => this.setStartLevel(i) },
            { label: 'START GAME', action: () => this.startGame() }
        ];        
        this.showMenu(this.mainMenu);
        this.hero = new Character(vec2(-6,0), this);
        this.bat = new Bat(vec2(0,0), this);
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
        let hcenter = mainCanvasSize.x/2
        let vbottom =  mainCanvasSize.y;
        drawTextScreen('OMEGA OSTRICH', vec2(hcenter, 40), 36, new Color(1,1,1,1));
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
