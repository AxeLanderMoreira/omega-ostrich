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

    }

    /**
     * Called at every transition out of this screen, when the current state can be discarded.
     */
    stop()
    {

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