const tabs = {};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) {
    console.error("No tab id available");
    return;
  }

  if (tabs[tab.id]) {
    tabs[tab.id] = false;
    try {
      await chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        css: `.blackout { background-color: black; color: black;}`,
      });
      await chrome.tabs.sendMessage(tab.id, { action: "turn-off" });
      const [{ result: isDark }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.matchMedia("(prefers-color-scheme: dark)").matches,
      });
      await chrome.action.setIcon({
        tabId: tab.id,
        path: isDark
          ? { "32": "icons/scribble-32-dark.png", "48": "icons/scribble-48-dark.png", "96": "icons/scribble-96-dark.png", "128": "icons/scribble-128-dark.png" }
          : { "32": "icons/scribble-32.png", "48": "icons/scribble-48.png", "96": "icons/scribble-96.png", "128": "icons/scribble-128.png" },
      });
    } catch (err) {
      console.error(`failed to toggle off: ${err}`);
    }
  } else {
    tabs[tab.id] = true;
    try {
      await chrome.scripting.insertCSS({
        target: {
          tabId: tab.id,
        },
        css: `.blackout { background-color: black; color: black;}`,
      });
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
          allFrames: true,
        },
        files: ["content.js"],
      });
      await chrome.action.setIcon({
        tabId: tab.id,
        path: {
          "32": "icons/scribble-active-32.png",
          "48": "icons/scribble-active-48.png",
          "96": "icons/scribble-active-96.png",
          "128": "icons/scribble-active-128.png"
        }
      });
    } catch (err) {
      console.error(`failed to toggle on: ${err}`);
    }
  }
});
