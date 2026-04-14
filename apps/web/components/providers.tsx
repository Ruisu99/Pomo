"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

const POMO_RED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1440" preserveAspectRatio="none" viewBox="0 0 1440 1440"><g mask="url(#m)" fill="none"><rect width="1440" height="1440" x="0" y="0" fill="rgba(169, 0, 0, 1)"/><path d="M0,552.865C102.663,532.369,200.245,504.997,290.964,452.749C385.635,398.224,478.863,337.993,535.4,244.509C595.906,144.462,639.932,26.015,618.562,-88.936C597.455,-202.473,504.015,-284.37,421.97,-365.639C345.346,-441.539,262.279,-510.547,159.603,-543.558C55.212,-577.121,-59.489,-591.038,-162.541,-553.564C-262.967,-517.045,-319.695,-418.126,-394.682,-341.994C-475.536,-259.905,-604.162,-203.27,-619.978,-89.139C-635.797,25.014,-511.023,107.114,-471.945,215.53C-427.81,337.976,-482.505,510.34,-376.616,586.027C-271.97,660.826,-126.141,578.048,0,552.865" fill="#870000"/><path d="M1440 2034.4270000000001C1560.462 2064.49 1706.787 2083.573 1803.827 2006.125 1901.3220000000001 1928.313 1864.982 1771.165 1913.725 1656.343 1960.575 1545.98 2071.828 1466.824 2083.423 1347.49 2096.24 1215.587 2077.583 1061.805 1980.232 971.886 1883.172 882.235 1730.759 901.406 1598.642 899.714 1494.774 898.383 1403.075 950.3620000000001 1299.991 963.172 1169.662 979.3679999999999 1006.69 891.107 914.58 984.721 824.23 1076.545 925.434 1235.873 906.319 1363.268 887.025 1491.854 739.403 1617.456 802.589 1731.096 867.48 1847.8020000000001 1056.171 1792.249 1176.747 1849.629 1275.559 1896.652 1333.826 2007.9299999999998 1440 2034.4270000000001" fill="#cb0000"/></g><defs><mask id="m"><rect width="1440" height="1440" fill="#fff"/></mask></defs></svg>`;

function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/%0A/g, "")
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/");
  return `url("data:image/svg+xml,${encoded}")`;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const theme = useAppStore((s) => s.settings.theme);
  const bgPreset = useAppStore((s) => s.settings.backgroundPreset);
  const bgSolid = useAppStore((s) => s.settings.backgroundSolid);
  const bgImage = useAppStore((s) => s.settings.backgroundImageDataUrl);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.add("light");
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-bg", bgSolid);
    if (bgPreset === "pomoRed") {
      root.style.setProperty("--app-bg-image", svgToDataUrl(POMO_RED_SVG));
      root.style.setProperty("--app-footer-color", "rgba(255,255,255,0.78)");
    } else if (bgPreset === "customImage" && typeof bgImage === "string" && bgImage.length > 0) {
      root.style.setProperty("--app-bg-image", `url("${bgImage}")`);
      root.style.setProperty("--app-footer-color", "rgba(255,255,255,0.8)");
    } else {
      root.style.setProperty("--app-bg-image", "none");
      root.style.setProperty("--app-footer-color", "var(--color-muted)");
    }
  }, [bgPreset, bgSolid, bgImage]);

  return <>{children}</>;
}

export function TimerSync() {
  const sync = useAppStore((s) => s.sync);
  useEffect(() => {
    const id = window.setInterval(() => {
      sync(Date.now());
    }, 250);
    return () => window.clearInterval(id);
  }, [sync]);
  return null;
}
