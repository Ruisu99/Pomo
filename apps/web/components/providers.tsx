"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

const POMO_RED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1440" preserveAspectRatio="none" viewBox="0 0 1440 1440"><g mask="url(#m)" fill="none"><rect width="1440" height="1440" x="0" y="0" fill="rgba(223, 60, 60, 1)"/><path d="M0,643.083C124.35,652.364,259.569,632.721,355.19,552.686C447.872,475.111,469.083,344.587,497.092,227.014C520.712,127.865,513.106,29.045,504.124,-72.482C494.609,-180.033,515.701,-304.033,443.045,-383.901C370.484,-463.665,238.77,-432.583,139.102,-473.738C22.594,-521.847,-64.895,-664.7,-189.404,-645.052C-311.703,-625.752,-364.298,-479.325,-441.064,-382.184C-514.166,-289.679,-603.895,-205.717,-627.82,-90.267C-652.445,28.561,-630.222,154.553,-574.649,262.433C-520.469,367.609,-421.309,436.756,-322.675,502.092C-222.796,568.252,-119.472,634.166,0,643.083\" fill=\"#c32020\"/><path d=\"M1440 2014.288C1542.317 1987.7359999999999 1612.633 1902.917 1707.3899999999999 1856.067 1818.558 1801.1019999999999 1976.835 1820.125 2043.806 1715.749 2110.078 1612.462 2051.325 1475.972 2028.655 1355.364 2006.9099999999999 1239.679 1994.065 1115.6 1914.665 1028.701 1836.01 942.617 1712.453 925.672 1601.97 888.379 1486.583 849.43 1371.161 773.36 1253.723 805.6 1135.979 837.924 1064.127 953.855 995.5319999999999 1054.866 933.168 1146.701 899.993 1250.399 877.803 1359.1680000000001 854.371 1474.025 831.299 1590.613 863.221 1703.406 898.237 1827.133 952.3779999999999 1961.615 1065.57 2022.625 1177.7359999999999 2083.082 1316.663 2046.295 1440 2014.288\" fill=\"#e76d6d\"/></g><defs><mask id=\"m\"><rect width=\"1440\" height=\"1440\" fill=\"#fff\"/></mask></defs></svg>`;

const POMO_SLATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1440" preserveAspectRatio="none" viewBox="0 0 1440 1440"><g mask="url(#m)" fill="none"><rect width="1440" height="1440" x="0" y="0" fill="rgba(69, 79, 103, 1)"/><path d="M0,697.414C128.654,696.881,207.438,556.977,301.623,469.334C379.563,396.807,446.738,320.14,502.738,229.593C566.239,126.917,645.946,27.262,649.657,-93.407C653.649,-223.239,624.164,-371.434,523.754,-453.836C424.088,-535.627,274.887,-480.683,148.248,-504.887C37.674,-526.021,-60.864,-602.7,-172.322,-586.876C-290.85,-570.048,-407.721,-511.333,-479.771,-415.724C-550.25,-322.199,-530.64,-194.377,-554.504,-79.726C-580.322,44.315,-678.312,170.489,-625.786,285.787C-573.265,401.075,-409.075,402.217,-303.232,471.838C-195.807,542.5,-128.581,697.946,0,697.414" fill="#2d3343"/><path d="M1440 2016.248C1548.374 1999.088 1654.009 1975.935 1747.16 1917.95 1841.306 1859.346 1927.386 1784.492 1973.976 1683.858 2020.693 1582.95 2026.071 1467.998 2006.116 1358.605 1986.644 1251.857 1929.743 1159.05 1862.681 1073.745 1792.82 984.879 1713.571 904.695 1611.348 856.443 1497.05 802.491 1366.722 742.251 1247.145 783.195 1128.022 823.984 1066.5140000000001 953.461 1005.819 1063.78 954.548 1156.971 939.76 1260.634 926.414 1366.157 913.294 1469.899 907.481 1571.109 928.706 1673.5 954.777 1799.27 956.556 1954.721 1063.246 2026.241 1169.755 2097.64 1313.352 2036.3020000000001 1440 2016.248" fill="#5d6b8b"/></g><defs><mask id="m"><rect width="1440" height="1440" fill="#fff"/></mask></defs></svg>`;

const POMO_GOLD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1440" preserveAspectRatio="none" viewBox="0 0 1440 1440"><g mask="url(#m)" fill="none"><rect width="1440" height="1440" x="0" y="0" fill="rgba(215, 176, 15, 1)"/><path d="M0,697.414C128.654,696.881,207.438,556.977,301.623,469.334C379.563,396.807,446.738,320.14,502.738,229.593C566.239,126.917,645.946,27.262,649.657,-93.407C653.649,-223.239,624.164,-371.434,523.754,-453.836C424.088,-535.627,274.887,-480.683,148.248,-504.887C37.674,-526.021,-60.864,-602.7,-172.322,-586.876C-290.85,-570.048,-407.721,-511.333,-479.771,-415.724C-550.25,-322.199,-530.64,-194.377,-554.504,-79.726C-580.322,44.315,-678.312,170.489,-625.786,285.787C-573.265,401.075,-409.075,402.217,-303.232,471.838C-195.807,542.5,-128.581,697.946,0,697.414" fill="#8c720a"/><path d="M1440 2016.248C1548.374 1999.088 1654.009 1975.935 1747.16 1917.95 1841.306 1859.346 1927.386 1784.492 1973.976 1683.858 2020.693 1582.95 2026.071 1467.998 2006.116 1358.605 1986.644 1251.857 1929.743 1159.05 1862.681 1073.745 1792.82 984.879 1713.571 904.695 1611.348 856.443 1497.05 802.491 1366.722 742.251 1247.145 783.195 1128.022 823.984 1066.5140000000001 953.461 1005.819 1063.78 954.548 1156.971 939.76 1260.634 926.414 1366.157 913.294 1469.899 907.481 1571.109 928.706 1673.5 954.777 1799.27 956.556 1954.721 1063.246 2026.241 1169.755 2097.64 1313.352 2036.3020000000001 1440 2016.248" fill="#f2d045"/></g><defs><mask id="m"><rect width="1440" height="1440" fill="#fff"/></mask></defs></svg>`;

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
    } else if (bgPreset === "pomoSlate") {
      root.style.setProperty("--app-bg-image", svgToDataUrl(POMO_SLATE_SVG));
      root.style.setProperty("--app-footer-color", "rgba(255,255,255,0.78)");
    } else if (bgPreset === "pomoGold") {
      root.style.setProperty("--app-bg-image", svgToDataUrl(POMO_GOLD_SVG));
      root.style.setProperty("--app-footer-color", "rgba(255,255,255,0.82)");
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
