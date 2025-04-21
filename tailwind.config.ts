
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
					cyan: '#00FFFF',    // Bright cyan
					pink: '#FF10F0',    // Vibrant pink
					blue: '#1EAEDB',    // Azure blue
					purple: '#8B5CF6',  // Vibrant purple
					green: '#80FFDB',   // Mint green
					orange: '#FF9F1C',  // Bright orange
					yellow: '#FFD166',  // Golden yellow
					red: '#FF5E5B',     // Coral red
					magenta: '#FF36AB', // Hot magenta
					turquoise: '#06D6A0', // Turquoise
					violet: '#9D4EDD',  // Electric violet
					indigo: '#7209B7',  // Deep indigo
					amber: '#FB8500',   // Amber
					emerald: '#2DC653'  // Emerald green
				},
				// Enhanced chart colors for better data visualization
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
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)' }
				},
				'bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-25%)' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				'text-shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'clean-data': {
					'0%': { opacity: '0.3', filter: 'blur(2px)' },
					'50%': { opacity: '0.7', filter: 'blur(1px) brightness(1.2)' },
					'75%': { filter: 'blur(0) brightness(1.5) drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))' },
					'100%': { opacity: '1', filter: 'none' }
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
				'shimmer': 'shimmer 2s infinite linear',
				'fade-in': 'fade-in 0.3s ease-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'bounce': 'bounce 1s infinite',
				'ripple': 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',
				'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
				'clean-data': 'clean-data 1.5s ease-in-out forwards'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'grid-pattern': 'linear-gradient(to right, #1A1F2C 1px, transparent 1px), linear-gradient(to bottom, #1A1F2C 1px, transparent 1px)',
				'data-shimmer': 'linear-gradient(to right, rgba(255,255,255,0) 0, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0) 100%)',
				'neon-glow': 'linear-gradient(120deg, #8B5CF6, #00FFFF, #FF10F0)',
				'text-shimmer': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)'
			},
			boxShadow: {
				'neon': '0 0 5px rgba(139, 92, 246, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
				'neon-hover': '0 0 10px rgba(139, 92, 246, 0.8), 0 0 30px rgba(0, 255, 255, 0.5), 0 0 50px rgba(255, 16, 240, 0.3)',
				'button': '0 4px 14px 0 rgba(139, 92, 246, 0.2)',
				'card-hover': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
				'input-focus': '0 0 0 2px rgba(139, 92, 246, 0.4)'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						color: 'inherit',
						a: {
							color: 'inherit',
							opacity: 0.8,
							'&:hover': {
								opacity: 1,
							},
							textDecoration: 'underline',
							textDecorationColor: 'rgba(139, 92, 246, 0.4)',
							textUnderlineOffset: '3px',
						},
						h1: {
							letterSpacing: '-0.025em',
						},
						h2: {
							letterSpacing: '-0.025em',
						},
						h3: {
							letterSpacing: '-0.025em',
						},
						blockquote: {
							borderLeftColor: 'rgba(139, 92, 246, 0.4)',
							opacity: 0.8,
						},
						'thead th': {
							color: 'inherit',
						},
						'tbody tr, tbody td': {
							borderBottomColor: 'rgb(51, 65, 85)'
						},
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
