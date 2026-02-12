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

    // Identify all text nodes within the selection
    const nodesToWrap = [];
    const commonAncestor = range.commonAncestorContainer;

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
      nodesToWrap.push(commonAncestor);
    } else {
      const treeWalker = document.createTreeWalker(
        commonAncestor,
        NodeFilter.SHOW_TEXT
      );

      let currentNode = treeWalker.nextNode();
      while (currentNode) {
        if (selection.containsNode(currentNode, true)) {
          nodesToWrap.push(currentNode);
        }
        currentNode = treeWalker.nextNode();
      }
    }

    // Capture boundary points before modifying DOM
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;

    nodesToWrap.forEach((node) => {
      let start = 0;
      let end = node.length;

      if (node === startContainer) {
        start = startOffset;
      }
      if (node === endContainer) {
        end = endOffset;
      }

      // Skip invalid ranges (e.g. if start == end)
      if (start >= end) return;

      const span = document.createElement("span");
      span.className = "blackout";

      try {
        const wrapRange = document.createRange();
        wrapRange.setStart(node, start);
        wrapRange.setEnd(node, end);
        wrapRange.surroundContents(span);
      } catch (e) {
        console.error("Blackout failed for node", node, e);
      }
    });

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
