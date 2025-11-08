import type { TranslationResource } from "../types";

const translation: TranslationResource = {
  accordion: {
    title: "Chromatic Button Accordion with Computer Keyboard",
    pitch: {
      base: "Base Pitch",
      relative: "Relative Pitch[cent]",
      units: {
        cent: "cent",
        hz: "Hz",
      },
    },
    volume: "Volume",
    reeds: {
      toggle: "Reed Switches",
      bassNote: "Bass Note Reed",
      chord: "Chord Reed",
    },
    register: {
      title: "Register Switches",
      description: "(F1-F12, drag to reorder)",
    },
    audio: {
      device: "Audio Output Device",
      errors: {
        permission: "Please allow access to audio devices",
        browser: "Your browser does not support audio output device selection",
        change: "Failed to change audio device: {{message}}",
      },
    },
    latency: {
      label: "audio output latency",
      value: "{{ value }}ms",
      unavailable: "N/A",
      update: "update interval: {{ value }}",
      lookAhead: "look-ahead time: {{ value }}",
      base: "base delay: {{ value }}",
      output: "output delay: {{ value }}",
      total: "total(look-ahead + base + output): {{ value }}",
    },
    display: {
      label: "Display Mode",
      left: "Left Hand (Accompaniment)",
      right: "Right Hand (Melody)",
    },
  },
  keyboard: {
    view: {
      label: "Keyboard View",
      keytop: "Key Top",
      note: "Note (C4, C#4, D4...)",
      doremi: "Note (Do-Re-Mi)",
    },
    backslashPosition: {
      label: "Backslash Position",
      secondRow: "2nd Row (US / ANSI)",
      thirdRow: "3rd Row (ISO / JIS)",
    },
    system: {
      label: "Keyboard System",
      c: "C-system",
      b: "B-system",
    },
    doremi: {
      c: "Do",
      cSharp: "Do#",
      d: "Re",
      dSharp: "Re#",
      e: "Mi",
      f: "Fa",
      fSharp: "Fa#",
      g: "Sol",
      gSharp: "Sol#",
      a: "La",
      aSharp: "La#",
      b: "Si",
    },
  },
  common: {
    errors: {
      microphoneAccess: {
        denied: "Microphone access was denied",
        required:
          "Microphone access permission is required to change audio output devices.",
      },
      browserLimitations: {
        userInteractionRequired:
          "Due to browser restrictions, audio playback requires user interaction first.",
        audioDeviceChangeUnsupported:
          "Your browser may not support changing audio output devices.",
      },
      devices: {
        enumerationFailed: "Failed to get device list: {{message}}",
        noOutputDevices: "No output devices found",
        unexpectedError: "An unexpected error occurred",
      },
    },
    actions: {
      enable: "Enable audio",
    },
  },
};

export default translation;
