import { AppGlobals } from "./globals";
import * as canvi from "./canvi";
import * as menus from "./menus";
import * as ascii from "./ascii";

/**
 * Starts the application by initializing the clock and updating the frame at a fixed interval.
 * 
 * @param {AppGlobals} globals - The global application state and functionality.
 */
export function start(globals: AppGlobals): void {

    globals.startClock();

    let counter = 0;
    setInterval(() => {
        globals.updateFrame(
            canvi.place(
                menus.landing,
                ascii.character.walkingRight[
                    counter % ascii.character.walkingLeft.length
                ],
                counter % 20,
                0,
                false,
            )
        );
        counter++;
    }, 1000 / 7);
}