// Ephemeral service worker state managed via chrome.storage

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "evaluate-evidence",
    title: "Evaluate selected text with CutBase",
    contexts: ["selection"]
  });
});

// Open Side Panel on Extension Action click
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle Context Menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "evaluate-evidence" && tab) {
    const selectedText = info.selectionText;
    const pageUrl = tab.url || "";
    const pageTitle = tab.title || "Selected Web Source";
    
    // Parse citation year (heuristic)
    const yearMatch = selectedText.match(/\b((?:19|20)\d{2})\b/) || pageUrl.match(/\b((?:19|20)\d{2})\b/);
    const parsedYear = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    // Store in chrome.storage for side panel retrieval
    await chrome.storage.local.set({
      pendingAnalysis: {
        text: selectedText,
        url: pageUrl,
        title: pageTitle,
        year: parsedYear,
        timestamp: Date.now()
      }
    });

    // Open side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });

    // Send a runtime message to notify side panel if it's already open
    try {
      await chrome.runtime.sendMessage({ action: "load_selection" });
    } catch (err) {
      // Ignore: panel may not be open yet
    }
  }
});
