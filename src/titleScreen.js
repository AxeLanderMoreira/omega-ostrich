
class TitleScreen extends GameScreen
{
    init()
    {
        //this.fontImg = new FontImage();
        this.levelSelect = 1;
    }
    
    start()
    {
    
    }
    
    update()
    {
        if (gameInput.pressedLeft() && this.levelSelect > 1) {
            this.levelSelect--;
        } else if (gameInput.pressedRight() && this.levelSelect < GAMEMAP.length) {
            this.levelSelect++;
        } else if (gameInput.pressedAction()) {
            showMainGameScreen(this.levelSelect);
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
        drawTextScreen('LEVEL SELECT: < ' + this.levelSelect + ' >', vec2(hcenter, vbottom - 70), 12, new Color(1,1,1,1));
        drawTextScreen('PRESS FIRE TO START', vec2(hcenter, vbottom -40), 20, new Color(1,1,1,1));
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
