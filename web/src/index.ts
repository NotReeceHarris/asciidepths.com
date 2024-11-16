import app from './app';
import clock from './clock';

// Import the font files
import Alucrads from './assets/Alucrads.ttf';
import Inconsolata from './assets/Inconsolata.ttf';

// Set the canvas dimensions and resolution
const width = 1000;
const height = 500;
const resolution = 4;

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

    // Fullscreen Toggle Logic
    const fullscreenToggleButton = document.querySelector('#fullscreen-toggle') as HTMLButtonElement;
    const maximiseIcon = fullscreenToggleButton.querySelector('#max') as HTMLElement;
    const minimiseIcon = fullscreenToggleButton.querySelector('#min') as HTMLElement;

    fullscreenToggleButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            maximiseIcon.classList.remove('hidden');
            minimiseIcon.classList.add('hidden');
        } else {
            document.documentElement.requestFullscreen();
            maximiseIcon.classList.add('hidden');
            minimiseIcon.classList.remove('hidden');
        }
    });

    // Get the version from the development branch of the repository and display it on the page
    fetch('https://raw.githubusercontent.com/NotReeceHarris/asciidepths.com/refs/heads/development/web/package.json')
    .then(response => response.json())
    .then(data => {if (data.version) localStorage.setItem('version', data.version);})
    .catch(error => console.error('Failed to fetch package.json', error));

    const version = localStorage.getItem('version');
    if (version) {
        const versionElement = document.createElement('span');
        versionElement.textContent = version;
        versionElement.classList.add('absolute', 'bottom-0', 'left-0', 'text-xs', 'text-battleship-grey', 'p-2');
        document.body.appendChild(versionElement);
    }
});

import './assets/styles.css';