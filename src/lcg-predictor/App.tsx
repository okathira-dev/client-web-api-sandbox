import { Container, Typography, Tabs, Tab } from "@mui/material";
import Box from "@mui/material/Box";
import { useState } from "react";

import { LcgFormula } from "./components/LcgFormula";
import { LcgGenerator } from "./features/LcgGenerator";
import { LcgPredictor } from "./features/LcgPredictor";
import { SocialIcons } from "../shared/components/SocialIcons";

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
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/lcg-predictor" />
      <Typography
        variant="h1"
        sx={{
          margin: "1rem",
          fontSize: "1.8rem",
        }}
      >
        線形合同法ツール (LCG Tool)
      </Typography>

      {/* 線形合同法の式 - 常に表示される */}
      <Box sx={{ width: "100%", maxWidth: "800px" }}>
        <LcgFormula />
      </Box>

      {/* 参考文献 */}
      <Typography
        variant="caption"
        sx={{ textAlign: "center", width: "100%", mb: 1, opacity: 0.7 }}
      >
        参考文献:
        <a
          href="https://msm.lt/posts/cracking-rngs-lcgs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cracking Random Number Generators - LCGs
        </a>
        /
        <a
          href="https://satto.hatenadiary.com/entry/solve-LCG"
          target="_blank"
          rel="noopener noreferrer"
        >
          線形合同法による乱数を予測するアルゴリズム
        </a>
        /
        <a
          href="https://ja.wikipedia.org/wiki/%E7%B7%9A%E5%BD%A2%E5%90%88%E5%90%8C%E6%B3%95"
          target="_blank"
          rel="noopener noreferrer"
        >
          線形合同法 - Wikipedia
        </a>
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
