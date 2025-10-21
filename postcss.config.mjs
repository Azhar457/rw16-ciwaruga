// postcss.config.mjs
const config = {
  theme: {
    extend: {
      keyframes: {
        "toast-in": {
          from: {
            opacity: "0",
            transform: "translateX(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "toast-in": "toast-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: ["@tailwindcss/postcss"],
};

export default config;
