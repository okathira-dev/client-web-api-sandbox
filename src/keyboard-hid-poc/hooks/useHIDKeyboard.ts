import { useCallback, useEffect, useState } from "react";

export type HIDKeyboardDevice = {
  device: HIDDevice;
  name: string;
};

export const useHIDKeyboard = (onKeyPress: (key: number) => void) => {
  const [devices, setDevices] = useState<HIDKeyboardDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<HIDDevice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestDevices = useCallback(async () => {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [{ usage: 0x06, usagePage: 0x01 }], // Generic keyboard
      });
      console.log("Available HID devices:", devices);
      setDevices(
        devices.map((device) => ({
          device,
          name: device.productName || "不明なデバイス",
        })),
      );
    } catch (err) {
      console.error("Error requesting HID devices:", err);
      setError("デバイスの要求中にエラーが発生しました");
    }
  }, []);

  const selectDevice = useCallback(async (device: HIDDevice) => {
    try {
      if (!device.opened) {
        await device.open();
      }
      console.log("Selected device:", device);
      setSelectedDevice(device);
      setError(null);
    } catch (err) {
      console.error("Error opening device:", err);
      setError("デバイスのオープン中にエラーが発生しました");
    }
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    console.log("selectedDevice", selectedDevice);

    const handleInputReport = (event: HIDInputReportEvent) => {
      const data = new Uint8Array(event.data.buffer);
      console.log("Input report:", data);
      // キーコードは通常3バイト目以降に含まれます
      for (let i = 2; i < 8; i++) {
        if (data[i] !== 0) {
          onKeyPress(data[i] as number);
        }
      }
    };

    selectedDevice.addEventListener("inputreport", handleInputReport);
    return () => {
      selectedDevice.removeEventListener("inputreport", handleInputReport);
    };
  }, [selectedDevice, onKeyPress]);

  return {
    devices,
    selectedDevice,
    error,
    requestDevices,
    selectDevice,
  };
};
