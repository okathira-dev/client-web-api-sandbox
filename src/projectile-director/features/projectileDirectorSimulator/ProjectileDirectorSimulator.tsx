import { useRef } from "react";

import { useProjectileDirectorSimulator } from "./hooks/useProjectileDirectorSimulator";
import { SimulatorInfo } from "./SimulatorInfo";
import { SimulatorSettings } from "./SimulatorSettings";

export function ProjectileDirectorSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    targetPosition,
    targetVelocity,
    calculator,
    parameters,
    hitCount,
    shotCount,
  } = useProjectileDirectorSimulator(canvasRef);

  return (
    <div className="projectile-director-simulator">
      <SimulatorSettings />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
      />
      <SimulatorInfo
        targetPosition={targetPosition}
        targetVelocity={targetVelocity}
        calculator={calculator}
        projectileSpeed={parameters.projectileSpeed}
        hitCount={hitCount}
        shotCount={shotCount}
      />
    </div>
  );
}
