import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
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
import {
  type ContactInfoLike,
  hasNoSharedS760Properties,
  matchesS760Card,
} from "./functions";
import { locale } from "./locale";

type ContactsManagerLike = {
  select(
    properties: readonly string[],
    options: { multiple: false },
  ): Promise<ContactInfoLike[]>;
};

const properties = ["name", "email", "tel", "address", "icon"] as const;

function iconUrl(): string {
  return new URL(
    "busybox/contact/courier-icon.svg",
    new URL(import.meta.env.BASE_URL, location.origin),
  ).href;
}

/**
 * S-760
 *
 * 目的: page内formではなくOS所有のContact Pickerで、架空contactの5property共有と、一件を選びながら全propertyを伏せた結果を対比する。
 * 最初の一手: 画面のname / email / tel / address / iconを端末の連絡先へ架空人物として追加し、最初のbuttonからOS pickerを開く。
 * 箱ごとの解法: B01は一件のname、email、正規化tel、addressの4 token、非空icon Blobが名刺と一致すると開く。B02は同じ5propertyを要求した実pickerが一件を返し、その五つがすべて空または欠損なら開く。
 * 開かない操作: pageへの手入力、game製picker、取消、0件、複数件、contact identityだけ、共有拒否理由の推定、iconなし、部分一致では開かない。
 * 使用API: Contact Picker API、ContactsManager.select、ContactInfo、Blob。
 * 権限・privacy: 返却contactはcurrent call内でboolean照合後に破棄し、名前、電話、住所、画像、生dataをDOM、console、storage、同期、送信へ残さない。
 * cleanup: pickerは一回ごとのpromiseだけを持ち、完了・取消・stage離脱後にContactInfo参照を保持しない。OS側contact削除はplayerが端末で行う。
 * 対応環境: Contact Pickerを公開するAndroid等のsecure context。非対応desktopへ独自選択UIを出さない。
 * 人手確認: H-003/H-004/H-019/H-023/H-025/H-047で架空contact作成、5property、全非共有、取消、削除、非保存を確認する。
 */
function S760Stage(props: Props) {
  const fullProblem = props.boxes[manifest.box.B01];
  const emptyProblem = props.boxes[manifest.box.B02];
  const [status, setStatus] = useState(() =>
    stageText(props.locale, locale.idle),
  );

  const select = async (emptyMode: boolean) => {
    const contacts = (
      navigator as Navigator & { contacts?: ContactsManagerLike }
    ).contacts;
    if (!contacts?.select) {
      setStatus(stageText(props.locale, locale.unavailable));
      return;
    }
    try {
      const result = await contacts.select(properties, { multiple: false });
      const contact = result.length === 1 ? result[0] : undefined;
      if (emptyMode && hasNoSharedS760Properties(contact)) {
        emptyProblem.solve();
        setStatus(stageText(props.locale, locale.emptySuccess));
      } else if (!emptyMode && matchesS760Card(contact)) {
        fullProblem.solve();
        setStatus(stageText(props.locale, locale.fullSuccess));
      } else {
        setStatus(stageText(props.locale, locale.mismatch));
      }
    } catch {
      setStatus(stageText(props.locale, locale.cancelled));
    }
  };

  const image = iconUrl();
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <StageProblemGiftBox box={fullProblem} locale={props.locale} />
        <StageProblemGiftBox box={emptyProblem} locale={props.locale} />
      </div>
      <article className="s760-card">
        <img
          src={image}
          alt={stageText(props.locale, locale.iconAlt)}
          width={512}
          height={512}
        />
        <dl>
          <dt>{stageText(props.locale, locale.nameLabel)}</dt>
          <dd>Busybox Courier</dd>
          <dt>{stageText(props.locale, locale.emailLabel)}</dt>
          <dd>courier@busybox.invalid</dd>
          <dt>{stageText(props.locale, locale.telLabel)}</dt>
          <dd>+81 3-0000-0000</dd>
          <dt>{stageText(props.locale, locale.addressLabel)}</dt>
          <dd>1-1-1 Busybox, Tokyo 100-0001, Japan</dd>
          <dt>{stageText(props.locale, locale.iconLabel)}</dt>
          <dd>
            <a href={image} download="busybox-courier.svg">
              {stageText(props.locale, locale.saveIcon)}
            </a>
          </dd>
        </dl>
      </article>
      <p>{stageText(props.locale, locale.idle)}</p>
      <div className="stage-action-row">
        <button
          type="button"
          className="stage-action"
          onClick={() => void select(false)}
        >
          {stageText(props.locale, locale.full)}
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => void select(true)}
        >
          {stageText(props.locale, locale.empty)}
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
      icon: DevicesOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: VisibilityOffOutlined,
      color: "#94a3b8",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "contacts" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S760Stage,
});
