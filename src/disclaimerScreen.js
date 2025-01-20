/*const DISCLAIMER_TEXT = 
    "DISCLAIMER\n"+
    "\n" +
    "The game you're about to play\n" +
    "shows flashing lights\n" +
    "and plays loud music.\n" +
    "\n" +
    "Interact to continue."
;*/

const DISCLAIMER_TEXT = [
    "DISCLAIMER",
    "",
    "The demo you're about to play",
    "shows flashing lights",
    "and plays loud music.",
    "",
    "Interact to continue.",
    "",
    "© 2024-2025 Alexandre Moreira"
]

const DISCLAIMER_FONT_SIZE = 15;
const DISCLAIMER_TEXT_NUM_LINES = DISCLAIMER_TEXT.length;

class DisclaimerScreen extends GameScreen 
{
    init()
    {
        if (!this.disclaimerText) {
            let arr = DISCLAIMER_TEXT;
            for (let i = 0; i < arr.length - 1; i++) {
                arr[i] += "\n";
            }
            this.disclaimerText = arr.join('');
        }
        super.init();
    }

    /*start()
    {

    }*/

    update()
    {
        let loading = (gTitleSong.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA);
        if (this.showLoading && !loading) {
            showTitleScreen();
            return;
        }
        if (gameInput.hasPressedAnyKey()) {
            if (!loading) {
                showTitleScreen();
            } else {
                this.showLoading = true;
            }
        }
    }

    /*updatePost()
    {

    }*/

    render()
    {
        let hcenter = mainCanvasSize.x/2;
        let vcenter = mainCanvasSize.y/2;
        if (!this.showLoading) {
            vcenter -= (DISCLAIMER_FONT_SIZE * DISCLAIMER_TEXT_NUM_LINES) / 2;
            drawTextScreen(this.disclaimerText, vec2(hcenter, vcenter), DISCLAIMER_FONT_SIZE);
        } else {
            drawTextScreen('LOADING...', vec2(hcenter, vcenter), DISCLAIMER_FONT_SIZE);
        }
    }

    /*renderPost()
    {

    }

    stop(fadeOutTime)
    {

    }

    hide()
    {

    }

    show()
    {

    }*/


}
