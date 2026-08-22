import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s870Locale } from "./S-870.locale";

const replacementText = "busybox{edited_outside_the_page}\n";

async function directoryIsEmpty(directory: FileSystemDirectoryHandle) {
  for await (const _entry of directory.values()) return false;
  return true;
}

async function writeText(
  directory: FileSystemDirectoryHandle,
  name: string,
  text: string,
) {
  const file = await directory.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write(`\uFEFF${text}`);
  await writable.close();
}

async function isMissing(directory: FileSystemDirectoryHandle, name: string) {
  try {
    await directory.getFileHandle(name);
    return false;
  } catch (error: unknown) {
    return (error as DOMException).name === "NotFoundError";
  }
}

/**
 * S-870 — 空の使い捨てfolderにgameがseedした3ファイルを、OS側で編集・削除・作成する。
 * 目的: page内のfile inputではなく、playerが選んだdirectoryの外部file操作をbrowserが再読込できる体験にする。
 * 最初の一手: 「空のフォルダーを選ぶ」から新規の空folderを選ぶ。空でないfolderは安全のため受け付けず何も変更しない。
 * 箱ごとの解法: B01は`rewrite-me.txt`をUTF-8で`busybox{edited_outside_the_page}`一行（BOMと末尾改行は許容）へ、B02は`delete-me.txt`を削除、B03は非空の通常`create-me.txt`を作る。画面へ戻ってvisible中の実directory再走査で開く。
 * 開かない操作: game内textarea、表示の文言変更、選択前のfolder、非空folder、synthetic File、hidden input、ページを閉じた間のtimer、別名fileでは開かない。
 * 使用API: File System Access API、`showDirectoryPicker({mode:"readwrite"})`、`FileSystemDirectoryHandle`、`getFileHandle`、`createWritable`、focus / visibility時の限定polling。
 * 権限・privacy: user gesture中に使い捨てfolderだけを選ばせる。handleはmemoryだけに置き、IndexedDB保存・アップロード・既存fileの削除はしない。
 * cleanup: stage離脱でinterval / focus / visibility listenerを解除する。選択folderとseed fileは自動削除しないため、playerがOS側で手動削除できる。
 * 対応環境: secure contextでFile System Access APIを提供するChromium系browser。permission拒否・cancelを成功へfallbackしない。
 * 人手確認: H-061でempty / non-empty拒否、3種類のOS操作、BOM・改行、visible時だけの確認、re-entry cleanupを確認する。
 */
export default function S870Stage(props: StageComponentProps) {
  const rewriteProblem = props.problem("S-870-B01");
  const deleteProblem = props.problem("S-870-B02");
  const createProblem = props.problem("S-870-B03");
  const directoryRef = useRef<FileSystemDirectoryHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let interval: number | undefined;
    let checking = false;
    const check = async () => {
      const directory = directoryRef.current;
      if (!directory || document.visibilityState !== "visible" || checking)
        return;
      checking = true;
      try {
        const [rewriteResult, createdResult, deleted] = await Promise.all([
          directory
            .getFileHandle("rewrite-me.txt")
            .then((handle) => handle.getFile())
            .catch(() => undefined),
          directory
            .getFileHandle("create-me.txt")
            .then((handle) => handle.getFile())
            .catch(() => undefined),
          isMissing(directory, "delete-me.txt"),
        ]);
        if (rewriteResult && (await rewriteResult.text()) === replacementText) {
          rewriteProblem.solve(["file-system:rewritten-outside-page"]);
        }
        if (deleted) deleteProblem.solve(["file-system:deleted-outside-page"]);
        if (createdResult && createdResult.size > 0)
          createProblem.solve(["file-system:created-outside-page"]);
        setStatus(stageText(props.locale, s870Locale.checking));
      } catch {
        // A partially completed external edit is expected; keep the watcher alive.
      } finally {
        checking = false;
      }
    };
    const resume = () => void check();
    if (ready) {
      interval = window.setInterval(() => void check(), 1000);
      window.addEventListener("focus", resume);
      document.addEventListener("visibilitychange", resume);
      void check();
    }
    const stop = () => {
      if (interval !== undefined) window.clearInterval(interval);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [
    createProblem.solve,
    deleteProblem.solve,
    props.locale,
    props.signal,
    ready,
    rewriteProblem.solve,
  ]);

  const chooseDirectory = async () => {
    if (!window.showDirectoryPicker) return;
    setStatus(stageText(props.locale, s870Locale.choosing));
    try {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      if (!(await directoryIsEmpty(directory))) {
        setStatus(stageText(props.locale, s870Locale.nonEmpty));
        return;
      }
      await Promise.all([
        writeText(directory, "rewrite-me.txt", "replace this line\n"),
        writeText(directory, "delete-me.txt", "delete this file\n"),
      ]);
      directoryRef.current = directory;
      setReady(true);
      setStatus(stageText(props.locale, s870Locale.ready));
    } catch (error: unknown) {
      if ((error as DOMException).name === "AbortError") {
        setStatus(stageText(props.locale, s870Locale.cancelled));
      } else {
        setStatus(stageText(props.locale, s870Locale.unsupported));
      }
    }
  };

  return (
    <div className="puzzle s870-stage">
      <div className="problem-row">
        <ProblemGiftBox problem={rewriteProblem} locale={props.locale} />
        <ProblemGiftBox problem={deleteProblem} locale={props.locale} />
        <ProblemGiftBox problem={createProblem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s870Locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void chooseDirectory()}
      >
        {stageText(props.locale, s870Locale.choose)}
      </button>
      {ready ? (
        <ol className="s870-jobs">
          <li>
            <strong>{stageText(props.locale, s870Locale.rewrite)}</strong>
            <code>
              {stageText(props.locale, s870Locale.rewriteInstruction)}
            </code>
          </li>
          <li>
            <strong>{stageText(props.locale, s870Locale.remove)}</strong>
          </li>
          <li>
            <strong>{stageText(props.locale, s870Locale.create)}</strong>
            <span>{stageText(props.locale, s870Locale.createInstruction)}</span>
          </li>
        </ol>
      ) : null}
      <output className="interaction-status" aria-live="polite">
        {status}
      </output>
      {ready ? (
        <small>{stageText(props.locale, s870Locale.cleanup)}</small>
      ) : null}
    </div>
  );
}
