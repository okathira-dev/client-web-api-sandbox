import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import PlayCircleOutlineOutlined from "@mui/icons-material/PlayCircleOutlineOutlined";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import { useEffect, useState } from "react";
import type { ProgressDocument } from "../domain/progress";
import { deriveStageProgress } from "../domain/stageRuntime";
import { messages } from "../i18n";
import {
  deriveStageAccessKind,
  type StageManifest,
} from "../runtime/stageContract";
import { GiftBox, type GiftBoxState } from "./GiftBox";
import { stageCardLabel, uiText } from "./locale";

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
  headingId: string;
  heading: string;
  progressLabel: string;
  solvedCount: number;
  totalBoxCount: number;
  locale: "ja" | "en";
  stages: readonly StageManifest[];
  progressStages: ProgressDocument["stages"];
  onOpen(stageId: string): void;
}

/** Flat, independent stage groups. No map topology or cross-stage clues. */
export function StageCatalogue({
  headingId,
  heading,
  progressLabel,
  solvedCount,
  totalBoxCount,
  locale,
  stages,
  progressStages,
  onOpen,
}: Props) {
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
    <section aria-labelledby={headingId}>
      <div className="section-heading">
        <h2 id={headingId}>{heading}</h2>
        <p>
          {progressLabel}: {solvedCount} / {totalBoxCount}
        </p>
      </div>
      <div className="stage-catalogue">
        {groups.map((group) => {
          const Icon = groupIcon[group];
          const groupStages = stages.filter(
            (stage) => deriveStageAccessKind(stage.platform) === group,
          );
          if (groupStages.length === 0) return null;
          return (
            <section className="stage-catalogue__group" key={group}>
              <h3 className="stage-catalogue__heading">
                <Icon fontSize="inherit" aria-hidden="true" />
                {uiText(locale, groupLabel[group])}
              </h3>
              <ul className="stage-grid">
                {groupStages.map((stage) => (
                  <li key={stage.id}>
                    <StageCard
                      stage={stage}
                      locale={locale}
                      stages={progressStages}
                      onOpen={onOpen}
                    />
                  </li>
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
    </section>
  );
}

interface StageCardProps {
  stage: StageManifest;
  locale: "ja" | "en";
  stages: ProgressDocument["stages"];
  onOpen(stageId: string): void;
}

function StageCard({ stage, locale, stages, onOpen }: StageCardProps) {
  const copy = messages[locale];
  const boxIds = stage.boxIds;
  const solvedBoxIds = new Set(stages[stage.id]?.solvedBoxIds ?? []);
  const accessKind = deriveStageAccessKind(stage.platform);
  const state = deriveStageProgress(boxIds, solvedBoxIds);
  const status =
    state === "solved"
      ? copy.solved
      : state === "partial"
        ? copy.partial
        : copy.available;
  const giftState: GiftBoxState =
    state === "solved" ? "open" : state === "partial" ? "closed" : "ribboned";
  const solvedBoxes = boxIds.filter((boxId) => solvedBoxIds.has(boxId)).length;

  return (
    <article
      className={`stage-card stage-card--${accessKind}`}
      data-progress={state}
    >
      <GiftBox
        state={giftState}
        color="var(--stage-access-color, #60a5fa)"
        label={`${stage.name[locale]}: ${status}`}
        size="compact"
        decorative
      />
      <div className="stage-card__text">
        <div className="stage-card__meta">
          <p className="stage-card__id">{stage.id}</p>
          <p className="stage-card__progress">
            {solvedBoxes}/{boxIds.length}
          </p>
        </div>
        <h4 className="stage-card__heading">{stage.name[locale]}</h4>
      </div>
      <button
        type="button"
        className="stage-card__hit-area"
        onClick={() => onOpen(stage.id)}
        aria-label={stageCardLabel(
          locale,
          stage.name[locale],
          solvedBoxes,
          boxIds.length,
          status,
        )}
      >
        <span className="sr-only">{copy.start}</span>
      </button>
    </article>
  );
}
