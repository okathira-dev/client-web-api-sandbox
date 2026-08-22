import { useId, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s690Locale } from "./S-690.locale";

const passages = [
  {
    sentence: "Copper moths gather beneath the quiet observatory.",
    token: "text",
  },
  {
    sentence: "A silver compass sleeps inside the eastern drawer.",
    token: "fragments",
  },
  {
    sentence: "Violet rain marks the page no catalog remembers.",
    token: "leave",
  },
  {
    sentence: "The final lantern burns beside the word home.",
    token: "trails",
  },
] as const;

const answer = "busybox{text_fragments_leave_trails}";

function textFragmentHref(sentence: string) {
  const url = new URL(location.href);
  url.hash = `:~:text=${encodeURIComponent(sentence)}`;
  return url.href;
}

/**
 * S-690 — 同一pageのText Fragment linkを辿り、散らばった語から固定flagを組み立てる。
 * 目的: URL Fragment Text Directivesが通常のanchorではなく、ブラウザ自身が文章を示す移動手段であることを体験する。
 * 最初の一手: 「最初の一節へ」を押し、ブラウザが示した英文のそばにある小さな語を読む。
 * 箱ごとの解法: B01は4つの実Text Fragment linkを順に辿り、`text`、`fragments`、`leave`、`trails`を`_`で結んだ`busybox{text_fragments_leave_trails}`を回答欄へ入れると開く。各jumpの成否はscriptで数えない。
 * 開かない操作: 通常hashだけを変える、記事を手でscrollする、URLを読むだけ、合成event、DevToolsで文面や回答値を改変するだけでは開かない。最終回答の完全一致が必要である。
 * 使用API: URL Fragment Text Directives、HTML form。target sentenceは独自英文としてstage内に固定し、外部文書やnetwork requestへ依存しない。
 * 権限・privacy: 権限、保存、送信は行わない。回答は既存進捗runtimeへ成功事実だけを渡し、入力途中の文字列はstage内stateにだけ保持する。
 * cleanup: listener、timer、object URL、外部接続を作らない。stage離脱でReact stateが破棄される。
 * 対応環境: Text Fragment対応browserでUA highlightを見られる。未対応でも記事と回答欄は読めるが、ブラウザ固有の移動体験は得られない。
 * 人手確認: H-054で4linkのUA highlight、Back / Forward、reload、狭いviewport、通常hashでは回答が漏れないことを確認する。
 */
export default function S690Stage(props: StageComponentProps) {
  const problem = props.problem("S-690-B01");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const answerId = useId();
  const hrefs = useMemo(
    () => passages.map((passage) => textFragmentHref(passage.sentence)),
    [],
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim().toLowerCase() === answer) {
      problem.solve(["text-fragment:trail-answer"]);
      setStatus(stageText(props.locale, s690Locale.answerCorrect));
      return;
    }
    setStatus(stageText(props.locale, s690Locale.answerWrong));
  };

  return (
    <div className="puzzle s690-stage">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <p className="s690-stage__intro">
        {stageText(props.locale, s690Locale.intro)}
      </p>
      <a className="stage-action s690-stage__start" href={hrefs[0]}>
        {stageText(props.locale, s690Locale.start)}
      </a>
      <article className="s690-article">
        <p>
          The old map room opened only after rain, when the brass windows forgot
          which way the city faced. Its shelves held field notes from patient
          observers, each written for a reader who could walk through a page
          instead of merely turning it. No index named the important lines.
        </p>
        <p>
          Visitors usually began at the globe near the door. It had a hairline
          crack across one ocean and a thumbprint pressed into another, but no
          country was marked in ink. The curator said that a useful map should
          leave enough room for a traveler to notice where they had arrived.
        </p>
        <p>
          Around the room, brass labels named ordinary tools: ruler, lens,
          string, brush, envelope. Their descriptions were equally ordinary,
          though each one mentioned a route, a return, or a place to pause. The
          notes never demanded attention. They waited for it with remarkable
          patience.
        </p>
        {passages.map((passage, index) => (
          <section className="s690-passage" key={passage.token}>
            <p>{passage.sentence}</p>
            <aside>
              <code>{passage.token}</code>
              {index + 1 < passages.length ? (
                <a href={hrefs[index + 1]}>
                  {stageText(props.locale, s690Locale.next)}
                </a>
              ) : null}
            </aside>
          </section>
        ))}
        <p>
          In the mornings, a messenger brought weather reports that had already
          become wrong. The archivist filed them beside sketches of roofs,
          receipts for lamp oil, and letters from people who had taken the long
          way home. Nothing was discarded merely because the day had changed.
        </p>
        <p>
          The room had no secret door, despite the stories told by new staff.
          There were only shelves, margins, and the small decisions a reader
          made while moving from one observation to the next. Some routes were
          recorded in ink; others appeared only when the reader followed them.
        </p>
        <p>
          The archivist insisted that every useful route had to be short enough
          to repeat, yet strange enough to remember. A reader who followed the
          signals would leave with a compact instruction rather than a borrowed
          story. The rest of the cabinet could stay quietly closed.
        </p>
        <p>
          Beyond the observatory, the paper road continued through rooms that
          were never built. The descriptions mattered less than the small marks
          left beside them: each mark was ordinary on its own, but together they
          described how this page wanted to be read.
        </p>
        <p>
          At closing time, the curator checked that every window was latched and
          every loose sheet had found a folder. Then they left the map room
          exactly as it was: quiet, unfinished, and ready for another person to
          discover that a page can offer directions without owning the journey.
        </p>
        <p>
          A note taped to the desk described the practice in plain language.
          Read the line the browser points to. Keep the small word beside it.
          Follow the next line, not because a script counts the trip, but
          because the marks become meaningful only when the reader moves.
        </p>
      </article>
      <form className="s690-answer" onSubmit={submit}>
        <label htmlFor={answerId}>
          {stageText(props.locale, s690Locale.answerLabel)}
        </label>
        <div>
          <input
            id={answerId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={stageText(props.locale, s690Locale.answerPlaceholder)}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
          />
          <button type="submit">
            {stageText(props.locale, s690Locale.answerLabel)}
          </button>
        </div>
        <small>{stageText(props.locale, s690Locale.answerHint)}</small>
        <output aria-live="polite">{status}</output>
      </form>
    </div>
  );
}
