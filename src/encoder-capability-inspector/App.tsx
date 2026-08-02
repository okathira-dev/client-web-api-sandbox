import {
  Box,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { SocialIcons } from "../shared/components/SocialIcons";
import { BitrateGuide } from "./features/BitrateGuide";
import { InspectionProgress } from "./features/InspectionProgress";
import { InspectionRunner } from "./features/InspectionRunner";
import { References } from "./features/References";
import { ResultTable } from "./features/ResultTable";
import { SustainedTest } from "./features/SustainedTest";
import { SyntheticPreview } from "./features/SyntheticPreview";

const GITHUB_URL =
  "https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/encoder-capability-inspector";

export const App = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  // 支援技術と自動翻訳が正しい言語で読めるよう、切り替えを文書側にも反映する。
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Container
      maxWidth={false}
      sx={{ py: 3, maxWidth: 1600, position: "relative" }}
    >
      <SocialIcons githubURL={GITHUB_URL} />
      <Stack spacing={3}>
        {/* アイコン列と重ならないよう、言語切り替えは右端を空けて置く。 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 6 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={language}
            aria-label={t("app.language")}
            onChange={(_event, next: string | null) => {
              if (next) void i18n.changeLanguage(next);
            }}
          >
            <ToggleButton value="ja">{t("app.languageJa")}</ToggleButton>
            <ToggleButton value="en">{t("app.languageEn")}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <InspectionRunner />
        <InspectionProgress />
        <SustainedTest />
        <SyntheticPreview />
        <ResultTable />
        <BitrateGuide />
        <References />
      </Stack>
    </Container>
  );
};
