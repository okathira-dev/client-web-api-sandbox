import type {
  ReedName,
  StradellaRegisterName,
  StradellaReedStates,
} from "./types";

// リードとそのラベルの定義（フルネーム）
export const REED_LABEL_MAP_FULL: Record<ReedName, string> = {
  soprano: "Soprano",
  alto: "Alto",
  tenor: "Tenor",
  bass: "Bass",
} as const;

// リードとそのラベルの定義（略称）
export const REED_LABEL_MAP_SHORT: Record<ReedName, string> = {
  soprano: "S",
  alto: "A",
  tenor: "T",
  bass: "B",
} as const;

// デフォルトのレジスタープリセット
export const DEFAULT_STRADELLA_REGISTER: StradellaRegisterName = "softTenor";

// レジスタープリセットの定義
// ref: https://en.wikipedia.org/wiki/Stradella_bass_system#Register_switches
export const STRADELLA_REGISTER_PRESETS: Record<
  StradellaRegisterName,
  StradellaReedStates
> = {
  soprano: {
    bassNote: {
      soprano: true,
      alto: false,
      tenor: false,
      bass: false,
    },
    chord: {
      soprano: true,
      alto: false,
      tenor: false,
      bass: false,
    },
  },
  alto: {
    bassNote: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: false,
    },
    chord: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
  tenor: {
    bassNote: {
      soprano: true,
      alto: true,
      tenor: true,
      bass: false,
    },
    chord: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
  softTenor: {
    bassNote: {
      soprano: false,
      alto: true,
      tenor: true,
      bass: false,
    },
    chord: {
      soprano: false,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
  master: {
    bassNote: {
      soprano: true,
      alto: true,
      tenor: true,
      bass: true,
    },
    chord: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
  softBass: {
    bassNote: {
      soprano: false,
      alto: true,
      tenor: true,
      bass: true,
    },
    chord: {
      soprano: false,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
  bass: {
    bassNote: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: true,
    },
    chord: {
      soprano: true,
      alto: true,
      tenor: false,
      bass: false,
    },
  },
} as const;

// リードのデフォルトの相対ピッチ（単位: cent）
export const DEFAULT_RELATIVE_REED_PITCHES = {
  soprano: 1200 + 2, // C5-B5
  alto: 0 + 1, // C4-B4（基準）
  tenor: -1200, // C3-B3
  bass: -2400 - 1, // C2-B2
} as const;
