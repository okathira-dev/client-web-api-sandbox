import type { PocRoot } from "../contracts";

type AudioTrackListLike = EventTarget & {
  length: number;
  [index: number]:
    | { label?: string; language?: string; enabled?: boolean }
    | undefined;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const video = root.querySelector<HTMLVideoElement>(
    "[data-audio-track-video]",
  );
  const inspect = root.querySelector<HTMLButtonElement>(
    "[data-audio-track-inspect]",
  );
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const inspectTracks = () => {
    const tracks = (
      video as HTMLVideoElement & { audioTracks?: AudioTrackListLike }
    )?.audioTracks;
    if (!tracks) {
      render(
        "HTMLMediaElement.audioTracksがありません。custom pickerで迂回しません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    const labels = Array.from({ length: tracks.length }, (_, index) => {
      const track = tracks[index];
      return `${index}:${track?.label ?? ""}/${track?.language ?? ""}/enabled=${Boolean(track?.enabled)}`;
    });
    render(
      `native AudioTrackList: ${labels.join("; ")}\nplayer標準UIからtrack変更後に再度inspectしてください。`,
    );
    root.dataset.pocState = "partial";
  };
  inspect?.addEventListener("click", inspectTracks);
  return () => inspect?.removeEventListener("click", inspectTracks);
}
