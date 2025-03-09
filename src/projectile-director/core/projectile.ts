/**
 * 発射体に関するモジュール
 * 発射体クラスの定義と発射体の生成・管理に関する機能を提供
 */

import * as THREE from "three";

/**
 * 発射体クラス
 * Three.jsのオブジェクトとして発射体を表現し、位置・速度・軌跡を管理
 */
export class Projectile {
  position: THREE.Vector3;
  previousPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  createdAt: number;
  hit: boolean;
  mesh: THREE.Mesh | null;
  trail: THREE.Line | null;

  /**
   * 発射体のコンストラクタ
   * @param position 初期位置
   * @param velocity 初期速度
   * @param createdAt 作成時間
   */
  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    createdAt: number,
  ) {
    this.position = position.clone();
    this.previousPosition = position.clone();
    this.velocity = velocity.clone();
    this.createdAt = createdAt;
    this.hit = false;

    // Three.jsオブジェクト（後で初期化）
    this.mesh = null;
    this.trail = null;
  }

  /**
   * Three.jsオブジェクトの作成
   * @param scene 追加するシーン
   */
  createMesh(scene: THREE.Scene): void {
    // 発射体のメッシュ作成
    const projectileGeometry = new THREE.SphereGeometry(3, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    this.mesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // 軌跡用の線
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff });
    const trailGeometry = new THREE.BufferGeometry().setFromPoints([
      this.previousPosition.clone(),
      this.position.clone(),
    ]);
    this.trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(this.trail);
  }

  /**
   * 発射体の位置を更新
   * @param deltaTime 前回更新からの経過時間（秒）
   */
  update(deltaTime: number): void {
    // 前の位置を保存
    this.previousPosition.copy(this.position);

    // 新しい位置を計算
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // メッシュの位置更新
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, 0);
    }

    // 軌跡の更新
    if (this.trail) {
      // NaN値のチェック
      if (
        isNaN(this.previousPosition.x) ||
        isNaN(this.previousPosition.y) ||
        isNaN(this.position.x) ||
        isNaN(this.position.y)
      ) {
        console.warn(
          "発射体の位置にNaN値が含まれています:",
          this.previousPosition,
          this.position,
        );
        return; // 不正な値の場合は軌跡を更新しない
      }

      const trailPoints = [
        new THREE.Vector3(this.previousPosition.x, this.previousPosition.y, 0),
        new THREE.Vector3(this.position.x, this.position.y, 0),
      ];
      this.trail.geometry.dispose();
      this.trail.geometry = new THREE.BufferGeometry().setFromPoints(
        trailPoints,
      );
    }
  }

  /**
   * リソースの解放
   * @param scene シーン
   */
  dispose(scene: THREE.Scene): void {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
      this.mesh = null;
    }

    if (this.trail) {
      scene.remove(this.trail);
      this.trail.geometry.dispose();
      (this.trail.material as THREE.Material).dispose();
      this.trail = null;
    }
  }

  /**
   * 発射体が画面外に出たかチェック
   * @returns 画面外に出たかどうか
   */
  isOutOfBounds(): boolean {
    return (
      Math.abs(this.position.x) > window.innerWidth ||
      Math.abs(this.position.y) > window.innerHeight ||
      performance.now() - this.createdAt > 10000 // タイムアウト (10秒)
    );
  }
}

/**
 * 発射体管理クラス
 * 複数の発射体を管理し、更新・衝突検出・削除を行う
 */
export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * 発射体を作成して追加
   * @param position 初期位置
   * @param velocity 初期速度
   * @returns 作成された発射体
   */
  createProjectile(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
  ): Projectile {
    const projectile = new Projectile(position, velocity, performance.now());
    projectile.createMesh(this.scene);
    this.projectiles.push(projectile);
    return projectile;
  }

  /**
   * すべての発射体を更新
   * @param deltaTime 前回更新からの経過時間（秒）
   * @param targetPosition 目標位置
   * @param targetSize 目標サイズ
   * @returns ヒットした発射体の数
   */
  update(
    deltaTime: number,
    targetPosition: THREE.Vector2,
    targetSize: number,
  ): number {
    let hitCount = 0;

    // フィルタリングで発射体を更新し、削除すべきものを特定
    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile) return false;

      // 位置を更新
      projectile.update(deltaTime);

      // 当たり判定
      if (!projectile.hit) {
        const distance = new THREE.Vector2(
          projectile.position.x - targetPosition.x,
          projectile.position.y - targetPosition.y,
        ).length();

        if (distance < targetSize) {
          projectile.hit = true;
          hitCount++;
        }
      }

      // 画面外に出た場合は削除
      if (projectile.isOutOfBounds()) {
        projectile.dispose(this.scene);
        return false;
      }

      return true;
    });

    return hitCount;
  }

  /**
   * 全ての発射体を削除
   */
  clear(): void {
    this.projectiles.forEach((projectile) => {
      projectile.dispose(this.scene);
    });
    this.projectiles = [];
  }

  /**
   * 発射体の数を取得
   */
  getCount(): number {
    return this.projectiles.length;
  }
}
