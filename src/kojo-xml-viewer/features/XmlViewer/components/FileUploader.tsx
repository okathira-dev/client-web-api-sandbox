import { CloudUpload } from "@mui/icons-material";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";

import type { DragEvent, ChangeEvent } from "react";

interface FileUploaderProps {
  onFileLoad: (xmlString: string) => void;
}

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // ファイル形式の検証
    if (!file.name.toLowerCase().endsWith(".xml")) {
      setError("XMLファイルのみアップロードできます");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      onFileLoad(text);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ファイルの読み込みに失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        XMLファイルをアップロード
      </Typography>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "primary.main" : "grey.300",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          backgroundColor: isDragging ? "action.hover" : "background.paper",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUpload
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>
              ファイルをドラッグ&ドロップするか、クリックして選択してください
            </Typography>
            <Typography variant="body2" color="text.secondary">
              XMLファイルのみ対応
            </Typography>
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
