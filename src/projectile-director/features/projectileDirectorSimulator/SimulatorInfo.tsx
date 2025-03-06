import { Typography, Box } from "@mui/material";

// レポジトリ内で見つかったProjectile.tsファイルからの型定義をインポート
interface Vector2D {
  x: number;
  y: number;
}

interface ProjectileCalculator {
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

interface SimulatorInfoProps {
  targetPosition: Vector2D;
  targetVelocity: Vector2D;
  calculator: ProjectileCalculator;
  projectileSpeed: number;
  hitCount?: number; // 命中回数（オプション）
  shotCount?: number; // 発射回数（オプション）
}

export function SimulatorInfo({
  targetPosition,
  targetVelocity,
  calculator,
  projectileSpeed,
  hitCount = 0,
  shotCount = 0,
}: SimulatorInfoProps) {
  // 命中率を計算
  const hitRate = shotCount > 0 ? (hitCount / shotCount) * 100 : 0;

  return (
    <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        シミュレーション情報
      </Typography>
      <div className="info">
        <p>
          目標位置: ({targetPosition.x.toFixed(2)},{" "}
          {targetPosition.y.toFixed(2)})
        </p>
        <p>
          目標速度: ({targetVelocity.x.toFixed(2)},{" "}
          {targetVelocity.y.toFixed(2)})
        </p>
        <p>
          リード角:{" "}
          {(
            (calculator.calculateLeadAngle(
              targetPosition,
              targetVelocity,
              projectileSpeed,
            ) *
              180) /
            Math.PI
          ).toFixed(2)}
          °
        </p>
        <p>
          予測到達時間:{" "}
          {calculator
            .calculateTimeToTarget(
              targetPosition,
              targetVelocity,
              projectileSpeed,
            )
            .toFixed(2)}
          秒
        </p>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          射撃統計
        </Typography>
        <p>発射回数: {shotCount}</p>
        <p>命中回数: {hitCount}</p>
        <p>命中率: {hitRate.toFixed(1)}%</p>
      </div>
    </Box>
  );
}
