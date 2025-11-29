/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            colors: {
                coral: {
                    50: '#fff5f3',
                    100: '#ffe8e4',
                    200: '#ffd1c9',
                    300: '#ffb1a3',
                    400: '#ff8266',
                    500: '#ff6b4a',
                    600: '#ed4822',
                    700: '#c83818',
                    800: '#a53218',
                    900: '#88301b',
                },
                gray: {
                     50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    750: '#2d3542', // Custom intermediate shade
                    800: '#1f2937',
                    900: '#111827',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}

