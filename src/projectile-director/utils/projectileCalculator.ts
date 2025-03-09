import type { Vector2D, ProjectileCalculator } from "../domain/projectile";

/**
 * リード角を計算する関数
 */
export const calculateLeadAngle = (
  targetPos: Vector2D,
  targetVel: Vector2D,
  projectileSpeed: number,
): number => {
  // 目標の速度を計算
  const targetSpeed = Math.sqrt(
    targetVel.x * targetVel.x + targetVel.y * targetVel.y,
  );

  // 目標が静止している場合やプロジェクタイル速度が0の場合はリード角0
  if (targetSpeed === 0 || projectileSpeed <= 0) {
    return 0;
  }

  // 目標の移動方向の角度を計算
  const targetAngle = Math.atan2(targetVel.y, targetVel.x);

  // 目標までの角度を計算
  const targetPositionAngle = Math.atan2(targetPos.y, targetPos.x);

  // 目標までの距離が0の場合はリード角0
  if (targetPos.x === 0 && targetPos.y === 0) {
    return 0;
  }

  // 正弦定理を使用してリード角を計算
  // 計算不能な場合（ターゲットが発射体より速い場合など）は0を返す
  try {
    // sinの値がsinの定義域を超えないようにクランプ
    const sinValue =
      (targetSpeed * Math.sin(targetAngle - targetPositionAngle)) /
      projectileSpeed;

    // -1から1の範囲に制限
    const clampedSinValue = Math.max(-1, Math.min(1, sinValue));

    return Math.asin(clampedSinValue);
  } catch (e) {
    console.warn("リード角の計算中にエラーが発生しました:", e);
    return 0;
  }
};

/**
 * 目標到達時間を計算する関数
 */
export const calculateTimeToTarget = (
  targetPos: Vector2D,
  targetVel: Vector2D,
  projectileSpeed: number,
): number => {
  // 目標までの距離を計算
  const distance = Math.sqrt(
    targetPos.x * targetPos.x + targetPos.y * targetPos.y,
  );

  // 距離または発射体速度が0の場合は到達時間0
  if (distance === 0 || projectileSpeed <= 0) {
    return 0;
  }

  // 目標の速度を計算
  const targetSpeed = Math.sqrt(
    targetVel.x * targetVel.x + targetVel.y * targetVel.y,
  );

  // 目標が静止している場合は単純な距離/速度
  if (targetSpeed === 0) {
    return distance / projectileSpeed;
  }

  // 目標の移動方向の角度を計算
  const targetAngle = Math.atan2(targetVel.y, targetVel.x);

  // 目標までの角度を計算
  const targetPositionAngle = Math.atan2(targetPos.y, targetPos.x);

  // 相対速度を計算
  try {
    const relativeSpeed = Math.sqrt(
      Math.pow(projectileSpeed, 2) +
        Math.pow(targetSpeed, 2) -
        2 *
          projectileSpeed *
          targetSpeed *
          Math.cos(targetAngle - targetPositionAngle),
    );

    // 相対速度が0になる場合は発射体が目標に追いつけない
    if (relativeSpeed <= 0) {
      return Number.POSITIVE_INFINITY;
    }

    // 到達時間を計算
    return distance / relativeSpeed;
  } catch (e) {
    console.warn("到達時間の計算中にエラーが発生しました:", e);
    return 0;
  }
};

/**
 * ProjectileCalculatorインターフェースを実装した関数オブジェクト
 */
export const projectileCalculator: ProjectileCalculator = {
  calculateLeadAngle,
  calculateTimeToTarget,
};
