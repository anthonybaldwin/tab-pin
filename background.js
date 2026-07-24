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
