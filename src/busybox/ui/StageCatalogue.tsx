import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import PlayCircleOutlineOutlined from "@mui/icons-material/PlayCircleOutlineOutlined";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import { type ReactNode, useEffect, useState } from "react";
import {
  deriveStageAccessKind,
  type StageManifest,
} from "../runtime/stageContract";
import { uiText } from "./locale";

type Group = ReturnType<typeof deriveStageAccessKind>;

const groups: readonly Group[] = [
  "baseline-direct",
  "baseline-permission",
  "limited",
];

const groupIcon = {
  "baseline-direct": PlayCircleOutlineOutlined,
  "baseline-permission": AdminPanelSettingsOutlined,
  limited: ScienceOutlined,
} as const;

const groupLabel = {
  "baseline-direct": "stageAccessDirect",
  "baseline-permission": "stageAccessPermission",
  limited: "stageAccessLimited",
} as const;

interface Props {
  locale: "ja" | "en";
  stages: readonly StageManifest[];
  renderStage(stage: StageManifest): ReactNode;
}

/** Flat, independent stage groups. No map topology or cross-stage clues. */
export function StageCatalogue({ locale, stages, renderStage }: Props) {
  const [markerToken, setMarkerToken] = useState<string | null>(null);

  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get(
      "catalogue-round",
    );
    if (!token) return;
    const channel = new BroadcastChannel(`busybox:catalogue-marker:${token}`);
    const receive = (event: MessageEvent<unknown>) => {
      if (event.data === `arm:${token}`) setMarkerToken(token);
    };
    channel.addEventListener("message", receive);
    channel.postMessage(`hello:${token}`);
    return () => channel.close();
  }, []);

  return (
    <div className="stage-catalogue">
      {groups.map((group) => {
        const Icon = groupIcon[group];
        const groupStages = stages.filter(
          (stage) => deriveStageAccessKind(stage.platform) === group,
        );
        if (groupStages.length === 0) return null;
        return (
          <section className="stage-catalogue__group" key={group}>
            <h3>
              <Icon fontSize="inherit" aria-hidden="true" />
              {uiText(locale, groupLabel[group])}
            </h3>
            <ul className="stage-grid">
              {groupStages.map((stage) => (
                <li key={stage.id}>{renderStage(stage)}</li>
              ))}
            </ul>
          </section>
        );
      })}
      <div
        className={`stage-catalogue__marker ${markerToken ? "stage-catalogue__marker--active" : ""}`}
        data-busybox-catalogue-marker={markerToken ?? "inactive"}
        aria-hidden="true"
      />
    </div>
  );
}
