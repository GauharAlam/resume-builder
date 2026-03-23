import React, { createContext, useContext, useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('resumeai-theme');
    return (stored as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('resumeai-theme', theme);
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Colors Configuration
export const themeConfig = {
  light: {
    background: 'bg-white',
    surface: 'bg-gray-50',
    surfaceAlt: 'bg-gray-100',
    border: 'border-gray-200',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
    },
    input: {
      background: 'bg-white',
      border: 'border-gray-300',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
    card: 'bg-white border-gray-200 shadow-sm',
    header: 'bg-white border-gray-200',
  },
  dark: {
    background: 'bg-slate-950',
    surface: 'bg-slate-900',
    surfaceAlt: 'bg-slate-800',
    border: 'border-slate-700',
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      muted: 'text-slate-400',
    },
    input: {
      background: 'bg-slate-800',
      border: 'border-slate-700',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
    card: 'bg-slate-900 border-slate-700',
    header: 'bg-slate-900 border-slate-700',
  },
};

// Theme Toggle Button Component
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all ${
        theme === 'dark'
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
      }`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
};

// Helper Hook to get current theme colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return themeConfig[theme];
};