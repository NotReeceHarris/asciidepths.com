import app from './app';
import clock from './clock';

// Import the font files
import Alucrads from './assets/Alucrads.ttf';
import Inconsolata from './assets/Inconsolata.ttf';

// Set the canvas dimensions and resolution
const width = 1000;
const height = 500;
const resolution = 2;

// Create the font face, canvas and context
const canvas = document.createElement('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

// Set the canvas styles and dimensions
canvas.classList.add('w-[100vw]', 'h-[50vw]', 'max-w-[200vh]', 'max-h-[100vh]', 'mx-auto', 'p-6')
canvas.width = width * resolution;
canvas.height = height * resolution;

// Create the font face
const AlucradsFontFace = new FontFace('Alucrads', `url(${Alucrads})`) as FontFace;
const InconsolataFontFace = new FontFace('Inconsolata', `url(${Inconsolata})`) as FontFace;

const clockInstance = new clock(context);

document.addEventListener('DOMContentLoaded', async () => {
    // Add the font to the document
    document.fonts.add(await AlucradsFontFace.load());
    document.fonts.add(await InconsolataFontFace.load());

    // Add the canvas to the document
    document.body.appendChild(canvas);

    // Page has loaded, run the app.
    app(context, clockInstance);
    clockInstance.start();
});

import './assets/styles.css';