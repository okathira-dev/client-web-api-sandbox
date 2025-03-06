import { Container, Typography, Box } from "@mui/material";

import { ProjectileDirectorSimulator } from "./features/projectileDirectorSimulator";
import { SocialIcons } from "../shared/components/SocialIcons";

export function App() {
  return (
    <div className="app">
      <SocialIcons githubURL="https://github.com/okathira/client-web-api-sandbox" />
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 2, mb: 2 }}>
        <Typography variant="h6">発射体指揮装置シミュレーター</Typography>
      </Box>
      <Container>
        <Typography variant="body1" sx={{ mb: 2 }}>
          マウスを動かして目標を追跡してください。黄色の線が予測照準です。
        </Typography>
        <ProjectileDirectorSimulator />
      </Container>
    </div>
  );
}
