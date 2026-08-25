import { type ReactNode, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../../runtime/stageContract";
import type { CommonStatus } from "../../ui/statusLocale";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";

const startLabel = { ja: "センサーを開始", en: "Start sensor" };

/** Shared lifecycle only. Each stage owns its sensor, readings, and boxes. */
export function useStageSensor<T extends Sensor, TBoxId extends string>(
  props: StageComponentProps<TBoxId>,
  create: () => T,
  reading: (sensor: T) => void,
) {
  const [status, setStatus] = useState<CommonStatus>("idle");
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

export function SensorStageShell<TBoxId extends string>({
  props,
  children,
  start,
  status,
}: {
  props: StageComponentProps<TBoxId>;
  children: ReactNode;
  start(): void;
  status: CommonStatus;
}) {
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">{children}</div>
      <button type="button" className="stage-action" onClick={start}>
        {stageText(props.locale, startLabel)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
    </div>
  );
}
