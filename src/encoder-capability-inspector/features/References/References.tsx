import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { REFERENCE_GROUPS } from "./consts";

/**
 * codec string の書き方や、この検査が何を確かめているのかを追える資料の一覧。
 *
 * 既定では畳んでおく。読むのは「なぜこの結果になるのか」を調べたくなったときで、
 * 常に開いていると検査そのものの導線を押し下げてしまう。
 */
export const References = () => {
  const { t } = useTranslation();

  return (
    <Accordion variant="outlined">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" component="h2">
          {t("references.heading")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t("references.description")}
          </Typography>

          {REFERENCE_GROUPS.map((group) => (
            <Stack key={group.id} spacing={0.5}>
              <Typography variant="subtitle2" component="h3">
                {t(`references.group.${group.id}`)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t(`references.groupNote.${group.id}`)}
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 3 }}>
                {group.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      variant="body2"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {link.title}
                      <OpenInNewIcon fontSize="inherit" />
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
