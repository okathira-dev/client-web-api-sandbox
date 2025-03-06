export interface Vector2D {
  x: number;
  y: number;
}

export interface ProjectileState {
  targetPosition: Vector2D;
  targetVelocity: Vector2D;
  projectileSpeed: number;
  timeToTarget: number;
  leadAngle: number;
}

export interface ProjectileCalculator {
  calculateLeadAngle: (
    targetPos: Vector2D,
    targetVel: Vector2D,
    projectileSpeed: number,
  ) => number;
  calculateTimeToTarget: (
    targetPos: Vector2D,
    targetVel: Vector2D,
    projectileSpeed: number,
  ) => number;
}
