import { useState } from "react";
import type { ProblemBoxId } from "../domain/stages";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s880Locale } from "./S-880.locale";

type CompressionFormat = "gzip" | "deflate" | "deflate-raw";

const parcels = [
  {
    id: "S-880-B01",
    url: new URL("../fixtures/s880/assets/parcel-a.gz", import.meta.url).href,
    format: "gzip",
    marker: "pocket compass",
    length: 65_536,
  },
  {
    id: "S-880-B02",
    url: new URL("../fixtures/s880/assets/parcel-b.deflate", import.meta.url)
      .href,
    format: "deflate",
    marker: "violet ledger",
    length: 65_536,
  },
  {
    id: "S-880-B03",
    url: new URL("../fixtures/s880/assets/parcel-c.raw", import.meta.url).href,
    format: "deflate-raw",
    marker: "ember receipt",
    length: 65_536,
  },
] as const satisfies readonly {
  id: ProblemBoxId;
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
export default function S880Stage(props: StageComponentProps) {
  const [formats, setFormats] = useState<Record<string, CompressionFormat>>({
    "S-880-B01": "gzip",
    "S-880-B02": "gzip",
    "S-880-B03": "gzip",
  });
  const [states, setStates] = useState<
    Record<string, "idle" | "waiting" | "opened" | "failed">
  >({});
  const unsupported = !window.DecompressionStream;

  const open = async (parcel: (typeof parcels)[number]) => {
    const selected = formats[parcel.id] ?? "gzip";
    setStates((current) => ({ ...current, [parcel.id]: "waiting" }));
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
      props
        .problem(parcel.id)
        .solve([`decompression:${parcel.format}:fixture-match`]);
      setStates((current) => ({ ...current, [parcel.id]: "opened" }));
    } catch {
      setStates((current) => ({ ...current, [parcel.id]: "failed" }));
    }
  };

  return (
    <div className="puzzle s880-stage">
      <div className="problem-row">
        {parcels.map((parcel) => (
          <ProblemGiftBox
            key={parcel.id}
            problem={props.problem(parcel.id)}
            locale={props.locale}
          />
        ))}
      </div>
      <p>{stageText(props.locale, s880Locale.intro)}</p>
      <div className="s880-parcels">
        {parcels.map((parcel) => {
          const state = states[parcel.id] ?? "idle";
          return (
            <section className="s880-parcel" key={parcel.id} data-state={state}>
              <h2>
                {stageText(
                  props.locale,
                  s880Locale[parcel.id.slice(-3) as "B01" | "B02" | "B03"],
                )}
              </h2>
              <label>
                {stageText(props.locale, s880Locale.chooseFormat)}
                <select
                  value={formats[parcel.id] ?? "gzip"}
                  onChange={(event) =>
                    setFormats((current) => ({
                      ...current,
                      [parcel.id]: event.target.value as CompressionFormat,
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
                {stageText(props.locale, s880Locale.open)}
              </button>
              <output aria-live="polite">
                {unsupported
                  ? stageText(props.locale, s880Locale.unsupported)
                  : state === "waiting"
                    ? stageText(props.locale, s880Locale.waiting)
                    : state === "opened"
                      ? stageText(props.locale, s880Locale.opened)
                      : state === "failed"
                        ? stageText(props.locale, s880Locale.failed)
                        : ""}
              </output>
            </section>
          );
        })}
      </div>
    </div>
  );
}
