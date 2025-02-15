import { atom, useAtomValue, useSetAtom } from "jotai";

import { createReedHooks } from "../audio/audioProcessor";

import type { ReedName } from "../consts";

// 各リードのhooksを生成と名前付け
export const {
  useSetReedPitch: useSetSopranoReedPitch,
  usePlayReed: usePlaySopranoReed,
} = createReedHooks("soprano");

export const {
  useSetReedPitch: useSetAltoReedPitch,
  usePlayReed: usePlayAltoReed,
} = createReedHooks("alto");

export const {
  useSetReedPitch: useSetTenorReedPitch,
  usePlayReed: usePlayTenorReed,
} = createReedHooks("tenor");

export const {
  useSetReedPitch: useSetBassReedPitch,
  usePlayReed: usePlayBassReed,
} = createReedHooks("bass");

// リードの有効/無効状態
type ReedStates = Record<ReedName, boolean>;
// 音の鳴り方
export type StradellaSoundType = "chord" | "bassNote";

// ストラデラベースのリードの有効/無効状態
type StradellaReedStates = {
  [key in StradellaSoundType]: ReedStates;
};

// レジスタースイッチのプリセット定義
// ref: https://en.wikipedia.org/wiki/Stradella_bass_system#Register_switches
export type StradellaRegisterName =
  | "soprano"
  | "alto"
  | "tenor"
  | "softTenor"
  | "master"
  | "softBass"
  | "bass";
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
};

// デフォルトのレジスタープリセット
const DEFAULT_STRADELLA_REGISTER: StradellaRegisterName = "softTenor";

// 現在選択中のレジスタープリセット
const stradellaRegisterAtom = atom<StradellaRegisterName>(
  DEFAULT_STRADELLA_REGISTER,
);
export const useStradellaRegisterValue = () =>
  useAtomValue(stradellaRegisterAtom);
export const useSetStradellaRegister = () => useSetAtom(stradellaRegisterAtom);

// プリセットの適用
export const useAdoptStradellaRegister = () => {
  const setStradellaReedStates = useSetStradellaReedStates();

  const adoptStradellaRegister = (
    stradellaRegisterName: StradellaRegisterName,
  ) => {
    const stradellaReedStates =
      STRADELLA_REGISTER_PRESETS[stradellaRegisterName];
    setStradellaReedStates(stradellaReedStates);
  };

  return adoptStradellaRegister;
};

// ストラデラベースのリードの有効/無効状態のatom
const stradellaReedStatesAtom = atom<StradellaReedStates>(
  STRADELLA_REGISTER_PRESETS[DEFAULT_STRADELLA_REGISTER],
);
export const useStradellaReedStatesValue = () =>
  useAtomValue(stradellaReedStatesAtom);
export const useSetStradellaReedStates = () =>
  useSetAtom(stradellaReedStatesAtom);

// リード全体の基準となるピッチ。そのままだとA4=440Hzになる。
const baseReedPitchAtom = atom<number>(0);
export const useBaseReedPitchValue = () => useAtomValue(baseReedPitchAtom);
export const useSetBaseReedPitch = () => useSetAtom(baseReedPitchAtom);

// 基準ピッチに対する各リードの相対値
type ReedPitches = Record<ReedName, number>;
const relativeReedPitchesAtom = atom<ReedPitches>({
  soprano: 1200 + 2, // C5-B5
  alto: 0 + 1, // C4-B4（基準）
  tenor: -1200, // C3-B3
  bass: -2400 - 1, // C2-B2
});

export const useRelativeReedPitchesValue = () =>
  useAtomValue(relativeReedPitchesAtom);
export const useSetRelativeReedPitches = () =>
  useSetAtom(relativeReedPitchesAtom);

// 鳴らすときの各リードのピッチ
const reedPitchesAtom = atom<ReedPitches>((get) => {
  const base = get(baseReedPitchAtom);
  const relative = get(relativeReedPitchesAtom);

  return {
    soprano: base + relative.soprano,
    alto: base + relative.alto,
    tenor: base + relative.tenor,
    bass: base + relative.bass,
  };
});

export const useReedPitchesValue = () => useAtomValue(reedPitchesAtom);

// 全リードのピッチを適用
export const useAdaptAllReedPitches = () => {
  const reedPitches = useReedPitchesValue();
  const setSopranoReedPitch = useSetSopranoReedPitch();
  const setAltoReedPitch = useSetAltoReedPitch();
  const setTenorReedPitch = useSetTenorReedPitch();
  const setBassReedPitch = useSetBassReedPitch();

  const adaptAll = () => {
    setSopranoReedPitch(reedPitches.soprano);
    setAltoReedPitch(reedPitches.alto);
    setTenorReedPitch(reedPitches.tenor);
    setBassReedPitch(reedPitches.bass);
  };

  return adaptAll;
};
