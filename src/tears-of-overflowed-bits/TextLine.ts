import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

import { BEAT_TIME } from "./consts/animation";
import { easingFuncList } from "./utils/easings";

import type { TextLine as TextLineType, AnimParam, Letter } from "./types";
import type { Font } from "three/addons/loaders/FontLoader.js";

const DEFAULT_FONT_SIZE = 11;
const SPACING_X = 60; // 文字間隔

export class TextLine {
  private meshes: THREE.Mesh[] = [];
  private elapsedTime = 0;
  private readonly group: THREE.Group;

  constructor(
    private readonly data: TextLineType,
    private readonly font: Font,
    private readonly scene: THREE.Scene,
  ) {
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.init();
  }

  private init(): void {
    const { chrs, entry } = this.data;
    const defaultLetterParams = entry.chrs || [];
    const chrArray = [...chrs];
    const centeringX = (SPACING_X * (chrArray.length - 1)) / 2;

    // 文字列を1文字ずつ処理
    chrArray.forEach((char, index) => {
      const letterParams = defaultLetterParams[index] || {};
      const mesh = this.createLetterMesh(char, letterParams);

      // 初期位置の設定
      const x = SPACING_X * index - centeringX + (letterParams.x || 0);
      const y = letterParams.y || 0;
      mesh.position.set(x, y, 0);
      mesh.rotation.z = THREE.MathUtils.degToRad(letterParams.rot || 0);

      this.meshes.push(mesh);
      this.group.add(mesh);
    });

    // グループ全体の初期位置設定
    this.group.position.set(entry.x, entry.y, 0);
    this.group.rotation.z = THREE.MathUtils.degToRad(entry.rot);
  }

  private createLetterMesh(char: string, params: Letter): THREE.Mesh {
    const geometry = new TextGeometry(char, {
      font: this.font,
      size: params.size || DEFAULT_FONT_SIZE,
      depth: 0.1,
    });

    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Three.jsのオブジェクトにアニメーションを適用する関数
   * @param object アニメーションを適用するオブジェクト
   * @param param アニメーションパラメータ
   * @param progress アニメーション時間 (0-1)
   */
  private applyAnimParam(
    object: THREE.Object3D,
    param: AnimParam,
    progress: number,
  ): void {
    if (param.easing === "none") return;

    const { x = 0, y = 0, rot = 0, rotX = 0, rotY = 0, easing } = param;

    const easedTime = easingFuncList[easing](progress);

    // 位置のアニメーション
    object.position.x += x * easedTime;
    object.position.y += y * easedTime;

    // 回転のアニメーション
    // 回転量
    const rad = THREE.MathUtils.degToRad(rot * easedTime);

    // ピボット点が指定されていたらそれを中心とした回転をする
    // three.js 的解決法があればそれを使いたい

    // 座標の位置を計算する
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    const pivotX = rotX;
    const pivotY = rotY;

    const posX = object.position.x;
    const posY = object.position.y;

    // 回転後の新しい位置を計算（回転行列の基本公式）
    // FIXME: rotX, rotY がピボット点の絶対座標なのか相対座標なのか決めてなかった。下記は自動生成による式。
    object.position.x = (posX - pivotX) * cos - (posY - pivotY) * sin + pivotX;
    object.position.y = (posX - pivotX) * sin + (posY - pivotY) * cos + pivotY;

    // const relativePivotX = rotX;
    // const relativePivotY = rotY;
    // object.position.x = relativePivotX * cos - relativePivotY * sin + posX;
    // object.position.y = relativePivotX * sin + relativePivotY * cos + posY;

    // オブジェクト自体も回転
    object.rotateZ(rad);
  }

  update(): void {
    // ステップの計算
    const baseTime = this.elapsedTime / BEAT_TIME;
    const currentStep = Math.floor(baseTime - this.data.entry.step);

    // まだ表示時間に達していない場合は何もしない
    if (currentStep < 0) {
      this.group.visible = false;
      return;
    }

    // 表示を有効にする
    this.group.visible = true;

    // 位置と回転をリセット
    this.group.position.set(this.data.entry.x, this.data.entry.y, 0);
    this.group.rotation.set(
      0,
      0,
      THREE.MathUtils.degToRad(this.data.entry.rot),
    );
    this.meshes.forEach((mesh, index) => {
      const letterParams = this.data.entry.chrs?.[index] || {};
      const x =
        SPACING_X * index -
        (SPACING_X * (this.meshes.length - 1)) / 2 +
        (letterParams.x || 0);
      const y = letterParams.y || 0;
      mesh.position.set(x, y, 0);
      mesh.rotation.set(0, 0, THREE.MathUtils.degToRad(letterParams.rot || 0));
    });

    // アニメーションの進行度を計算
    const progress = baseTime % 1;

    // ライン全体のアニメーション
    this.data.lineAnimParams.forEach((param, i) => {
      if (i <= currentStep) {
        this.applyAnimParam(this.group, param, i < currentStep ? 1 : progress);
      }
    });

    // 文字ごとのアニメーション
    this.meshes.forEach((mesh, charIndex) => {
      const letterParams = this.data.letterAnimParamsList[charIndex];
      if (!letterParams) return;

      letterParams.forEach((param, i) => {
        if (i <= currentStep) {
          this.applyAnimParam(mesh, param, i < currentStep ? 1 : progress);
        }
      });
    });
  }

  setElapsedTime(time: number): void {
    this.elapsedTime = Math.max(0, time);
  }

  dispose(): void {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.scene.remove(this.group);
  }
}
