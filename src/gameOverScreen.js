
class GameOverScreen extends GameScreen
{
    /**
     * 
     * @param {boolean} victory flag determining whether the screen shows the
     * message 'GAME OVER' (all lives lost) or 'WELL DONE' (end reached).
     */
    constructor(victory)
    {
        super();
        this.victory = victory;
    }

    init()
    {

    }
    
    start()
    {
    
    }
    
    update()
    {
        if (gameInput.pressedAction()) {
            showTitleScreen();
        }
        super.update();
    }
    
    updatePost()
    {
    
    }
    
    render()
    {
    }
    
    renderPost()
    {
        const pos = vec2(mainCanvasSize.x/2, mainCanvasSize.y/2);
        drawRect(pos, vec2(150,50),new Color(1,1,1,1), 0, glEnable, true);
        drawRect(pos, vec2(148,48),new Color(0,0,0,1), 0, glEnable, true);
        drawTextScreen(this.victory ? 'WELL DONE' : 'GAME OVER', pos, 20, new Color(1,1,1,1));
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
