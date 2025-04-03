
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced color palette with more vibrant neon colors
				neon: {
					cyan: '#00FFFF',
					pink: '#FF10F0',
					blue: '#1EAEDB',
					purple: '#8B5CF6',
					green: '#80FFDB',
					orange: '#FF9F1C',
					yellow: '#FFD166',
					red: '#FF5E5B',
					magenta: '#FF36AB',
					turquoise: '#06D6A0',
					violet: '#9D4EDD',
					indigo: '#7209B7',
					amber: '#FB8500',
					emerald: '#2DC653'
				},
				chart: {
					purple: '#8B5CF6',
					cyan: '#00FFFF',
					pink: '#FF10F0',
					blue: '#1EAEDB',
					teal: '#64DFDF',
					orange: '#FF9F1C',
					'deep-purple': '#7400B8',
					mint: '#80FFDB',
					yellow: '#FFD166',
					red: '#FF5E5B',
					magenta: '#FF36AB',
					turquoise: '#06D6A0',
					violet: '#9D4EDD',
					indigo: '#7209B7',
					amber: '#FB8500',
					emerald: '#2DC653'
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
				'pulse-glow': {
					'0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 5px currentColor)' },
					'50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px currentColor)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'data-glow': {
					'0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(255, 16, 240, 0.4)' },
					'100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' }
				},
				'chart-fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite',
				'data-glow': 'data-glow 8s ease-in-out infinite',
				'chart-fade-in': 'chart-fade-in 0.5s ease-out',
				'shimmer': 'shimmer 2s infinite linear'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'grid-pattern': 'linear-gradient(to right, #1A1F2C 1px, transparent 1px), linear-gradient(to bottom, #1A1F2C 1px, transparent 1px)',
				'data-shimmer': 'linear-gradient(to right, rgba(255,255,255,0) 0, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0) 100%)',
				'neon-glow': 'linear-gradient(120deg, #8B5CF6, #00FFFF, #FF10F0)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
