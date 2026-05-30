import React, { createContext, useContext, useState, useEffect } from 'react';
import { setStorage, getStorage } from "@/utils/storage";
import { Colors } from "@/constants/Colors";

interface ThemeProviderContextProps {
  theme: any;
  themeColors: any;
  toggleTheme: any;
}

export type ThemeType = 'greenBlack' | 'blueWhite' | 'orangeWhite'

const ThemeContext = createContext<ThemeProviderContextProps | undefined>(undefined);
export const SELECTED_THEME = 'theme-color';

export const DEFAULT_THEME = 'blueWhite'

export const ThemeContextGlobal = createContext<{
  theme: ThemeType;
  toggleTheme: (theme: ThemeType) => void;
}>({
  theme: 'blueWhite',
  toggleTheme: () => { },
});

export const useThemeGlobal = () => useContext(ThemeContextGlobal);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const theme = await getStorage(SELECTED_THEME)
        if (theme !== null) {
          setTheme(theme); // 从缓存中获取主题
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme(); // 在组件挂载时调用
  }, []);


  const toggleTheme = (themeType: ThemeType, _rest: string | undefined) => {
    if (Colors[themeType]) {

      setTheme(themeType); // 切换主题
      setStorage(SELECTED_THEME, themeType)
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeColors: Colors[theme], toggleTheme }}>
      <ThemeContextGlobal.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContextGlobal.Provider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeProviderContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};