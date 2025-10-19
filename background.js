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
    } catch (err) {
      console.error(`failed to toggle on: ${err}`);
    }
  }
});
