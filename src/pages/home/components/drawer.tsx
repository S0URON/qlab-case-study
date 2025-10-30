import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, Outlet } from "react-router-dom";
import * as React from "react";
import { Divider } from "@mui/material";
import { useScrollTrigger } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";

type Page = {
  displayName: string;
  path: string;
};
interface Props {
  pages: Page[];
}
export default function ClippedDrawer(props: Props) {
  const [selectedPage, setSelectedPage] = React.useState("Defects");

  function ElevationScroll(props) {
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 10,
    });

    return React.cloneElement(props.children, {
      elevation: trigger ? 4 : 1,
      sx: {
        backgroundColor: "#003D78",
        transition: "all 0.3s ease",
        width: trigger ? "100%" : "98%",
        margin: trigger ? 0 : 2,
      },
    });
  }
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <ElevationScroll>
        <AppBar>
          <Toolbar>
            <Box
              sx={{
                width: "20%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography color="#D6D6D6" variant="h5" sx={{ fontWeight: 200 }}>
                Q<AutoAwesome />
                Lab
              </Typography>
              <Divider
                orientation="vertical"
                sx={{ backgroundColor: "#D6D6D6", height: 30 }}
              />
              {props.pages.map((element, index) => (
                <Typography color="#D6D6D6" variant="h6" fontWeight={300}>
                  <Link
                    to={{ pathname: element.path }}
                    onClick={() => {
                      setSelectedPage(element.displayName);
                    }}
                    style={{
                      width: "100%",
                      paddingLeft: 2,
                      textDecoration: "none",
                      fontWeight:
                        selectedPage == element.displayName ? 400 : 200,
                      color: "#D6D6D6",
                    }}
                  >
                    {element.displayName}
                  </Link>
                </Typography>
              ))}
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
