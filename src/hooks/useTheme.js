// src/hooks/useTheme.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, updateSystemTheme } from '../store/slices/uiSlice';

/**
 * ✅ useTheme Hook - For theme management
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const { theme, systemTheme } = useSelector(state => state.ui);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine effective theme
    const effectiveTheme = theme === 'auto' ? systemTheme : theme;
    
    // Apply theme class
    root.classList.add(effectiveTheme);
    
    // Update color-scheme for better browser integration
    root.style.colorScheme = effectiveTheme;
    
    // Smooth transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
  }, [theme, systemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      dispatch(updateSystemTheme());
    };
    
    dispatch(updateSystemTheme());
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const setThemeMode = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const isDark = theme === 'dark' || (theme === 'auto' && systemTheme === 'dark');
  const isLight = theme === 'light' || (theme === 'auto' && systemTheme === 'light');
  const isAuto = theme === 'auto';

  return {
    theme,
    systemTheme,
    isDark,
    isLight,
    isAuto,
    toggleTheme,
    setThemeMode,
    effectiveTheme: theme === 'auto' ? systemTheme : theme
  };
};

export default useTheme;