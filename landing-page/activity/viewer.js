const logOutput = document.getElementById("log-output");
const lastUpdated = document.getElementById("last-updated");
const refreshButton = document.getElementById("refresh-button");
const scrollButton = document.getElementById("scroll-button");
const ACTIVITY_LOG_URL = "../activity.log";
const REFRESH_INTERVAL_MS = 2000;
let lastRenderedText = null;

function scrollToLatest() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

async function refreshLog() {
  try {
    const response = await fetch(`${ACTIVITY_LOG_URL}?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    if (text.trim().length === 0) {
      logOutput.textContent = "No activity yet.\n\nStart `make main` in another terminal and this page will populate automatically.";
      logOutput.classList.add("empty-state");
    } else {
      logOutput.textContent = text;
      logOutput.classList.remove("empty-state");
      if (lastRenderedText !== text) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }
    lastRenderedText = text;
    lastUpdated.textContent = `Last refreshed ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    logOutput.textContent = `Couldn't read landing-page/activity.log yet.\n\nError: ${error}`;
    logOutput.classList.add("empty-state");
    lastUpdated.textContent = `Retrying… ${new Date().toLocaleTimeString()}`;
  }
}

refreshButton.addEventListener("click", refreshLog);
scrollButton.addEventListener("click", scrollToLatest);
refreshLog();
setInterval(refreshLog, REFRESH_INTERVAL_MS);
