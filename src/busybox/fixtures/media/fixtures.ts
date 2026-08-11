export type MediaCapabilityProfile = {
  id: string;
  label: string;
  contentType: string;
  width: number;
  height: number;
  framerate: number;
  bitrate: number;
};

export type MediaCapabilityResult = {
  supported: boolean;
  smooth: boolean;
  powerEfficient: boolean;
};

export const mediaCapabilityProfiles: readonly MediaCapabilityProfile[] = [
  {
    id: "vp8-360p30",
    label: "VP8 640×360 / 30",
    contentType: 'video/webm; codecs="vp8"',
    width: 640,
    height: 360,
    framerate: 30,
    bitrate: 500_000,
  },
  {
    id: "vp9-720p30",
    label: "VP9 1280×720 / 30",
    contentType: 'video/webm; codecs="vp09.00.10.08"',
    width: 1280,
    height: 720,
    framerate: 30,
    bitrate: 1_500_000,
  },
  {
    id: "h264-720p30",
    label: "H.264 1280×720 / 30",
    contentType: 'video/mp4; codecs="avc1.42E01E"',
    width: 1280,
    height: 720,
    framerate: 30,
    bitrate: 2_000_000,
  },
  {
    id: "av1-1080p30",
    label: "AV1 1920×1080 / 30",
    contentType: 'video/webm; codecs="av01.0.08M.08"',
    width: 1920,
    height: 1080,
    framerate: 30,
    bitrate: 4_000_000,
  },
  {
    id: "hevc-1080p30",
    label: "HEVC 1920×1080 / 30",
    contentType: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
    width: 1920,
    height: 1080,
    framerate: 30,
    bitrate: 5_000_000,
  },
  {
    id: "h264-1080p60",
    label: "H.264 1920×1080 / 60",
    contentType: 'video/mp4; codecs="avc1.64002A"',
    width: 1920,
    height: 1080,
    framerate: 60,
    bitrate: 8_000_000,
  },
] as const;

export function mediaProfilePixelRate(profile: MediaCapabilityProfile): number {
  return profile.width * profile.height * profile.framerate;
}

export function bestMediaCapabilityProfile(
  results: ReadonlyMap<string, MediaCapabilityResult>,
): MediaCapabilityProfile | undefined {
  return [...mediaCapabilityProfiles]
    .filter((profile) => {
      const result = results.get(profile.id);
      return result?.supported && result.smooth && result.powerEfficient;
    })
    .sort(
      (left, right) =>
        mediaProfilePixelRate(right) - mediaProfilePixelRate(left) ||
        right.bitrate - left.bitrate,
    )[0];
}

export const vfrSegments = [
  { start: 0, end: 2, framerate: 12 },
  { start: 2, end: 5, framerate: 24 },
  { start: 5, end: 7, framerate: 30 },
  { start: 7, end: 9, framerate: 60 },
] as const;

export const resolutionReels = [
  { id: "low", width: 320, height: 180, target: false },
  { id: "target", width: 640, height: 360, target: true },
  { id: "high", width: 960, height: 540, target: false },
] as const;

export const subtitleTracks = [
  { label: "Busy", language: "qaa", target: false, default: true },
  { label: "Busybox", language: "qab", target: true, default: false },
  { label: "Box", language: "qac", target: false, default: false },
] as const;

export const audioTracks = [
  {
    label: "Busy",
    language: "qaa",
    frequency: 330,
    target: false,
    default: true,
  },
  {
    label: "Busybox",
    language: "qab",
    frequency: 440,
    target: true,
    default: false,
  },
  {
    label: "Box",
    language: "qac",
    frequency: 550,
    target: false,
    default: false,
  },
] as const;
