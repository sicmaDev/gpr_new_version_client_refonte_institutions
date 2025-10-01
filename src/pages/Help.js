import React from 'react'
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import doc from "../assets/images/guide_web_provisoire.pdf"
import { connect } from "react-redux";
import Faq from "react-faq-component";
import { helpChanged } from '../redux/actions/HelpActions';
import { HelpApi, downloadFillesApi } from '../apis/HelpApi';
import { useEffect } from 'react';
import { guessExtension, loadItemFromSessionStorage } from '../Utils/utils';
import { notify } from '../Utils/alert';
import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';


const styles = {
    // bgColor: 'white',
    titleTextSize: '24px',
    titleTextColor: "#1e2188",
    rowTitleColor: "black",
    rowTitleTextSize: '18px',
    rowContentTextSize: '14px',
    // rowContentColor: 'grey',
    // arrowColor: "red",
};

const config = {
    // animate: true,
    // arrowIcon: "V",
    // tabFocus: true
};


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Help = (props) => {
    const [open, setOpen] = React.useState(false);

    useEffect( () => {
        HelpApi(props).then((r) => {});
    }, []);
    let mode =loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // clearComponentState();
    };
    
    let faqs = props.help?.faqs ? props.help.faqs : [];
    let docs = props.help?.faqs ? props.help.docs : [];

    var lignes=[]
    for (let i = 0; i < faqs.length; i++) {
        lignes.push({title: faqs[i]["libelle"],content: faqs[i]["answer"],})
    }
    const data = {
        title: "FAQ (Comment ça marche ? )",
        rows: lignes
    };

    let documents = docs.map((doc) => {
        let couleurs =["#333300","#00cc00","#99003d","#3333ff","#666666","#253858","#00875A","#36B37E","#FFC400","#FF8B00","#FF5630","#5243AA","#0052CC","#00B8D9"]
        let fond = couleurs[getRandomInt(couleurs.length)];
        // let fond = couleurs[index % couleurs.length];
        let icon = guessExtension(doc);
        return (
            
            <div className='col l3 s12 m6 df mt-1' style={{ }}>
                 <img
                      className="recent-file"
                      src={icon}
                      height="28"
                      width="24"
                      alt=""
                    />
                <Typography  style={{fontWeight:"normal", color:"#0052CC", cursor: "pointer", marginLeft: "8px", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", height: "35px", width: "200px"}}  
                onClick={(e) => {
                      if (mode === 1) {
                          downloadFillesApi(doc.id, doc.name)
                      } else {
                          notify("Passez en mode Online pour télécharger ","info")
                      }
                        
                  }}>
                    {doc.libelle}
                </Typography>
                {/* <Card>
                    {/* <CardContent style={{ borderLeft:"70px solid "+fond }}> */}
                    {/* <CardContent style={{ borderLeft:"70px solid "+fond }}>
                    
                        <Typography  style={{fontWeight:"bold" }}>
                            {doc.libelle}
                        </Typography>

                        <Typography className='mt-15'  style={{display:"flex" }}> */}
                            {/* <VisibilityIcon 
                                className='mr-10'
                                onClick={(e) => {
                      
                                    if (mode === 1) {
                                        handleClickOpen();
                                    } else {
                                        notify("Passez en mode Online pour télécharger ","info")
                                    }
                                      
                                }}
                            /> */}
                            {/* <DownloadIcon
                               
                            />  
                        </Typography>
                    
                    </CardContent>
                    
                </Card>  */}
            </div>
                               
        );
    });

    
   
    return(
        <>
         <div className="col s12">
                <div className="container">
                    <section className="tabs-vertical mt-1 section">
                    <div className="row">
                        <div className="col l12 s12 pb-5">
                        <div className="card-panel pb-5">
                            <div className="row">
                                <div className="col s12">
                                    <h6 className="card-title text-bold">
                                        Ressources disponibles
                                    </h6>
                                </div>

                                {documents}
                                <div className="col s12 mt-4">
                                    <div>
                                        <Faq
                                            data={data}
                                            styles={styles}
                                            config={config}
                                        />
                                    </div>
                                </div>
                            
                            </div>
                        </div>
                        </div>
                    
                    </div>
                    </section>
                </div>
                
            </div>

            <div>
                <div>
                  <Dialog
                    fullScreen
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                  >
                    <AppBar
                      sx={{ position: "relative", backgroundColor: "#1e2188" }}
                    >
                      <Toolbar>
                        <IconButton
                          edge="start"
                          color="inherit"
                          onClick={handleClose}
                          aria-label="close"
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography
                          sx={{ ml: 2, flex: 1 }}
                          variant="h6"
                          component="div"
                        >
                          Contenu du document
                        </Typography>
                      </Toolbar>
                    </AppBar>

                    <div className="row">
                      {/* first part */}

                      <div className="col l12 m12 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          
                            <iframe
                                id="inlineFrameExample"
                                title="Inline Frame Example"
                                width="300"
                                height="200"
                                src="C:/Users/DELL/Downloads/Rapport_GPR_10112023.doc">
                            </iframe>
                          
                        </div>
                      </div>

                      
                    </div>
                  </Dialog>
                </div>
              </div>

        </>
    );
}
 

const mapStateToProps = (state) => {
    return {
        help: state.help.help,
    
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        helpChanged: (help) => {
            dispatch(helpChanged(help));
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Help);