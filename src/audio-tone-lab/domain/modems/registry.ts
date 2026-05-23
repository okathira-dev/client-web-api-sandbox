import { createGgwaveDriver } from "./backends/ggwave/createGgwaveDriver";
import { createQuietDriver } from "./backends/quiet/createQuietDriver";
import { createWebAudioDriver } from "./backends/webaudio/createWebAudioDriver";
import type { ModemDriver, ModemId } from "./types";

const drivers: Record<ModemId, ModemDriver> = {
  QUIET_AUDIBLE: createQuietDriver("QUIET_AUDIBLE"),
  QUIET_ULTRASONIC: createQuietDriver("QUIET_ULTRASONIC"),
  GGWAVE_AUDIBLE: createGgwaveDriver(),
  MFSK_AUDIBLE_4: createWebAudioDriver("MFSK_AUDIBLE_4"),
  GMSK_WEB: createWebAudioDriver("GMSK_WEB"),
  FSK_TUNABLE_FAST: createWebAudioDriver("FSK_TUNABLE_FAST"),
};

export function getModemDriver(modemId: ModemId): ModemDriver {
  const driver = drivers[modemId];
  if (!driver) throw new Error(`unknown modem: ${modemId}`);
  return driver;
}

export function listModemDrivers(): ModemDriver[] {
  return Object.values(drivers);
}
