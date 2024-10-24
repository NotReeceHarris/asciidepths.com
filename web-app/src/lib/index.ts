import { AppGlobals } from "./globals";
import * as canvi from "./canvii";
import * as menus from "./frames";
import * as ascii from "./ascii";
import * as controls from "./controls";

/**
 * Starts the application by initializing the clock and updating the frame at a fixed interval.
 * 
 * @param {AppGlobals} globals - The global application state and functionality.
 */
export function start(globals: AppGlobals): void {

    controls.register('w', () => {
        globals.y -= 1;

        globals.updateFrame(
            canvi.place(
                menus.blank,
                ascii.character.walkingRight[0],
                globals.x,
                globals.y,
                false,
            )
        );
    });

    controls.register('a', () => {
        globals.x -= 1;

        globals.updateFrame(
            canvi.place(
                menus.blank,
                ascii.character.walkingRight[0],
                globals.x,
                globals.y,
                false,
            )
        );
    });

    controls.register('s', () => {
        globals.y += 1;

        globals.updateFrame(
            canvi.place(
                menus.blank,
                ascii.character.walkingRight[0],
                globals.x,
                globals.y,
                false,
            )
        );
    });

    controls.register('d', () => {
        globals.x += 1;

        globals.updateFrame(
            canvi.place(
                menus.blank,
                ascii.character.walkingRight[0],
                globals.x,
                globals.y,
                false,
            )
        );
    });

    globals.updateFrame(
        canvi.place(
            menus.blank,
            ascii.character.walkingRight[0],
            globals.x,
            globals.y,
            false,
        )
    );

    globals.startClock();
}