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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-pin",
    title: "Pin",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-pin") togglePin(tab);
});
