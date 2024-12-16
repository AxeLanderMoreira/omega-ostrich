class TitleScreen extends GameScreen
{
    init()
    {
        //this.fontImg = new FontImage();
        this.levelSelect = 1;
        this.mainMenu = [
            /*{ label: 'OPTIONS', action: this.showMenu.bind(this, this.optionsMenu) },*/
            { label: 'OPTIONS', action: () => this.showMenu(this.optionsMenu) },
            { label: 'START GAME', action: () => this.startGame() }
        ];
        this.optionsMenu = [
            { label: 'CONTROL MODE:', options: ['1 BUTTON', '3 BUTTONS'], index: 0, onfocus: (i) => this.setControlMode(i) },
            { label: 'LEVEL SELECT:', options: this.makeLevelSelectOptions(), index: 0, onfocus: (i) => this.setStartLevel(i) },
            { label: 'BACK', action: () => this.showMenu(this.mainMenu) }

        ]
        this.showMenu(this.mainMenu);
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

    setControlMode(i) {
        this.controlMode = i;
    }

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
        } else if (gameInput.pressedDown() && menu.index < menu.length) {
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

        let hcenter = mainCanvasSize.x/2
        let vbottom =  mainCanvasSize.y;
        drawTextScreen('OMEGA OSTRICH', vec2(hcenter, 40), 40, new Color(1,1,1,1));
        /*drawTextScreen('LEVEL SELECT: ⟨' + this.levelSelect + '⟩', vec2(hcenter, vbottom - 70), 12, new Color(1,1,1,1));
        drawTextScreen('➤ PRESS FIRE TO START', vec2(hcenter, vbottom -40), 20, new Color(1,1,1,1));*/
        //for (let i = 0; i < this.currentMenu.len)
        let i = 0;
        let menu = this.currentMenu;
        let y = vbottom -90;
        menu.forEach(element => {
            let label = element.label;
            let color = (i == menu.index) ? new Color(1,1,0,1) : new Color(.75,.75,.75,1);
            let options = element.options;
            if (options) {
                let subIndex = element.index || 0;
                label += ' < ' + options[subIndex] + ' > ';
            }
            i++;
            drawTextScreen(label, vec2(hcenter, y), 20, color);
            y += 25;
        });
    }
    
    renderPost()
    {
    }
    
    stop()
    {
    
    }
    
    hide()
    {
    
    }
    
    show()
    {
    
    }
}
