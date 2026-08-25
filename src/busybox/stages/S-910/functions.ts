export const s910Cues = [
  { id: "circle", start: 0.4, end: 1.2 },
  { id: "triangle", start: 1.55, end: 2.35 },
  { id: "square", start: 2.7, end: 3.5 },
] as const;

export type S910CueId = (typeof s910Cues)[number]["id"];

export function activeS910CueId(time: number): S910CueId | undefined {
  return s910Cues.find((cue) => time >= cue.start && time <= cue.end)?.id;
}
