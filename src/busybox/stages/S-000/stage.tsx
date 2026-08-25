import AdsClickOutlined from "@mui/icons-material/AdsClickOutlined";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

/**
 * 目的: 最初の箱を直接操作する。
 * 最初の一手: 箱をクリックする。
 * 箱ごとの解法: B01をクリックする。
 * 開かない操作: 合成イベントや表示だけの変更。
 * API/権限: 特別なAPI・権限は使わない。
 * cleanup/環境: 後始末を必要としない。
 * 人手確認: H-001。
 */
function S000Stage(props: Props) {
  const box = props.boxes.B01;
  return (
    <div className="puzzle puzzle--centered">
      <StageProblemGiftBox
        box={box}
        locale={props.locale}
        onClick={box.solve}
      />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: AdsClickOutlined,
      tone: "violet",
      label: locale.B01,
    },
  },
  Component: S000Stage,
});
