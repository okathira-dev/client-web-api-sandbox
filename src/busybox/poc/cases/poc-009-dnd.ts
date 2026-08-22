import type { PocRoot } from "../contracts";

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const target = root.querySelector<HTMLElement>("[data-dnd-target]");
  const sourceFrame =
    root.querySelector<HTMLIFrameElement>("[data-dnd-source]");
  const openSource = root.querySelector<HTMLButtonElement>("[data-dnd-open]");
  const openWindow = root.querySelector<HTMLButtonElement>(
    "[data-dnd-open-window]",
  );
  const reset = root.querySelector<HTMLButtonElement>("[data-dnd-reset]");
  if (!status || !target) return () => undefined;

  const setStatus = (message: string) => {
    status.value = message;
  };
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    target.dataset.dragover = "true";
  };
  const onDragLeave = () => {
    delete target.dataset.dragover;
  };
  const onDrop = async (event: DragEvent) => {
    event.preventDefault();
    delete target.dataset.dragover;
    const transfer = event.dataTransfer;
    if (!transfer) {
      setStatus("DataTransferなし。成功にはしません。");
      return;
    }
    const types = [...transfer.types];
    const uri = transfer.getData("text/uri-list");
    const files = [...transfer.files];
    if (files.length > 0) {
      const bytes = await files[0]?.arrayBuffer();
      const digest = bytes
        ? await crypto.subtle.digest("SHA-256", bytes)
        : undefined;
      const checksum = digest
        ? [...new Uint8Array(digest)]
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")
        : "none";
      setStatus(
        `実Fileを受領: name=${files[0]?.name ?? "unknown"}, type=${files[0]?.type ?? ""}, sha256=${checksum}`,
      );
      root.dataset.pocState = "partial";
      return;
    }
    if (uri) {
      setStatus(
        `別window / sandbox境界のpayloadを受領: types=${types.join(", ")}; uri=${uri}`,
      );
      root.dataset.pocState = "partial";
      return;
    }
    setStatus(
      `DataTransferは届いたが対象payloadなし: types=${types.join(", ")}`,
    );
  };
  const open = () => {
    sourceFrame?.focus();
    sourceFrame?.contentWindow?.postMessage({ type: "busybox-dnd-focus" }, "*");
    setStatus(
      "source iframeをフォーカスしました。sandbox内の画像を実際にこのdrop targetへdragしてください。",
    );
  };
  let sourceWindow: Window | null = null;
  const openSeparateWindow = () => {
    const helperUrl = new URL("../drag-helper.html", location.href);
    helperUrl.searchParams.set("mode", "window");
    sourceWindow = window.open(
      helperUrl.href,
      "busybox-dnd-source",
      "popup,width=420,height=360",
    );
    if (sourceWindow) {
      sourceWindow.focus();
      setStatus(
        "別windowのnative imageをこのdrop targetへ実dragしてください。DataTransferの実payloadだけを記録します。",
      );
    } else {
      setStatus("別windowを開けませんでした。popup許可を確認してください。");
    }
  };
  const clear = () => {
    delete root.dataset.pocState;
    setStatus("未実行。実dragのみを記録します。");
  };
  target.addEventListener("dragover", onDragOver);
  target.addEventListener("dragleave", onDragLeave);
  target.addEventListener("drop", onDrop);
  openSource?.addEventListener("click", open);
  openWindow?.addEventListener("click", openSeparateWindow);
  reset?.addEventListener("click", clear);

  return () => {
    target.removeEventListener("dragover", onDragOver);
    target.removeEventListener("dragleave", onDragLeave);
    target.removeEventListener("drop", onDrop);
    openSource?.removeEventListener("click", open);
    openWindow?.removeEventListener("click", openSeparateWindow);
    reset?.removeEventListener("click", clear);
    sourceWindow?.close();
  };
}
