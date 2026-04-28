/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // !important sur chaque utilitaire pour passer au-dessus de Materialize/vendor CSS
  important: true,
  corePlugins: {
    // preflight désactivé pour ne pas casser les styles Materialize existants
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f0f7',
          100: '#cce1ef',
          500: '#005081',
          600: '#004070',
          700: '#003060',
        },
      },
    },
  },
  plugins: [],
};
