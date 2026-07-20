import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

function useSensor<T extends Sensor>(
  props: StageComponentProps,
  create: () => T,
  reading: (sensor: T) => void,
) {
  const [status, setStatus] = useState("idle");
  const sensorRef = useRef<T | null>(null);
  const start = () => {
    try {
      const sensor = create();
      sensorRef.current = sensor;
      sensor.addEventListener("reading", () => reading(sensor));
      sensor.addEventListener("error", () => setStatus("error"));
      sensor.start();
      setStatus("running");
    } catch {
      setStatus("error");
    }
  };
  useEffect(() => {
    const stop = () => sensorRef.current?.stop();
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);
  return { start, status };
}

function SensorShell({
  props,
  children,
  start,
  status,
}: {
  props: StageComponentProps;
  children: React.ReactNode;
  start(): void;
  status: string;
}) {
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">{children}</div>
      <button type="button" className="stage-action" onClick={start}>
        {props.locale === "ja" ? "センサーを開始" : "Start sensor"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}

export function S520Stage(props: StageComponentProps) {
  const problem = props.problem("S-520-B01");
  const sawFar = useRef(false);
  const sensor = useSensor(
    props,
    () => new ProximitySensor({ frequency: 10 }),
    (value) => {
      if (value.near === false) sawFar.current = true;
      if (sawFar.current && value.near === true)
        problem.solve(["proximity:far-near"]);
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </SensorShell>
  );
}

export function S530Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-530-B01"),
    props.problem("S-530-B02"),
    props.problem("S-530-B03"),
  ] as const;
  const signs = useRef([
    [false, false],
    [false, false],
    [false, false],
  ]);
  const sensor = useSensor(
    props,
    () => new LinearAccelerationSensor({ frequency: 60 }),
    (value) => {
      [value.x, value.y, value.z].forEach((axis, index) => {
        if (axis === null || Math.abs(axis) < 8) return;
        const axisSigns = signs.current[index];
        const problem = problems[index];
        if (!axisSigns || !problem) return;
        axisSigns[axis > 0 ? 1 : 0] = true;
        if (axisSigns.every(Boolean))
          problem.solve([`linear-acceleration:${"xyz"[index]}`]);
      });
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      {problems.map((problem) => (
        <ProblemGiftBox
          key={problem.definition.id}
          problem={problem}
          locale={props.locale}
        />
      ))}
    </SensorShell>
  );
}

export function S540Stage(props: StageComponentProps) {
  const dark = props.problem("S-540-B01");
  const bright = props.problem("S-540-B02");
  const sensor = useSensor(
    props,
    () => new AmbientLightSensor({ frequency: 5 }),
    (value) => {
      if (value.illuminance !== null && value.illuminance <= 5)
        dark.solve(["illuminance:dark"]);
      if (value.illuminance !== null && value.illuminance >= 10000)
        bright.solve(["illuminance:bright"]);
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      <ProblemGiftBox problem={dark} locale={props.locale} />
      <ProblemGiftBox problem={bright} locale={props.locale} />
    </SensorShell>
  );
}

export function S550Stage(props: StageComponentProps) {
  const problem = props.problem("S-550-B01");
  const run = useRef({ since: 0, count: 0 });
  const sensor = useSensor(
    props,
    () => new Accelerometer({ frequency: 60 }),
    (value) => {
      const magnitude = Math.hypot(value.x ?? 99, value.y ?? 99, value.z ?? 99);
      if (magnitude > 2) {
        run.current = { since: 0, count: 0 };
        return;
      }
      if (!run.current.since) run.current.since = performance.now();
      run.current.count += 1;
      if (run.current.count >= 3 && performance.now() - run.current.since >= 80)
        problem.solve(["accelerometer:near-zero"]);
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </SensorShell>
  );
}

export function S560Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-560-B01"),
    props.problem("S-560-B02"),
    props.problem("S-560-B03"),
  ] as const;
  const accumulated = useRef([0, 0, 0]);
  const last = useRef<number | null>(null);
  const sensor = useSensor(
    props,
    () => new Gyroscope({ frequency: 60 }),
    (value) => {
      const now = value.timestamp ?? performance.now();
      const dt =
        last.current === null ? 0 : Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      [value.x, value.y, value.z].forEach((axis, index) => {
        const prior = accumulated.current[index] ?? 0;
        accumulated.current[index] = prior + Math.abs(axis ?? 0) * dt;
        const problem = problems[index];
        if (problem && accumulated.current[index] >= Math.PI * 2)
          problem.solve([`gyroscope:${"xyz"[index]}:turn`]);
      });
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      {problems.map((problem) => (
        <ProblemGiftBox
          key={problem.definition.id}
          problem={problem}
          locale={props.locale}
        />
      ))}
    </SensorShell>
  );
}

function quaternionDistance(a: readonly number[], b: readonly number[]) {
  return Math.min(
    Math.hypot(...a.map((value, index) => value - (b[index] ?? 0))),
    Math.hypot(...a.map((value, index) => value + (b[index] ?? 0))),
  );
}

export function S570Stage(props: StageComponentProps) {
  const problem = props.problem("S-570-B01");
  const start = useRef<readonly number[] | null>(null);
  const gates = useRef(new Set<number>());
  const sensor = useSensor(
    props,
    () => new RelativeOrientationSensor({ frequency: 30 }),
    (value) => {
      const q = value.quaternion;
      if (!q) return;
      if (!start.current) {
        start.current = [...q];
        return;
      }
      const vector = q.slice(0, 3).map(Math.abs);
      vector.forEach((component, index) => {
        if (component > 0.65) gates.current.add(index);
      });
      if (
        gates.current.size === 3 &&
        quaternionDistance(q, start.current) < 0.25
      )
        problem.solve(["orientation:three-gates-return"]);
    },
  );
  return (
    <SensorShell props={props} {...sensor}>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </SensorShell>
  );
}
