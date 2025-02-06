import { ReedName } from "../../config/rightHand/config";

// リードの有効/無効状態の型
export type ReedActivation = Record<ReedName, boolean>;

// リードのピッチの型
export type ReedPitches = Record<ReedName, number>;
