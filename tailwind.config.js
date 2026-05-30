/** @type {import('tailwindcss').Config} */
const { Colors } = require('./src/constants/Colors');
// From Colors, get all theme and property combinations for safelist
const generateSafelist = () => {
  const themes = Object.keys(Colors);
  const properties = [];

  // Get all unique property names across all themes
  themes.forEach(theme => {
    Object.keys(Colors[theme]).forEach(prop => {
      if (!properties.includes(prop)) {
        properties.push(prop);
      }
    });
  });

  // Generate safelist items for all combinations
  const safelistItems = [];

  themes.forEach(theme => {
    properties.forEach(prop => {
      // Text colors
      safelistItems.push(`text-${theme}-${prop}`);
      // Background colors
      safelistItems.push(`bg-${theme}-${prop}`);
      // Border colors
      safelistItems.push(`border-${theme}-${prop}`);
    });
  });

  return safelistItems;
};

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        greenBlack: Colors.greenBlack,
        blueWhite: Colors.blueWhite,
        orangeWhite: Colors.orangeWhite,
      },
    },
  },
  plugins: [],
  // Explicitly list all possible theme class combinations
  safelist: generateSafelist(),
  darkMode: "class"
};
