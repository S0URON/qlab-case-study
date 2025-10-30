import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { Defect } from "../../../apis/defects.api";
import * as React from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { flagAnomalyApi } from "../../../apis/anomalies.api";
import {
  autoFlagAnomalies,
  formatDate,
  type Algorithm,
} from "../../../utils/utils";

const columns: GridColDef<Defect>[] = [
  {
    field: "date",
    headerName: "Date",
    width: 90,
    valueFormatter: (value) => {
      return formatDate(value);
    },
  },
  {
    field: "time",
    headerName: "Time",
    width: 100,
    editable: true,
  },
  {
    field: "defectName",
    headerName: "Defect Name",
    width: 100,
    editable: true,
  },
  {
    field: "station",
    headerName: "Station",
    width: 100,
    editable: true,
  },
  {
    field: "partOfTheCar",
    headerName: "Part of the Car",
    width: 100,
  },
  {
    field: "reporterName",
    headerName: "Reporter Name",
    sortable: true,
    width: 100,
  },
  {
    field: "partNumber",
    headerName: "Part Number",
    sortable: true,
    width: 100,
  },
  {
    field: "severityRating",
    headerName: "Severity Rating",
    sortable: true,
    width: 100,
  },
  {
    field: "carModel",
    headerName: "Car Model",
    sortable: true,
    width: 100,
  },
  {
    field: "motorType",
    headerName: "Motor Type",
    sortable: true,
    width: 100,
  },
  {
    field: "designPackage",
    headerName: "Design Package",
    sortable: true,
    width: 100,
  },
  {
    field: "productionShift",
    headerName: "Production Shift",
    sortable: true,
    width: 100,
  },
  {
    field: "resolutionTime",
    headerName: "Resolution Time (in hours)",
    sortable: true,
    width: 100,
  },
  {
    field: "rootCauseIdentified",
    headerName: "Root Cause Identified",
    sortable: true,
    width: 100,
  },
  {
    field: "defectCategory",
    headerName: "Defect Category",
    sortable: true,
    width: 100,
  },
];

