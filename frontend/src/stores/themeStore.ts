import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem('nexo_theme');
  const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');

  return {
    dark,
    toggle: () => set((state) => {
      const next = !state.dark;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('nexo_theme', next ? 'dark' : 'light');
      return { dark: next };
    }),
  };
});
