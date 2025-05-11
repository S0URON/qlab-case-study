import { Box } from "@mui/material";
import ClippedDrawer from "./components/drawer";

const Home = () => {
  return (
    <Box sx={{ margin: 0, padding: 0 }}>
      <ClippedDrawer
        pages={[
          { displayName: "Defects", path: "/" },
          { displayName: "Anomalies", path: "/anomalies" },
        ]}
      />
    </Box>
  );
};

export default Home;
