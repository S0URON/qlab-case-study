import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/home/home";
import DefectsTable from "./pages/defects/defects";
import AnomaliesTable from "./pages/anomlies/anomlies";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DefectChartsView from "./pages/defects/components/defectChartsView";
import DefectDataTable from "./pages/defects/components/defectsDataTable";
import React from "react";
import { getDefectsApi, type Defect } from "./apis/defects.api";

const theme = createTheme({
  typography: {
    fontFamily: '"BMW Type Next", sans-serif',
    fontWeightRegular: 300,
  },
  palette: {
    primary: {
      main: "#003D78", // example: BMW dark blue
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0066B1", // example: BMW teal
      contrastText: "#000000",
    },
  },
  shape: {
    borderRadius: 0,
  },
});

function App() {
  const [data, setData] = React.useState<Defect[]>([]);
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

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Home />}>
        <Route index element={<DefectDataTable data={data} />} />
        <Route path="/charts" element={<DefectChartsView data={data} />} />
        <Route path="*" element={<div>page not found</div>} />
      </Route>
    )
  );
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
