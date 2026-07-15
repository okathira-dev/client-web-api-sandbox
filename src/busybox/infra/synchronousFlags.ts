const revisitFlag = "busybox:S-060:seen";

export function hasRevisitFlag() {
  try {
    return localStorage.getItem(revisitFlag) === "1";
  } catch {
    return false;
  }
}

export function setRevisitFlag() {
  try {
    // This single boolean is intentionally synchronous: closing the page directly
    // after first sight can abort an IndexedDB transaction before it commits.
    localStorage.setItem(revisitFlag, "1");
  } catch {
    // IndexedDB observation remains the fallback in storage-restricted contexts.
  }
}

export function clearSynchronousFlags() {
  try {
    localStorage.removeItem(revisitFlag);
  } catch {
    // Reset still clears the primary IndexedDB document when localStorage is blocked.
  }
}
