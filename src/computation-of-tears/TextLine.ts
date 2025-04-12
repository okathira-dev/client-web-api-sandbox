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
    const defaultLetterParams = entry.chrs ?? [];
    const chrArray = [...chrs];
    const centeringX = (SPACING_X * (chrArray.length - 1)) / 2;

    // 文字列を1文字ずつ処理
    chrArray.forEach((char, index) => {
      const letterParams = defaultLetterParams[index] ?? {};
      const mesh = this.createLetterMesh(char, letterParams);

      // 初期位置の設定
      const x = SPACING_X * index - centeringX + (letterParams.x ?? 0);
      const y = letterParams.y ?? 0;
      mesh.position.set(x, y, 0);
      mesh.rotation.z = THREE.MathUtils.degToRad(letterParams.rot ?? 0);

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
      size: params.size ?? DEFAULT_FONT_SIZE,
      depth: 0.1,
    });

    const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Three.jsのオブジェクトにステップのアニメーションを適用する関数
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

    const easedTime = easingFuncList[param.easing](progress);

    // 位置の移動処理
    if ("moveBy" in param && param.moveBy) {
      // 相対位置移動
      object.position.x += (param.moveBy.x ?? 0) * easedTime;
      object.position.y += (param.moveBy.y ?? 0) * easedTime;
    } else if ("moveTo" in param && param.moveTo) {
      // 絶対位置移動（線形補間）
      const startX = object.position.x;
      const startY = object.position.y;
      object.position.x = startX + (param.moveTo.x - startX) * easedTime;
      object.position.y = startY + (param.moveTo.y - startY) * easedTime;
    }

    // 回転処理
    if ("rotationAbs" in param && param.rotationAbs) {
      // 絶対ピボット点を中心とした回転
      const deg = param.rotationAbs.deg * easedTime;
      const pivotX = param.rotationAbs.x;
      const pivotY = param.rotationAbs.y;

      this.rotateAroundPivot(object, deg, pivotX, pivotY);
    } else if ("rotationRel" in param && param.rotationRel) {
      // 相対ピボット点を中心とした回転
      const deg = param.rotationRel.deg * easedTime;
      const pivotX = param.rotationRel.x ?? 0;
      const pivotY = param.rotationRel.y ?? 0;

      // オブジェクトの現在位置を基準にした相対ピボット点
      const absolutePivotX = object.position.x + pivotX;
      const absolutePivotY = object.position.y + pivotY;

      this.rotateAroundPivot(object, deg, absolutePivotX, absolutePivotY);
    }
  }

  /**
   * 指定したピボット点を中心に回転させる
   * @param object 回転させるオブジェクト
   * @param degrees 回転角度（度数法）
   * @param pivotX ピボットX絶対座標
   * @param pivotY ピボットY絶対座標
   */
  private rotateAroundPivot(
    object: THREE.Object3D,
    degrees: number,
    pivotX: number,
    pivotY: number,
  ): void {
    // 度数からラジアンに変換
    const rad = THREE.MathUtils.degToRad(degrees);
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    // 現在位置
    const posX = object.position.x;
    const posY = object.position.y;

    // 回転後の新しい位置を計算（回転行列の基本公式）
    object.position.x = (posX - pivotX) * cos - (posY - pivotY) * sin + pivotX;
    object.position.y = (posX - pivotX) * sin + (posY - pivotY) * cos + pivotY;

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
      const letterParams = this.data.entry.chrs?.[index] ?? {};
      const x =
        SPACING_X * index -
        (SPACING_X * (this.meshes.length - 1)) / 2 +
        (letterParams.x ?? 0);
      const y = letterParams.y ?? 0;
      mesh.position.set(x, y, 0);
      mesh.rotation.set(0, 0, THREE.MathUtils.degToRad(letterParams.rot ?? 0));
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
