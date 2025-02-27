import { Divider, Grid, Paper, Typography } from "@mui/material";

/**
 * 線形合同法の数式を表示するコンポーネント
 * このコンポーネントは予測ページと生成ページの両方で共通して使用される
 */
export function LcgFormula() {
  return (
    <Paper sx={{ padding: "16px", marginBottom: "16px", bgcolor: "#f5f5f5" }}>
      <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
        線形合同法（Linear Congruential Generator）
      </Typography>
      <Divider sx={{ marginY: "8px" }} />
      <Typography
        variant="h6"
        align="center"
        component="div"
        sx={{
          fontFamily: "math", // 数学表記に適したフォント
          my: 2,
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        <div>
          X<sub>n+1</sub> = (a × X<sub>n</sub> + c) mod m
        </div>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="body2">
            <strong>a</strong>: 乗数 (multiplier)
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">
            <strong>c</strong>: 増分 (increment)
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">
            <strong>m</strong>: 法 (modulus)
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
