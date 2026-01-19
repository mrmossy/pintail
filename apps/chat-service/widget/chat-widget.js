/* NR Chat Widget - JS-only embed */
(() => {
  const CURRENT_SCRIPT =
    document.currentScript ||
    document.querySelector('script[data-nr-chat]');

  const dataset = (CURRENT_SCRIPT && CURRENT_SCRIPT.dataset) || {};
  const config = window.NRChatWidget || {};

  const apiBase =
    (config.apiBase || dataset.apiBase || "https://chat.nextrhythm.ai")
      .toString()
      .replace(/\/$/, "");
  const title = config.title || dataset.title || "Chat Assistant";
  const subtitle =
    config.subtitle ||
    dataset.subtitle ||
    "Ask a property question or start a request.";
  const welcome = config.welcome || dataset.welcome || "Hi there. How can we help today?";
  const launcherText =
    config.launcherText || dataset.launcherText || "Chat with Assistant";

  const root = document.createElement("div");
  root.id = "nr-chat-widget";

  const style = document.createElement("style");
  style.textContent = `
    @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap");

    :root {
      --nr-ink: #101816;
      --nr-mint: #cfe9d9;
      --nr-forest: #0c3b2e;
      --nr-gold: #c8a45b;
      --nr-sand: #f5f0e6;
      --nr-shadow: rgba(12, 59, 46, 0.18);
    }

    #nr-chat-widget {
      font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
      position: relative;
      z-index: 9999;
    }

    #nr-chat-widget .nr-launcher {
      position: fixed;
      right: 24px;
      bottom: 24px;
      border: none;
      background: linear-gradient(135deg, var(--nr-forest), #145d48);
      color: #fff;
      padding: 14px 18px;
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 16px 32px var(--nr-shadow);
      font-size: 14px;
      letter-spacing: 0.4px;
    }

    #nr-chat-widget .nr-panel {
      position: fixed;
      right: 24px;
      bottom: 86px;
      width: min(360px, calc(100vw - 48px));
      height: 520px;
      background: var(--nr-sand);
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(12, 59, 46, 0.22);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    #nr-chat-widget .nr-panel.is-open {
      display: flex;
      animation: nr-rise 220ms ease-out;
    }

    @keyframes nr-rise {
      from {
        transform: translateY(12px);
        opacity: 0.6;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    #nr-chat-widget .nr-header {
      background: linear-gradient(135deg, #0c3b2e, #1d5c48);
      color: #fff;
      padding: 18px 20px 14px;
    }

    #nr-chat-widget .nr-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 2px;
    }

    #nr-chat-widget .nr-subtitle {
      font-size: 12px;
      margin: 0;
      opacity: 0.8;
    }

    #nr-chat-widget .nr-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: radial-gradient(circle at top, #ffffff 0%, #f5f0e6 70%);
    }

    #nr-chat-widget .nr-message {
      display: flex;
      margin-bottom: 12px;
    }

    #nr-chat-widget .nr-message.nr-user {
      justify-content: flex-end;
    }

    #nr-chat-widget .nr-bubble {
      max-width: 75%;
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    #nr-chat-widget .nr-user .nr-bubble {
      background: var(--nr-forest);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    #nr-chat-widget .nr-assistant .nr-bubble {
      background: var(--nr-mint);
      color: var(--nr-ink);
      border-bottom-left-radius: 4px;
    }

    #nr-chat-widget .nr-input-area {
      padding: 12px 14px 16px;
      background: #fff;
      border-top: 1px solid rgba(12, 59, 46, 0.1);
    }

    #nr-chat-widget .nr-form {
      display: flex;
      gap: 8px;
    }

    #nr-chat-widget .nr-input {
      flex: 1;
      border: 1px solid rgba(12, 59, 46, 0.2);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
    }

    #nr-chat-widget .nr-send {
      border: none;
      background: var(--nr-gold);
      color: #1b160c;
      padding: 0 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    #pintail-chat-widget .pintail-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      #nr-chat-widget .nr-panel {
        right: 12px;
        left: 12px;
        width: auto;
        bottom: 80px;
      }

      #nr-chat-widget .nr-launcher {
        right: 12px;
        bottom: 16px;
      }
    }
  `;

  const panel = document.createElement("section");
  panel.className = "nr-panel";
  panel.innerHTML = `
    <header class="nr-header">
      <h3 class="nr-title"></h3>
      <p class="nr-subtitle"></p>
    </header>
    <div class="nr-messages"></div>
    <div class="nr-input-area">
      <form class="nr-form">
        <input class="nr-input" type="text" placeholder="Type your message..." />
        <button class="nr-send" type="submit">Send</button>
      </form>
    </div>
  `;

  const launcher = document.createElement("button");
  launcher.className = "nr-launcher";
  launcher.type = "button";
  launcher.textContent = launcherText;

  root.appendChild(panel);
  root.appendChild(launcher);

  document.head.appendChild(style);
  document.body.appendChild(root);

  const titleEl = panel.querySelector(".nr-title");
  const subtitleEl = panel.querySelector(".nr-subtitle");
  const messages = panel.querySelector(".nr-messages");
  const form = panel.querySelector(".nr-form");
  const input = panel.querySelector(".nr-input");
  const sendButton = panel.querySelector(".nr-send");

  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;

  const sessionKey = `pintailChatSessionId:${apiBase}`;
  let sessionId = window.localStorage.getItem(sessionKey);
  let hasLoadedHistory = false;
  let isStreaming = false;

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function createMessage(role, text) {
    const message = document.createElement("div");
    message.className = `nr-message nr-${role}`;
    const bubble = document.createElement("div");
    bubble.className = "nr-bubble";
    bubble.textContent = text;
    message.appendChild(bubble);
    messages.appendChild(message);
    scrollToBottom();
    return bubble;
  }

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch(`${apiBase}/session`, { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to start session");
    }
    const data = await response.json();
    sessionId = data.sessionId;
    window.localStorage.setItem(sessionKey, sessionId);
    return sessionId;
  }

  async function loadHistory() {
    if (!sessionId || hasLoadedHistory) return;
    try {
      const response = await fetch(`${apiBase}/history/${sessionId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.messages)) {
        data.messages.forEach((item) => {
          if (item.role === "user" || item.role === "assistant") {
            createMessage(item.role, item.content);
          }
        });
      }
    } catch (error) {
      console.warn("Unable to load chat history", error);
    } finally {
      hasLoadedHistory = true;
    }
  }

  function togglePanel() {
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) {
      input.focus();
      ensureSession()
        .then(loadHistory)
        .then(() => {
          if (!messages.childElementCount && welcome) {
            createMessage("assistant", welcome);
          }
        })
        .catch((error) => {
          createMessage("assistant", "Unable to start chat right now.");
          console.error(error);
        });
    }
  }

  launcher.addEventListener("click", togglePanel);

  async function streamChat(text) {
    if (!text.trim()) return;
    createMessage("user", text.trim());
    input.value = "";

    const assistantBubble = createMessage("assistant", "Thinking...");
    let assistantText = "";

    sendButton.disabled = true;
    input.disabled = true;
    isStreaming = true;

    try {
      const activeSessionId = await ensureSession();
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: activeSessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        parts.forEach((part) => {
          const line = part
            .split("\n")
            .find((entry) => entry.startsWith("data:"));
          if (!line) return;
          const payload = line.replace("data:", "").trim();
          if (!payload) return;
          if (payload === "[DONE]") return;
          try {
            const data = JSON.parse(payload);
            if (data.status === "thinking") {
              assistantBubble.textContent = "Thinking...";
              return;
            }
            if (typeof data.text === "string") {
              assistantText += data.text;
              assistantBubble.textContent = assistantText;
              scrollToBottom();
            }
          } catch (error) {
            console.warn("Malformed stream chunk", error);
          }
        });
      }
    } catch (error) {
      assistantBubble.textContent =
        "Sorry, something went wrong. Please try again.";
      console.error(error);
    } finally {
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
      isStreaming = false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isStreaming) return;
    streamChat(input.value);
  });
})();
