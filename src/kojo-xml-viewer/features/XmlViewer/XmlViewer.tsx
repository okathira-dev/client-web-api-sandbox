import { Box, Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import XMLViewer from "react-xml-viewer";

import { FileUploader } from "./components/FileUploader";
import { FormRenderer } from "./components/FormRenderer";
import { parseXml } from "../../utils/xmlParser";

import type { ParsedXml } from "../../types/xml";

const TAB_IDS = {
  XML: "viewer-tab-xml",
  FORM: "viewer-tab-form",
} as const;

const TABPANEL_IDS = {
  XML: "viewer-tabpanel-xml",
  FORM: "viewer-tabpanel-form",
} as const;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  tabId: string;
  tabpanelId: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, tabId, tabpanelId, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={tabpanelId}
      aria-labelledby={tabId}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function XmlViewer() {
  const [xmlString, setXmlString] = useState<string | null>(null);
  const [parsedXml, setParsedXml] = useState<ParsedXml | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const handleFileLoad = (xml: string) => {
    setXmlString(xml);
    const parsed = parseXml(xml);
    setParsedXml(parsed);
    // XMLが読み込まれたら簡易帳票タブに切り替え（デフォルト）
    if (parsed.isValid) {
      setTabIndex(0);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px" }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <FileUploader onFileLoad={handleFileLoad} />
      </Paper>

      {xmlString && (
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="XML簡易帳票"
              id={TAB_IDS.FORM}
              aria-controls={TABPANEL_IDS.FORM}
            />
            <Tab
              label="XML閲覧"
              id={TAB_IDS.XML}
              aria-controls={TABPANEL_IDS.XML}
            />
          </Tabs>

          <TabPanel
            value={tabIndex}
            index={0}
            tabId={TAB_IDS.FORM}
            tabpanelId={TABPANEL_IDS.FORM}
          >
            {parsedXml && parsedXml.isValid ? (
              <FormRenderer xmlNode={parsedXml.root} parsedXml={parsedXml} />
            ) : (
              <Box sx={{ color: "error.main", mt: 2 }}>
                <strong>エラー:</strong>{" "}
                {parsedXml?.error || "XMLの解析に失敗しました"}
              </Box>
            )}
          </TabPanel>

          <TabPanel
            value={tabIndex}
            index={1}
            tabId={TAB_IDS.XML}
            tabpanelId={TABPANEL_IDS.XML}
          >
            <Box
              sx={{
                mt: 2,
                "& .xml-viewer": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
                "& .rxv-collapse": {
                  cursor: "pointer",
                },
                "& .rxv-expand": {
                  cursor: "pointer",
                },
              }}
            >
              <XMLViewer xml={xmlString} collapsible showLineNumbers />
            </Box>
          </TabPanel>
        </Paper>
      )}
    </Box>
  );
}
