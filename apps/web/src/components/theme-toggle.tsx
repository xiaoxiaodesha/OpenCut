"use client";

import { Button } from "./ui/button";
import { Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 只在客户端挂载后使用实际主题，避免 hydration 错误
  const displayText = mounted
    ? resolvedTheme === "dark"
      ? "Light"
      : "Dark"
    : "Toggle theme";

  return (
    <Button
      size="icon"
      variant="text"
      className="h-7"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="!size-[1.1rem]" />
      <span className="sr-only">{displayText}</span>
    </Button>
  );
}
