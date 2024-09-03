import React, { useEffect, useState } from 'react'
import {Route, Switch, Redirect } from "react-router-dom";
import Dashboard from '../pages/Dashboard';
import Help from '../pages/Help';
import { Container, Toolbar } from '@mui/material';
import Box from '@mui/material/Box';
import Langues from '../pages/Configurations/Langues';
import Objets from '../pages/Configurations/Objets';
import PointsServices from '../pages/Configurations/PointsServices';
import Postes from '../pages/Configurations/Postes';
import Produits from '../pages/Configurations/Produits';
import RecoursExternes from '../pages/Configurations/RecoursExternes';
import SupportsCollectes from '../pages/Configurations/SupportsCollectes';
import Utilisateurs from '../pages/Configurations/Utilisateurs';
import EnregistrerReclamation from '../pages/Reclamations/EnregistrerReclamation';
import TraiterReclamation from '../pages/Reclamations/TraiterReclamation';
import MesurerReclamation from '../pages/Reclamations/MesurerReclamation';
import AssuranceReclamation from '../pages/Reclamations/AssuranceReclamation';
import ListeReclamations from '../pages/Reclamations/ListeReclamations';
import ListeReclamationsClassees from '../pages/Reclamations/ListeReclamationsClassees';
import EnregistrerDenonciation from '../pages/Denonciations/EnregistrerDenonciation';
import TraiterDenonciation from '../pages/Denonciations/TraiterDenonciation';
// import MesurerDenonciation from '../pages/Denonciations/MesurerDenonciation';
// import AssuranceDenonciation from '../pages/Denonciations/AssuranceDenonciation';
import ListeDenonciations from '../pages/Denonciations/ListeDenonciations';
// import ListeDenonciationsClassees from '../pages/Denonciations/ListeDenonciationsClassees';
import EnregistrerSuggestion from '../pages/Suggestions/EnregistrerSuggestion';
import TraiterSuggestion from '../pages/Suggestions/TraiterSuggestion';
import ListeSuggestions from '../pages/Suggestions/ListeSuggestions';
import ReclamationsAlertes from '../pages/Alertes/ReclamationsAlertes';
import DenonciationsAlertes from '../pages/Alertes/DenonciationsAlertes';
import Global from '../pages/Rapports/Global';
import Bceao from '../pages/Rapports/Bceao';
import Compte from '../pages/Compte/Compte';
import Documents from '../pages/Configurations/Documents';
import Faq from '../pages/Configurations/Faq';
import { loadItemFromSessionStorage } from '../Utils/utils';
import Notifications from '../pages/Configurations/Notifications';
import Solutions from '../pages/Configurations/Solutions';
import Categories from '../pages/Configurations/Categories';
import Institution from '../pages/Configurations/Institution';
import Email from '../pages/Configurations/Email';
import Sms from '../pages/Configurations/Sms';
import Bot from '../pages/Configurations/Bot';
import Log from '../pages/Configurations/Log';


export default function Contenu() { 
    let mode =loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;
    let rendu;
    if (mode === 1) {
        rendu = 
        <Route render={() => <Dashboard />} />
    } else {
        rendu = 
        <Route render={() => <Help />} />
    }
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      useEffect(() => {
        const handleResize = () => {
          setScreenSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
    
        // Add event listener to handle window resize
        window.addEventListener('resize', handleResize);
    
        // Clean up the event listener on component unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []); // Empty dependency array means this effect will only run once on mount
    
    return (
        
        <Box
          component="main"
          sx={{
              backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflowY:'scroll',
          }}
        >
            <Toolbar />
          
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4}} >
                <Switch>
                    <Route path="/dashboard" component={Dashboard} />

                    {/* configurations */}
                    <Route path="/configurations/institution" component={Institution} />
                    <Route path="/configurations/langues" component={Langues} />
                    <Route path="/configurations/categories" component={Categories} />
                    <Route path="/configurations/objets" component={Objets} />
                    <Route path="/configurations/solutions" component={Solutions} />
                    <Route path="/configurations/pointsServices" component={PointsServices} />
                    <Route path="/configurations/postes" component={Postes} />
                    <Route path="/configurations/produits" component={Produits} />
                    <Route path="/configurations/recoursExternes" component={RecoursExternes} />
                    <Route path="/configurations/supportsCollectes" component={SupportsCollectes} />
                    <Route path="/configurations/utilisateurs" component={Utilisateurs} />
                    <Route path="/configurations/email" component={Email} />
                    <Route path="/configurations/sms" component={Sms} />
                    <Route path="/configurations/bot" component={Bot} />
                    <Route path="/configurations/logs" component={Log} />
                    <Route path="/ressources/documents" component={Documents} />
                    <Route path="/ressources/faq" component={Faq} />
                    <Route path="/configurations/notifications" component={Notifications} />

                    {/* reclamations */}
                    <Route path="/reclamations/enregistrement" component={EnregistrerReclamation} />
                    <Route path="/reclamations/traitement/:code" component={TraiterReclamation} />
                    <Route path="/reclamations/mesure/:code" component={MesurerReclamation} />
                    <Route path="/reclamations/assurance" component={AssuranceReclamation} />
                    <Route path="/reclamations/liste" component={ListeReclamations} />
                    <Route path="/reclamations/classees" component={ListeReclamationsClassees} />
                    
                    {/* denonciations */}
                    <Route path="/denonciations/enregistrement" component={EnregistrerDenonciation} />
                    <Route path="/denonciations/traitement/:code" component={TraiterDenonciation} />
                    {/* <Route path="/denonciations/mesure" component={MesurerDenonciation} />
                    <Route path="/denonciations/assurance" component={AssuranceDenonciation} /> */}
                    <Route path="/denonciations/liste" component={ListeDenonciations} />
                    {/* <Route path="/denonciations/classees" component={ListeDenonciationsClassees} /> */}

                    {/* suggestions */}
                    <Route path="/suggestions/enregistrement" component={EnregistrerSuggestion} />
                    <Route path="/suggestions/traitement" component={TraiterSuggestion} />
                    <Route path="/suggestions/liste" component={ListeSuggestions} />

                    {/* alertes */}
                    <Route path="/alertes/reclamations" component={ReclamationsAlertes} />
                    <Route path="/alertes/denonciations" component={DenonciationsAlertes} />

                    {/* rapports */}
                    <Route path="/rapports/global" component={Global} />
                    <Route path="/rapports/bceao" component={Bceao} />

                    {/* compte */}
                    <Route path="/compte" component={Compte} />
                   
                    <Route path="/help" component={Help} />

                    
                    {rendu}
                </Switch>
            </Container>
      
        
        </Box>
        
           
    );
    
}
 
