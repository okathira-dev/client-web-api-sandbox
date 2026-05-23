function randomToken() {
  return Math.random().toString(36).slice(2, 10);
}

export function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${randomToken()}`;
}
