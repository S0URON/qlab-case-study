import { Box } from "@mui/material";
import ClippedDrawer from "./components/drawer";

const Home = () => {
  return (
    <Box sx={{ margin: 0, padding: 0 }}>
      <ClippedDrawer
        pages={[
          { displayName: "Tabular View", path: "/" },
          { displayName: "Charts View", path: "/charts" },
        ]}
      />
    </Box>
  );
};

export default Home;
