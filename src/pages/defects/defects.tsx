import React from "react";
import DefectDataTable from "./components/defectsDataTable";
import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { getDefectsApi, type Defect } from "../../apis/defects.api";
import DefectChartsView from "./components/defectChartsView";

const DefectsTable = () => {
  const [data, setData] = React.useState<Defect[]>([]);
  const [selectedView, setSelectedView] = React.useState<string>("tabular");
  React.useEffect(() => {
    getDefectsApi()
      .then((result) => {
        setData(result);
      })
      .catch((e) => {
        console.log(e);
        setData([]);
      });
  }, []);
  return (
    <Box
      sx={{
        width: window.innerWidth - 120,
        height: "auto",
        padding: 2,
        marginTop: 8,
      }}
    >
      <ToggleButtonGroup
        value={selectedView}
        exclusive
        onChange={(e, v) => {
          setSelectedView(v);
        }}
        aria-label="switch view"
      >
        <ToggleButton value="tabular" aria-label="left aligned">
          <Typography>Tabular view</Typography>
        </ToggleButton>
        <ToggleButton value="graphical" aria-label="centered">
          <Typography>Graphical view</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider sx={{ margin: 2 }} />
      {selectedView !== "tabular" ? (
        <DefectChartsView data={data} />
      ) : (
        <DefectDataTable data={data} />
      )}
    </Box>
  );
};

export default DefectsTable;
