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

async function updateMenuTitle() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  chrome.contextMenus.update("toggle-pin", {
    title: tab?.pinned ? "Unpin" : "Pin"
  });
}

chrome.runtime.onInstalled.addListener(async () => {
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

chrome.tabs.onActivated.addListener(() => updateMenuTitle());
chrome.windows.onFocusChanged.addListener(() => updateMenuTitle());
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.pinned !== undefined) updateMenuTitle();
});
