export const PREFERRED_MIC_CONSTRAINTS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 1,
} as const;

export function formatMicConstraintsSummary() {
  return "echoCancellation=OFF, noiseSuppression=OFF, autoGainControl=OFF, channelCount=1";
}
