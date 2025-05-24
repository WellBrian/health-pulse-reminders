
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'default' | 'healing' | 'nature' | 'calm' | 'warm';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: {
    [key in Theme]: {
      name: string;
      description: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  default: {
    name: 'Healthcare Blue',
    description: 'Professional and trustworthy',
    colors: {
      primary: 'from-blue-50 via-white to-green-50',
      secondary: 'bg-blue-600',
      accent: 'border-blue-100',
      background: 'bg-white/80'
    }
  },
  healing: {
    name: 'Healing Purple',
    description: 'Gentle and therapeutic',
    colors: {
      primary: 'from-purple-50 via-pink-50 to-white',
      secondary: 'bg-purple-600',
      accent: 'border-purple-100',
      background: 'bg-white/90'
    }
  },
  nature: {
    name: 'Nature Green',
    description: 'Fresh and revitalizing',
    colors: {
      primary: 'from-emerald-50 via-green-50 to-teal-50',
      secondary: 'bg-emerald-600',
      accent: 'border-emerald-100',
      background: 'bg-white/85'
    }
  },
  calm: {
    name: 'Calm Ocean',
    description: 'Peaceful and serene',
    colors: {
      primary: 'from-cyan-50 via-blue-50 to-indigo-50',
      secondary: 'bg-cyan-600',
      accent: 'border-cyan-100',
      background: 'bg-white/85'
    }
  },
  warm: {
    name: 'Warm Care',
    description: 'Comforting and nurturing',
    colors: {
      primary: 'from-orange-50 via-amber-50 to-yellow-50',
      secondary: 'bg-orange-600',
      accent: 'border-orange-100',
      background: 'bg-white/90'
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('healthcare-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('healthcare-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
