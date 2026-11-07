/**
 * Time Loop Escape chat: half of your clues are in your partner's room, so this is how the game is played.
 * Ported from the team's plain-JS game (games/team-3/timeloop-escape/js/ui.js). It shows the lines it is
 * given and reports a sent line through onSend; the server adds it to the state.
 */

/** One chat line. `mine` marks your own lines, so two players with the same name still work. */
export interface ChatLine {
  from: string;
  text: string;
  mine: boolean;
}

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Creates the chat panel inside root. Empty lines are not sent. */
export function mountChat(root: HTMLElement, onSend: (text: string) => void): void {
  root.insertAdjacentHTML(
    "beforeend",
    `<section id="chat" aria-label="Chat with your partner">
      <h2>Chat</h2>
      <ul id="chat-log" aria-live="polite"></ul>
      <form id="chat-form"><label for="chat-text" class="sr-only">Message</label><input id="chat-text" maxlength="200" autocomplete="off" placeholder="Tell your partner…"><button>Send</button></form>
    </section>`,
  );
  const form = root.querySelector("#chat-form") as HTMLFormElement;
  const input = root.querySelector("#chat-text") as HTMLInputElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    onSend(text);
    input.value = "";
  });
}

/** Shows the chat lines, and scrolls to the newest one when a line is added. */
export function updateChat(root: HTMLElement, lines: ChatLine[]): void {
  const log = root.querySelector("#chat-log") as HTMLElement;
  log.innerHTML = lines.length
    ? lines
        .map(
          (m) =>
            `<li${m.mine ? ' class="me"' : ""}><b>${m.mine ? "You" : esc(m.from)}:</b> ${esc(m.text)}</li>`,
        )
        .join("")
    : '<li class="empty">Tell your partner what you find. Half of your clues are in their room.</li>';
  if (String(lines.length) !== log.dataset.count) {
    log.dataset.count = String(lines.length);
    log.scrollTop = log.scrollHeight;
  }
}
