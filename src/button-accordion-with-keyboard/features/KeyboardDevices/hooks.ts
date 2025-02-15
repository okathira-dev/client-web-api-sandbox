import { useCallback, useEffect } from "react";

interface UseKeyboardDeviceProps {
  device: HIDDevice | null;
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

const keyCodeToKey: Record<number, string> = {
  4: "a",
  5: "b",
  6: "c",
  7: "d",
  8: "e",
  9: "f",
  10: "g",
  11: "h",
  12: "i",
  13: "j",
  14: "k",
  15: "l",
  16: "m",
  17: "n",
  18: "o",
  19: "p",
  20: "q",
  21: "r",
  22: "s",
  23: "t",
  24: "u",
  25: "v",
  26: "w",
  27: "x",
  28: "y",
  29: "z",
  30: "1",
  31: "2",
  32: "3",
  33: "4",
  34: "5",
  35: "6",
  36: "7",
  37: "8",
  38: "9",
  39: "0",
  44: " ",
  45: "-",
  46: "=",
  47: "[",
  48: "]",
  49: "\\",
  51: ";",
  52: "'",
  53: "`",
  54: ",",
  55: ".",
  56: "/",
};

export const useKeyboardDevice = ({
  device,
  onKeyDown,
  onKeyUp,
}: UseKeyboardDeviceProps) => {
  const handleInputReport = useCallback(
    (event: HIDInputReportEvent) => {
      const { data } = event;
      // キーボードのレポートは通常8バイトで、最初のバイトはモディファイア、
      // 残りの6バイトは同時に押されているキーのキーコード
      for (let i = 2; i < 8; i++) {
        const keyCode = data.getUint8(i);
        if (keyCode !== 0) {
          const key = keyCodeToKey[keyCode];
          if (key) {
            onKeyDown(key);
          }
        }
      }

      // キーが離されたことを検出するために、前回のキーコードと比較する
      // この実装は単純化のため、すべてのキーが離されたと仮定
      for (const key of Object.values(keyCodeToKey)) {
        onKeyUp(key);
      }
    },
    [onKeyDown, onKeyUp],
  );

  useEffect(() => {
    if (!device) return;

    const connectDevice = async () => {
      if (!device.opened) {
        try {
          await device.open();
        } catch (error) {
          console.error("Failed to open HID device:", error);
        }
      }
    };

    void connectDevice();

    device.addEventListener("inputreport", handleInputReport);

    return () => {
      device.removeEventListener("inputreport", handleInputReport);
      // デバイスのクリーンアップ
      if (device.opened) {
        void device.close();
      }
    };
  }, [device, handleInputReport]);
};
