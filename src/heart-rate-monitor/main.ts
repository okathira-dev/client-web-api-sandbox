import { createElement } from "react";
import { createRoot } from "react-dom/client";

import { HeartRateMonitor } from "./heart-rate-monitor";

// React コンポーネントのマウント
const appElement = document.getElementById("app");

if (appElement) {
  const root = createRoot(appElement);
  root.render(createElement(HeartRateMonitor));
} else {
  console.error("App mount element not found");
}

// カメラ機能のサポートチェック
document.addEventListener("DOMContentLoaded", () => {
  // カメラAPIのサポートチェック
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError("このブラウザはカメラ機能をサポートしていません。");
    return;
  }

  // モバイルデバイスでのユーザー体験改善
  const viewportMetaTag = document.querySelector('meta[name="viewport"]');
  if (
    viewportMetaTag &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  ) {
    viewportMetaTag.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    );
  }
});

function showError(message: string): void {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; text-align: center;">
        <p>${message}</p>
      </div>
    `;
  }
}
