/**
 * Enhanced Central Theme Provider
 * Perfect responsive design with seamless theme switching
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ConfigProvider, theme as antdTheme } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonOutlined, SunOutlined, BulbOutlined } from '@ant-design/icons';
import { themeConfig, darkThemeConfig, pureColors } from '@/styles/theme';
import { themePresets, ThemePresetKey } from '@/styles/themePresets';

type ThemeMode = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  density: Density;
  setDensity: (d: Density) => void;
  themePreset: ThemePresetKey;
  setThemePreset: (p: ThemePresetKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const THEME_BASELINE_VERSION = '2025-09-neutral-v1';
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemIsDark, setSystemIsDark] = useState(false);
  const [accentColor, setAccentColor] = useState(themePresets['neutral'].accent);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [density, setDensityState] = useState<Density>('comfortable');
  const [themePreset, setThemePresetState] = useState<ThemePresetKey>('neutral');

  // Determine if dark mode should be active
  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('sabpaisa-theme-mode') as ThemeMode;
    const savedAccent = localStorage.getItem('sabpaisa-accent-color');
    const savedDensity = (localStorage.getItem('sabpaisa-density') as Density) || undefined;
    const savedPreset = (localStorage.getItem('sabpaisa-theme-preset') as ThemePresetKey) || undefined;
    const savedVersion = localStorage.getItem('sabpaisa-theme-version');
    
    if (savedMode) {
      setModeState(savedMode);
    }
    
    if (savedAccent) {
      setAccentColor(savedAccent);
    } else {
      // Initialize accent from CSS variable if present
      try {
        const cssPrimary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        if (cssPrimary) setAccentColor(cssPrimary);
      } catch {}
    }

    if (savedDensity) setDensityState(savedDensity);
    if (savedPreset && themePresets[savedPreset]) setThemePresetState(savedPreset);

    // Force baseline visual if version changed
    if (savedVersion !== THEME_BASELINE_VERSION) {
      const neutral = themePresets['neutral'].accent;
      setThemePresetState('neutral');
      setAccentColor(neutral);
      localStorage.setItem('sabpaisa-theme-version', THEME_BASELINE_VERSION);
      localStorage.setItem('sabpaisa-theme-preset', 'neutral');
      localStorage.setItem('sabpaisa-accent-color', neutral);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save preferences to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setIsTransitioning(true);
    setModeState(newMode);
    localStorage.setItem('sabpaisa-theme-mode', newMode);
    
    // Add transition delay
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  const setAccentColorCallback = useCallback((color: string) => {
    setAccentColor(color);
    localStorage.setItem('sabpaisa-accent-color', color);
  }, []);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
    localStorage.setItem('sabpaisa-density', d);
  }, []);

  const setThemePreset = useCallback((p: ThemePresetKey) => {
    if (!themePresets[p]) return;
    setThemePresetState(p);
    localStorage.setItem('sabpaisa-theme-preset', p);
    // Apply preset accent
    const nextAccent = themePresets[p].accent;
    setAccentColor(nextAccent);
    localStorage.setItem('sabpaisa-accent-color', nextAccent);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  }, [mode, setMode]);

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number) => {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  };

  // Update CSS variables and theme attributes for dynamic theming
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const currentTheme = isDark ? darkThemeConfig : themeConfig;
    
    // Set theme attribute for CSS custom properties
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    body.className = `${isDark ? 'dark-theme' : 'light-theme'} theme-transition`;
    
    // Update accent color CSS vars if different from the base theme default
    const baseTheme = isDark ? darkThemeConfig : themeConfig;
    if (accentColor !== baseTheme.token.colorPrimary) {
      root.style.setProperty('--color-primary', accentColor);
      root.style.setProperty('--color-primary-hover', adjustColor(accentColor, -8));
      root.style.setProperty('--color-primary-active', adjustColor(accentColor, -16));
    } else {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-hover');
      root.style.removeProperty('--color-primary-active');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.token.colorBgContainer);
    }
    
    // Add theme transition class for smooth transitions
    const transitionTimeout = setTimeout(() => {
      body.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(transitionTimeout);
  }, [isDark, accentColor]);

  // Create dynamic theme with accent color
  const currentTheme = {
    ...(isDark ? darkThemeConfig : themeConfig),
    token: {
      ...(isDark ? darkThemeConfig : themeConfig).token,
      colorPrimary: accentColor,
      // Adjust related colors based on accent
      colorPrimaryHover: adjustColor(accentColor, -8),
      colorPrimaryActive: adjustColor(accentColor, -16),
      colorPrimaryText: accentColor,
      colorPrimaryTextHover: adjustColor(accentColor, -8),
      colorPrimaryTextActive: adjustColor(accentColor, -16),
    },
  };

  // Build algorithm list based on mode and density
  const algorithms = [
    isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    ...(density === 'compact' ? [antdTheme.compactAlgorithm] as any : []),
  ];

  const contextValue: ThemeContextType = {
    mode,
    isDark,
    setMode,
    toggleTheme,
    accentColor,
    setAccentColor: setAccentColorCallback,
    density,
    setDensity,
    themePreset,
    setThemePreset,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={{
        ...currentTheme,
        algorithm: algorithms as any,
        cssVar: { key: 'app' },
        hashed: false,
      }}>
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--color-bg-overlay)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(20px)',
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.1, 1],
                  opacity: 1,
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${accentColor}, ${adjustColor(accentColor, -20)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse)',
                  fontSize: '32px',
                  boxShadow: `0 20px 60px ${accentColor}40, 0 8px 20px ${accentColor}20`,
                }}
              >
                {mode === 'system' ? <BulbOutlined /> : isDark ? <MoonOutlined /> : <SunOutlined />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const theme = useTheme();
  
  if (!theme) return null;

  const getIcon = () => {
    switch (theme.mode) {
      case 'light': return <SunOutlined />;
      case 'dark': return <MoonOutlined />;
      case 'system': return <BulbOutlined />;
    }
  };

  const getLabel = () => {
    switch (theme.mode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'Auto';
    }
  };

  return (
    <motion.button
      onClick={theme.toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: theme.isDark 
          ? 'var(--glass-bg-card)' 
          : 'var(--glass-bg-primary)',
        border: '1px solid var(--color-border-glass)',
        borderRadius: '12px',
        padding: 'var(--spacing-sm) var(--spacing-lg)',
        color: theme.isDark ? 'var(--color-text-inverse)' : 'var(--color-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        fontWeight: 600,
        fontSize: 'var(--font-size-14)',
        transition: 'all var(--animation-duration-normal) var(--animation-easing)',
        backdropFilter: 'var(--glass-backdrop-filter)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <motion.span
        animate={{ rotate: theme.mode === 'system' ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {getIcon()}
      </motion.span>
      {getLabel()}
    </motion.button>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
