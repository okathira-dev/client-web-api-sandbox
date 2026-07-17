import { readGamepadGesture } from "./S-200";

function gamepad(buttons: readonly number[], axes: readonly number[]): Gamepad {
  return {
    connected: true,
    buttons: buttons.map((value) => ({
      pressed: value > 0.75,
      touched: value > 0,
      value,
    })),
    axes: [...axes],
  } as unknown as Gamepad;
}

describe("S-200 gamepad gesture", () => {
  it("requires two simultaneous buttons and a displaced axis", () => {
    expect(readGamepadGesture([gamepad([1, 1], [0.7])])).toEqual({
      pressed: 2,
      axis: 0.7,
      complete: true,
    });
  });

  it("does not accept buttons or axis in isolation", () => {
    expect(readGamepadGesture([gamepad([1, 1], [0.2])]).complete).toBe(false);
    expect(readGamepadGesture([gamepad([1, 0], [-0.9])]).complete).toBe(false);
  });

  it("returns a neutral reading when no controller is connected", () => {
    expect(readGamepadGesture([null])).toEqual({
      pressed: 0,
      axis: 0,
      complete: false,
    });
  });
});
