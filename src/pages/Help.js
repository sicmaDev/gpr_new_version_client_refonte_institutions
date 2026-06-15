import React, { useState } from 'react'
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { connect } from "react-redux";
import { helpChanged } from '../redux/actions/HelpActions';
import { HelpApi, downloadFillesApi } from '../apis/HelpApi';
import { useEffect } from 'react';
import { loadItemFromSessionStorage } from '../Utils/utils';
import { notify } from '../Utils/alert';
import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import { KTApp } from "../Utils/blockui";

const sectionHeaderSx = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)",
    color: "#fff",
    marginBottom: "20px",
};

const cardPanelSx = {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
    padding: "20px",
    marginBottom: "24px",
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Help = (props) => {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v2',
            state: 'danger',
            message: 'En cours de chargement...'
        })
        setIsLoading(true);
        HelpApi(props).then((r) => { }).finally(() => {
            setIsLoading(false);
            KTApp.unblockPage();
        });
    }, []);
    let mode = loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // clearComponentState();
    };

    let faqs = props.help?.faqs ? props.help.faqs : [];
    let docs = props.help?.faqs ? props.help.docs : [];

    let documents = docs.map((doc) => {
        return (
            <Box
                key={doc.id}
                onClick={() => {
                    if (mode === 1) {
                        downloadFillesApi(doc.id, doc.name)
                    } else {
                        notify("Passez en mode Online pour télécharger ", "info")
                    }
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { background: "#f8fafc", borderColor: "#3b3fd8" },
                }}
            >
                <FileTypeIcon attachment={doc} size={36} />
                <Typography
                    sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1e2188",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {doc.libelle}
                </Typography>
            </Box>
        );
    });



    return (
        <>
            <div className="col s12">
                <div className="container">
                    <Box sx={sectionHeaderSx}>
                        <FolderOpenIcon />
                        <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                            Ressources disponibles
                        </Typography>
                    </Box>

                    <Box sx={cardPanelSx}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: "14px" }}>
                            {documents}
                        </Box>
                    </Box>

                    <Box sx={sectionHeaderSx}>
                        <HelpOutlineIcon />
                        <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                            FAQ (Comment ça marche ?)
                        </Typography>
                    </Box>

                    <Box sx={cardPanelSx}>
                        {faqs.map((faq, index) => (
                            <Accordion
                                key={index}
                                disableGutters
                                elevation={0}
                                sx={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px !important",
                                    marginBottom: "10px",
                                    "&:before": { display: "none" },
                                    "&.Mui-expanded": { borderColor: "#3b3fd8" },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: "#3b3fd8" }} />}
                                    sx={{
                                        "& .MuiAccordionSummary-content": { margin: "10px 0" },
                                    }}
                                >
                                    <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#1e2188" }}>
                                        {faq.libelle}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography sx={{ fontSize: "14px", color: "#475569" }}>
                                        {faq.answer}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
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