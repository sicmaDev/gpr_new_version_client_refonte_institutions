import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react'
import { Link, NavLink } from "react-router-dom";
import ReactDatatable from "@ashvin27/react-datatable";
// import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LanguageIcon from '@mui/icons-material/Language';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GavelIcon from '@mui/icons-material/Gavel';
import { hexToRgb, loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToSessionStorage } from '../Utils/utils';
import { PieChart } from '@mui/x-charts';
import { titre } from '../layouts/Haut';
import CircleIcon from '@mui/icons-material/Circle';
import { ReactMic } from 'react-mic';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { dashboardChanged, etat1Changed } from '../redux/actions/DashboardActions';
import { connect } from "react-redux";
import { DashboardApi } from '../apis/DahboardApi';
import GaugeChart from 'react-gauge-chart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SummarizeIcon from '@mui/icons-material/Summarize';
import RedoIcon from '@mui/icons-material/Redo';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Dashboard = (props) => {

    useEffect( () => {

        props.etat1Changed(false)
       DashboardApi(props).then((r) => {});
     
      
    }, []);

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des dénonciations",
        button: {
          //excel: true,
          //pdf: true,
          //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon/>,
                previous: <ChevronLeftIcon/>,
                next: <ChevronRightIcon/>,
                last: <LastPageIcon/>
            },
        },
    };

    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))): undefined;
    let hbt = (user.posteDto.habilitations).split(',');
    let addR = user.additionalRole;
    let ps;
    let postes;
    let langues;
    let objets;
    let recours;
    let utilisateurs;
    let supports;
    let produits;
    try{
        postes = JSON.parse(loadItemFromLocalStorage('app-postes'));
        ps = JSON.parse(loadItemFromLocalStorage('app-ps'));
        langues = JSON.parse(loadItemFromLocalStorage('app-langues'));
        objets = JSON.parse(loadItemFromLocalStorage('app-objets'));
        recours = JSON.parse(loadItemFromLocalStorage('app-recours'));
        utilisateurs = JSON.parse(loadItemFromLocalStorage('app-users'));
        supports = JSON.parse(loadItemFromLocalStorage('app-supports'));
        produits = JSON.parse(loadItemFromLocalStorage('app-produits'));
        // recours = JSON.parse(loadItemFromLocalStorage('app-recours'));
       // console.log(recours)
    }
    catch (e) {
        postes=[];
        ps=[];
        langues=[];
        objets=[];
        recours=[];
        utilisateurs=[];
        supports=[];
        produits=[];
        // recours=[];
    }
    let compte = 0;
    compte = postes.length!==0 ? compte+1 : compte+0; 
    compte = ps.length!==0 ? compte+1 : compte+0; 
    compte = langues.length!==0 ? compte+1 : compte+0; 
    compte = objets.length!==0 ? compte+1 : compte+0; 
    compte = produits.length!==0 ? compte+1 : compte+0; 
    compte = utilisateurs.length!==0 ? compte+1 : compte+0; 
    compte = supports.length!==0 ? compte+1 : compte+0; 
    // compte = recours.length!==0 ? compte+1 : compte+0; 
    let className =  compte < 7 ? 'col l8 m8 s12' : 'col l12 m12 s12'
    

   // console.log(compte);
    const settingTauxRef = useRef(null);
    let configChart = (
        <>
           
          <div className="invoice-product-details">
          
            <div className="row vertical-modern-dashboard">
              <div className="animate fadeRight">
                <div className="card">
                    <div className="card-content">
                        <div className='row'>
                            <div className={className}>
                               
                                <p className="medium-small"></p>
                                <div className="total-transaction-container">
                                    
                                    <GaugeChart id="gauge-chart5"
                                        ref={settingTauxRef}
                                        nrOfLevels={420}
                                        arcsLength={[0.3, 0.5, 0.2]}
                                        arcWidth = "0.2"
                                        colors={['#EA4228', '#F5CD19', '#5BE12C']}
                                        textColor="#000000"
                                        // needleColor="#EA4228"
                                        // needleBaseColor="#EA4228"
                                        percent={compte/7}
                                        arcPadding={0.02}
                                        // style={"height:25px"}
                                    />
                                    
                                </div>
                            </div>
                            <div className='col l4 m4 s12'>
                                
                                <div>{langues.length!==0 ? "" : <><CircleIcon style={{color:"#FFC400", fontSize:10 }}/> <NavLink to="/configurations/langues" style={{ color:"black",textDecoration:"none" }}>Langues</NavLink> </> } </div>
                                <div>{ps.length!==0 ? "" : <><CircleIcon style={{color:"#5243AA", fontSize:10 }}/> <NavLink to="/configurations/pointsServices" style={{ color:"black",textDecoration:"none" }}>Point de services</NavLink> </> }</div>    
                                <div>{postes.length!==0 ? "" : <><CircleIcon style={{color:"#666666", fontSize:10 }}/> <NavLink to="/configurations/postes" style={{ color:"black",textDecoration:"none" }}>Postes</NavLink> </> } </div>
                                <div>{utilisateurs.length!==0 ? "" : <><CircleIcon style={{color:"#253858", fontSize:10 }}/> <NavLink to="/configurations/utilisateurs" style={{ color:"black",textDecoration:"none" }}>Utilisateurs</NavLink> </> } </div>
                                <div>{supports.length!==0 ? "" : <><CircleIcon style={{color:"#FFC400", fontSize:10 }}/> <NavLink to="/configurations/supportsCollectes" style={{ color:"black",textDecoration:"none" }}>Supports de cllectes</NavLink> </> } </div>
                                <div>{objets.length!==0 ? "" : <><CircleIcon style={{color:"#0052CC", fontSize:10 }}/> <NavLink to="/configurations/objets" style={{ color:"black",textDecoration:"none" }}>Objets de réclamations</NavLink> </> } </div> 
                                <div>{produits.length!==0 ? "" : <><CircleIcon style={{color:"#00B8D9", fontSize:10 }}/> <NavLink to="/configurations/produits" style={{ color:"black",textDecoration:"none" }}>Produits / Services</NavLink> </> } </div>
                                {/* <div>{recours.length!==0 ? "" : <><CircleIcon style={{color:"#00B8D9", fontSize:10 }}/> <NavLink to="/configurations/produits" style={{ color:"black",textDecoration:"none" }}>Recours</NavLink> </> } </div> */}
                                  
                            </div>
                        </div>
                       
                    </div>
                </div>
              </div>
               
             
            </div>
          </div>
        </>
    );
    
    let columns = [
        {
            key: "type",
            text: "Type",
            className: "type",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
               let cat;
               if (claim.type === "CLAIM") {
                cat = "Réclamation";
               } else {
                cat = "Dénonciation";
               }
                return cat;
            },
        },
        {
          key: "claimCode",
          text: "Code",
          className: "code",
          align: "left",
          sortable: true,
        },
        {
          key: "claimClient",
          text: "Client",
          className: "client",
          align: "left",
          sortable: true,
        },
        {
            key: "receiptDateTimeFormated",
            text: "Reçu le",
            className: "receiptDateTime",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let receiptDateTime = new Intl.DateTimeFormat("fr-FR", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                }).format(new Date(claim.receiptDateTime));
                return receiptDateTime;
            },
        },
        {
            key: "declenchedAtFormated",
            text: "Déclenchée le",
            className: "declenchedDate",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let declenchedAt = new Intl.DateTimeFormat("fr-FR", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                }).format(new Date(claim.declenchedDate));
                return declenchedAt;
            },
        },
        {
            key: "retardDay",
            text: "En retard de",
            className: "retard",
            align: "left",
            sortable: true,
        },
        
        {
            key: "action",
            text: "Action",
            className: "",
            align: "left",
            sortable: false,
            cell: (claim) => {
                
                let url;
                if(claim.type === "CLAIM"){
                   
                    switch (claim.status) {
                      case "SAVED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                      case "AFFECTED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                      case "DESAPPROUVED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                      case "TREAT":
                        url = "/reclamations/mesure/"+claim.claimCode
                        break;
                      case "UNSATISFIED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                      case "PARTIAL_SATISFIED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                      case "CLASSED":
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
            
                      default:
                        url = "/reclamations/traitement/"+claim.claimCode
                        break;
                    }
                }else {
                    url = "/denonciations/traitement/"+claim.claimCode;
                }
                
                let iconeElt =<NavLink to={url}><div className="card-content red-text"><MenuIcon/></div></NavLink>
                return iconeElt
            },
           
        }

       
    ];

    let content = [];
    content = props.dashboard?.claimDenunRetard ? props.dashboard?.claimDenunRetard : [] ;
    
    content.forEach(element => {
        // date declenchedAt
        let declenchedDate = new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour:"numeric",
          minute:"numeric"
        }).format(new Date(element.declenchedDate));
        element.declenchedAtFormated = declenchedDate;

        // date receiptAt
        let receiptDateTime = new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour:"numeric",
          minute:"numeric"
        }).format(new Date(element.receiptDateTime));
        element.receiptDateTimeFormated = receiptDateTime;
    });

   

    return(
        hbt.includes("H12") ? 
        <>
            <div className='row'>
                <div className='col l6 s12 m12 '>
                    <div className='row'>
                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #059db1" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{supports.length} </span>
                                        <br/>
                                        Supports de collectes
                                    </Typography>
                                   
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <RecyclingIcon style={{ color:"#059db1",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #f96f00" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{produits.length} </span>
                                        <br/>
                                        Produits et services
                                    </Typography>
                                    <Typography  sx={{width: "50%",textAlign:"end" }}>
                                        <CategoryIcon style={{ color:"#f96f00",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #f9005e" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{utilisateurs.length} </span>
                                        <br/>
                                        Utilisateurs
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <PersonOutlineOutlinedIcon style={{ color:"#f9005e",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #f9005e" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{recours.length} </span>
                                        <br/>
                                        Recours externes
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <GavelIcon style={{ color:"#f9005e",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #059db1" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{postes.length} </span>
                                        <br/>
                                        Postes
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <WorkIcon style={{ color:" #059db1",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #f96f00" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}> {langues.length} </span>
                                        <br/>
                                        Langues
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <LanguageIcon style={{ color:"#f96f00",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6  mt-2'>
                            <Card style={{ borderLeft:"7px solid #f9005e" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{ps.length} </span>
                                        <br/>
                                        Points de services
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <AddBusinessIcon style={{ color:"#f9005e",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                        <div className='col l6 s12 m6 mt-2'>
                            <Card style={{ borderLeft:"7px solid #f9005e" }}>
                                <CardContent sx={{ display: 'flex'}}>
                                    <Typography sx={{ width: "50%" }} >
                                        <span style={{ fontWeight:"bold",fontSize:"18px" }}>{objets.length} </span>
                                        <br/>
                                        Objets
                                    </Typography>
                                    <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                        <DataObjectIcon style={{ color:"#f9005e",fontSize:50 }} />
                                    </Typography>
                                
                                </CardContent>
                                
                            </Card>
                        </div>

                    </div>
                </div>

                <div className="col l6 s12 m12 ">
                    <div className='row'>
                        {configChart}
                    </div>
                    
                </div>
            </div>
           
        </> : 
        <>
           
           <div className='row'>
                <div className='col l4 s12 m6 mt-2'>
                    <Card  style={{ borderLeft:"7px solid #059db1" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.plainteSuggest
                                        
                                    }
                                    
                                   
                                </span>
                                <br/>
                                <span style={{fontSize:"10px" }}>Réclamations,Dénonciation et Suggestions</span>
                                
                                
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <SummarizeIcon style={{ color:" #059db1",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

                <div className='col l4 s12 m6 mt-2'>
                    <Card style={{ borderLeft:"7px solid #f96f00" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.claims
                                        
                                    }
                                    
                                   
                                </span>
                                
                                 <br/>
                                <span style={{fontSize:"10px" }}>Réclamations</span>
                                
                            </Typography>
                            
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <ReceiptLongIcon style={{ color:"#f96f00",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

                <div className='col l4 s12 m6 mt-2'>
                    <Card style={{ borderLeft:"7px solid #f96f00" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.claimsTreat
                                        
                                    }
                                </span>
                               
                                 <br/>
                                 <span style={{fontSize:"10px" }}>Réclamations Traitées</span>
                                
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <RecyclingIcon style={{ color:"#f96f00",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

                <div className='col l4 s12 m6 mt-2'>
                    <Card  style={{ borderLeft:"7px solid #059db1" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.claimsAffected
                                        
                                    }
                                </span>
                            
                                 <br/>
                                 <span style={{fontSize:"10px" }}> Réclamation affectées</span>
                               
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <RedoIcon style={{ color:"#059db1",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

                <div className='col l4 s12 m6 mt-2'>
                    <Card style={{ borderLeft:"7px solid #f9005e" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }}  />
                                            </Box>
                                        :
                                        props.dashboard?.denuns
                                            
                                    }
                                </span>
                              
                                 <br/>
                                 <span style={{fontSize:"10px" }}>Dénonciations</span>
                                
                            </Typography>
                            <Typography  sx={{width: "50%",textAlign:"end" }}>
                                <ReceiptLongIcon style={{ color:"#f9005e",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

                <div className='col l4 s12 m6 mt-2'>
                    <Card style={{ borderLeft:"7px solid #1e2188" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.suggest
                                        
                                    }
                                </span>
                               
                                 <br/>
                                 <span style={{fontSize:"10px" }}>Suggestions</span>
                                
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <ReceiptLongIcon style={{ color:"#1e2188",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>


               

                

                <div className='col l4 s12 m6 mt-2'>
                    <Card  style={{ borderLeft:"7px solid #f9005e" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.TotalclaimDenunRetard
                                        
                                    }
                                </span>
                               
                                 <br/>
                                 <span style={{fontSize:"10px" }}>En retard de traitement</span>
                                
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <AssignmentLateIcon style={{ color:"#f9005e",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>


                <div className='col l4 s12 m6 mt-2'>
                    <Card  style={{ borderLeft:"7px solid #1e2188" }}>
                        <CardContent sx={{ display: 'flex'}}>
                            <Typography sx={{ width: "50%" }} >
                                <span style={{ fontWeight:"bold",fontSize:"18px" }}>
                                    {
                                        props.etat1 === false ?
                                            <Box sx={{ display: 'flex' }}>
                                                <CircularProgress sx={{ width:"25px!important",height:"25px!important" }} />
                                            </Box>
                                        :
                                        props.dashboard?.tauxSatisfaction + " %"
                                        
                                    }
                                </span>
                             
                                 <br/>
                                 <span style={{fontSize:"10px" }}>Satisfaction cliente</span>
                                
                            </Typography>
                            <Typography  sx={{ width: "50%",textAlign:"end" }}>
                                <SentimentSatisfiedAltIcon style={{ color:"#1e2188",fontSize:50 }} />
                            </Typography>
                        
                        </CardContent>
                        
                    </Card>
                </div>

               

            </div>

            {
                addR !== "MOLDUE" || hbt.includes("H13") ? 
           
                <div className="col s12">
                    <div className="container">
                        <section className="tabs-vertical mt-1 section">
                        <div className="row">
                            <div className="col l12 s12 pb-5">
                            <div className="card-panel pb-5">
                                <div className="row">
                                <div className="col s12">
                                    <h6 className="card-title">
                                    Alertes liées aux Plaintes &nbsp;
                                    </h6>
                                </div>
                                <div className="col s12">
                                    <ReactDatatable
                                    className={"responsive-table table-xlsx"}
                                    config={config}
                                    records={content}
                                    columns={columns}
                                    
                                    />
                                </div>
                                <div id="tab_exl" style={{ display: "none" }}></div>
                                </div>
                            </div>
                            </div>
                        
                        </div>
                        </section>
                    </div>
                    <div className="content-overlay"></div>
                </div>

                :""
            }

        </>
       
    );
}
 

const mapStateToProps = (state) => {
    return {
        dashboard: state.dashboard.dashboard,
        etat1: state.dashboard.etat1,
    
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dashboardChanged: (dashboard) => {
            dispatch(dashboardChanged(dashboard));
        },
        etat1Changed: (etat1) => {
            dispatch(etat1Changed(etat1));
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);