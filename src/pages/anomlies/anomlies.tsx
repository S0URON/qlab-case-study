import React from "react";
import AnomalieDataTable from "./components/anomaliesDataTable";
import { Box } from "@mui/material";
import { getAnomaliesApi, type Anomaly } from "../../apis/anomalies.api";

const AnomaliesTable = () => {
  const [data, setData] = React.useState<Anomaly[]>([]);
  const [refetchData, setRefetchData] = React.useState(false);
  React.useEffect(() => {
    getAnomaliesApi()
      .then((result) => {
        setData(result);
      })
      .catch((e) => {
        console.log(e);
        setData([]);
      });
  }, [refetchData]);
  return (
    <Box
      sx={{
        width: window.innerWidth - 120,
        height: "auto",
        padding: 2,
        marginTop: 5,
      }}
    >
      <AnomalieDataTable data={data} setRefetchData={setRefetchData} />
    </Box>
  );
};

export default AnomaliesTable;
