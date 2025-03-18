
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Rainbow theme colors
				rainbow: {
					red: '#F97316',
					orange: '#FDBA74',
					yellow: '#FBBF24',
					green: '#10B981',
					blue: '#0EA5E9',
					indigo: '#6366F1',
					violet: '#8B5CF6',
					pink: '#D946EF',
				},
				// Pastel colors
				pastel: {
					red: '#FEC6A1',
					green: '#F2FCE2',
					yellow: '#FEF7CD',
					blue: '#D3E4FD',
					purple: '#E5DEFF',
					pink: '#FFDEE2',
					peach: '#FDE1D3',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-in': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-out': {
					from: { transform: 'translateY(0)', opacity: '1' },
					to: { transform: 'translateY(20px)', opacity: '0' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'blur-in': {
					from: { filter: 'blur(8px)', opacity: '0' },
					to: { filter: 'blur(0)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pulse-rainbow': {
					'0%, 100%': { 
						'background-position': '0% 50%',
					},
					'50%': { 
						'background-position': '100% 50%', 
					},
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'slide-out': 'slide-out 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'blur-in': 'blur-in 0.4s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-rainbow': 'pulse-rainbow 8s ease infinite',
				'spin-slow': 'spin-slow 12s linear infinite',
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
			},
			transitionTimingFunction: {
				'bounce-ease': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			backgroundImage: {
				'rainbow-gradient': 'linear-gradient(60deg, #5f2c82, #833ab4, #fd1d1d, #fcb045, #ffdb3a, #3a47d5, #2a0845)',
				'pastel-gradient': 'linear-gradient(to right, #fec6a1, #fee2d5, #fef7cd, #f2fce2, #d3e4fd, #e5deff, #ffdee2)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
