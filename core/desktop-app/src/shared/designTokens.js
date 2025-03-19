/**
 * Design Tokens for Clipboard Sync
 * Shared between desktop and web applications
 */

const designTokens = {
    // Color Palette
    colors: {
        // Primary Brand Colors
        brand: {
            primary: '#6366F1', // Indigo
            secondary: '#8B5CF6', // Purple
            tertiary: '#EC4899', // Pink
            accent: '#0EA5E9', // Sky blue
        },

        // UI Colors
        ui: {
            background: {
                primary: 'rgba(15, 23, 42, 0.8)', // Slate 900 with transparency
                secondary: 'rgba(30, 41, 59, 0.75)', // Slate 800 with transparency
                tertiary: 'rgba(51, 65, 85, 0.6)', // Slate 700 with transparency
            },
            foreground: {
                primary: 'rgba(248, 250, 252, 0.95)', // Slate 50
                secondary: 'rgba(248, 250, 252, 0.7)', // Slate 50 with opacity
                tertiary: 'rgba(248, 250, 252, 0.5)', // Slate 50 with more opacity
            },
            border: {
                default: 'rgba(148, 163, 184, 0.2)', // Slate 400 with transparency
                hover: 'rgba(148, 163, 184, 0.4)', // Slate 400 with less transparency
                focus: 'rgba(99, 102, 241, 0.6)', // Indigo with transparency
            }
        },

        // Status Colors
        status: {
            success: '#10B981', // Emerald
            warning: '#F59E0B', // Amber
            error: '#EF4444', // Red
            info: '#0EA5E9', // Sky
        },

        // Light Mode Overrides
        light: {
            ui: {
                background: {
                    primary: 'rgba(248, 250, 252, 0.8)', // Slate 50 with transparency
                    secondary: 'rgba(241, 245, 249, 0.75)', // Slate 100 with transparency
                    tertiary: 'rgba(226, 232, 240, 0.6)', // Slate 200 with transparency
                },
                foreground: {
                    primary: 'rgba(15, 23, 42, 0.95)', // Slate 900
                    secondary: 'rgba(15, 23, 42, 0.7)', // Slate 900 with opacity
                    tertiary: 'rgba(15, 23, 42, 0.5)', // Slate 900 with more opacity
                },
                border: {
                    default: 'rgba(148, 163, 184, 0.2)', // Slate 400 with transparency
                    hover: 'rgba(71, 85, 105, 0.3)', // Slate 600 with transparency
                    focus: 'rgba(99, 102, 241, 0.6)', // Indigo with transparency
                }
            }
        }
    },

    // Typography
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        fontSizes: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem', // 36px
        },
        fontWeights: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        lineHeights: {
            none: 1,
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
        }
    },

    // Spacing
    spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px  
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
    },

    // Borders
    borders: {
        radius: {
            none: '0',
            sm: '0.125rem',    // 2px
            DEFAULT: '0.25rem', // 4px
            md: '0.375rem',     // 6px
            lg: '0.5rem',       // 8px
            xl: '0.75rem',      // 12px
            '2xl': '1rem',      // 16px
            '3xl': '1.5rem',    // 24px
            full: '9999px',     // Full roundness
        },
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
    },

    // Animations
    animations: {
        durations: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
        },
        timingFunctions: {
            linear: 'linear',
            ease: 'ease',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
    },

    // Glass effect settings
    glass: {
        background: 'rgba(255, 255, 255, 0.08)',
        backdrop: 'blur(12px) saturate(180%)'
    }
};

export default designTokens;