export default function DefectDataTable(props: { data: Defect[] }) {
  const { data } = props;
  const [selectedRows, setSelectedRows] = React.useState<Defect[]>([]);
  const [openFlag, setOpenFlag] = React.useState(false);
  const [openAutoFlag, setOpenAutoFlag] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [suspectedValue, setSuspectedValue] = React.useState("");
  const [field, setField] = React.useState("");
  const [controlValue, setControlValue] = React.useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = React.useState<Algorithm>();
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] =
    React.useState("Operation Success");
  const [operationSuccess, setOperationSuccess] = React.useState(false);
  const [operationFail, setOperationFail] = React.useState(false);

  const algorithms = [
    {
      name: "detectAnomaliesByFrequency",
      possibleFields: ["any"],
      information: `
      * Track the frequency of defect types across the dataset (for example defect category, part of the car).
      * Defects that occur too frequently or too infrequently (compared to typical occurrences) can be flagged as anomalies.
      * set the control value as a certain number of standard deviations above the mean (for example 2 standard deviations).
      * The threshold is dynamically calculated as mean + (stdDevMultiplier * stdDev), so values that exceed this threshold are flagged as anomalies.
      `,
    },
    {
      name: "detectAnomaliesByZScore",
      possibleFields: ["severityRating"],
      information: `
        * A Z-score measures how many standard deviations a particular value is away from the mean.
        * Values with a Z-score higher than a threshold (the control value) (for example 3) can be considered anomalies.
      `,
    },
    {
      name: "detectAnomaliesByIQR",
      possibleFields: ["resolutionTime"],
      information: `
        * The IQR method helps identify outliers by examining the range between the 1st quartile (Q1) and 3rd quartile (Q3).\n
        * Values outside of the range (Q1 - 1,5 * IQR, Q3 + 1,5 * IQR) could be flagged as anomalies.
      `,
    },
  ];
  const handleAutoFlagAnomalies = () => {
    autoFlagAnomalies(
      data,
      selectedAlgorithm || {
        name: "detectAnomaliesByFrequency",
        possibleFields: ["any"],
        information: "",
      },
      field,
      controlValue,
      async (anomalies) => {
        if (anomalies.length == 0)
          setSuccessMessage("no anomalies found with this threshhold");
        else {
          anomalies.forEach(async (anomaly) => {
            await flagAnomalyApi(anomaly);
          });
          setSuccessMessage(`${anomalies.length} anomalies detected`);
        }
      }
    )
      .then(() => {
        setLoading(false);
        setOpenAutoFlag(false);
        setSelectedAlgorithm(undefined);
        setField("");
        setControlValue(0);
        setOperationSuccess(true);
      })
      .catch(() => {
        setLoading(false);
        setSelectedAlgorithm(undefined);
        setField("");
        setControlValue(0);
        setOpenAutoFlag(false);
        setOperationFail(true);
      });
  };

  return (
    <Box sx={{ margin: 0, padding: 0, height: "100%", width: "100%" }}>
      <Snackbar
        open={operationSuccess}
        autoHideDuration={3000}
        message={successMessage}
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
      <Dialog open={openFlag}>
        <DialogTitle>Flag Anomaly</DialogTitle>
        <DialogContent>
          <Box>
            <Typography>Note:</Typography>
            <TextField
              sx={{ width: 500, marginBottom: 2 }}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            ></TextField>
          </Box>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              suspected value
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={suspectedValue}
              label="Suspected Value"
              onChange={(e) => {
                setSuspectedValue(e.target.value);
              }}
            >
              {selectedRows.length > 0 ? (
                Object.keys(selectedRows[0]).map((e) => (
                  <MenuItem value={e}>{e}</MenuItem>
                ))
              ) : (
                <></>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setOpenFlag(false)}
            color="error"
          >
            cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setLoading(true);
              const flaggingDate = new Date();
              flagAnomalyApi({
                note,
                status: "under review",
                id: Math.floor(Math.random() * 10000) + "",
                defectId: selectedRows[0].id,
                date: flaggingDate,
                time: `${flaggingDate.getHours()}:${flaggingDate.getMinutes()}:${flaggingDate.getSeconds()}`,
                flaggedBy: "user",
                suspectedValue: selectedRows[0][suspectedValue] + "",
                suspectedField: suspectedValue,
              })
                .then((r) => {
                  console.log(r);
                  setLoading(false);
                  setOpenFlag(false);
                  setOperationSuccess(true);
                  setNote("");
                  setSuspectedValue("");
                })
                .catch((e) => {
                  console.log(e);
                  setLoading(false);
                  setOpenFlag(false);
                  setNote("");
                  setSuspectedValue("");
                  setOperationFail(true);
                });
            }}
            color="success"
          >
            confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAutoFlag}>
        <DialogTitle>Auto Flag Anomaly</DialogTitle>
        <DialogContent sx={{ width: 550 }}>
          <Box sx={{ marginBottom: 2, marginTop: 2, width: "100%" }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">algorithm</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedAlgorithm}
                label="algorithm"
                onChange={(event) => {
                  setSelectedAlgorithm(
                    algorithms.find((e) => e.name == event.target.value)
                  );
                }}
              >
                {algorithms.map((e) => (
                  <MenuItem value={e.name}>{e.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">field</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={field}
                label="Field"
                disabled={!selectedAlgorithm}
                onChange={(e) => {
                  setField(e.target.value);
                }}
              >
                {data.length > 0 && selectedAlgorithm ? (
                  Object.keys(data[0])
                    .filter(
                      (k) =>
                        selectedAlgorithm?.possibleFields.includes(k) ||
                        selectedAlgorithm?.possibleFields.includes("any")
                    )
                    .map((e) => <MenuItem value={e}>{e}</MenuItem>)
                ) : (
                  <></>
                )}
              </Select>
            </FormControl>
          </Box>
          {selectedAlgorithm?.name !== "detectAnomaliesByIQR" ? (
            <Box sx={{ marginBottom: 2 }}>
              <Typography>Control Value:</Typography>
              <TextField
                type="number"
                sx={{ width: "100%" }}
                onChange={(e) => {
                  setControlValue(Number.parseInt(e.target.value));
                }}
              ></TextField>
            </Box>
          ) : (
            <></>
          )}
          <Divider />
          <Box sx={{ marginBottom: 2, marginTop: 2 }}>
            <Typography fontWeight="bold">algorithm information :</Typography>
            {selectedAlgorithm?.information.split(".").map((e) => (
              <Typography>{e}</Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedAlgorithm(undefined);
              setField("");
              setControlValue(0);
              setOpenAutoFlag(false);
            }}
            color="error"
          >
            cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setLoading(true);
              handleAutoFlagAnomalies();
            }}
            color="success"
          >
            confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        onClick={() => {
          setOpenFlag(true);
        }}
        variant="contained"
        sx={{ marginTop: 2, marginBottom: 2 }}
        disabled={selectedRows.length == 0}
      >
        Flag anomaly
      </Button>
      <Button
        onClick={() => {
          setOpenAutoFlag(true);
        }}
        variant="contained"
        sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
      >
        auto Flag anomalies
      </Button>
      <DataGrid
        rows={data}
        columns={columns}
        showToolbar
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 8,
            },
          },
          sorting: {
            sortModel: [{ field: "date", sort: "desc" }],
          },
        }}
        pageSizeOptions={[5]}
        isCellEditable={() => false}
        onRowSelectionModelChange={(rowSelectionModel) => {
          const selectedRowIds = Array.from(rowSelectionModel.ids);
          setSelectedRows(data.filter((e) => selectedRowIds.includes(e.id)));
        }}
      />
    </Box>
  );
}
