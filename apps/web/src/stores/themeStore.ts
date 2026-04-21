import { create } from "zustand";

export type AppTheme = "dark" | "light";

type ThemeStore = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

function applyThemeClass(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("theme-light", theme === "light");
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  setTheme: (theme) => {
    applyThemeClass(theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      applyThemeClass(theme);

      return { theme };
    });
  },
}));
