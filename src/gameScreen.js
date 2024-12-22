/**
 * The Screen class represents a "presentation context" in the game, where each
 * particular instance has its own layout, navigation rules etc.
 * 
 * The game code will manage which screen type is current, and delegate all 
 * rendering and navigation logic to it.
 * 
 * In PROJECT ZL, there are three Screen subclasses:
 * - titleScreen
 * - mainGameScreen
 * - miniGameScreen
 */
class GameScreen
{
    /**
     * 
     */
    constructor()
    {

    }

    /**
     * Called just once. Makes general initialization, and loads resources that
     * are never expected to be unloaded.
     */
    init()
    {

    }

    /**
     * Called at every transition into this screen
     */
    start()
    {
        this.stopping = false;
    }

    /**
     * Called from gameUpdate callback registered via engineInit
     */
    update()
    {

    }

    /**
     * Called from gameUpdatePost callback registered via engineInit
     */
    updatePost()
    {

    }

    /**
     * Called from gameRender callback registered via engineInit
     */
    render()
    {

    }

    /**
     * Called from gameRenderPost callback registered via engineInit
     */
    renderPost()
    {
        if (this.fadeOutT1) {
            if (time <= this.fadeOutT1) {
                let elapsed = time - this.fadeOutT0;
                let total = this.fadeOutT1 - this.fadeOutT0;
                let color = new Color(0,0,0,(elapsed/total));
                drawRect(vec2(GAME_RESOLUTION_W/2,GAME_RESOLUTION_H/2), vec2(GAME_RESOLUTION_W,GAME_RESOLUTION_H), color, 0, glEnable, true);
            } else {
                this.onEnd();
            }
        }  
    }

    onEnd()
    {
        if (nextScreen) {
            currentScreen = nextScreen;
            nextScreen = null;
            currentScreen.init();
            currentScreen.start();
        }
    }

    /**
     * Called at every transition out of this screen, when the current state can be discarded.
     */
    stop(fadeOutTime)
    {
        this.stopping = true;
        this.fadeOutT0 = time;
        this.fadeOutT1 = time + fadeOutTime;
    }

    /**
     * Called at every transition out of this screen, when the current state has to be preserved.
     */
    hide()
    {

    }

    /**
     * Called to show this screen again after hide().
     */
    show()
    {

    }
}
