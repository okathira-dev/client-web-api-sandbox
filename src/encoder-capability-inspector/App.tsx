import { Container, Stack } from "@mui/material";

import { InspectionProgress } from "./features/InspectionProgress";
import { InspectionRunner } from "./features/InspectionRunner";
import { ResultTable } from "./features/ResultTable";
import { SustainedTest } from "./features/SustainedTest";

export const App = () => (
  <Container maxWidth={false} sx={{ py: 3, maxWidth: 1600 }}>
    <Stack spacing={3}>
      <InspectionRunner />
      <InspectionProgress />
      <SustainedTest />
      <ResultTable />
    </Stack>
  </Container>
);
