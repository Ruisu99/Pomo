const RULE_ID_BASE = 1000;
const ALARM_NAME = "pomo-focus-expiry";

async function updateBlockingRules(blockingActive, blockedSites) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  if (!blockingActive || !blockedSites?.length) {
    if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: [],
      });
    }
    return;
  }

  const addRules = blockedSites.map((site, index) => ({
    id: RULE_ID_BASE + index,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" },
    },
    condition: {
      urlFilter: `||${site}^`,
      resourceTypes: ["main_frame"],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules,
  });
}

function scheduleExpiry(endsAt) {
  chrome.alarms.clear(ALARM_NAME);
  if (endsAt == null || endsAt <= Date.now()) return;
  chrome.alarms.create(ALARM_NAME, { when: endsAt });
}

async function applyFocusState({ blockingActive, blockedSites, endsAt }) {
  const stillBlocking =
    blockingActive && endsAt != null ? endsAt > Date.now() : Boolean(blockingActive);

  await chrome.storage.local.set({ blockingActive: stillBlocking, blockedSites, endsAt });
  await updateBlockingRules(stillBlocking, blockedSites);
  scheduleExpiry(stillBlocking ? endsAt : null);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "POMO_FOCUS_SYNC") return;

  applyFocusState(message)
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  updateBlockingRules(false, []);
  chrome.storage.local.set({ blockingActive: false });
});

chrome.storage.local.get(["blockingActive", "blockedSites", "endsAt"], (data) => {
  applyFocusState({
    blockingActive: data.blockingActive,
    blockedSites: data.blockedSites ?? [],
    endsAt: data.endsAt ?? null,
  });
});
