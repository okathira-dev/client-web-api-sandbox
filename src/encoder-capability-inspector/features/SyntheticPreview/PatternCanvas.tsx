import { styled } from "@mui/material/styles";

/**
 * 合成パターンを描くキャンバス。
 *
 * `Box component="canvas"` は `width` / `height` をスタイルとして解釈してしまい、
 * 描画バッファの大きさを決める HTML 属性が渡らない。属性として素通しするために
 * `styled` で素の canvas を包む。表示上の大きさは CSS 側で伸縮させる。
 */
export const PatternCanvas = styled("canvas")(({ theme }) => ({
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));
