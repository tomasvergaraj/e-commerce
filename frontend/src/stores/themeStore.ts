import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

let themeTransitionTimer: number | null = null;

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.themeMode = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

function animateThemeTransition() {
  document.documentElement.classList.remove('theme-switching');
  void document.documentElement.offsetWidth;
  document.documentElement.classList.add('theme-switching');

  if (themeTransitionTimer !== null) {
    window.clearTimeout(themeTransitionTimer);
  }

  themeTransitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
    themeTransitionTimer = null;
  }, 260);
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem('nexo_theme');
  const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(dark);

  return {
    dark,
    toggle: () => set((state) => {
      const next = !state.dark;
      animateThemeTransition();
      applyTheme(next);
      localStorage.setItem('nexo_theme', next ? 'dark' : 'light');
      return { dark: next };
    }),
  };
});
