import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useTranslation } from "react-i18next";

import type { MediaKind } from "../domain/families";

/**
 * 映像か音声かを示す小さなアイコン。
 *
 * ファミリー名だけでは `H.264` と `Opus` のどちらの検査なのか読み取りづらいので、
 * 一覧と要約の両方に同じ印を出す。読み上げ用に名前も持たせる。
 */
export const MediaKindIcon = ({ kind }: { readonly kind: MediaKind }) => {
  const { t } = useTranslation();
  const Icon = kind === "video" ? VideocamIcon : GraphicEqIcon;
  return (
    <Icon
      fontSize="inherit"
      titleAccess={t(`kind.${kind}`)}
      sx={{ color: "text.secondary", flexShrink: 0 }}
    />
  );
};
