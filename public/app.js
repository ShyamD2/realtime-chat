const socket = io();

const joinScreen = document.getElementById("join-screen");
const chatScreen = document.getElementById("chat-screen");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");
const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const userCountEl = document.getElementById("user-count");
const typingIndicator = document.getElementById("typing-indicator");

let myUsername = "";
let typingTimeout = null;

function joinChat() {
  const name = usernameInput.value.trim();
  if (!name) return;
  myUsername = name;
  socket.emit("join", name);
  joinScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  messageInput.focus();
}

joinBtn.addEventListener("click", joinChat);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") joinChat();
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit("chat message", text);
  socket.emit("typing", false);
  messageInput.value = "";
});

messageInput.addEventListener("input", () => {
  socket.emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit("typing", false), 1000);
});

socket.on("chat message", (msg) => {
  const el = document.createElement("div");
  const isOwn = msg.username === myUsername;
  el.className = "message" + (isOwn ? " own" : "");
  el.innerHTML = `<div class="meta">${escapeHtml(msg.username)}<span class="time">${msg.time}</span></div>${escapeHtml(msg.text)}`;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on("system message", (text) => {
  const el = document.createElement("div");
  el.className = "system-message";
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on("user count", (count) => {
  userCountEl.textContent = `${count} online`;
});

socket.on("typing", ({ username, isTyping }) => {
  typingIndicator.textContent = isTyping ? `${username} is typing...` : "";
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
