import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('tf_theme') !== 'light');

  const toggle = () => setDark(d => {
    localStorage.setItem('tf_theme', !d ? 'dark' : 'light');
    return !d;
  });

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);