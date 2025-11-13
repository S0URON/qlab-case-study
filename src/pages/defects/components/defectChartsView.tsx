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
import {
  BarChart,
  BarPlot,
  ChartContainer,
  ChartsGrid,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LineChart,
  LinePlot,
  PieChart,
} from "@mui/x-charts";
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
    avgResolutionPerSeverity,
    avgResolutionPerStation,
    defectCountPerDefect,
    percentRootCauseIdentified,
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

  // Heatmap data: Average severity by station and defect name
  const heatmapData = React.useMemo(() => {
    const severityByStationAndDefect: {
      [key: string]: { [key: string]: number[] };
    } = {};

    data.forEach((defect) => {
      const station = defect.station || "Unknown";
      const defectName = defect.defectName || "Unknown";

      if (!severityByStationAndDefect[station]) {
        severityByStationAndDefect[station] = {};
      }
      if (!severityByStationAndDefect[station][defectName]) {
        severityByStationAndDefect[station][defectName] = [];
      }

      severityByStationAndDefect[station][defectName].push(
        defect.severityRating
      );
    });

    // Calculate averages and format for heatmap
    const heatmapArray: Array<{
      station: string;
      defectName: string;
      avgSeverity: number;
    }> = [];

    Object.entries(severityByStationAndDefect).forEach(([station, defects]) => {
      Object.entries(defects).forEach(([defectName, severities]) => {
        const avgSeverity =
          severities.reduce((a, b) => a + b, 0) / severities.length;
        heatmapArray.push({
          station,
          defectName,
          avgSeverity: parseFloat(avgSeverity.toFixed(2)),
        });
      });
    });

    return heatmapArray;
  }, [data]);

  // Get unique stations and defect names for heatmap dimensions
  const heatmapDimensions = React.useMemo(() => {
    const stations = [...new Set(heatmapData.map((d) => d.station))].sort();
    const defectNames = [
      ...new Set(heatmapData.map((d) => d.defectName)),
    ].sort();
    return { stations, defectNames };
  }, [heatmapData]);

  // Create matrix for visualization
  const heatmapMatrix = React.useMemo(() => {
    const matrix: number[][] = [];
    heatmapDimensions.stations.forEach((station) => {
      const row: number[] = [];
      heatmapDimensions.defectNames.forEach((defectName) => {
        const entry = heatmapData.find(
          (d) => d.station === station && d.defectName === defectName
        );
        row.push(entry?.avgSeverity || 0);
      });
      matrix.push(row);
    });
    return matrix;
  }, [heatmapData, heatmapDimensions]);

  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return "#f5f5f5";
    const ratio = value / max;
    if (ratio < 0.33) return "#90EE90"; // Light green
    if (ratio < 0.66) return "#FFD700"; // Gold
    return "#FF6B6B"; // Red
  };

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
                      scaleType: "band",
                      label: "Defect Category",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "number of defects",
                    },
                  ]}
                  series={[
                    {
                      data: top5Defects.map((defect) => defect.count),
                      color: "#003D78",
                      label: "Defect Count",
                    },
                  ]}
                  height={300}
                  grid={{ vertical: true, horizontal: true }}
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
                <ChartContainer
                  height={300}
                  xAxis={[
                    {
                      label: "Station",
                      data: avgResolutionPerStationXValues,
                      scaleType: "band",
                    },
                  ]}
                  yAxis={[{ label: "Avg Resolution Time (hrs)" }]}
                  series={[
                    {
                      type: "bar",
                      data: avgResolutionPerStationYValues,
                      label: "Avg Resolution Time (hrs)",
                      color: "#0066B1",
                    },
                    {
                      type: "line",
                      data: avgResolutionPerStationMeanLine,
                      label: `Mean (${avgResolutionPerStationMean.toFixed(
                        2
                      )} hrs)`,
                      color: "#E22718",
                    },
                  ]}
                >
                  <ChartsGrid horizontal vertical />
                  <BarPlot />
                  <LinePlot />
                  <ChartsXAxis />
                  <ChartsYAxis />
                  <ChartsLegend />
                  <ChartsTooltip />
                </ChartContainer>
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
                  Defect count by defect name
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      data: Object.keys(defectCountPerDefect),
                      label: "Defect Name",
                      scaleType: "band",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "number of defects",
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
                  grid={{ vertical: true, horizontal: true }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid size={12} container spacing={2}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      Model defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: modelDefectRates,
                          valueFormatter: (item) => `${item.value.toFixed(3)}%`,
                        },
                      ]}
                      width={200}
                      height={200}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      Motor type defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: motorTypeDefectRates,
                          valueFormatter: (item) => `${item.value.toFixed(3)}%`,
                        },
                      ]}
                      width={200}
                      height={200}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} align="center" gutterBottom>
                      Design package defect rates (%)
                    </Typography>
                    <PieChart
                      series={[
                        {
                          data: packageDefectRates,
                          valueFormatter: (item) => `${item.value.toFixed(3)}%`,
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
                        valueFormatter: (item) => `${item.value.toFixed(3)}%`,
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
                  grid={{ vertical: true, horizontal: true }}
                  xAxis={[
                    {
                      data: avgMetricsPerModel.map((d) => d.carModel),
                      label: "Car Model",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "hours",
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
                  yAxis={[
                    {
                      label: "hours",
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
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Box sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}>
            <Typography sx={{ mb: 2 }} align="center" gutterBottom>
              Average Severity Rating by Station and Defect
            </Typography>
            <Box sx={{ overflowX: "auto", p: 2 }}>
              <Box sx={{ minWidth: "600px" }}>
                <Box display="flex">
                  <Box sx={{ minWidth: "120px" }} />
                  {heatmapDimensions.defectNames.map((defectName) => (
                    <Box
                      key={defectName}
                      sx={{
                        minWidth: "100px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                        p: 1,
                      }}
                    >
                      {defectName}
                    </Box>
                  ))}
                </Box>
                {heatmapDimensions.stations.map((station, stationIdx) => (
                  <Box key={station} display="flex">
                    <Box
                      sx={{
                        minWidth: "120px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "bold",
                        p: 1,
                        pr: 2,
                      }}
                    >
                      {station}
                    </Box>
                    {heatmapDimensions.defectNames.map(
                      (defectName, defectIdx) => {
                        const value = heatmapMatrix[stationIdx][defectIdx];
                        const maxValue = Math.max(...heatmapMatrix.flat());
                        return (
                          <Box
                            key={`${station}-${defectName}`}
                            sx={{
                              minWidth: "100px",
                              backgroundColor: getHeatmapColor(value, maxValue),
                              border: "1px solid #ddd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              p: 1,
                              fontSize: "12px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                            title={`${station} - ${defectName}: ${value}`}
                          >
                            {value > 0 ? value : "-"}
                          </Box>
                        );
                      }
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Legend */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#90EE90",
                  }}
                />
                <Typography variant="caption">Low</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#FFD700",
                  }}
                />
                <Typography variant="caption">Medium</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#FF6B6B",
                  }}
                />
                <Typography variant="caption">High</Typography>
              </Box>
            </Box>
          </Box>
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
          partOfTheCar count in the {stationCount.station} station
        </DialogTitle>
        <DialogContent>
          <Box
            width="90%"
            sx={{ backgroundColor: "white", padding: "16px", boxShadow: 4 }}
          >
            <BarChart
              grid={{ vertical: true, horizontal: true }}
              xAxis={[
                {
                  label: "Part of the car",
                  data: stationCountAboveAvg.map((d) => {
                    return d.partOfTheCar;
                  }),
                },
              ]}
              yAxis={[{ label: "Count" }]}
              series={[
                {
                  label: "Count",
                  data: stationCountAboveAvg.map((d) => d.resolutionTime),
                },
              ]}
              height={500}
            />
            {/* <Box>
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
            </Box> */}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DefectChartsView;
