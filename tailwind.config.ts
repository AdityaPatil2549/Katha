import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme variables
        midnight: {
          bg: 'var(--color-bg-base)',        // True deep space black-violet
          surface: 'var(--color-surface)',    // Deep cinematic indigo
          'surface-hover': 'var(--color-surface-hover)', 
          border: 'var(--color-border)',     // Brightened borders for better contrast
          divider: 'var(--color-divider)',    
        },
        
        // Text Colors
        text: {
          primary: 'var(--color-text-primary)',    // Crisp white for highest contrast
          secondary: 'var(--color-text-secondary)',  // Cool metallic gray
          muted: 'var(--color-text-muted)',      // Cool muted gray
          quote: 'var(--color-text-quote)',
          'high-contrast': 'var(--color-high-contrast-text)',       
        },
        
        // High Contrast Backgrounds
        'high-contrast': 'var(--color-high-contrast-bg)',
        
        // Accent System (Vibrant & Neon)
        accent: {
          primary: 'var(--color-accent-primary)',
          violet: '#8A2BE2',    // Electric Purple
          cyan: '#00F2FE',      // Neon Cyan
          rose: '#FF007F',      // Neon Magenta/Pink
          emerald: '#00FA9A',   // Neon Mint/Emerald
          amber: '#FFD700',     // Vivid Cinematic Gold
        },
        
        // Mood Color Mapping (Highly Saturated)
        mood: {
          inspired: '#00F2FE',  // Cyan
          emotional: '#FF007F', // Magenta
          calm: '#00FA9A',      // Mint
          thoughtful: '#8A2BE2', // Purple
          intense: '#FF4500',   // Orange/Red
          dark: '#11121C',      // Deep Indigo
        },
      },
      
      // Typography System
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Syne', 'Playfair Display', 'serif'],
      },
      
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '1.4' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      
      // Spacing System (8px grid)
      spacing: {
        'micro': '4px',     
        'tight': '8px',     
        'normal': '16px',   
        'section': '24px',  
        'major': '32px',    
        'page': '48px',     
      },
      
      // Border Radius
      borderRadius: {
        'small': '8px',     
        'card': '16px',     
        'modal': '20px',    
        'button': '12px',   
        'chip': '9999px',   
      },
      
      // Shadow System (Vibrant Glowing Shadows)
      boxShadow: {
        'card': '0 10px 30px var(--color-shadow)',
        'card-hover': '0 20px 40px var(--color-shadow-hover)',
        'soft': '0 10px 40px var(--color-shadow)',
        'glow': '0 0 40px var(--color-accent-glow)', // Dynamic primary glow
        'glow-cyan': '0 0 40px rgba(0, 242, 254, 0.4)', // Cyan glow
        'glow-rose': '0 0 40px rgba(255, 0, 127, 0.4)', // Magenta glow
      },
      
      // Animation & Motion
      transitionDuration: {
        'fast': '150ms',    
        'normal': '250ms',  
        'slow': '400ms',    
      },
      
      transitionTimingFunction: {
        'calm': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)' },
          '50%': { boxShadow: '0 0 50px rgba(0, 242, 254, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      
      // Custom gradients (Neon & Cinematic)
      backgroundImage: {
        'gradient-midnight': 'radial-gradient(circle at top right, var(--color-surface) 0%, var(--color-bg-base) 100%)',
        'gradient-primary': 'linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)',
        'gradient-violet': 'linear-gradient(135deg, #8A2BE2 0%, #4A00E0 100%)', 
        'gradient-cyan': 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',   
        'gradient-rose': 'linear-gradient(135deg, #FF007F 0%, #B92B27 100%)',   
        'gradient-cinematic': 'linear-gradient(135deg, #FF007F 0%, #8A2BE2 50%, #00F2FE 100%)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")',
      },
    },
  },
  plugins: [],
} satisfies Config;
