document.addEventListener("DOMContentLoaded", async () => {
  const serverUrlInput = document.getElementById("server-url");
  const claimInput = document.getElementById("claim-input");
  const evidencePreview = document.getElementById("evidence-preview");
  const authorInput = document.getElementById("author-input");
  const evaluateBtn = document.getElementById("evaluate-btn");
  const statusDisplay = document.getElementById("status-display");
  const resultPanel = document.getElementById("result-panel");
  const apiStatus = document.getElementById("api-status");

  // Load target server from storage
  chrome.storage.local.get("serverUrl", (res) => {
    if (res.serverUrl) {
      serverUrlInput.value = res.serverUrl;
    }
  });

  // Save server URL whenever changed
  serverUrlInput.addEventListener("change", () => {
    chrome.storage.local.set({ serverUrl: serverUrlInput.value });
  });

  // Fetch selection data or auto-scrape current page
  const loadSelectionOrPage = async () => {
    // 1. Check if there is a pending selection from right-click
    const data = await chrome.storage.local.get("pendingAnalysis");
    
    if (data.pendingAnalysis && (Date.now() - data.pendingAnalysis.timestamp < 10000)) {
      // If there is a selection from the last 10 seconds, use it
      const selection = data.pendingAnalysis;
      evidencePreview.value = selection.text;
      claimInput.value = selection.title; // Default claim to page title
      authorInput.value = selection.year || new Date().getFullYear().toString();
      evaluateBtn.disabled = false;
      
      // Auto trigger evaluation for selection
      evaluateBtn.click();
      
      // Clear selection so it doesn't run again on next reopen
      await chrome.storage.local.remove("pendingAnalysis");
    } else {
      // 2. Otherwise, auto-scrape the text of the active tab
      await autoScrapeActiveTab();
    }
  };

  const autoScrapeActiveTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      const pageUrl = tab.url || "";
      const pageTitle = tab.title || "Web Page Claim";

      claimInput.value = pageTitle;
      
      // Parse year from URL or title
      const yearMatch = pageUrl.match(/\b((?:19|20)\d{2})\b/) || pageTitle.match(/\b((?:19|20)\d{2})\b/);
      authorInput.value = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

      // Check if URL is an internal chrome page
      if (pageUrl.startsWith("chrome://") || pageUrl.startsWith("edge://") || pageUrl.startsWith("about:") || pageUrl.startsWith("chrome-extension://")) {
        evidencePreview.value = "Cannot auto-scrape internal browser page. Navigate to an article and click Evaluate.";
        evaluateBtn.disabled = true;
        return;
      }

      statusDisplay.style.display = "block";
      statusDisplay.textContent = "Scraping page content...";

      // Inject script to extract page text content (prefers article/main tags)
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Remove scripts and style elements from count
          const clone = document.body.cloneNode(true);
          const scriptsAndStyles = clone.querySelectorAll("script, style, nav, footer, header");
          scriptsAndStyles.forEach(el => el.remove());

          const article = clone.querySelector("article");
          if (article) return article.innerText;
          
          const main = clone.querySelector("main");
          if (main) return main.innerText;

          return clone.innerText || "";
        }
      });

      const extractedText = results[0]?.result || "";
      if (extractedText.trim()) {
        evidencePreview.value = extractedText.trim();
        evaluateBtn.disabled = false;
        statusDisplay.style.display = "none";
        
        // Auto trigger evaluation
        evaluateBtn.click();
      } else {
        evidencePreview.value = "No readable text content found on the page.";
        statusDisplay.style.display = "none";
      }
    } catch (err) {
      console.warn("Could not auto-scrape page content:", err);
      statusDisplay.style.display = "none";
      evidencePreview.value = "Unable to auto-scrape this page context. Select text manually, right-click, and select 'Evaluate selection'.";
    }
  };

  // Initial load
  loadSelectionOrPage();

  // Listen to runtime messages from service worker (reloads on right click)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "load_selection") {
      loadSelectionOrPage();
    }
  });

  // Evaluate Selection Action
  evaluateBtn.addEventListener("click", async () => {
    const serverUrl = serverUrlInput.value.replace(/\/$/, "");
    const claim = claimInput.value.trim();
    const evidence = evidencePreview.value.trim();
    const year = authorInput.value.trim();

    if (!claim) {
      alert("Please enter a target claim tag first.");
      return;
    }

    evaluateBtn.disabled = true;
    statusDisplay.style.display = "block";
    resultPanel.style.display = "none";
    statusDisplay.textContent = "Analyzing selection metrics...";

    try {
      const response = await fetch(`${serverUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          claimText: claim,
          evidenceText: evidence,
          publishedAt: year ? `${year}-01-01` : undefined
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to analyze evidence.");
      }

      const report = await response.json();

      // Display results
      statusDisplay.style.display = "none";
      resultPanel.style.display = "block";

      document.getElementById("result-verdict").textContent = report.one_line_verdict;
      document.getElementById("result-meta").textContent = `${report.author_name || "Unknown Author"} (${year || "N/A"})`;
      
      const readiness = report.overall_score;
      const readinessPill = document.getElementById("readiness-score");
      readinessPill.textContent = readiness.toFixed(1);

      // Color coding pill
      readinessPill.className = "readiness-pill";
      if (readiness >= 7.5) {
        readinessPill.classList.add("pill-green");
      } else if (readiness >= 5.0) {
        readinessPill.classList.add("pill-yellow");
      } else {
        readinessPill.classList.add("pill-red");
      }

      // Subscores visual bars
      updateScore("fit", report.claim_fit);
      updateScore("cred", report.source_credibility);
      updateScore("rec", report.recency_fit);

      document.getElementById("suggested-tag").textContent = report.suggested_tag;

    } catch (err) {
      console.error(err);
      statusDisplay.textContent = `Evaluation failed: ${err.message}`;
    } finally {
      evaluateBtn.disabled = false;
    }
  });

  function updateScore(id, val) {
    const value = parseFloat(val);
    document.getElementById(`score-${id}`).textContent = value.toFixed(1);
    document.getElementById(`bar-${id}`).style.width = `${value * 10}%`;
  }
});
