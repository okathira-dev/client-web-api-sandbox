export const videoRecoveryFlags = {
  t1: "busybox{swap_halves}",
  t2: "busybox{merge_frames}",
  alpha: "busybox{odd_even_alpha}",
  beta: "busybox{swap_route_beta}",
} as const;

export type VideoRecoveryRoute = keyof typeof videoRecoveryFlags;

export const videoRecoveryAssets = {
  source1: new URL("./assets/source-t1.webm", import.meta.url).href,
  source2: new URL("./assets/source-t2.webm", import.meta.url).href,
  source3: new URL("./assets/source-t3.webm", import.meta.url).href,
} as const;

export const videoRecoveryOutputs = {
  t1: new URL("./assets/recovered-t1.webm", import.meta.url).href,
  t2: new URL("./assets/recovered-t2.webm", import.meta.url).href,
  alpha: new URL("./assets/recovered-alpha.webm", import.meta.url).href,
  beta: new URL("./assets/recovered-beta.webm", import.meta.url).href,
} as const;

export const videoRecoveryRoutes = {
  t1: ["source1", "t1", "output"],
  t2: ["source2", "t2", "output"],
  alpha: ["source3", "t3", "t2", "output"],
  beta: ["source3", "t1", "t3", "t2", "t1", "output"],
} as const;
