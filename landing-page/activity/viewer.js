const eventsList = document.getElementById("events-list");
const rawLog = document.getElementById("raw-log");
const lastUpdated = document.getElementById("last-updated");
const feedStatus = document.getElementById("feed-status");
const refreshButton = document.getElementById("refresh-button");
const scrollButton = document.getElementById("scroll-button");
const ACTIVITY_LOG_URL = "../activity.log";
const ACTIVITY_JSON_URL = "../.agent_activity.json";
const REFRESH_INTERVAL_MS = 2000;
let lastRawLog = null;

function scrollToLatest() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function eventKindLabel(event) {
  return String(event.kind || "activity").replaceAll("_", " ").toUpperCase();
}

function eventMessage(event) {
  const label = event.label ? `${event.label} · ` : "";
  const effect = event.expectedEffect ? `${event.expectedEffect} · ` : "";
  const token = event.tokenAddress ? `${event.tokenAddress} · ` : "";
  const url = event.txUrl ? `\n${event.txUrl}` : "";
  return `${label}${effect}${token}${event.txHash || ""}${url}`.trim();
}

function renderEvents(events) {
  if (!events.length) {
    eventsList.innerHTML = '<div class="empty-state">No recorded activity yet.</div>';
    return;
  }
  eventsList.innerHTML = events
    .slice(-8)
    .reverse()
    .map((event) => {
      const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : "—";
      return `
        <article class="log-row">
          <div class="log-row-kind">${eventKindLabel(event)}</div>
          <div class="log-row-top">
            <div class="log-row-message">${eventMessage(event)}</div>
            <div class="log-row-time">${time}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function refreshActivity() {
  try {
    const [logResponse, jsonResponse] = await Promise.all([
      fetch(`${ACTIVITY_LOG_URL}?ts=${Date.now()}`, { cache: "no-store" }),
      fetch(`${ACTIVITY_JSON_URL}?ts=${Date.now()}`, { cache: "no-store" }),
    ]);
    if (!logResponse.ok) {
      throw new Error(`log HTTP ${logResponse.status}`);
    }
    const logText = await logResponse.text();
    rawLog.textContent = logText.trim().length ? logText : "No activity yet.\n\nStart the main loop and the feed will populate automatically.";
    const activity = jsonResponse.ok ? await jsonResponse.json() : { events: [] };
    renderEvents(activity.events || []);
    feedStatus.textContent = logText.trim().length ? "Live" : "Waiting";
    lastUpdated.textContent = new Date().toLocaleTimeString();
    if (lastRawLog !== logText && logText.trim().length) {
      scrollToLatest();
    }
    lastRawLog = logText;
  } catch (error) {
    feedStatus.textContent = "Waiting";
    rawLog.textContent = `Couldn't read local activity files yet.\n\nError: ${error}`;
    eventsList.innerHTML = '<div class="empty-state">Waiting for the main loop to write local activity files.</div>';
    lastUpdated.textContent = new Date().toLocaleTimeString();
  }
}

refreshButton.addEventListener("click", refreshActivity);
scrollButton.addEventListener("click", scrollToLatest);
refreshActivity();
setInterval(refreshActivity, REFRESH_INTERVAL_MS);
