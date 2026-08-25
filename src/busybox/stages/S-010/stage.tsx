import EditOutlined from "@mui/icons-material/EditOutlined";
import MouseOutlined from "@mui/icons-material/MouseOutlined";
import TouchAppOutlined from "@mui/icons-material/TouchAppOutlined";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

/**
 * 目的: ポインター種別を区別して観測する。
 * 最初の一手: それぞれの箱を対応するポインターで操作する。
 * 箱ごとの解法: B01〜B03をmouse、touch、penで押す。
 * 開かない操作: 異なるポインター種別や合成イベント。
 * API/権限: Pointer Eventsを使い、権限は不要。
 * cleanup/環境: listenerを持たず、対応ポインターのある環境で動作する。
 * 人手確認: H-001。
 */
function S010Stage(props: Props) {
  const boxes = [
    ["mouse", props.boxes.B01],
    ["touch", props.boxes.B02],
    ["pen", props.boxes.B03],
  ] as const;

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row" aria-live="polite">
        {boxes.map(([pointerType, box]) => (
          <StageProblemGiftBox
            key={box.id}
            box={box}
            locale={props.locale}
            onPointerDown={(event) => {
              if (event.pointerType === pointerType) box.solve();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: MouseOutlined,
      tone: "blue",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: TouchAppOutlined,
      tone: "rose",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: EditOutlined,
      tone: "green",
      label: locale.B03,
    },
  },
  Component: S010Stage,
});
