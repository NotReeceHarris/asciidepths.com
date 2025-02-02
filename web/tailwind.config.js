const colours = require('./src/constants/colours.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["index.html", "src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        "smoky-black": colours["smoky-black"],
        "battleship-grey": colours["battleship-grey"],
      }
    },
  },
  plugins: [],
}