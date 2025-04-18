import { useRef, useState, useEffect } from "react";

import type { MutableRefObject } from "react";

// MediaTrackCapabilitiesとConstraintSetの型を拡張
declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }

  interface MediaTrackConstraintSet {
    torch?: boolean;
  }
}

// 戻り値の型定義
interface UseCameraStreamResult {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  hasStream: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleFlashlight: () => Promise<void>;
}

export const useCameraStream = (): UseCameraStreamResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);

  // カメラストリームを開始する関数
  const startCamera = async (): Promise<void> => {
    try {
      if (!videoRef.current) {
        console.error("Video element not found");
        return;
      }

      // カメラストリームの取得
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user", // フロントカメラを使用
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      setHasStream(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasStream(false);
    }
  };

  // カメラストリームを停止する関数
  const stopCamera = (): void => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setHasStream(false);
      setIsFlashlightOn(false);
    }
  };

  // フラッシュライトを切り替える関数
  const toggleFlashlight = async (): Promise<void> => {
    if (!mediaStreamRef.current) {
      return;
    }

    try {
      // フラッシュライトのトラックを取得
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];

      if (!videoTrack || !("getCapabilities" in videoTrack)) {
        console.error("Flash not supported or no video track available");
        return;
      }

      const capabilities = videoTrack.getCapabilities();

      // フラッシュライトをサポートしているか確認
      if (capabilities.torch) {
        const newFlashlightState = !isFlashlightOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: newFlashlightState }],
        });
        setIsFlashlightOn(newFlashlightState);
      } else {
        console.log("Flashlight not supported on this device");
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error);
    }
  };

  // コンポーネントのアンマウント時にカメラを停止
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    hasStream,
    startCamera,
    stopCamera,
    toggleFlashlight,
  };
};
