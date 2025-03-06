import { useEffect, useState, useRef } from "react";

import {
  createVelocityFilter,
  type VelocityFilter,
} from "../../../utils/filters";
import { projectileCalculator } from "../../../utils/projectileCalculator";
import { useSimulationSettings } from "../atoms/simulationAtoms";

import type { Vector2D } from "../../../domain/projectile";
import type { RefObject } from "react";

// 発射体の型定義
interface Projectile {
  position: Vector2D;
  previousPosition: Vector2D; // 前フレームの位置（軌跡表示用）
  velocity: Vector2D;
  createdAt: number; // 発射時間
  hit: boolean; // 命中したかどうか
}

export function useProjectileDirectorSimulator(
  canvasRef: RefObject<HTMLCanvasElement>,
) {
  // UI表示用の状態（表示のみに使用）
  const [displayPosition, setDisplayPosition] = useState<Vector2D>({
    x: 0,
    y: 0,
  });
  const [displayVelocity, setDisplayVelocity] = useState<Vector2D>({
    x: 0,
    y: 0,
  });
  // 発射体のヒット回数
  const [hitCount, setHitCount] = useState<number>(0);
  // 発射体の発射回数
  const [shotCount, setShotCount] = useState<number>(0);

  const calculator = projectileCalculator;
  const parameters = useSimulationSettings();

  // フィルターへの参照を保持
  const velocityFilterRef = useRef<VelocityFilter | null>(null);
  // アクティブな発射体のリスト
  const projectilesRef = useRef<Projectile[]>([]);

  useEffect(() => {
    // パラメータが変更されたらフィルターを再作成
    velocityFilterRef.current = createVelocityFilter(parameters);

    return () => {
      // クリーンアップ時にフィルターをリセット
      if (velocityFilterRef.current) {
        velocityFilterRef.current.reset();
      }
    };
  }, [parameters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // アニメーションに必要な実際の計算値（クロージャ内変数）
    let targetPosition: Vector2D = { x: 0, y: 0 };
    let targetVelocity: Vector2D = { x: 0, y: 0 };
    let lastPosition: Vector2D = { x: 0, y: 0 };
    let lastTime: number = performance.now();
    const filterEnabled = true; // フィルターを有効にするフラグ

    // 等速直線運動と等速円運動のための状態変数
    let linearDirection = 1; // 1: 正方向、-1: 負方向
    let linearProgress = 0; // 直線運動の進行度
    let circularAngle = 0; // 円運動の角度（ラジアン）

    // 初期位置を設定（モードに応じて）
    const initializeTargetPosition = () => {
      if (parameters.targetMotion.type === "linearConstant") {
        // 等速直線運動の場合は初期位置を中心に設定
        const { centerX, centerY } = parameters.targetMotion;
        targetPosition = { x: centerX, y: centerY };
        // 表示用の状態も更新
        setDisplayPosition(targetPosition);
      } else if (parameters.targetMotion.type === "circularConstant") {
        // 等速円運動の場合は初期位置を円上の点に設定
        const { circularRadius, centerX, centerY } = parameters.targetMotion;
        // 初期角度を0として計算
        targetPosition = {
          x: centerX + circularRadius,
          y: centerY,
        };
        // 表示用の状態も更新
        setDisplayPosition(targetPosition);
      } else {
        // マウスモードの場合はキャンバス中央から少し離れた位置に設定
        targetPosition = { x: 100, y: 100 };
        setDisplayPosition(targetPosition);
      }
    };

    // 初期位置を設定
    initializeTargetPosition();

    const handleMouseMove = (e: MouseEvent) => {
      // マウスモードの場合のみ位置を更新
      if (parameters.targetMotion.type === "mouse") {
        const rect = canvas.getBoundingClientRect();
        const currentPosition = {
          x: e.clientX - rect.left - canvas.width / 2,
          y: e.clientY - rect.top - canvas.height / 2,
        };

        // 位置をクロージャ変数で直接更新
        targetPosition = currentPosition;
        // 表示用の状態も更新（再レンダリングのため）
        setDisplayPosition(currentPosition);
      }
    };

    // キャンバスクリック時に発射体を発射
    const handleCanvasClick = () => {
      // リード角を計算
      const leadAngle = calculator.calculateLeadAngle(
        targetPosition,
        targetVelocity,
        parameters.projectileSpeed,
      );

      // 発射方向（リード角を考慮）
      const angle = Math.atan2(targetPosition.y, targetPosition.x) + leadAngle;

      // 発射体の速度（方向 * 速度）- px/秒単位で設定
      const actualSpeed = parameters.projectileSpeed; // px/秒
      const velocity = {
        x: Math.cos(angle) * actualSpeed,
        y: Math.sin(angle) * actualSpeed,
      };

      // 新しい発射体を作成
      const initialPosition = { x: 0, y: 0 }; // 中心から発射
      const newProjectile: Projectile = {
        position: { ...initialPosition },
        previousPosition: { ...initialPosition }, // 初期位置は同じ
        velocity: velocity,
        createdAt: performance.now(),
        hit: false,
      };

      // 発射体リストに追加
      projectilesRef.current.push(newProjectile);

      // 発射回数をカウントアップ
      setShotCount((prev) => prev + 1);
    };

    // 等速直線運動の位置を更新する関数
    const updateLinearMotion = (deltaTime: number) => {
      const { linearSpeed, linearLength, centerX, centerY } =
        parameters.targetMotion;

      // 進行度を更新
      linearProgress +=
        (linearDirection * linearSpeed * deltaTime) / linearLength;

      // 方向転換の判定
      if (linearProgress >= 1) {
        linearProgress = 1;
        linearDirection = -1;
      } else if (linearProgress <= -1) {
        linearProgress = -1;
        linearDirection = 1;
      }

      // 新しい位置を計算（中心点を考慮）
      targetPosition = {
        x: centerX + linearProgress * linearLength,
        y: centerY, // Y軸方向には中心点のみ適用
      };

      // 速度を直接計算（px/秒単位）
      targetVelocity = {
        x: linearDirection * linearSpeed, // px/秒
        y: 0,
      };

      // 表示用の状態も更新
      setDisplayPosition(targetPosition);
    };

    // 等速円運動の位置を更新する関数
    const updateCircularMotion = (deltaTime: number) => {
      const { circularRadius, circularSpeed, centerX, centerY } =
        parameters.targetMotion;

      // 角度を更新
      circularAngle += circularSpeed * deltaTime;
      // 2πで一周するように正規化
      if (circularAngle > Math.PI * 2) {
        circularAngle -= Math.PI * 2;
      }

      // 新しい位置を計算（中心点を考慮）
      targetPosition = {
        x: centerX + Math.cos(circularAngle) * circularRadius,
        y: centerY + Math.sin(circularAngle) * circularRadius,
      };

      // 速度を直接計算（px/秒単位）
      targetVelocity = {
        x: -Math.sin(circularAngle) * circularRadius * circularSpeed, // px/秒
        y: Math.cos(circularAngle) * circularRadius * circularSpeed, // px/秒
      };

      // 表示用の状態も更新
      setDisplayPosition(targetPosition);
    };

    // 発射体の位置を更新し、衝突判定を行う
    const updateProjectiles = (deltaTime: number, currentTime: number) => {
      // deltaTimeに上限を設ける（極端に大きなフレーム間隔を防ぐ）
      const clampedDeltaTime = Math.min(deltaTime, 0.1); // 最大100ms

      const projectiles = projectilesRef.current;

      // 画面外に出た発射体や作成から5秒以上経過した発射体を削除するためのフィルター
      projectilesRef.current = projectiles.filter((projectile) => {
        // 既にヒットしている場合はそのまま残す（アニメーション表示のため）
        if (projectile.hit) {
          // ヒットしてから1秒以上経過したら削除
          return currentTime - projectile.createdAt < 1000;
        }

        // 現在の位置を前フレームの位置として保存
        projectile.previousPosition = { ...projectile.position };

        // 位置を更新 - 速度(px/秒)とdeltaTime(秒)を掛け合わせて移動量を計算
        projectile.position.x += projectile.velocity.x * clampedDeltaTime;
        projectile.position.y += projectile.velocity.y * clampedDeltaTime;

        // 画面外判定（キャンバスの大きさを考慮）
        const maxDistance = Math.max(canvas.width, canvas.height);
        if (
          Math.abs(projectile.position.x) > maxDistance ||
          Math.abs(projectile.position.y) > maxDistance ||
          currentTime - projectile.createdAt > 5000 // 5秒以上経過
        ) {
          return false; // 削除
        }

        // ターゲットとの衝突判定
        const distance = Math.sqrt(
          Math.pow(projectile.position.x - targetPosition.x, 2) +
            Math.pow(projectile.position.y - targetPosition.y, 2),
        );

        console.log("distance", distance);
        console.log("projectile.position", projectile.position);
        console.log("targetPosition", targetPosition);

        // シンプルに距離のみで衝突判定を行う
        if (distance < parameters.targetSize) {
          // 衝突した
          projectile.hit = true;
          // ヒット回数をカウントアップ
          setHitCount((prev) => prev + 1);
        }

        return true; // 残す
      });
    };

    // 発射体を描画する
    const drawProjectiles = () => {
      const projectiles = projectilesRef.current;

      projectiles.forEach((projectile) => {
        // 軌跡を描画（ヒットしていない場合のみ）
        if (!projectile.hit) {
          // 前フレームの位置と現在の位置をつなぐ線を描画
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(
            canvas.width / 2 + projectile.previousPosition.x,
            canvas.height / 2 + projectile.previousPosition.y,
          );
          ctx.lineTo(
            canvas.width / 2 + projectile.position.x,
            canvas.height / 2 + projectile.position.y,
          );
          ctx.stroke();
        }

        // 発射体自体を描画
        ctx.beginPath();

        if (projectile.hit) {
          // ヒットした場合は爆発エフェクト
          ctx.arc(
            canvas.width / 2 + projectile.position.x,
            canvas.height / 2 + projectile.position.y,
            parameters.targetSize * 1.5,
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = "rgba(255, 165, 0, 0.7)"; // オレンジ色の半透明
        } else {
          // 通常の発射体 - サイズを少し大きくして見やすく
          ctx.arc(
            canvas.width / 2 + projectile.position.x,
            canvas.height / 2 + projectile.position.y,
            5, // サイズを5pxに増加
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = "black";
        }

        ctx.fill();
      });
    };

    const animate: FrameRequestCallback = (currentTime) => {
      // 現在の時間を取得
      const deltaTime = (currentTime - lastTime) / 1000; // 秒単位

      // 動作モードに応じて位置を更新
      if (parameters.targetMotion.type === "linearConstant") {
        updateLinearMotion(deltaTime);
      } else if (parameters.targetMotion.type === "circularConstant") {
        updateCircularMotion(deltaTime);
      }

      // マウスモードの場合のみ速度を計算（他のモードでは直接計算済み）
      if (parameters.targetMotion.type === "mouse" && deltaTime > 0) {
        // 現在位置と前回位置から速度を計算（px/秒単位）
        const rawVelocity = {
          x: (targetPosition.x - lastPosition.x) / deltaTime, // px/秒
          y: (targetPosition.y - lastPosition.y) / deltaTime, // px/秒
        };

        // 速度フィルタリングを適用
        if (velocityFilterRef.current && filterEnabled) {
          targetVelocity = velocityFilterRef.current.filter(rawVelocity);
        } else {
          targetVelocity = rawVelocity;
        }
      }

      // 表示用の状態を更新
      setDisplayVelocity(targetVelocity);

      // 発射体の位置更新と衝突判定
      updateProjectiles(deltaTime, currentTime);

      // 次のフレームのために現在の位置と時間を保存
      lastPosition = { ...targetPosition };
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 座標系の中心を描画
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();

      // 動きの中心点を描画（等速直線運動と等速円運動の場合のみ）
      if (parameters.targetMotion.type !== "mouse") {
        const { centerX, centerY } = parameters.targetMotion;
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2 + centerX,
          canvas.height / 2 + centerY,
          3,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "purple";
        ctx.fill();
      }

      // 目標を描画
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2 + targetPosition.x,
        canvas.height / 2 + targetPosition.y,
        parameters.targetSize,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "red";
      ctx.fill();

      // 発射体を描画
      drawProjectiles();

      // リード角と予測位置を計算
      const leadAngle = calculator.calculateLeadAngle(
        targetPosition,
        targetVelocity,
        parameters.projectileSpeed,
      );
      const timeToTarget = calculator.calculateTimeToTarget(
        targetPosition,
        targetVelocity,
        parameters.projectileSpeed,
      );

      // 予測位置を計算
      const predictedPosition = {
        x: targetPosition.x + targetVelocity.x * timeToTarget,
        y: targetPosition.y + targetVelocity.y * timeToTarget,
      };

      // 予測位置を描画
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2 + predictedPosition.x,
        canvas.height / 2 + predictedPosition.y,
        5,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "green";
      ctx.fill();

      // リード角の線を描画
      const angle = Math.atan2(targetPosition.y, targetPosition.x) + leadAngle;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(
        canvas.width / 2 + Math.cos(angle) * parameters.predictionLineLength,
        canvas.height / 2 + Math.sin(angle) * parameters.predictionLineLength,
      );
      ctx.strokeStyle = "black";
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleCanvasClick);
    animate(performance.now()); // アニメーションループを開始

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [calculator, canvasRef, parameters]); // parametersが変わったときだけ再構築

  // parametersが変わったとき、特にtargetMotion.typeが変わったときに初期位置をリセット
  useEffect(() => {
    // canvasRefとuseStateが準備できているときのみ実行
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ターゲットモードに応じた初期位置を設定
      if (parameters.targetMotion.type === "linearConstant") {
        const { centerX, centerY } = parameters.targetMotion;
        setDisplayPosition({ x: centerX, y: centerY });
      } else if (parameters.targetMotion.type === "circularConstant") {
        const { circularRadius, centerX, centerY } = parameters.targetMotion;
        setDisplayPosition({
          x: centerX + circularRadius,
          y: centerY,
        });
      } else if (parameters.targetMotion.type === "mouse") {
        // マウスモードでは中央から少し離れた位置に
        setDisplayPosition({ x: 100, y: 100 });
      }
    }
  }, [parameters.targetMotion.type, canvasRef, parameters.targetMotion]);

  return {
    targetPosition: displayPosition,
    targetVelocity: displayVelocity,
    calculator,
    parameters,
    hitCount,
    shotCount,
  };
}
