import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { unflagAnomalyApi, type Anomaly } from "../../../apis/anomalies.api";
import * as React from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
} from "@mui/material";
import { formatDate } from "../../../utils/utils";

const columns: GridColDef<Anomaly>[] = [
  {
    field: "date",
    headerName: "Date",
    sortable: true,
    valueFormatter: (value) => {
      return formatDate(value);
    },
    width: 150,
  },
  {
    field: "time",
    headerName: "Time",
    sortable: true,
    width: 100,
  },
  {
    field: "defectId",
    headerName: "Defect ID",
    sortable: true,
    width: 100,
  },
  {
    field: "suspectedField",
    headerName: "Suspected Field",
    sortable: true,
    width: 150,
  },
  {
    field: "suspectedValue",
    headerName: "Suspected Value",
    sortable: true,
    width: 150,
  },
  {
    field: "status",
    headerName: "Status",
    sortable: true,
    width: 150,
  },
  {
    field: "flaggedBy",
    headerName: "Flagged By",
    sortable: true,
    width: 150,
  },
  {
    field: "note",
    headerName: "Note",
    sortable: true,
    width: 150,
  },
];

export default function AnomalieDataTable(props: {
  data: Anomaly[];
  setRefetchData: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data, setRefetchData } = props;
  const [selectedRows, setSelectedRows] = React.useState<Anomaly[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [operationSuccess, setOperationSuccess] = React.useState(false);
  const [operationFail, setOperationFail] = React.useState(false);

  return (
    <Box sx={{ margin: 0, padding: 0, height: "100%", width: "100%" }}>
      <Snackbar
        open={operationSuccess}
        autoHideDuration={3000}
        message="Operation Success"
        sx={{ backgroundColor: "green" }}
        onClose={() => {
          setRefetchData(false);
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
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog open={open}>
        <DialogTitle>Unflag Anomaly</DialogTitle>
        <DialogContent>
          <Box>
            <Typography>
              Are you sure you want to delete this anomaly?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setOpen(false)}
            color="error"
          >
            cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setLoading(true);
              unflagAnomalyApi(selectedRows[0].id)
                .then((r) => {
                  console.log(r);
                  setLoading(false);
                  setOpen(false);
                  setRefetchData(true);
                  setOperationSuccess(true);
                })
                .catch((e) => {
                  console.log(e);
                  setLoading(false);
                  setOpen(false);
                  setOperationFail(true);
                });
            }}
            color="success"
          >
            confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        onClick={() => {
          console.log(selectedRows);

          setOpen(true);
        }}
        variant="contained"
        sx={{ marginTop: 2, marginBottom: 2 }}
        disabled={selectedRows.length == 0}
      >
        unflag anomaly
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
