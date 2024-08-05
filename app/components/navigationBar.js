"use client";
import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pic from "./pictureButton";
import ItemTable from "./table";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function NavBar() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden", p: 0, m: 0 }}>
      <Box
        sx={{ 
          borderBottom: 1, 
          borderColor: "divider", 
          bgcolor: "#ffa000",
          display: 'flex', 
          justifyContent: 'center',
          p: 0, 
          m: 0
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Pantry Options"
          TabIndicatorProps={{ style: { backgroundColor: "#ffa000" } }}
        >
          <Tab
            sx={{
              ":hover": {
                backgroundColor: "#00008B",
                color: "#ffffff"
              },
            }}
            label="Home"
          />
          <Tab
            sx={{
              ":hover": {
                backgroundColor: "#00008B",
                color: "#ffffff"
              },
            }}
            label="Pantry"
          />
          <Tab
            sx={{
              ":hover": {
                backgroundColor: "#00008B",
                color: "#ffffff"
              },
            }}
            label="Fridge"
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          textAlign="center"
          
        >
          <Pic />
          <Typography variant="h2" sx={{ marginTop: 2 }}>
            Click to scan item into correct category
          </Typography>
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ItemTable collectionName={"Pantry"} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
      <ItemTable collectionName={"Fridge"} />
      </CustomTabPanel>
    </Box>
  );
}
