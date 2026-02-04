
'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const themes = [
    {
        name: 'theme-bluish',
        label: 'Bluish',
        colors: {
            light: {
                primary: '221 83% 53%',
                accent: '210 40% 94%',
                background: '210 40% 98%',
            },
            dark: {
                primary: '217 91% 60%',
                accent: '217 33% 22%',
                background: '222 84% 4%',
            }
        }
    },
    {
        name: 'theme-beige',
        label: 'Beige',
        colors: {
            light: {
                primary: '40 85% 60%',
                accent: '15 70% 70%',
                background: '45 50% 98%',
            },
            dark: {
                primary: '40 75% 70%',
                accent: '15 60% 60%',
                background: '30 10% 12%',
            }
        }
    }
];


type Theme = 'light' | 'dark'
type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme?: Theme
  useSystemTheme: boolean,
  setUseSystemTheme: (useSystem: boolean) => void,
  themes: typeof themes
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  attribute = 'class',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || defaultTheme
    } catch (e) {
      return defaultTheme
    }
  });

  const [useSystemTheme, setUseSystemThemeState] = useState(() => {
     try {
      const storedPreference = localStorage.getItem(`${storageKey}-system`);
      return storedPreference ? JSON.parse(storedPreference) : enableSystem;
    } catch (e) {
      return enableSystem;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme | undefined>();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        if (useSystemTheme) {
            const currentThemeName = themes.find(t => document.documentElement.className.includes(t.name))?.name || themes[0].name;
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(systemTheme);
            
            // Ensure the correct theme name class is present
            if (!document.documentElement.classList.contains(currentThemeName)) {
                themes.forEach(t => document.documentElement.classList.remove(t.name));
                document.documentElement.classList.add(currentThemeName);
            }
        }
    };

    handleMediaChange();
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [useSystemTheme, theme]);


  useEffect(() => {
    const root = window.document.documentElement
    
    // Clear all theme classes
    root.classList.remove(...themes.map(t => t.name));
    root.classList.remove('light', 'dark');
    
    let themeToApply: string;

    if (useSystemTheme) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
        // When using system theme, we might still have a preferred color palette.
        // Let's default to the first theme in our list if none is explicitly set.
        const activeColorTheme = themes.find(t => t.name === theme)?.name || themes[0].name;
        themeToApply = activeColorTheme;

    } else {
        themeToApply = theme;
        // For manual theme selection, we need to decide on light/dark.
        // For now, let's assume manual themes are applied over a default 'light' mode
        // unless the theme name itself implies dark mode.
        // A better approach would be to have separate light/dark mode toggles.
        // For simplicity, let's just add 'light' by default. This could be enhanced later.
        root.classList.add('light'); 
        setResolvedTheme('light');
    }

    const selectedTheme = themes.find(t => t.name === themeToApply);
    if (selectedTheme) {
      root.classList.add(selectedTheme.name);
    } else {
      // Fallback to the first theme if the stored one is invalid
      root.classList.add(themes[0].name);
    }

  }, [theme, useSystemTheme]);

  const setTheme = (newTheme: string) => {
    try {
      localStorage.setItem(storageKey, newTheme);
      localStorage.setItem(`${storageKey}-system`, JSON.stringify(false));
    } catch (e) {
      // ignore
    }
    setThemeState(newTheme);
    setUseSystemThemeState(false);
  };

  const setUseSystemTheme = (useSystem: boolean) => {
    try {
        localStorage.setItem(`${storageKey}-system`, JSON.stringify(useSystem));
    } catch (e) {}
    setUseSystemThemeState(useSystem);
  };
  
  const value = useMemo(() => ({
    theme: theme,
    setTheme,
    resolvedTheme,
    useSystemTheme,
    setUseSystemTheme,
    themes
  }), [theme, resolvedTheme, useSystemTheme]);

  return (
    <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
