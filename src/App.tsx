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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Home />}>
      <Route index element={<DefectsTable />} />
      <Route path="/anomalies" element={<AnomaliesTable />} />
      <Route path="*" element={<div>page not found</div>} />
    </Route>
  )
);

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
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
