import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			},
			backgroundImage: {
				letterBackground: "url('/assets/letter_bg.png')",
				'letterBackground-White':
					"linear-gradient(rgba(255, 255, 255, 0.6),rgba(255, 255, 255, 0.6)), url('/assets/letter_bg.png')",
				'letterBackground-Green':
					"linear-gradient(rgba(164, 229, 147, 0.6),rgba(164, 229, 147, 0.6)), url('/assets/letter_bg.png')",
				'letterBackground-Yellow':
					"linear-gradient(rgba(254, 251, 146, 0.6),rgba(254, 251, 146, 0.6)), url('/assets/letter_bg.png')",
				'page-game-background': "url('/assets/background.png')"
			},
			hueRotate: {
				'-270': '-270deg',
				270: '270deg',
				190: '190deg'
			},
			keyframes: {
				jump: {
					'0%': {
						transform: 'scale(100%)'
					},
					'10%': {
						transform: 'scale(90%)'
					},
					'50%': {
						transform: 'scale(110%)'
					},
					'100%': {
						transform: 'scale(105%)'
					}
				},
				'fade-out-expand': {
					'0%': {
						opacity: '1',
						transform: 'scale(100%)'
					},
					'100%': {
						opacity: '0',
						transform: 'scale(110%)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					}
				}
			},
			animation: {
				jump: 'jump 500ms ease-in-out',
				'fade-out-expand': 'fade-out-expand 500ms ease-in-out',
				'fade-out': 'fade-out 500ms ease-in-out'
			}
		}
	},
	plugins: [
		plugin(function ({ addUtilities }) {
			addUtilities({
				'.scrollbar-none': {
					'scrollbar-width': 'none',
					'&::-webkit-scrollbar': {
						display: 'none'
					}
				}
			});
		})
	]
};

export default config;
