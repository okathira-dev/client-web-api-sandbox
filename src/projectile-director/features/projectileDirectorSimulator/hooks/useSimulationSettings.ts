import {
  useSimulationSettings,
  useSetSimulationSettings,
  type FilterType,
  type TargetMotionType,
} from "../atoms/simulationAtoms";

export function useSimulationSettingsControl() {
  const parameters = useSimulationSettings();
  const setParameters = useSetSimulationSettings();

  // 通常のトップレベルパラメータの変更ハンドラー
  const handleChange =
    (field: keyof typeof parameters) =>
    (
      event: React.ChangeEvent<HTMLInputElement> | Event,
      value?: number | number[] | string,
    ) => {
      const newValue =
        typeof value !== "undefined"
          ? value
          : (event.target as HTMLInputElement).value;
      setParameters((prev) => ({ ...prev, [field]: newValue }));
    };

  // フィルターパラメータ（ネストされたオブジェクト）の変更ハンドラー
  const handleFilterParamChange =
    (paramName: keyof typeof parameters.filterParams) =>
    (
      event: React.ChangeEvent<HTMLInputElement> | Event,
      value?: number | number[],
    ) => {
      const newValue =
        typeof value === "number"
          ? value
          : Number((event.target as HTMLInputElement).value);

      setParameters((prev) => ({
        ...prev,
        filterParams: {
          ...prev.filterParams,
          [paramName]: newValue,
        },
      }));
    };

  // フィルタータイプの変更ハンドラー
  const handleFilterTypeChange = (newFilterType: FilterType) => {
    setParameters((prev) => ({
      ...prev,
      filterType: newFilterType,
    }));
  };

  // ターゲット動作モードの変更ハンドラー
  const handleTargetMotionTypeChange = (newMotionType: TargetMotionType) => {
    setParameters((prev) => ({
      ...prev,
      targetMotion: {
        ...prev.targetMotion,
        type: newMotionType,
      },
    }));
  };

  // ターゲット動作パラメータの変更ハンドラー
  const handleTargetMotionParamChange =
    (paramName: keyof Omit<typeof parameters.targetMotion, "type">) =>
    (
      event: React.ChangeEvent<HTMLInputElement> | Event,
      value?: number | number[],
    ) => {
      const newValue =
        typeof value === "number"
          ? value
          : Number((event.target as HTMLInputElement).value);

      setParameters((prev) => ({
        ...prev,
        targetMotion: {
          ...prev.targetMotion,
          [paramName]: newValue,
        },
      }));
    };

  return {
    parameters,
    setParameters,
    handleChange,
    handleFilterParamChange,
    handleFilterTypeChange,
    handleTargetMotionTypeChange,
    handleTargetMotionParamChange,
  };
}
