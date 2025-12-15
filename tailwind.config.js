/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                playfair: ['"Playfair Display"', 'serif'],
            },
            colors: {
                slate: {
                    950: '#0f172a',
                    200: '#e2e8f0',
                }
            }
        },
    },
    plugins: [],
}
