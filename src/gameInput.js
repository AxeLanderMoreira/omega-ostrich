const GAME_INPUT_UP = 0;
const GAME_INPUT_DOWN = 1;
const GAME_INPUT_LEFT = 2;
const GAME_INPUT_RIGHT = 3;
const GAME_INPUT_ACTION = 4;
const GAME_INPUT_PAUSE = 5;

/**
 * Handles all low-level things related to player input.
 * 
 * The GameInput can detect how long a button has been pressed, it can register 
 * multiple simultaneous keypresses, and diagonals.
 * 
 * TO-DO: Allow compatibility with joypad
 */
class GameInput
{
    constructor()
    {
        this.clear();
        this.controlMode = CONTROL_MODE_RETRO; // default
    }
    

    clear()
    {
        clearInput();
        this.holdingKey = [ false, false, false, false, false, false ];
        this.pressedKey = [ false, false, false, false, false, false ];
    }

    setControlMode(mode)
    {
        this.controlMode = mode;
    }

    /**
     * 
     */
    update()
    {
        // update the flags that will feed return of functions
        // holdingLeft, holdingRight etc
        // TODO Handle gamepad and 

        if (isUsingGamepad) {
            let stk = gamepadStick(0, 0);            
            let alreadyHolding = [false,false,false,false];
            alreadyHolding[GAME_INPUT_UP] = this.holdingKey[GAME_INPUT_UP];
            alreadyHolding[GAME_INPUT_DOWN] = this.holdingKey[GAME_INPUT_DOWN];
            alreadyHolding[GAME_INPUT_LEFT] = this.holdingKey[GAME_INPUT_LEFT];
            alreadyHolding[GAME_INPUT_RIGHT] = this.holdingKey[GAME_INPUT_RIGHT];
            if (this.controlMode == CONTROL_MODE_RETRO) {
                this.holdingKey[GAME_INPUT_UP] = stk.y > 0;
                this.holdingKey[GAME_INPUT_ACTION] = gamepadIsDown(0) || gamepadIsDown(1) || gamepadIsDown(2) || gamepadIsDown(3);
            } else {
                this.holdingKey[GAME_INPUT_UP] = gamepadIsDown(1);
                this.holdingKey[GAME_INPUT_ACTION] = gamepadIsDown(0);
            }            
            this.holdingKey[GAME_INPUT_DOWN] = stk.y < 0;
            this.holdingKey[GAME_INPUT_LEFT] = stk.x < 0;
            this.holdingKey[GAME_INPUT_RIGHT] = stk.x > 0;
            this.pressedKey[GAME_INPUT_UP] = this.holdingKey[GAME_INPUT_UP] && !alreadyHolding[GAME_INPUT_UP];
            this.pressedKey[GAME_INPUT_DOWN] = this.holdingKey[GAME_INPUT_DOWN] && !alreadyHolding[GAME_INPUT_DOWN];
            this.pressedKey[GAME_INPUT_LEFT] = this.holdingKey[GAME_INPUT_LEFT] && !alreadyHolding[GAME_INPUT_LEFT];
            this.pressedKey[GAME_INPUT_RIGHT] = this.holdingKey[GAME_INPUT_RIGHT] && !alreadyHolding[GAME_INPUT_RIGHT];
            this.pressedKey[GAME_INPUT_ACTION] = gamepadWasPressed(0) || gamepadWasPressed(1) || gamepadWasPressed(2) || gamepadWasPressed(3);
            this.pressedKey[GAME_INPUT_PAUSE] = gamepadWasPressed(8);

        } else { // keyboard
            this.holdingKey[GAME_INPUT_DOWN] = keyIsDown('ArrowDown');
            this.holdingKey[GAME_INPUT_LEFT] = keyIsDown('ArrowLeft');
            this.holdingKey[GAME_INPUT_RIGHT] = keyIsDown('ArrowRight');
            // action is performed by Z, spacebar, or ENTER (which in TV remote controls translate to the ENTER key)
            this.holdingKey[GAME_INPUT_ACTION] = keyIsDown('KeyZ') || keyIsDown('Space') || keyIsDown('Enter');
            if (this.controlMode == CONTROL_MODE_RETRO) {
                this.holdingKey[GAME_INPUT_UP] = keyIsDown('ArrowUp');
                this.pressedKey[GAME_INPUT_UP] = keyWasPressed('ArrowUp');
            } else {
                this.holdingKey[GAME_INPUT_UP] = keyIsDown('KeyX');
                this.pressedKey[GAME_INPUT_UP] = keyWasPressed('KeyX');
            }
            this.pressedKey[GAME_INPUT_DOWN] = keyWasPressed('ArrowDown');
            this.pressedKey[GAME_INPUT_LEFT] = keyWasPressed('ArrowLeft');
            this.pressedKey[GAME_INPUT_RIGHT] = keyWasPressed('ArrowRight');
            this.pressedKey[GAME_INPUT_ACTION] = keyWasPressed('KeyZ') || keyWasPressed('Space') || keyWasPressed('Enter');
            this.pressedKey[GAME_INPUT_PAUSE] = keyWasPressed('KeyP');
        }        
    }

    holdingUp()
    {
        return this.holdingKey[GAME_INPUT_UP];
    }

    holdingDown()
    {
        return this.holdingKey[GAME_INPUT_DOWN];
    }

    holdingLeft()
    {
        return this.holdingKey[GAME_INPUT_LEFT];
    }

    holdingRight()
    {
        return this.holdingKey[GAME_INPUT_RIGHT];
    }

    holdingAction()
    {
        return this.holdingKey[GAME_INPUT_ACTION];
    }

    pressedLeft()
    {
        return this.pressedKey[GAME_INPUT_LEFT];
    }

    pressedRight()
    {
        return this.pressedKey[GAME_INPUT_RIGHT];
    }

    pressedUp()
    {
        return this.pressedKey[GAME_INPUT_UP];
    }

    pressedDown()
    {
        return this.pressedKey[GAME_INPUT_DOWN];
    }

    pressedAction()
    {
        return this.pressedKey[GAME_INPUT_ACTION];
    }

    pressedPause()
    {
        return this.pressedKey[GAME_INPUT_PAUSE];
    }

}