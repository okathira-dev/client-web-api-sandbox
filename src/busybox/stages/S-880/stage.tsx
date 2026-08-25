import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

type CompressionFormat = "gzip" | "deflate" | "deflate-raw";

const parcels = [
  {
    boxId: manifest.box.B01,
    url: new URL("../../fixtures/s880/assets/parcel-a.gz", import.meta.url)
      .href,
    format: "gzip",
    marker: "pocket compass",
    length: 65_536,
  },
  {
    boxId: manifest.box.B02,
    url: new URL("../../fixtures/s880/assets/parcel-b.deflate", import.meta.url)
      .href,
    format: "deflate",
    marker: "violet ledger",
    length: 65_536,
  },
  {
    boxId: manifest.box.B03,
    url: new URL("../../fixtures/s880/assets/parcel-c.raw", import.meta.url)
      .href,
    format: "deflate-raw",
    marker: "ember receipt",
    length: 65_536,
  },
] as const satisfies readonly {
  boxId: (typeof manifest.boxIds)[number];
  url: string;
  format: CompressionFormat;
  marker: string;
  length: number;
}[];

async function readDecompressed(url: string, format: CompressionFormat) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error("fixture unavailable");
  const reader = response.body
    .pipeThrough(new DecompressionStream(format))
    .getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    length += result.value.byteLength;
  }
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

/**
 * S-880 — Git管理したgzip / deflate / deflate-raw荷物を、選ばれた実DecompressionStreamへ通す。
 * 目的: 拡張子当てではなく、browserが受け取ったcompressed byte streamとformatの組み合わせが実際に展開できる感覚を作る。
 * 最初の一手: 各荷物の封印形式を選び「荷物を開く」を押す。失敗した荷物は別の形式で安全に再挑戦できる。
 * 箱ごとの解法: B01はgzipの青い荷物、B02はdeflateの紫の荷物、B03はdeflate-rawの赤い荷物を選ぶ。fetch bodyを`pipeThrough(new DecompressionStream(format))`で全量読み、固定markerと65,536 byte長が一致した時だけ開く。
 * 開かない操作: 拡張子表示、format選択だけ、responseをtext化、CompressionStreamで再圧縮、Node / library fallback、部分stream、script生成の成功表示では開かない。
 * 使用API: Fetch ReadableStream、DecompressionStream、ReadableStream reader、TextDecoder。荷物はbuild時に生成済みの固定binary assetである。
 * 権限・privacy: 権限・保存・送信は使わない。fetch対象は同梱された3つの公開fixtureだけである。
 * cleanup: readerは完走またはerrorで閉じ、stateはカードごとに表示だけ残す。timer・worker・URL objectは作らない。
 * 対応環境: `DecompressionStream`がgzip / deflate / deflate-rawを提供するbrowser。未対応時にlibrary fallbackは作らない。
 * 人手確認: H-062で3正解、各format負例、再試行、network失敗、marker / byte長照合、未対応表示を確認する。
 */
function S880Stage(props: Props) {
  const [formats, setFormats] = useState<Record<string, CompressionFormat>>({
    [manifest.box.B01]: "gzip",
    [manifest.box.B02]: "gzip",
    [manifest.box.B03]: "gzip",
  });
  const [states, setStates] = useState<
    Record<string, "idle" | "waiting" | "opened" | "failed">
  >({});
  const unsupported = !window.DecompressionStream;

  const open = async (parcel: (typeof parcels)[number]) => {
    const selected = formats[parcel.boxId] ?? "gzip";
    setStates((current) => ({ ...current, [parcel.boxId]: "waiting" }));
    try {
      const bytes = await readDecompressed(parcel.url, selected);
      const text = new TextDecoder().decode(bytes);
      if (
        selected !== parcel.format ||
        bytes.byteLength !== parcel.length ||
        !text.includes(parcel.marker)
      ) {
        throw new Error("parcel did not match");
      }
      props.boxes[parcel.boxId].solve();
      setStates((current) => ({ ...current, [parcel.boxId]: "opened" }));
    } catch {
      setStates((current) => ({ ...current, [parcel.boxId]: "failed" }));
    }
  };

  return (
    <div className="puzzle s880-stage">
      <div className="problem-row">
        {parcels.map((parcel) => (
          <StageProblemGiftBox
            key={parcel.boxId}
            box={props.boxes[parcel.boxId]}
            locale={props.locale}
          />
        ))}
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <div className="s880-parcels">
        {parcels.map((parcel) => {
          const state = states[parcel.boxId] ?? "idle";
          return (
            <section
              className="s880-parcel"
              key={parcel.boxId}
              data-state={state}
            >
              <h2>{stageText(props.locale, locale[parcel.boxId])}</h2>
              <label>
                {stageText(props.locale, locale.chooseFormat)}
                <select
                  value={formats[parcel.boxId] ?? "gzip"}
                  onChange={(event) =>
                    setFormats((current) => ({
                      ...current,
                      [parcel.boxId]: event.target.value as CompressionFormat,
                    }))
                  }
                  disabled={unsupported || state === "waiting"}
                >
                  <option value="gzip">gzip</option>
                  <option value="deflate">deflate</option>
                  <option value="deflate-raw">deflate-raw</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => void open(parcel)}
                disabled={unsupported || state === "waiting"}
              >
                {stageText(props.locale, locale.open)}
              </button>
              <output aria-live="polite">
                {unsupported
                  ? stageText(props.locale, locale.unsupported)
                  : state === "waiting"
                    ? stageText(props.locale, locale.waiting)
                    : state === "opened"
                      ? stageText(props.locale, locale.opened)
                      : state === "failed"
                        ? stageText(props.locale, locale.failed)
                        : ""}
              </output>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: FileDownloadOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: FileDownloadOutlined,
      color: "#a855f7",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: FileDownloadOutlined,
      color: "#7e22ce",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "DecompressionStream" in window ? "available" : "unsupported",
    ),
  Component: S880Stage,
});
