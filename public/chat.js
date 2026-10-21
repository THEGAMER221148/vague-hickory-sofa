export default class ChatUI {
    constructor({ onSend, onFocus }) {
        this.panel = document.getElementById("chatPanel");
        this.messages = document.getElementById("chatMessages");
        this.form = document.getElementById("chatForm");
        this.input = document.getElementById("chatInput");
        this.onSend = onSend;

        this.input.addEventListener("focus", onFocus);
        this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    }

    get isFocused() {
        return document.activeElement === this.input;
    }

    show() {
        this.panel.style.display = "block";
        this.panel.setAttribute("aria-hidden", "false");
    }

    focus() {
        this.input.focus();
    }

    addMessage(author, message, { system = false } = {}) {
        const listItem = document.createElement("li");
        listItem.className = system
            ? "chatMessage chatSystemMessage"
            : "chatMessage";

        if (system) {
            listItem.textContent = message;
        } else {
            const authorElement = document.createElement("span");
            authorElement.className = "chatAuthor";
            authorElement.textContent = `${author}: `;

            const messageElement = document.createElement("span");
            messageElement.textContent = message;

            listItem.append(authorElement, messageElement);
        }

        this.messages.append(listItem);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    handleSubmit(event) {
        event.preventDefault();

        const message = this.input.value.trim();
        if (!message) return;

        if (!this.onSend(message)) {
            this.addMessage(
                "",
                "Chat is still connecting. Try again in a moment.",
                { system: true }
            );
            return;
        }

        this.input.value = "";
        this.input.blur();
    }
}
