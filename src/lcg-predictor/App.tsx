import {
  Container,
  IconButton,
  SvgIcon,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import Box from "@mui/material/Box";
import { useState } from "react";

import { LcgGenerator } from "./features/LcgGenerator";
import { LcgPredictor } from "./features/LcgPredictor";

// タブパネルのインターフェース
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lcg-tabpanel-${index}`}
      aria-labelledby={`lcg-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const TAB_ID = "lcg-tab";
const TAB_ARIA_CONTROLS = "lcg-tabpanel";

export function App() {
  // 現在選択されているタブのインデックス
  const [tabIndex, setTabIndex] = useState(0);

  // タブ変更時のハンドラ
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <IconButton
          component="a"
          href="https://github.com/okathira-dev/client-web-api-sandbox"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          sx={{ padding: 0, width: "24px", height: "24px", minWidth: "24px" }}
        >
          <SvgIcon sx={{ fontSize: "24px" }} viewBox="0 0 16 16">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </SvgIcon>
        </IconButton>
      </Box>
      <Typography
        variant="h1"
        sx={{
          margin: "1rem",
          fontSize: "1.8rem",
        }}
      >
        線形合同法ツール (LCG Tool)
      </Typography>

      {/* タブ */}
      <Box sx={{ width: "100%", maxWidth: "800px" }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label="乱数予測"
            id={`${TAB_ID}-predictor`}
            aria-controls={`${TAB_ARIA_CONTROLS}-predictor`}
          />
          <Tab
            label="乱数生成"
            id={`${TAB_ID}-generator`}
            aria-controls={`${TAB_ARIA_CONTROLS}-generator`}
          />
        </Tabs>

        {/* タブパネル */}
        <TabPanel value={tabIndex} index={0}>
          <LcgPredictor />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <LcgGenerator />
        </TabPanel>
      </Box>
    </Container>
  );
}
