(() => {
  window.addEventListener('mouseup', onPossibleSelection);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "turn-off") {
      turnOff();
    }
  });

  function onPossibleSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (selection.isCollapsed) return;

    const extractedContent = range.extractContents();

    const span = document.createElement("span");
    span.className = "blackout";
    span.appendChild(extractedContent);

    range.insertNode(span);

    selection.removeAllRanges();
  }

  function turnOff() {
    window.removeEventListener('mouseup', onPossibleSelection);
    const blackoutSpans = document.querySelectorAll('.blackout');
    blackoutSpans.forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });
  }
})();
