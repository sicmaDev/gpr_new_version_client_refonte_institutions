import React, { useState } from "react";
import { Container, Button, Typography, Grid, Box, useMediaQuery } from "@mui/material";
import logo from '../assets/images/logo_gpr.jpg';
import loginPhoto from "../assets/images/landing_photo.svg";
import presentation from "../assets/images/Presentation_GPR_V2.pdf";
import logoSicma from "../assets/images/logo_sicma.png"; // Import the SICMa logo
import { BrowserRouter, NavLink, Route, Switch, Router } from "react-router-dom";
// import { useTranslation } from "react-i18next";

const LandingPage = () => {
//   const { t, i18n } = useTranslation();
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const buttonContainerStyles = {
    display: 'flex',
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: 'center',
    marginTop: isSmallScreen ? '10px' : '0',
  };
  const textContainerStyles = {
    marginLeft: isSmallScreen ? '20px' : '0',
    marginRight: isSmallScreen ? '20px' : '0',
    fontSize: isSmallScreen ? '1.5rem' : '2rem'  // Adjust font size for smaller screens
  };
  const textContainerStyles2 = {
    marginLeft: isSmallScreen ? '20px' : '0',
    marginRight: isSmallScreen ? '20px' : '0',
    fontSize: isSmallScreen ? '0.9rem' : '1rem'  // Adjust font size for smaller screens
  };
  const [lng, setLng] = useState("en");
  const switchLng = (param) => {

    setLng(param);
    // i18n.changeLanguage(param)

  }


  return (
    <>
      <div className="row presentation">
        <div style={{ overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#f8f9fa', padding: '20px 0', flexShrink: 0 }}>
            <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src={logo} alt="Logo" style={{ height: '50px' }} />
              <div style={buttonContainerStyles}>

                <Button variant="contained" style={{ marginLeft: '10px', marginTop: isSmallScreen ? '10px' : '0' }}>
                  <NavLink to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>{"S'authentifier"}</NavLink>
                </Button>
                <Button variant="contained" style={{ marginLeft: '10px', marginTop: isSmallScreen ? '10px' : '0' }}>
                  <NavLink to="/SignUser" style={{ textDecoration: 'none', color: 'inherit' }}>{"Créer un compte"}</NavLink>
                </Button>
              </div>
            </Container>
          </header>

          <Container
            maxWidth="lg"
            style={{
              textAlign: 'center',
              padding: '40px 0',
              flexGrow: 1,
              position: 'relative',
              minHeight: '400px', // Adjust the minimum height to fit the text
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h4" gutterBottom style={textContainerStyles}>
              {"GPR WEB est un logiciel de Gestion des Plaintes ou Réclamations conçu par SICMa & Associés dans le but d'aider les institutions de microfinances et autres organismes à mieux gérer leurs plaintes."}
            </Typography>
            <Typography variant="body1" paragraph style={textContainerStyles2}>
            {"Et ce, de l'enregistrement de la réclamation du client en passant par son traitement jusqu'à la clôture de sa réclamation. Simple, sécurisée et fiable ! Un outil d'analyse et d'aide à la décision basée sur la présentation de tableaux, de statistiques et de rapport synthèse. GPR vous aide à développer des stratégies claires pour améliorer la gestion de votre performance sociale."}
            </Typography>
            <Box display="flex" flexDirection={isSmallScreen ? 'column' : 'row'} justifyContent="center" mt={2}>
              <a href="https://sicmagroup.com/produits/gpr" target="_blank" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" style={{ margin: '10px' }}>{"En savoir plus"}</Button>
              </a>
              <Button variant="contained" style={{ margin: '10px' }}>
                <NavLink to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>{"Se connecter"}</NavLink>
              </Button>
              <Button variant="contained" style={{ margin: '10px' }}>
                <NavLink to="/SignUser" style={{ textDecoration: 'none', color: 'inherit' }}>{"Créer un compte"}</NavLink>
              </Button>
            </Box>
          </Container>

          <Box style={{ background: '#f1f3f5', padding: '40px 0', flexShrink: 0 }}>
            <Container maxWidth="lg">
              <Grid container spacing={2} alignItems="center" direction={isSmallScreen ? 'column-reverse' : 'row'}>
                <Grid item xs={12} md={6} style={{ textAlign: isSmallScreen ? 'center' : 'left' }}>
                  <img src={logoSicma} alt="SICMa Logo" style={{ height: '100px', marginBottom: '20px' }} />
                  <Typography variant="body1" paragraph style={textContainerStyles}>
                  {"Une Entreprise de Conseils en Investissement et en Management des Organisations"}
                  </Typography>
                  <a href={presentation} download="presentation_GPR.pdf" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">{"Télécharger la présentation rapide"}</Button>
                  </a>
                </Grid>
                <Grid item xs={12} md={6}>
                  <img src={loginPhoto} alt="Illustration" style={{ width: '100%', height: 'auto' }} />
                </Grid>
              </Grid>
            </Container>
          </Box>

          <footer style={{ textAlign: 'center', padding: '20px 0', background: '#f8f9fa', flexShrink: 0 }}>
            <Container maxWidth="lg">
              <Typography variant="body2">{"Copyright ©2025 SICMa & Associés. Tous droits réservés."}</Typography>
            </Container>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
