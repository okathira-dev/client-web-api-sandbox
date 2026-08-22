import { hasNoSharedS760Properties, matchesS760Card } from "./S-760.functions";

describe("S-760 contact result checks", () => {
  it("accepts the complete fictional card without storing identity", () => {
    expect(
      matchesS760Card({
        name: ["Busybox Courier"],
        email: ["courier@busybox.invalid"],
        tel: ["+81 3-0000-0000"],
        address: [
          {
            addressLine: ["1-1-1 Busybox"],
            city: "Tokyo",
            postalCode: "100-0001",
            country: "Japan",
          },
        ],
        icon: [new Blob(["icon"])],
      }),
    ).toBe(true);
  });

  it("requires all five properties and distinguishes a selected empty result", () => {
    expect(
      matchesS760Card({
        name: ["Busybox Courier"],
        email: ["courier@busybox.invalid"],
        tel: ["+81 3-0000-0000"],
      }),
    ).toBe(false);
    expect(hasNoSharedS760Properties({})).toBe(true);
    expect(hasNoSharedS760Properties(undefined)).toBe(false);
    expect(hasNoSharedS760Properties({ name: ["Busybox Courier"] })).toBe(
      false,
    );
  });
});
