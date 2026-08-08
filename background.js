async function togglePin(tab) {
  if (!tab || tab.id === chrome.tabs.TAB_ID_NONE) {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  }
  if (!tab || tab.id === chrome.tabs.TAB_ID_NONE) return;
  const key = `pos-${tab.id}`;
  if (!tab.pinned) {
    await chrome.storage.session.set({
      [key]: { index: tab.index, windowId: tab.windowId }
    });
    await chrome.tabs.update(tab.id, { pinned: true });
  } else {
    await chrome.tabs.update(tab.id, { pinned: false });
    const stored = (await chrome.storage.session.get(key))[key];
    await chrome.storage.session.remove(key);
    if (stored && stored.windowId === tab.windowId) {
      const tabs = await chrome.tabs.query({ windowId: tab.windowId });
      const index = Math.min(stored.index, tabs.length - 1);
      await chrome.tabs.move(tab.id, { index });
    }
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`pos-${tabId}`);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-pin") togglePin();
});

chrome.action.onClicked.addListener((tab) => togglePin(tab));

function updateAction(tab) {
  if (!tab || tab.id === chrome.tabs.TAB_ID_NONE) return;
  const suffix = tab.pinned ? "" : "-gray";
  // Tab-close can fire updates for the dying tab, and setIcon's "No tab
  // with id" error escapes promise .catch — only reading lastError in a
  // callback marks it checked.
  const ignoreClosedTab = () => void chrome.runtime.lastError;
  chrome.action.setIcon({
    tabId: tab.id,
    path: {
      16: `icons/icon16${suffix}.png`,
      32: `icons/icon32${suffix}.png`
    }
  }, ignoreClosedTab);
  chrome.action.setTitle({
    tabId: tab.id,
    title: tab.pinned ? "Unpin tab" : "Pin tab"
  }, ignoreClosedTab);
}

async function refreshPinnedActions() {
  const tabs = await chrome.tabs.query({ pinned: true });
  tabs.forEach(updateAction);
}

async function updateMenuTitle() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  chrome.contextMenus.update("toggle-pin", {
    title: tab?.pinned ? "Unpin" : "Pin"
  });
}

chrome.runtime.onStartup.addListener(() => refreshPinnedActions());

chrome.runtime.onInstalled.addListener(async () => {
  refreshPinnedActions();
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create(
    {
      id: "toggle-pin",
      title: "Pin",
      contexts: ["page"],
      documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"]
    },
    () => updateMenuTitle()
  );
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-pin") togglePin(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateMenuTitle();
  // Refresh from the tab we land on (e.g. after closing another tab).
  try {
    updateAction(await chrome.tabs.get(activeInfo.tabId));
  } catch {
    // That tab is already gone too; nothing to update.
  }
});
chrome.windows.onFocusChanged.addListener(() => updateMenuTitle());
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.pinned !== undefined) updateMenuTitle();
  // Per-tab icon and title reset on navigation, so re-apply on load as well.
  if (changeInfo.pinned !== undefined || changeInfo.status === "loading") {
    updateAction(tab);
  }
});
