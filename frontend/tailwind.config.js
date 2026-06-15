/** @type {import('tailwindcss').Config} */
// Paleta inspirada en el degradado cian → verde sobre azul oscuro.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#141C27", // fondo principal (azul-marino oscuro)
          surface: "#1E2A38", // tarjetas / paneles
          surface2: "#27374A", // hover / cabeceras de tabla
          input: "#16202C", // fondo de inputs
          border: "#324558", // bordes
          muted: "#93A4B8", // texto secundario
          cyan: "#16A8DA", // azul cian del logo
          teal: "#1CB5A6", // teal intermedio
          green: "#46B45A", // verde del logo
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #16A8DA 0%, #46B45A 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "slide-in-left": "slide-in-left 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
