import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppFramePage } from "./pages/RackPage";
import { BoardPage } from "./pages/BoardPage";
import { HomePage } from "./pages/HomePage";
import { useThemeStore } from "@stores/themeStore";

export default function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/board/:projectId" element={<BoardPage />} />
      <Route path="/rack-editor-demo" element={<AppFramePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
