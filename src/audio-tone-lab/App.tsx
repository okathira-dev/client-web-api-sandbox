import {
  Alert,
  Box,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import { SocialIcons } from "../shared/components/SocialIcons";
import { getModemCatalogEntry } from "./domain/modems/catalog";
import { getModemDriver } from "./domain/modems/registry";
import {
  loadModemTuning,
  saveModemTuning,
} from "./domain/modems/tuningStorage";
import {
  MODEM_DEFAULT_ID,
  type ModemId,
  type TransferActivityLog,
  type TransferEstimate,
  type TransferProgress,
  type TransferResult,
  type TransferRole,
  type TuningPresetId,
} from "./domain/modems/types";
import { warmupModemLibraries } from "./domain/modems/warmup";
import {
  type DemodSensitivityConfig,
  loadDemodConfig,
  saveDemodConfig,
} from "./domain/pipeline/demodConfig";
import {
  createTransferPayloadFromFile,
  createTransferPayloadFromText,
  estimateTransfer,
  isMicrophoneCaptureAvailable,
  receiveTransfer,
  sendTransfer,
} from "./domain/pipeline/transferEngine";
import {
  clearResults,
  loadResults,
  saveResult,
} from "./domain/protocol/resultsStore";
import { BenchmarkRunner } from "./features/BenchmarkRunner";
import { CalibrationPanel } from "./features/CalibrationPanel";
import { ModemSurvey } from "./features/ModemSurvey";
import { ModemWorkbench } from "./features/ModemWorkbench";
import { ResultsDashboard } from "./features/ResultsDashboard";
import { createImageSampleFile, TEXT_SAMPLES } from "./utils/sampleData";

type PayloadType = "text" | "file";

const DEFAULT_TEXT_SAMPLE_ID = "short-64";

export function App() {
  const [payloadType, setPayloadType] = useState<PayloadType>("text");
  const [textSampleId, setTextSampleId] = useState(DEFAULT_TEXT_SAMPLE_ID);
  const [textValue, setTextValue] = useState(
    TEXT_SAMPLES.find((s) => s.id === DEFAULT_TEXT_SAMPLE_ID)?.content ?? "",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transferRole, setTransferRole] = useState<TransferRole>("sender");
  const [selectedModemId, setSelectedModemId] =
    useState<ModemId>(MODEM_DEFAULT_ID);
  const [tuningPreset, setTuningPreset] = useState<TuningPresetId>("default");
  const [modemTuning, setModemTuning] = useState(() =>
    getModemDriver(MODEM_DEFAULT_ID).getDefaultTuning(),
  );
  const [demodConfig, setDemodConfig] = useState<DemodSensitivityConfig>(() =>
    loadDemodConfig(),
  );
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [activityLogs, setActivityLogs] = useState<TransferActivityLog[]>([]);
  const [estimate, setEstimate] = useState<TransferEstimate | null>(null);
  const [results, setResults] = useState<TransferResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [libraryWarnings, setLibraryWarnings] = useState<string[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const receiveHandleRef = useRef<{ close: () => void } | null>(null);

  const catalogEntry = useMemo(
    () => getModemCatalogEntry(selectedModemId),
    [selectedModemId],
  );

  const driver = useMemo(
    () => getModemDriver(selectedModemId),
    [selectedModemId],
  );

  useEffect(() => {
    const driverForModem = getModemDriver(selectedModemId);
    const defaults = driverForModem.getDefaultTuning();
    const stored = loadModemTuning(selectedModemId, defaults);
    setModemTuning(stored);
    setTuningPreset("custom");
  }, [selectedModemId]);

  const handlePresetChange = (preset: TuningPresetId) => {
    setTuningPreset(preset);
    const next = driver.applyPreset(preset, modemTuning);
    setModemTuning(next);
    saveModemTuning(selectedModemId, next);
  };

  const handleTuningChange = (next: typeof modemTuning) => {
    setModemTuning(next);
    saveModemTuning(selectedModemId, next);
  };

  const senderPayload = useMemo(() => {
    if (transferRole === "receiver") return null;
    if (payloadType === "text") {
      if (textValue.trim().length === 0) return null;
      return createTransferPayloadFromText(textValue);
    }
    if (!selectedFile) return null;
    return null;
  }, [payloadType, selectedFile, textValue, transferRole]);

  const payloadSizeBytes = useMemo(() => {
    if (transferRole === "receiver") return 0;
    if (payloadType === "text") {
      return new TextEncoder().encode(textValue).length;
    }
    return selectedFile?.size ?? 0;
  }, [payloadType, selectedFile, textValue, transferRole]);

  useEffect(() => {
    if (transferRole === "receiver" || !senderPayload) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    void estimateTransfer(senderPayload, selectedModemId, modemTuning).then(
      (next) => {
        if (!cancelled) setEstimate(next);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [senderPayload, selectedModemId, modemTuning, transferRole]);

  const canRunSender = useMemo(() => {
    if (payloadType === "text") return textValue.trim().length > 0;
    return selectedFile !== null;
  }, [payloadType, selectedFile, textValue]);

  const canRunReceiver = isMicrophoneCaptureAvailable();

  useEffect(() => {
    void warmupModemLibraries().then((state) => {
      setLibraryWarnings(state.warningMessages);
    });
  }, []);

  useEffect(() => {
    void loadResults().then((stored) => {
      if (stored.length > 0) setResults(stored);
    });
  }, []);

  useEffect(() => {
    return () => {
      receiveHandleRef.current?.close();
    };
  }, []);

  const appendActivityLog = (entry: TransferActivityLog) => {
    setActivityLogs((prev) => [...prev, entry].slice(-200));
  };

  const handleStopReceive = () => {
    receiveHandleRef.current?.close();
    receiveHandleRef.current = null;
    setIsReceiving(false);
    setBusy(false);
    setProgress(null);
    appendActivityLog({
      at: Date.now(),
      level: "info",
      message: "受信を停止しました",
    });
  };

  const handleStartReceive = () => {
    if (!canRunReceiver || isReceiving) return;
    setBusy(true);
    setIsReceiving(true);
    setProgress(null);
    setActivityLogs([]);

    const abortController = new AbortController();
    const handle = receiveTransfer({
      modemId: selectedModemId,
      tuning: modemTuning,
      signal: abortController.signal,
      onProgress: setProgress,
      onActivityLog: appendActivityLog,
      onComplete: (result) => {
        void (async () => {
          setResults((prev) => [result, ...prev].slice(0, 200));
          await saveResult(result);
          if (!result.success) {
            setSnackbarMessage(result.errorMessage ?? "受信に失敗しました");
          }
        })();
      },
    });

    receiveHandleRef.current = {
      close: () => {
        abortController.abort();
        handle.close();
      },
    };
  };

  const handleSend = async () => {
    if (!canRunSender) return;
    setBusy(true);
    setProgress(null);
    setActivityLogs([]);

    try {
      const payload =
        payloadType === "text"
          ? createTransferPayloadFromText(textValue)
          : await createTransferPayloadFromFile(selectedFile as File);

      appendActivityLog({
        at: Date.now(),
        level: "info",
        message: `送信開始: ${catalogEntry.label}`,
      });

      const result = await sendTransfer(
        {
          modemId: selectedModemId,
          tuning: modemTuning,
          payload,
        },
        { onProgress: setProgress, onActivityLog: appendActivityLog },
      );

      setResults((prev) => [result, ...prev].slice(0, 200));
      await saveResult(result);
    } catch (error) {
      const now = Date.now();
      const failed: TransferResult = {
        modemId: selectedModemId,
        role: "sender",
        messageId: `failed-${now}`,
        payloadType,
        payloadSizeBytes,
        expectedSeconds: estimate?.expectedSeconds ?? 0,
        actualSeconds: 0,
        throughputBps: 0,
        success: false,
        errorMessage: String(error),
        startedAt: now,
        finishedAt: now,
        tuningSnapshot: { ...modemTuning },
      };
      setResults((prev) => [failed, ...prev].slice(0, 200));
      await saveResult(failed);
      appendActivityLog({
        at: Date.now(),
        level: "error",
        message: `送信失敗: ${String(error)}`,
      });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleRun = () => {
    if (transferRole === "receiver") {
      if (isReceiving) handleStopReceive();
      else handleStartReceive();
      return;
    }
    void handleSend();
  };

  const micWarning =
    transferRole === "receiver" && !canRunReceiver
      ? "マイク API が利用できないため受信を開始できません。"
      : null;

  const allWarnings = [...(micWarning ? [micWarning] : []), ...libraryWarnings];

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/audio-tone-lab" />
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          音声モデム比較ラボ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quiet.js・ggwave・自前 Web Audio の 6 モデムで実音響転送を比較します。
        </Typography>
      </Box>
      <Stack spacing={2}>
        <ModemSurvey selectedModemId={selectedModemId} />
        <CalibrationPanel
          disabled={busy}
          demodConfig={demodConfig}
          onDemodConfigChange={(next) => {
            setDemodConfig(next);
            saveDemodConfig(next);
          }}
        />
        <ModemWorkbench
          transferRole={transferRole}
          onTransferRoleChange={setTransferRole}
          payloadType={payloadType}
          onPayloadTypeChange={setPayloadType}
          textValue={textValue}
          onTextValueChange={setTextValue}
          onApplyTextSample={(id) => {
            const sample = TEXT_SAMPLES.find((s) => s.id === id);
            if (!sample) return;
            setTextSampleId(id);
            setTextValue(sample.content);
            setPayloadType("text");
          }}
          selectedTextSampleId={textSampleId}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          onApplyImageSample={(id) => {
            if (!id) return;
            setSelectedFile(createImageSampleFile(id));
            setPayloadType("file");
          }}
          selectedModemId={selectedModemId}
          onSelectedModemIdChange={setSelectedModemId}
          catalogEntry={catalogEntry}
          tuning={modemTuning}
          tuningPreset={tuningPreset}
          onTuningPresetChange={handlePresetChange}
          onTuningChange={handleTuningChange}
          estimate={estimate}
          progress={progress}
          activityLogs={activityLogs}
          busy={busy}
          isReceiving={isReceiving}
          libraryWarnings={allWarnings}
        />
        <BenchmarkRunner
          transferRole={transferRole}
          selectedModemLabel={catalogEntry.label}
          payloadSizeBytes={payloadSizeBytes}
          busy={busy}
          isReceiving={isReceiving}
          canRun={transferRole === "sender" ? canRunSender : canRunReceiver}
          onRun={handleRun}
          onClearResults={() => void clearResults().then(() => setResults([]))}
        />
        <ResultsDashboard results={results} />
      </Stack>
      <Snackbar
        open={snackbarMessage.length > 0}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage("")}
      >
        <Alert severity="error" onClose={() => setSnackbarMessage("")}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
