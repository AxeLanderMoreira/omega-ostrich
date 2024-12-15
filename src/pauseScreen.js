
class PauseScreen extends GameScreen
{
    init()
    {

    }
    
    start()
    {
    
    }
    
    update()
    {

    }
    
    updatePost()
    {
        gameInput.update();
        if (gameInput.pressedAction() || gameInput.pressedPause()) {
            hidePauseScreen();
        }
    }
    
    render()
    {
    }
    
    renderPost()
    {
        gameInput.update();
        // TODO - Not working OK on gamepad?
        if (gameInput.pressedAction() || gameInput.pressedPause()) {
            hidePauseScreen();
        } else {
            const pos = vec2(mainCanvasSize.x/2, mainCanvasSize.y/2);
            drawRect(pos, vec2(150,50),new Color(1,1,1,1), 0, glEnable, true);
            drawRect(pos, vec2(148,48),new Color(0,0,0,1), 0, glEnable, true);
            drawTextScreen('PAUSED', pos, 20, new Color(1,1,1,1));
        }
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
