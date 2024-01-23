import React, {useEffect} from "react";
import CompteDetails from "./CompteDetails";
import ChangePassword from "./ChangePassword";
import { Link, NavLink } from "react-router-dom";
import HelpIcon from '@mui/icons-material/Help';
import { Box, Tab, Tabs, Typography } from "@mui/material";
import PropTypes from 'prop-types';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
    >
        {value === index && (
        <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
        </Box>
        )}
    </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}


const Compte = (props) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
    
    useEffect(() => {
        //Checking for install forlder
        window.$('.tabs').tabs();
        window.$("select").formSelect();

    }, []);
    
    
  
    return (
        <div id="main">
            <div className="row">
                <div className="col s12">
                    <div className="container">
                        <section className=" mt-1 section">
                            <div className="row"  >
                                
                                <div className="col l4 m12 s12" >
                                   
                                    <Tabs
                                        orientation="vertical"
                                        variant="scrollable"
                                        value={value}
                                        onChange={handleChange}
                                        style={{ backgroundColor:"white",boxShadow: "0 2px 2px 0 rgba(0, 0, 0, .14)" }}
                                    >
                                        <Tab style={{ maxWidth:"1000px" }} label="Informations" {...a11yProps(0)} />
                                        <Tab style={{ maxWidth:"1000px" }} label="Changer Mot de Passe" {...a11yProps(1)} />
                                    </Tabs>
                                        
                                </div>

                                <div className="col l8 s12">

                                    <TabPanel value={value} index={0}>
                                        <div id="info" >
                                            <CompteDetails />
                                        </div>
                            
                                    </TabPanel>
                                    <TabPanel value={value} index={1}>
                                        <div id="change-password">
                                            <ChangePassword />
                                        </div>
                                    </TabPanel>

                                </div>
                               
                            </div>
                        </section>
                    </div>
                    <div className="content-overlay"></div>
                </div>
            </div>
        </div>
    )
};

export default Compte;
