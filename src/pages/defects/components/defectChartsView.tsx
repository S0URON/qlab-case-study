import * as React from "react";
import {
  Alert,
  AppBar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import type { Defect } from "../../../apis/defects.api";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import {
  calculateDefectRatesPerModel,
  getTop5MostCommonDefects,
  modelDefectRate,
  motorTypeDefectRate,
  packageDefectRate,
  defectsPerStation,
} from "../../../utils/utils";
import { calculateDefectMetrics } from "../../../utils/metrics";
import { GridCloseIcon } from "@mui/x-data-grid";
import { flagAnomalyApi } from "../../../apis/anomalies.api";

/**
 * @typedef {Object} DefectChartsViewProps
 * @property {Defect[]} data - An array of defect data to be visualized.
 */

/**
 * A React component that displays various charts visualizing defect data.
 *
 * This component takes an array of defect objects and renders several types of charts,
 * including bar charts, line charts, and pie charts, to provide insights into
 * defect trends, distributions, and averages. It utilizes utility functions
 * from `utils.ts` and `metrics.ts` to process the data for charting.
 * It also includes functionality to investigate and flag anomalies based on chart data.
 *
 * @param {DefectChartsViewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered defect charts view.
 */
const DefectChartsView = (props: { data: Defect[] }) => {
  const { data } = props;
  const [selectedStation, setSelectedStation] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selectedDefect, setSeletedDefect] = React.useState<{
    id: number;
    resolutionTime: number;
  }>();
  const [loading, setLoading] = React.useState(false);
  const [operationSuccess, setOperationSuccess] = React.useState(false);
  const [operationFail, setOperationFail] = React.useState(false);
  const {
    top5Defects,
    defectRates,
    modelDefectRates,
    packageDefectRates,
    motorTypeDefectRates,
    stationCount,
  } = React.useMemo(() => {
    return {
      top5Defects: getTop5MostCommonDefects(data),
      defectRates: calculateDefectRatesPerModel(data),
      modelDefectRates: modelDefectRate(data),
      packageDefectRates: packageDefectRate(data),
      motorTypeDefectRates: motorTypeDefectRate(data),
      stationCount: defectsPerStation(data, selectedStation),
    };
  }, [data, selectedStation]);

  const {
    overallAvgResolution,
    avgResolutionPerSeverity,
    avgResolutionPerDefect,
    avgResolutionPerStation,
    avgResolutionPerPart,
    defectCountPerDefect,
    defectCountPerModel,
    defectCountPerPart,
    defectCountPerShift,
    mostCommonDefectPerStation,
    severityDistribution,
    avgSeverityPerModel,
    avgSeverityPerStation,
    percentRootCauseIdentified,
    rootCausePerDefect,
    avgWithRoot,
    avgWithoutRoot,
    reportsPerReporter,
    avgSeverityPerReporter,
    avgResolutionPerReporter,
    defectRatePerModel,
    avgMetricsPerModel,
  } = React.useMemo(() => {
    return calculateDefectMetrics(data);
  }, [data]);

  const { xValues, yValues, meanY, meanLine } = React.useMemo(() => {
    const xValues = avgResolutionPerSeverity.map((d) => d.severityRating);
    const yValues = avgResolutionPerSeverity.map(
      (d) => d.averageResolutionTime
    );
    const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    const meanLine = new Array(xValues.length).fill(meanY);
    return { xValues, yValues, meanY, meanLine };
  }, [avgResolutionPerSeverity]);

  const {
    avgResolutionPerStationXValues,
    avgResolutionPerStationYValues,
    avgResolutionPerStationMean,
    avgResolutionPerStationMeanLine,
    stationCountAboveAvg,
  } = React.useMemo(() => {
    const xValues = avgResolutionPerStation.map((d) => d.station);
    const yValues = avgResolutionPerStation.map((d) => d.averageResolutionTime);
    const mean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    const meanLine = new Array(xValues.length).fill(mean);
    const stationCountAboveAvg = stationCount.defects.filter(
      (d) => d.resolutionTime > mean + 5
    );
    return {
      avgResolutionPerStationXValues: xValues,
      avgResolutionPerStationYValues: yValues,
      avgResolutionPerStationMean: mean,
      avgResolutionPerStationMeanLine: meanLine,
      stationCountAboveAvg,
    };
  }, [avgResolutionPerStation, stationCount]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Snackbar
        open={operationSuccess}
        autoHideDuration={3000}
        message={"Operation Success"}
        sx={{ backgroundColor: "green" }}
        onClose={() => {
          setOperationSuccess(false);
        }}
      />
      <Snackbar
        open={operationFail}
        onClose={() => {
          setOperationFail(false);
        }}
        sx={{ backgroundColor: "red" }}
        autoHideDuration={3000}
        message="Error Deleting Anomaly"
      />
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.modal + 3 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={2}>
        <Grid size={6} container spacing={2}>
          <Grid size={12}>
            <Box
              sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                  Top 5 defects by defect count
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      id: "barCategories",
                      data: top5Defects.map((defect) => defect.category),
                    },
                  ]}
                  series={[
                    {
                      data: top5Defects.map((defect) => defect.count),
                      color: "#003D78",
                    },
                  ]}
                  height={300}
                />
              </Box>
            </Box>
          </Grid>
          <Grid size={12}>
            <Box
              sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                  Average Resolution Time by Station
                </Typography>
                <LineChart
                  height={300}
                  xAxis={[
                    {
                      data: avgResolutionPerStationXValues,
                      label: "Station",
                      scaleType: "band", // required for categorical strings
                      tickLabelStyle: {
                        angle: -45,
                        textAnchor: "end",
                        fontSize: 12,
                      },
                    },
                  ]}
                  series={[
                    {
                      data: avgResolutionPerStationYValues,
                      label: "Avg Resolution Time (hrs)",
                      color: "#0066B1",
                      showMark: true,
                    },
                    {
                      data: avgResolutionPerStationMeanLine,
                      label: `Mean (${avgResolutionPerStationMean.toFixed(
                        2
                      )} hrs)`,
                      color: "#E22718",
                      showMark: false,
                    },
                  ]}
                />
              </Box>
              {avgResolutionPerStation
                .filter(
                  (e) =>
                    e.averageResolutionTime > avgResolutionPerStationMean + 1
                )
                .map((e) => (
                  <Alert severity="warning">
                    {e.station} is registering a high average !
                    <Button
                      disableFocusRipple={true}
                      disableRipple={true}
                      disableElevation={true}
                      sx={{ height: 20 }}
                      onClick={() => {
                        setSelectedStation(e.station);
                        setOpen(true);
                      }}
                    >
                      investigate
                    </Button>
                  </Alert>
                ))}
            </Box>
          </Grid>
        </Grid>
        <Grid size={6} container spacing={2}>
          <Grid size={12}>
            <Box
              sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
            >
              {/* <BarChart
                dataset={defectRates.map((item) => ({
                  carModel: item.carModel,
                  longRange: item.motorTypeRate.longRange,
                  highPerformance: item.motorTypeRate.highPerformance,
                  offroad: item.designPackageRate.offroad,
                  race: item.designPackageRate.race,
                  luxury: item.designPackageRate.luxury,
                  eco: item.designPackageRate.eco,
                  standard: item.motorTypeRate.standard,
                }))}
                series={[
                  {
                    dataKey: "longRange",
                    stack: "motorType",
                    label: "longRange",
                  },
                  {
                    dataKey: "highPerformance",
                    stack: "motorType",
                    label: "highPerformance",
                  },
                  {
                    dataKey: "standard",
                    stack: "motorType",
                    label: "standard",
                  },
                  {
                    dataKey: "offroad",
                    stack: "designPackage",
                    label: "offroad",
                  },
                  { dataKey: "race", stack: "designPackage", label: "race" },
                  {
                    dataKey: "luxury",
                    stack: "designPackage",
                    label: "luxury",
                  },
                  { dataKey: "eco", stack: "designPackage", label: "eco" },
                ]}
                xAxis={[{ dataKey: "carModel" }]}
                yAxis={[{ width: 80 }]}
                {...config}
              /> */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                  defect count By defect Name
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      data: Object.keys(defectCountPerDefect),
                      label: "Defect Name",
                    },
                  ]}
                  series={[
                    {
                      data: Object.values(defectCountPerDefect),
                      label: "Defect Count",
                      color: "#0066B1",
                    },
                  ]}
                  height={300}
                />
              </Box>
            </Box>
          </Grid>
          <Grid size={12} container spacing={2}>
            <Grid container spacing={2}>
              <Grid size={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      model defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: modelDefectRates,
                        },
                      ]}
                      width={200}
                      height={200}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      Motor Type defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: motorTypeDefectRates,
                        },
                      ]}
                      width={200}
                      height={200}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      design Package defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: packageDefectRates,
                        },
                      ]}
                      width={200}
                      height={200}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12} container spacing={2}>
          <Grid container size={6}>
            <Grid size={6}>
              <Box
                sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                    Root Cause identification (%)
                  </Typography>
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            id: 0,
                            value: percentRootCauseIdentified,
                            label: "Root Cause: Yes",
                            color: "#003D78",
                          },
                          {
                            id: 1,
                            value: 100 - percentRootCauseIdentified,
                            label: "Root Cause: No",
                            color: "#0066B1",
                          },
                        ],
                      },
                    ]}
                    height={300}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box
                sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
              >
                <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                  Avg Severity + Resolution per Car Model
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      data: avgMetricsPerModel.map((d) => d.carModel),
                      label: "Car Model",
                    },
                  ]}
                  series={[
                    {
                      data: avgMetricsPerModel.map((d) => d.avgSeverity),
                      label: "Avg Severity",
                      color: "#E22718",
                    },
                    {
                      data: avgMetricsPerModel.map((d) => d.avgResolutionTime),
                      label: "Avg Resolution Time",
                      color: "#0066B1",
                    },
                  ]}
                  height={300}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid size={6}>
            <Box
              sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                  Avg Resolution time per Severity
                </Typography>
                <LineChart
                  sx={{ backgroundColor: "#fff" }}
                  height={300}
                  xAxis={[
                    {
                      data: xValues,
                      label: "Severity Rating",
                      scaleType: "linear",
                      tickLabelStyle: { angle: 0 },
                    },
                  ]}
                  grid={{ vertical: true, horizontal: true }}
                  series={[
                    {
                      data: yValues,
                      label: "Avg Resolution Time (hrs)",
                      color: "blue",
                      showMark: true,
                      area: false,
                    },
                    {
                      data: meanLine,
                      label: `Mean (${meanY.toFixed(2)} hrs)`,
                      color: "red",
                      showMark: false,
                      area: false,
                    },
                  ]}
                  legend={{ position: "top", align: "right" }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Grid size={24}></Grid>
      </Grid>
      <Dialog fullScreen open={open}>
        <AppBar sx={{ position: "relative", border: 0 }}>
          <Box display="flex" sx={{ p: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => {
                setOpen(false);
                setSeletedDefect(undefined);
              }}
              aria-label="close"
              sx={{ border: 0 }}
            >
              <GridCloseIcon />
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                close
              </Typography>
            </IconButton>
          </Box>
        </AppBar>
        <DialogTitle>
          above avarage {stationCount.station} defect resolution times
        </DialogTitle>
        <DialogContent>
          <Box
            width="90%"
            sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
          >
            <LineChart
              grid={{ vertical: true, horizontal: true }}
              xAxis={[
                {
                  label: "defect ID",
                  data: stationCountAboveAvg.map((d) => d.id),
                },
              ]}
              series={[
                {
                  label: "resolution time (in hours)",
                  data: stationCountAboveAvg.map((d) => d.resolutionTime),
                },
              ]}
              height={500}
              onMarkClick={(e, params) => {
                console.log(params.dataIndex);

                if (params.dataIndex) {
                  setSeletedDefect({
                    id: stationCountAboveAvg[params.dataIndex].id,
                    resolutionTime:
                      stationCountAboveAvg[params.dataIndex].resolutionTime,
                  });
                }
              }}
            />
            <Box>
              <Typography>selected defect: {selectedDefect?.id}</Typography>
              <Button
                disableRipple={true}
                variant="outlined"
                disabled={!selectedDefect}
                onClick={() => {
                  setLoading(true);
                  if (selectedDefect) {
                    const flaggingDate = new Date();
                    flagAnomalyApi({
                      note: `Resolution time above general average (${avgResolutionPerStationMean}) by ${
                        selectedDefect.resolutionTime -
                        avgResolutionPerStationMean
                      }`,
                      status: "under review",
                      id: Math.floor(Math.random() * 10000) + "",
                      defectId: selectedDefect.id,
                      date: flaggingDate,
                      time: `${flaggingDate.getHours()}:${flaggingDate.getMinutes()}:${flaggingDate.getSeconds()}`,
                      flaggedBy: "user",
                      suspectedValue: selectedDefect.resolutionTime + "",
                      suspectedField: "Resolution time",
                    })
                      .then((r) => {
                        console.log(r);
                        setLoading(false);
                        //   setOpenFlag(false);
                        setOperationSuccess(true);
                        setSeletedDefect(undefined);
                      })
                      .catch((e) => {
                        console.log(e);
                        setLoading(false);
                        //   setOpenFlag(false);
                        setSeletedDefect(undefined);
                        setOperationFail(true);
                      });
                  }
                }}
              >
                flag anomaly
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DefectChartsView;
