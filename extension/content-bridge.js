window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.type !== "POMO_FOCUS_SYNC") return;

  chrome.runtime.sendMessage(data).catch(() => {
    /* extension not installed */
  });
});

try {
  const raw = localStorage.getItem("pomodoro:focus-block");
  if (raw) {
    const state = JSON.parse(raw);
    chrome.runtime.sendMessage({ type: "POMO_FOCUS_SYNC", ...state }).catch(() => {});
  }
} catch {
  /* ignore */
}
