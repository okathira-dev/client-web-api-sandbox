import InstallDesktopOutlined from "@mui/icons-material/InstallDesktopOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useRef, useState } from "react";
import assetManifest from "../../fixtures/s790/assets/generation-manifest.json";
import { stageText } from "../locale";
import { locale } from "./locale";

type LocalFontDataLike = {
  readonly family: string;
  readonly fullName: string;
  readonly postscriptName: string;
  readonly style: string;
  blob(): Promise<Blob>;
};

type QueryLocalFonts = (options: {
  postscriptNames: readonly string[];
}) => Promise<LocalFontDataLike[]>;

const fontAsset = new URL(
  "../../fixtures/s790/assets/busybox-key.ttf",
  import.meta.url,
).href;

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * S-790
 *
 * 目的: Git管理した専用fontがOS install UIを通ってsystem fontになり、Local Font Accessで実raw dataとしてWebへ戻る往復を一箱にする。
 * 最初の一手: 専用TTFをdownloadし、OS標準font preview / install UIでuser installしてから「OSの活字を探す」を押す。
 * 箱ごとの解法: `queryLocalFonts({ postscriptNames: ["BusyboxKey-Regular"] })`が期待faceを一件だけ返し、`FontData.blob()`のSHA-256が生成manifestと一致し、Blob由来FontFaceがU+E000専用glyphを実loadするとB01が開く。
 * 開かない操作: downloadだけ、permission grantedだけ、全font列挙、既存font、file upload、drag-and-drop、`@font-face local()`、同名別bytes、bundled webfont、mock FontDataでは開かない。
 * 使用API: Local Font Access、FontData.blob、FontFace、CSS Font Loading、Web Crypto SHA-256、object URL。
 * 権限・privacy: 対象PostScript名一件だけを要求し、installed font一覧、他font名、件数、raw dataを保存・同期・送信しない。digestもcurrent attempt照合だけに使う。
 * cleanup: clear、stage離脱、abortでFontFaceをdocument.fontsから削除し、object URLとFontData参照を破棄する。OS fontは自動uninstallしない。
 * 対応環境: `queryLocalFonts`対応desktop ChromiumとOS user font installが必要。非対応時にuploadへfallbackしない。
 * 人手確認: H-003/H-004/H-006/H-014/H-019/H-023/H-025/H-051でinstall、permission、glyph、deny、cancel、uninstall、revoke、非保存を確認する。
 */
function S790Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const glyphRef = useRef<HTMLSpanElement>(null);
  const loadedRef = useRef<{ face: FontFace; url: string } | undefined>(
    undefined,
  );
  const [status, setStatus] = useState(() =>
    stageText(props.locale, locale.idle),
  );

  const clear = useCallback(() => {
    const loaded = loadedRef.current;
    loadedRef.current = undefined;
    if (loaded) {
      document.fonts.delete(loaded.face);
      URL.revokeObjectURL(loaded.url);
    }
    glyphRef.current?.style.removeProperty("font-family");
  }, []);

  useEffect(() => {
    const stop = () => clear();
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      clear();
    };
  }, [clear, props.signal]);

  const scan = async () => {
    const queryLocalFonts = (
      window as Window & { queryLocalFonts?: QueryLocalFonts }
    ).queryLocalFonts;
    if (!queryLocalFonts) {
      setStatus(stageText(props.locale, locale.unavailable));
      return;
    }
    clear();
    setStatus(stageText(props.locale, locale.scanning));
    try {
      const fonts = await queryLocalFonts({
        postscriptNames: [assetManifest.postscriptName],
      });
      if (
        fonts.length !== 1 ||
        fonts[0]?.postscriptName !== assetManifest.postscriptName
      ) {
        setStatus(stageText(props.locale, locale.missing));
        return;
      }
      const blob = await fonts[0].blob();
      const bytes = await blob.arrayBuffer();
      const digest = hex(await crypto.subtle.digest("SHA-256", bytes));
      if (digest !== assetManifest.sha256) {
        setStatus(stageText(props.locale, locale.mismatch));
        return;
      }
      const url = URL.createObjectURL(blob);
      const face = new FontFace("Busybox Installed Key", `url(${url})`);
      await face.load();
      document.fonts.add(face);
      loadedRef.current = { face, url };
      if (glyphRef.current)
        glyphRef.current.style.fontFamily = '"Busybox Installed Key"';
      if (!document.fonts.check('64px "Busybox Installed Key"', "\uE000")) {
        clear();
        setStatus(stageText(props.locale, locale.mismatch));
        return;
      }
      problem.solve();
      setStatus(stageText(props.locale, locale.success));
    } catch {
      clear();
      setStatus(stageText(props.locale, locale.cancelled));
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.instruction)}</p>
      <a className="stage-action" href={fontAsset} download="busybox-key.ttf">
        {stageText(props.locale, locale.download)}
      </a>
      <figure className="s790-glyph">
        <span ref={glyphRef}></span>
        <figcaption>{stageText(props.locale, locale.glyphLabel)}</figcaption>
      </figure>
      <div className="stage-action-row">
        <button
          type="button"
          className="stage-action"
          onClick={() => void scan()}
        >
          {stageText(props.locale, locale.scan)}
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => {
            clear();
            setStatus(stageText(props.locale, locale.cleared));
          }}
        >
          {stageText(props.locale, locale.clear)}
        </button>
      </div>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: InstallDesktopOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "queryLocalFonts" in window
        ? "permission-required"
        : "unsupported",
    ),
  Component: S790Stage,
});
