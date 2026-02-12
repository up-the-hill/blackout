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
      await chrome.action.setIcon({
        tabId: tab.id,
        path: {
          "32": "icons/scribble-32.png",
          "48": "icons/scribble-48.png",
          "96": "icons/scribble-96.png",
          "128": "icons/scribble-128.png"
        }
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
