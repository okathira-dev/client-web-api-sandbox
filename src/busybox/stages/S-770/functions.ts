export interface GoogleFedCmResult {
  readonly credential?: string;
  readonly select_by?: string;
}

/** Accepts only a non-empty credential produced by a manual FedCM flow. */
export function isManualGoogleFedCm(result: GoogleFedCmResult): boolean {
  return result.select_by === "fedcm" && Boolean(result.credential);
}
