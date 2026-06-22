document.addEventListener("DOMContentLoaded", () => {
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

  // Fetch pending analysis data
  const loadSelectionData = async () => {
    const data = await chrome.storage.local.get("pendingAnalysis");
    if (data.pendingAnalysis) {
      const selection = data.pendingAnalysis;
      evidencePreview.value = selection.text;
      authorInput.value = selection.year || "";
      evaluateBtn.disabled = false;
      
      // Auto-focus claim input to prompt the user
      claimInput.focus();
    }
  };

  // Initial load
  loadSelectionData();

  // Listen to runtime messages from service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "load_selection") {
      loadSelectionData();
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
