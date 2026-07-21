"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

/** Keep <html lang> in sync with the user’s language setting. */
export function HtmlLangSync() {
  const language = useAppStore((s) => s.settings.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
