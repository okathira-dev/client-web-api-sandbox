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

  // 目標の移動方向の角度を計算
  const targetAngle = Math.atan2(targetVel.y, targetVel.x);

  // 目標までの角度を計算
  const targetPositionAngle = Math.atan2(targetPos.y, targetPos.x);

  // 正弦定理を使用してリード角を計算
  const leadAngle = Math.asin(
    (targetSpeed * Math.sin(targetAngle - targetPositionAngle)) /
      projectileSpeed,
  );

  return leadAngle;
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

  // 目標の速度を計算
  const targetSpeed = Math.sqrt(
    targetVel.x * targetVel.x + targetVel.y * targetVel.y,
  );

  // 目標の移動方向の角度を計算
  const targetAngle = Math.atan2(targetVel.y, targetVel.x);

  // 目標までの角度を計算
  const targetPositionAngle = Math.atan2(targetPos.y, targetPos.x);

  // 相対速度を計算
  const relativeSpeed = Math.sqrt(
    Math.pow(projectileSpeed, 2) +
      Math.pow(targetSpeed, 2) -
      2 *
        projectileSpeed *
        targetSpeed *
        Math.cos(targetAngle - targetPositionAngle),
  );

  // 到達時間を計算
  return distance / relativeSpeed;
};

/**
 * ProjectileCalculatorインターフェースを実装した関数オブジェクト
 */
export const projectileCalculator: ProjectileCalculator = {
  calculateLeadAngle,
  calculateTimeToTarget,
};
