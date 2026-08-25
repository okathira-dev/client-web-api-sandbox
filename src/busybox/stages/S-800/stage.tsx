import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

const encodedFragment = "#:~:text=%20%63%6f%62%61%6c%74,-.";

function WordCanvas({ word }: { word: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "700 42px ui-monospace, monospace";
    context.fillStyle = "#f7f3ff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(word, canvas.width / 2, canvas.height / 2);
  }, [word]);
  return (
    <canvas
      ref={canvasRef}
      className="s800-word"
      width={260}
      height={90}
      role="img"
      aria-label={word}
    />
  );
}

/**
 * S-800 — address barのText Fragmentを自分で組み立て、hidden=until-foundの文をbrowserに表示させる。
 * 目的: page内inputや擬似highlightを使わず、URLの`#:~:text=`がブラウザ所有の一語highlightを作ることを体験する。
 * 最初の一手: B01のpercent-encoded fragmentをこのpageのURL末尾へ貼り付けて移動し、ブラウザが隠れた英文を開くことを確かめる。
 * 箱ごとの解法: B01は表示された`#:~:text=%20%63%6f%62%61%6c%74,-.`で`cobalt.`のcontainerを、B02はcanvasに見える`ember`から`#:~:text=%20ember,-.`を作り別containerを開く。対応containerの実`beforematch`で各箱が開く。
 * 開かない操作: page内URL入力欄、通常`#id`、自作CSS highlight、対象外語、script生成eventでは開かない。find-in-pageでもbeforematchが発火し得ることは、標準が起点を公開しない既知の制約としてH-055で扱う。
 * 使用API: URL Fragment Text Directives、`hidden="until-found"`、`beforematch`。target語はcanvasのaccessible name以外の検索対象DOM textへ重複させない。
 * 権限・privacy: 権限、network送信、永続入力は使わない。browserがfragment directiveを処理し、stageはreveal eventだけを観測する。
 * cleanup: `beforematch` listenerをstage離脱時に解除する。timer、observer、object URL、外部接続は作らない。
 * 対応環境: Chrome系のText FragmentとHidden Until Found対応を対象とする。対応しないbrowserはStageHostのprobeで操作を要求しない。
 * 人手確認: H-055でB01/B02をaddress barから実行し、UA highlight、beforematch、Back / reload、対象外語、Ctrl+Fの既知代替経路を確認する。
 */
function S800Stage(props: Props) {
  const encodedProblem = props.boxes[manifest.box.B01];
  const wordProblem = props.boxes[manifest.box.B02];
  const encodedTargetRef = useRef<HTMLElement>(null);
  const wordTargetRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const encodedTarget = encodedTargetRef.current;
    const wordTarget = wordTargetRef.current;
    if (!encodedTarget || !wordTarget) return;
    encodedTarget.setAttribute("hidden", "until-found");
    wordTarget.setAttribute("hidden", "until-found");
    const handleEncoded = () => {
      encodedProblem.solve();
      setStatus(stageText(props.locale, locale.revealed));
    };
    const handleWord = () => {
      wordProblem.solve();
      setStatus(stageText(props.locale, locale.revealed));
    };
    encodedTarget.addEventListener("beforematch", handleEncoded);
    wordTarget.addEventListener("beforematch", handleWord);
    return () => {
      encodedTarget.removeEventListener("beforematch", handleEncoded);
      wordTarget.removeEventListener("beforematch", handleWord);
    };
  }, [encodedProblem.solve, props.locale, wordProblem.solve]);

  return (
    <div className="puzzle s800-stage">
      <div className="problem-row">
        <StageProblemGiftBox box={encodedProblem} locale={props.locale} />
        <StageProblemGiftBox box={wordProblem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <div className="s800-prompts">
        <section>
          <h2>{stageText(props.locale, locale.fragmentLabel)}</h2>
          <code>{encodedFragment}</code>
          <p>{stageText(props.locale, locale.fragmentHelp)}</p>
        </section>
        <section>
          <h2>{stageText(props.locale, locale.wordLabel)}</h2>
          <WordCanvas word="ember" />
          <p>{stageText(props.locale, locale.wordHelp)}</p>
        </section>
      </div>
      <article className="s800-article">
        <p>
          The workshop ledger lists ordinary repairs in a deliberately plain
          hand. A hinge was polished, a clock was wound, and a weather vane was
          returned to its roof before the afternoon wind arrived.
        </p>
        <p>
          Each repair has a date, a price, and a small note about the weather.
          Some mornings were foggy enough to hide the river, while others made
          the shop windows shine like mirrors. None of those entries names a
          special item, and the ledger gives no table of contents.
        </p>
        <p>
          The owner preferred a careful order. First came tools returned to
          their drawers, then the names of visitors, then any leftover screws
          counted into paper envelopes. A reader can pass through the ordinary
          work for quite a while without noticing a change in the page.
        </p>
        <section ref={encodedTargetRef} hidden>
          <p>At dusk, the archivist seals the final vial with cobalt.</p>
        </section>
        <p>
          On another shelf, the notes describe a lantern, a brass key, and a
          small stove that had outlived every map in the room. Nothing in the
          ledger announces which sentence matters.
        </p>
        <p>
          A pencilled column records three broken umbrellas, four repaired
          watches, and one doorbell that rang only when the air was dry. The
          details are intentionally unhelpful. They make the hidden lines feel
          like part of a document instead of a menu prepared for a search.
        </p>
        <p>
          Near the back, a list of borrowed books trails off into a note about
          rainwater reaching the cellar. The librarian underlined nothing. They
          trusted that a browser could reveal a passage when someone asked for
          the exact words, rather than when a page chose to advertise them.
        </p>
        <section ref={wordTargetRef} hidden>
          <p>Before sunrise, the last brass stove shelters one ember.</p>
        </section>
        <p>
          The remaining pages record only rain, dust, and quiet footsteps. They
          are here to make the two hidden passages part of a real article rather
          than a menu of answers.
        </p>
        <p>
          By winter, the workshop had collected enough spare gears to fill a
          drawer. The owner did not label them by size. Instead, they arranged
          them by the sound they made on the wooden counter: a light tap, a dull
          knock, a thin ring. The ledger preserves that unimportant habit too.
        </p>
        <p>
          A final entry explains that a well-kept record should not force its
          reader down one route. It should allow ordinary reading, but reward a
          precise request with the exact place where the request belongs. The
          empty space after the final period is intentional.
        </p>
      </article>
      <output className="interaction-status" aria-live="polite">
        {status}
      </output>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SelectAllOutlined,
      color: "#a78bfa",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: SelectAllOutlined,
      color: "#c084fc",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "onbeforematch" in HTMLElement.prototype ? "available" : "unsupported",
    ),
  Component: S800Stage,
});
