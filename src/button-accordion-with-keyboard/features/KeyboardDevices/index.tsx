import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ButtonGroup,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";

import {
  useAccordionModeValue,
  useSetAccordionMode,
  useLeftHandKeyboardValue,
  useSetLeftHandKeyboard,
  useRightHandKeyboardValue,
  useSetRightHandKeyboard,
} from "../../atoms/accordionMode";

export const KeyboardDevices = () => {
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [error, setError] = useState<string>("");

  const accordionMode = useAccordionModeValue();
  const setAccordionMode = useSetAccordionMode();
  const leftHandKeyboard = useLeftHandKeyboardValue();
  const setLeftHandKeyboard = useSetLeftHandKeyboard();
  const rightHandKeyboard = useRightHandKeyboardValue();
  const setRightHandKeyboard = useSetRightHandKeyboard();

  const requestKeyboards = async () => {
    try {
      const filters = [
        {
          usage: 0x06,
          usagePage: 0x01,
        },
      ];

      const devices = await navigator.hid.requestDevice({ filters });

      setDevices((prev) => [...prev, ...devices]);
      setError("");
    } catch (err) {
      setError("キーボードデバイスの取得に失敗しました。");
      console.error("Error requesting HID devices:", err);
    }
  };

  useEffect(() => {
    navigator.hid
      .getDevices()
      .then((hidDevices) => {
        setDevices(hidDevices);
      })
      .catch((err) => {
        setError("キーボードデバイスの取得に失敗しました。");
        console.error("Error requesting HID devices:", err);
      });
  }, []);

  const canEnableDualMode =
    leftHandKeyboard !== null && rightHandKeyboard !== null;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        キーボードデバイス
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="contained"
          onClick={() => {
            void requestKeyboards();
          }}
        >
          キーボードを追加
        </Button>

        {error && <Typography color="error">{error}</Typography>}

        <List>
          {devices.map((device, index) => (
            <ListItem
              key={`${device.vendorId}-${device.productId}-${index}`}
              secondaryAction={
                <ButtonGroup>
                  <Button
                    variant={
                      leftHandKeyboard === device ? "contained" : "outlined"
                    }
                    onClick={() => setLeftHandKeyboard(device)}
                  >
                    左手に割り当て
                  </Button>
                  <Button
                    variant={
                      rightHandKeyboard === device ? "contained" : "outlined"
                    }
                    onClick={() => setRightHandKeyboard(device)}
                  >
                    右手に割り当て
                  </Button>
                </ButtonGroup>
              }
            >
              <ListItemText
                primary={device.productName}
                secondary={`Vendor ID: ${device.vendorId}, Product ID: ${device.productId}`}
              />
            </ListItem>
          ))}
        </List>

        {devices.length >= 2 && (
          <Button
            variant="contained"
            color="secondary"
            disabled={!canEnableDualMode}
            onClick={() => {
              setAccordionMode(accordionMode === "dual" ? "right" : "dual");
            }}
          >
            {accordionMode === "dual"
              ? "片手演奏モードに切り替え"
              : "両手同時演奏モードに切り替え"}
          </Button>
        )}
      </Stack>
    </div>
  );
};
