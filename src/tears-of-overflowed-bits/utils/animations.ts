import * as THREE from "three";

import { easingFuncList } from "./easings";

import type { AnimParam } from "../types";

/**
 * Three.jsのオブジェクトにアニメーションを適用する関数
 * @param object アニメーションを適用するオブジェクト
 * @param t アニメーション時間 (0-1)
 * @param param アニメーションパラメータ
 */
export const applyAnimation = (
  object: THREE.Object3D,
  t: number,
  param: AnimParam,
) => {
  if (param.easing === "none") return;

  const { x = 0, y = 0, rot = 0, rotX = 0, rotY = 0, easing } = param;

  const easedTime = easingFuncList[easing](t);

  // 位置のアニメーション
  object.position.x += x * easedTime;
  object.position.y += y * easedTime;

  // 回転のアニメーション
  // 回転軸周りの回転を表現するために一時的にグループ化する
  if (rot !== 0) {
    // 回転軸の位置を保存
    const originalPosition = object.position.clone();

    // 回転軸に移動
    object.position.x += rotX;
    object.position.y += rotY;

    // Z軸周りに回転
    object.rotateZ(THREE.MathUtils.degToRad(rot * easedTime));

    // 回転軸から戻る
    object.position.x = originalPosition.x;
    object.position.y = originalPosition.y;
  }
};
