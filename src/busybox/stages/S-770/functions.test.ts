import { isManualGoogleFedCm } from "./functions";

describe("S-770 Google FedCM result boundary", () => {
  it("accepts only a manual fedcm result with an opaque token", () => {
    expect(
      isManualGoogleFedCm({ select_by: "fedcm", credential: "opaque" }),
    ).toBe(true);
    for (const select_by of [
      "fedcm_auto",
      "auto",
      "user",
      "btn",
      "btn_confirm",
      undefined,
    ]) {
      expect(isManualGoogleFedCm({ select_by, credential: "opaque" })).toBe(
        false,
      );
    }
    expect(isManualGoogleFedCm({ select_by: "fedcm", credential: "" })).toBe(
      false,
    );
  });
});
