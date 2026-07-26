async function togglePin(tab) {
  if (!tab) {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  }
  if (tab) {
    await chrome.tabs.update(tab.id, { pinned: !tab.pinned });
  }
}

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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(
    {
      id: "toggle-pin",
      title: "Pin",
      contexts: ["page"]
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
