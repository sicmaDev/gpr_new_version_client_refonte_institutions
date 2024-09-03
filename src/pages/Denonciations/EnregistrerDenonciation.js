import React, {useEffect, useRef, useState} from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
import RecordingsList from "../../components/recordings-list";
import "react-datepicker/dist/react-datepicker.css";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuid } from "uuid";
import {
    addressChanged,
    claimRecordErrors,
    codeChanged,
    collectChanged,
    collectLibelleChanged,
    contentChanged,
    crewChanged,
    dossierimfChanged,
    etat2Changed,
    etatChanged,
    firstnameChanged,
    genderChanged,
    idChanged,
    itemsChanged,
    languageChanged,
    languageLibelleChanged,
    lastnameChanged,
    loading,
    phoneChanged,
    productChanged,
    productLibelleChanged,
    recordedAtChanged, recordedAtDPChanged,
    selectedFilesChanged,
    selectedFilesReset,
    selectedItemChanged,
    selectedItemFilesChanged,
  selectedItemAudioChanged,
    subjectChanged,
    subjectLibelleChanged,
    underSubjectChanged,
    underSubjectLibelleChanged,
    unitChanged,
    unitLibelleChanged
} from "../../redux/actions/Reclamations/EnregistrementReclamationActions";
import { cleanPhoneNumber, groupBy, guessExtension, handleDatePicker, isEmpty, isSettingComplete, isValidDate, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import http from "../../apis/http-common";
import {KTApp} from "../../Utils/blockui";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { notify } from "../../Utils/alert";
import axios from "axios";
import { addDenunciationApi, addDenunciationApiOffline, addTempDenunciationApi, addTempDenunciationApiOffline, downloadAudioApi, downloadFillesApi, getDenunAudioApi, getFillesApi, listeByStatut, listeByStatutOffline } from "../../apis/Denonciations/DenonciationsApi";
import { licenseInfo } from "../../apis/LoginApi";
import useRecorder from "../../hooks/useRecorder";
import RecorderControls from "../../components/recorder-controls";
import { Mic } from "@mui/icons-material";
// import { licenseControl } from "../../Utils/license";
// import DateInput from "../ui/DateInput";
//import IntlTelInput from 'react-intl-tel-input';
//import 'react-intl-tel-input/dist/main.css';
registerLocale('fr', fr)

const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};
const EnregistrerDenonciation = (props) => {
    const [open, setOpen] = React.useState(false)
    const [files, setFiles] = React.useState([]);
    const [underSubjectOptions, setUnderSubjectOptions] = useState([]);

    const { recorderState, ...handlers } = useRecorder();
    let { audio } = recorderState;

    let settingComplete = isSettingComplete()
    let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))): undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))): undefined;

    const handleClose = () => {
        setOpen(false);
    };

    const [actif, setActif] = useState();
  
    const licenseControl = async () => {
      try {
        let resultat = await licenseInfo();
        // console.log("resultat", resultat);
        setActif(resultat.actif)
        
      } catch (error) {
        console.error("Une erreur s'est produite :", error);
      }
    };
  
    useEffect(() => {
      const fetchData = async () => {
        await licenseControl();
      };
  
      fetchData();
    }, []);


    useEffect(() => {
        if (mode===1) {
            props.itemsChanged([])
            listeByStatut(props,"TEMP_SAVED").then((r) => {}); 
        } else {
            props.itemsChanged([])
            listeByStatutOffline(props,"TEMP_SAVED").then((r) => {}); 
        }
      
        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({marginTop: "1%", boxShadow: "none"})
        window.$('ul.pagination').parent().css({boxShadow: "none"})
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')
        window.$('.tooltipped').tooltip();
       
    }, []);

    const [open2, setOpen2] = React.useState(false);
    const [showAudioBox, setAudioBox] = useState(false);
    const [showAudioPlayer, setAudioPlayer] = useState("");
    const [currentAudio, setCurrentAudio] = useState("");

   
    //Handling the form
    let collects
    let subjects
    let underSubjects
    let products
    let units
   
    try {
        collects =JSON.parse(loadItemFromLocalStorage('app-supports'));
        subjects =JSON.parse(loadItemFromLocalStorage('app-objets'));
        subjects = JSON.parse(loadItemFromLocalStorage("app-categories"));
        underSubjects = JSON.parse(loadItemFromLocalStorage("app-objets"));
        products =JSON.parse(loadItemFromLocalStorage('app-produits'));
        units =JSON.parse(loadItemFromLocalStorage('app-ps'));
    } catch (e) {
        collects=[]
        subjects = [];
        underSubjects = [];
        products=[]
        units=[]
    }

    let formButtons;
    let collectOptions
    let subjectOptions
    let productOptions

    if (collects !== undefined) {
        collectOptions = collects.map(collect => {
            return {"label": collect.libelle, "value": collect.id}
        })
    } else {
        collectOptions = []
    }

    if (subjects !== undefined) {
        subjectOptions = subjects.map(subject => {
            return {"label": subject.libelle, "value": subject.id}
        })
    } else {
        subjectOptions = []
    }
    if (products !== undefined) {
        productOptions = products.map(product => {
            return {"label": product.libelle, "value": product.id}
        })
    } else {
        productOptions = []
    }
  
    let unitOptions
    let agencyOptions
    let directionOptions
    let guichetOptions
    units  = units.filter((un)=> !un.deleted)
    let unitsGroupByType = (units!==undefined)? groupBy(units, "type"): undefined;
    //
    if (unitsGroupByType!== undefined && unitsGroupByType["AGENCE"] !== undefined) {
        agencyOptions = unitsGroupByType["AGENCE"].map(agency => {
            return {"label": agency.libelle, "value": agency.id}
        })
    } else {
        agencyOptions = ""
    }
   
    if (unitsGroupByType!== undefined && unitsGroupByType["DIRECTION"] !== undefined) {
        directionOptions = unitsGroupByType["DIRECTION"].map(direction => {
            return {"label": direction.libelle, "value": direction.id}
        })
    } else {
        directionOptions = ""
    }
    if (unitsGroupByType!== undefined && unitsGroupByType["GUICHET"] !== undefined) {
        guichetOptions = unitsGroupByType["GUICHET"].map(guichet => {
            return {"label": guichet.libelle, "value": guichet.id}
        })
    } else {
        guichetOptions = ""
    }
   
    unitOptions = []
    if(directionOptions!==""){unitOptions.push({"label": "Direction", "options": directionOptions})}
    if(agencyOptions!==""){unitOptions.push({"label": "Agence", "options": agencyOptions})}
    if(guichetOptions!==""){unitOptions.push({"label": "Guichet", "options": guichetOptions})}
    

    const handleChange = (e) => {
        props.unitChanged(e.value)
        props.unitLibelleChanged(e.label)
    }
    const handleChange1 = (e) => {
        props.productChanged(e.value)
        props.productLibelleChanged(e.label)
    }
    let tmps = []
    const handleChange2 = (e) => {
        props.subjectChanged(e.value);
        props.subjectLibelleChanged(e.label);
    
        //filtre
        if (underSubjects !== undefined) {
          underSubjects.filter((underSubject) => {
            // console.log("underSubject.categorie.id",underSubject.categorie.id)
            if (e.value === underSubject.categorie.id ) {
              tmps.push({ label: underSubject.libelle, value: underSubject.id });
            } 
          });
          setUnderSubjectOptions(tmps)
          // console.log("tmps",tmps)
        } else {
          underSubjectOptions = [];
        }
    
    };
    const handleChange3 = (e) => {
        props.collectChanged(e.value)
        props.collectLibelleChanged(e.label)
    }

    const handleChange5 = (e) => {
        // console.log("e",e)
        props.underSubjectChanged(e.value);
        props.underSubjectLibelleChanged(e.label);
    };

    let errors = {};
    const clearComponentState = () => {
        props.idChanged("")
        props.subjectChanged("")
        props.underSubjectChanged("")
        props.subjectLibelleChanged("")
        props.underSubjectLibelleChanged("")
        props.collectChanged("")
        props.collectLibelleChanged("")
        props.codeChanged("")
        props.recordedAtChanged("")
        props.recordedAtDPChanged("")
        props.productChanged("")
        props.productLibelleChanged("")
        props.unitChanged("")
        props.unitLibelleChanged("")
        props.contentChanged("")
        props.claimRecordErrors("")
        props.selectedFilesReset([])
        props.selectedItemChanged({})
        props.selectedItemAudioChanged([]);
        props.selectedItemFilesChanged([])
        audio =[]
    }

    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()

    }
    
    const handleValidation = () => {
        let isValid = true;

        if ((props.recorded_at === "" || props.recorded_at === undefined || props.recorded_at === null || !isValidDate(props.recorded_at))) {
            isValid = false;
            errors["recorded_at"] = "Champ incorrect";
        }
        if ((props.collect === "" || props.collect === undefined || props.collect === null)) {
            isValid = false;
            errors["collect"] = "Champ incorrect";
        }
        if ((props.subject === "" || props.subject === undefined || props.subject === null)) {
            isValid = false;
            errors["subject"] = "Champ incorrect";
        }
        if ((props.underSubject === "" || props.underSubject === undefined || props.underSubject === null)) {
            isValid = false;
            errors["underSubject"] = "Champ incorrect";
        }
        if (
            (props.content === "" ||
              props.content === undefined ||
              props.content === null) &&
            audio === null &&
            (props.selectedItemAudio === null || (props.selectedItemAudio !== null && props.selectedItemAudio.length == 0))
          ) {
            isValid = false;
            errors["content"] = "Champ incorrect";
          }
        if ((props.product === "" || props.product === undefined || props.product === null)) {
            isValid = false;
            errors["product"] = "Champ incorrect";
        }
        if ((props.unit === "" || props.unit === undefined || props.unit === null)) {
            isValid = false;
            errors["unit"] = "Champ incorrect";
        }
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            const formData = new FormData();

            let claim = {}
            claim["collectionChannelId"] = props.collect;
            claim["servicePointId"] = props.unit;
            claim["productId"] = props.product;
            claim["objetId"] = props.underSubject;
            claim["receiptDateTime"] = props.recorded_at;
            claim["collectorId"] = user.id;
            claim["content"] = props.content;
            claim["code"] = props.code;
            claim["id"] = props.id;
           
            formData.append("denun", JSON.stringify(claim));
            for (let index = 0; index < files.length; index++) {
                formData.append("files", files[index]);
            }

             //console.log("claimenregistrer",formData);
            //HERE
            // console.log("etattttttttttttt",props.etat2)
            if (audio != null) {
                const audioFile = new File([audio], "denonciation_record_" + uuid() + ".ogg", {
                  type: "audio/ogg; codecs=opus",
                });
                formData.append("audios", audioFile);
              }
            props.etat2Changed(true)
            if (mode === 1) {
                addDenunciationApi(formData, props).then(() => {
                    handleCancel(e)
                })
            } else {
                // console.log("dataden",claim)
                addDenunciationApiOffline(claim, props).then(() => {
                    handleCancel(e)
                })
            }
           
        } else {
        }
        props.claimRecordErrors(errors)
    }
    const handleSave = (e) => {
        e.preventDefault()
        const formData = new FormData();
        let claim = {}
        
        claim["collectionChannelId"] = props.collect;
        claim["servicePointId"] = props.unit;
        claim["productId"] = props.product;
        claim["objetId"] = props.underSubject;
        claim["receiptDateTime"] = props.recorded_at;
        claim["collectorId"] = user.id;
        claim["content"] = props.content;
        claim["code"] = props.code;
        claim["id"] = props.id;
       
        formData.append("denun", JSON.stringify(claim));
        for (let index = 0; index < files.length; index++) {
            formData.append("files", files[index]);
        }
         if (audio != null) {
                const audioFile = new File([audio], "denonciation_record_" + uuid() + ".ogg", {
                  type: "audio/ogg; codecs=opus",
                });
                formData.append("audios", audioFile);
              }
        
        // console.log(formData);
        //HERE
        props.etatChanged(true)
        if (mode === 1) {
            addTempDenunciationApi(formData, props).then(() => {
                handleCancel(e)
            })
        } else {
            addTempDenunciationApiOffline(claim, props).then(() => {
                handleCancel(e)
            })
        }
      
        
        
        props.claimRecordErrors(errors)
    }

   
    if (!settingComplete.length) {
        if (isEmpty(props.selectedItem)) {
           
            formButtons = 
            // (actif !== undefined && actif) ?
          
            <>
                <LoadingButton
                    className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                    onClick={handleSave}
                    loading={props.etat}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{ textTransform:"initial" }}
                    >
                    <span>Sauvegarder</span>
                </LoadingButton>

                <LoadingButton
                    onClick={(e) => {
                    e.preventDefault();
                        if (handleValidation()) {
                            handleSubmit(e)
                        }
                        props.claimRecordErrors(errors);
                    }}
                    className="waves-effect waves-effect-b waves-light btn-small"
                    loading={props.etat2}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                >
                    <span>Enregistrer</span>
                </LoadingButton>
            
            </>
               
            // :
            // <div className="card-alert card red lighten-5">
            //     <div className="card-content red-text">
            //         <ul>
            //             Veuillez activer une licence.
            //         </ul>
            //     </div>
            // </div>
        } else {
           
            formButtons = 
            // (actif !== undefined && actif) ?
                <>
                    <button type="button" onClick={(e) => handleCancel(e)}
                            className="waves-effect waves-effect-b waves-light red-text white lighten-4 btn-small mr-1">
                        Annuler
                    </button>
                   
                    <LoadingButton
                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                        onClick={handleSave}
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ textTransform:"initial" }}
                        >
                    <span>Sauvegarder</span>
                    </LoadingButton>

                    <LoadingButton
                        onClick={(e) => {
                        e.preventDefault();
                            if (handleValidation()) {
                                handleSubmit(e)
                            }
                            props.claimRecordErrors(errors);
                        }}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                        >
                        <span>Enregistrer</span>
                    </LoadingButton>
                  
                </>
            // :
            // <div className="card-alert card red lighten-5">
            //     <div className="card-content red-text">
            //         <ul>
            //             Veuillez activer une licence.
            //         </ul>
            //     </div>
            // </div>
        }
    } else {
        let output = settingComplete.map(message => {
            return <li>{message}</li>
        })
        formButtons = (
            <div className="card-alert card red lighten-5">
                <div className="card-content red-text">
                    <ul>
                        {output}
                    </ul>
                </div>
            </div>
        )
    }

    //Handling the List
    let columns = [
        {
            key: "code",
            text: "Code",
            className: "code",
            align: "left",
            sortable: true,
        },
        
        {
            key: "createdAtFormated",
            text: "Sauvegardé le",
            className: "created_at",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let createdAt = new Intl.DateTimeFormat("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour:"numeric",
                    minute:"numeric"
                }).format(new Date(claim.createdAt));
                return (createdAt);
            }
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des dénonciations incomplètes",
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
            }
        }
    }

    const rowClickedHandler = (event, data, rowIndex) => {
        clearComponentState();

        if (mode === 1) {
            props.idChanged(data.id ? data.id : "")
            props.codeChanged(data.code ? data.code : "");
            props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
            props.collectChanged(data.collectionChannel ? data.collectionChannel.id : "");
            props.collectLibelleChanged(data.collectionChannel ? data.collectionChannel.libelle : "");
            props.subjectChanged(data?.objet?.categorie ? data.objet.categorie.id : "");
            props.subjectLibelleChanged(data?.objet?.categorie ? data.objet.categorie.libelle : "");
            props.underSubjectChanged(data?.objet ? data.objet.id : "");
            props.underSubjectLibelleChanged(data?.objet ? data.objet.libelle : "");
            props.productChanged(data.product ? data.product.id : "");
            props.productLibelleChanged(data.product ? data.product.libelle : "");
            props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
            props.unitLibelleChanged(data.servicePoint ? data.servicePoint.libelle : "");
            props.contentChanged(data.content ? data.content : "");
            props.selectedItemChanged(data ? data : "");
            //fetch attachments for selected claim
            
            getFillesApi(data.id, props);
            getDenunAudioApi(data.id, props);
            

        } else {
            if (data.id) {
                // console.log("datarowsig2",data)
                props.idChanged(data.id ? data.id : "")
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.collectChanged(data.collectionChannel ? data.collectionChannel.id : "");
                props.collectLibelleChanged(data.collectionChannel ? data.collectionChannel.libelle : "");
                props.subjectChanged(data?.objet ? data.objet.id : "");
                props.subjectLibelleChanged(data?.objet ? data.objet.libelle : "");
                props.underSubjectChanged(data?.objet?.categorie ? data.objet.categorie.id : "");
                props.underSubjectLibelleChanged(data?.objet?.categorie ? data.objet.categorie.libelle : "");
                props.productChanged(data.product ? data.product.id : "");
                props.productLibelleChanged(data.product ? data.product.libelle : "");
                props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
                props.unitLibelleChanged(data.servicePoint ? data.servicePoint.libelle : "");
                props.contentChanged(data.content ? data.content : "");
                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                getFillesApi(data.id, props);
            } else {
                // console.log("datarowsig",data)
                // props.idChanged(data.id ? data.id : "")
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.contentChanged(data.content ? data.content : "");
                
                let description1 = data.collectionChannelId ? (JSON.parse(loadItemFromSessionStorage('app-supports'))).filter((e) => {return e.id === data.collectionChannelId}) : ""
                let description2 = data.objetId ? (JSON.parse(loadItemFromSessionStorage('app-objets'))).filter((e) => {return e.id === data.objetId}) : ""
                let description3 = data.productId ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => {return e.id === data.productId}) : ""
                let description4 = data.servicePointId ? (JSON.parse(loadItemFromSessionStorage('app-ps'))).filter((e) => {return e.id === data.servicePointId}) : ""
                let description5 = data.objetId? JSON.parse(loadItemFromSessionStorage("app-objets")).filter((e) => {return e.id === data.objetId;}): "";

                props.collectChanged(data.collectionChannelId ? description1[0].id : "");
                props.collectLibelleChanged(data.collectionChannelId ? description1[0].libelle : "");
                props.subjectChanged(data.objetId ? description2[0].categorie.id : "");
                props.subjectLibelleChanged(
                data.objetId ? description2[0].categorie.libelle : ""
                );
                props.underSubjectChanged(data.objetId ? description5[0].id : "");
                props.underSubjectLibelleChanged(
                data.objetId ? description5[0].libelle : ""
                );
                props.productChanged(data.productId ? description3[0].id  : "");
                props.productLibelleChanged(data.productId ? description3[0].libelle : "");
                props.unitChanged(data.servicePointId ? description4[0].id  : "");
                props.unitLibelleChanged(data.servicePointId ? description4[0].libelle : "");
                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                getFillesApi(data.id, props);
                
            }
        }

       

    }
    const fileToDataURL = (file) => {
        let reader = new FileReader()
        return new Promise(function (resolve, reject) {
            reader.onload = function (event) {
                resolve(event.target.result)
            }

            reader.readAsDataURL(file)
            reader.onload = (e) => {
                props.selectedFilesChanged(e.target.result)
            }
            KTApp.unblockPage()
        })
    }

    const handleFile = (e) => {
        // KTApp.blockPage({
        //     overlayColor: '#000000',
        //     type: 'v2',
        //     state: 'danger',
        //     message: 'Téléchargement en cours...'
        // })
        setFiles(e.target.files)
        let filesArray = Array.prototype.slice.call(e.target.files)
        return Promise.all(filesArray.map(fileToDataURL))
    }
    const handleClose2 = () => {
        setOpen2(false);
      };

    let jfichiers;
    if (mode ===1) {
        jfichiers = 
        <>
            <div className="col l12 m12 s12 file-field input-field">
                <div className="btn btn-small file-small brand-blue">
                    <span>Joindre des fichiers</span>
                    <input type="file" multiple
                            onChange={(e) => handleFile(e)}
                            accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                    />
                </div>                                     
                                                            
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text"
                            value={props.selectedFiles}/>
                </div>
                <small className="errorTxt4">
                    <div id="cpassword-error"
                        className="error">{props.errors.selectedFiles}</div>
                </small>
            </div>
           
        </>
    } else {
        jfichiers = ""
    }

    let attachmentList
    // console.log("props.selectedItemFiles", props.selectedItemFiles);
    if (/**/props.selectedItemFiles.length>0) {

        let attachmentListChild = props.selectedItemFiles.map(attachment =>{
            let icon = guessExtension(attachment);
             return (
                 <div className="col xl12 l12 m12 s12" key={attachment.id}>
                     <div
                         className="card box-shadow-none mb-1 app-file-info">
                         <div className="card-content">
                <div className="row" >
                    <div className="col xl1 l1 s1 m1">
                        <div className="app-file-content-logo">
                            <div className="fonticon hide">
                                <i className="material-icons ">more_vert</i>
                            </div>
                            <img className="recent-file"
                                 src={icon}
                                 height="38" width="30"
                                 alt=""/>
                        </div>
                    </div>
                    <div className="col xl11 l11 s11 m11">
                        <div className="app-file-recent-details">
                            <div
                                className="app-file-name font-weight-700 truncate">{attachment.name}
                            </div>
                             <div
                                className="app-file-size">{Math.round(((attachment.size/1024)+ Number.EPSILON) * 100) / 100} Ko
                            </div>
                           <div
                                className="app-file-last-access"><a style={{ cursor: "pointer" }}  onClick={(e) => {
                                    downloadFillesApi(attachment.id, attachment.name)
                                }}>Télécharger</a>
                            </div>
                        </div>
                    </div>
                </div>
                         </div>
                     </div>
                 </div>
            )
        })
        attachmentList = (
            <div className="col s12 app-file-content grey lighten-4">
                <span className="app-file-label">Fichiers joints</span>
                <div className="row app-file-recent-access mb-3">
                    {attachmentListChild}
                </div>
            </div>

        )
    }
    else {

    }
    let audioList;
  if (props.selectedItemAudio != null && props.selectedItemAudio.length > 0) {
    let audioListChild = props.selectedItemAudio.map((attachment) => {
   
      return (
        <div className="col xl12 l12 m12 s12" key={attachment.id}>
         
          <div className="card box-shadow-none mb-1 ">
            <div className="card-content">
              <div className="row">
                <div className="col xl11 l11 s11 m11">
                  <div className="app-file-recent-details">
                    <div className="app-file-name font-weight-700 truncate">
                      {attachment.name}
                    </div>
                    <div className="app-file-size">
                      {Math.round(
                        (attachment.size / 1024 + Number.EPSILON) * 100
                      ) / 100}{" "}
                      Ko
                    </div>
                    <div className="app-file-last-access" id={"audio-"+attachment.id}>
                      <a
                         style={{ cursor: "pointer" }}
                         onClick={(e) => {
                          downloadAudioApi(attachment.id, attachment.name).then(
                            (data) => {
                              // console.log(data);
                              
                              let blobAudio = new Blob([data], { type: "audio/ogg; codecs=opus" });
                              let aud = new Audio(window.URL.createObjectURL(blobAudio));
                              setCurrentAudio(window.URL.createObjectURL(blobAudio))
                              setAudioPlayer("audio-"+attachment.id)
                            }
                          )
                         }}
                      >{showAudioPlayer === "audio-"+attachment.id && ("")} {showAudioPlayer !=="audio-"+attachment.id && ("Afficher")}</a>
                       
                      {showAudioPlayer === "audio-"+attachment.id  && (<audio controls autoPlay onEnded={(e) => {setAudioPlayer("")}}>
                        <source src= {currentAudio} type="audio/ogg"  />
                        Votre navigateur ne prend pas en charge l'élément audio.
                      </audio>) }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
    audioList = (
      <div className="col s12 app-file-content">
        <div className="row app-file-recent-access mb-3">{audioListChild}</div>
      </div>
    );
  }
  
    let content = [];
    content = props.items;
    //darrell : add custome attribut for search 
    content.forEach(element => {
        //date createdAt
        let createdAt = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour:"numeric",
        minute:"numeric"
        }).format(new Date(element.createdAt));
        element.createdAtFormated = createdAt;
    });

    let formAudio;
  if (mode === 1) {
    formAudio = (
      <>
        <div
          style={{
            position: "absolute",
            right: "0px",
            top: "-16px",
          }}
        >
          <Fab
            color="primary"
            aria-label="audio"
            size="small"
            onClick={(e) => {
              e.preventDefault();
              setAudioBox(true);
              setOpen2(true);
            }}
          >
            <Mic />
          </Fab>
        </div> 
      </>
    )
  } else {
    formAudio = ""
  }

//   default sms notification
  

    return (
        //  'Enregistrer dénonciation'
        <div id="main">
            {showAudioBox && (
        <div>
          <Dialog
            open={open2}
            onClose={handleClose2}
            style={{ padding: "16px" }}
          >
            <DialogTitle
              align="center"
              color={"#1E2188"}
              fontSize={"23px"}
              fontWeight={"bold"}
            >
              Enregistreur vocal dénonciations
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                align="center"
                fontSize={"14px"}
                textAlign={"center"}
              >
                Cliquez sur le bouton ci-dessous et parler dans le micro de
                votre téléphone, ou branchez un casque ou des écouteurs
              </DialogContentText>

              <section className="voice-recorder">
                <div className="recorder-container">
                  <RecorderControls
                    recorderState={recorderState}
                    handlers={handlers}
                    closeAction={handleClose2}
                  />
                  {/* <RecordingsList audio={audio} /> */}
                </div>
              </section>
            </DialogContent>
          </Dialog>
        </div>
      )}
           
            <div className="row">
              
                <div className="col s12">
                    <div className="container">
                        <section className="tabs-vertical mt-1 section">
                            <div className="row">
                                <div className="col l5 m12 s12 pb-5">

                                    <div className="card-panel pb-5">
                                        <div className="row">
                                            <div className="col s12"><h5 className="card-title">Dénonciations à
                                                compléter</h5></div>
                                            <div className="col s12">
                                                <ReactDatatable
                                                    className={"responsive-table"}
                                                    config={config}
                                                    records={content}
                                                    columns={columns}
                                                    onRowClicked={rowClickedHandler}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col l7  m12 s12 pb-5">
                                    <div className="card-panel pb-5">
                                        <form id="claimForm">
                                            <div className="row">
                                                <div className="col s12">
                                                    <h5 className="card-title">Enregistrer une dénonciation</h5>
                                                    <span>(<span className="red-text darken-2 ">*</span>) Champs requis</span>
                                                </div>
                                            </div>
                                            <div className="row">
                                                
                                                <div className="col l12 m12 s12">
                                                    <div className="row">
                                                        <div className="col l12 m12 s12"><h6 className="card-title">Détails de la dénonciation</h6></div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <input id="code" name="code" type="text" placeholder=""
                                                                   className="validate"
                                                                   value={props.code}
                                                                   disabled/>
                                                            <label htmlFor="code" className={"active"}>Code<span>(<span
                                                                className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                     className="error">{(props.errors !== undefined) ? props.errors.code : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <DatePicker
                                                                // placeholderText="Date et Heure de réception"
                                                                withPortal
                                                                closeOnScroll={true}
                                                                isClearable
                                                                showTimeInput
                                                                showMonthDropdown
                                                                value={props.recorded_at}
                                                                timeInputLabel="Heure :"
                                                                todayButton="Aujourd'hui"
                                                                selected={props.recorded_at_dp}
                                                                onChange={(date) =>handleDatePicker(date, props)}
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                locale="fr"/>
                                                            <label htmlFor="recorded_at" className={"active"}>Date de
                                                                réception<span>(<span
                                                                    className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                     className="error">{(props.errors !== undefined) ? props.errors.recorded_at : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                value={props.collect ? {"label": props.collectLibelle, "value": props.collect } : "Sélectionner la modalité de dépôt" }
                                                                options={collectOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner la modalité de dépôt"
                                                                onChange={handleChange3}
                                                            />
                                                            <label htmlFor="gender" className={"active"}>Modalité de dépôt<span>(<span
                                                                    className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                     className="error">{(props.errors !== undefined) ? props.errors.collect : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="input-field">
                                                            <input id="recorded_by" name="recorded_by" type="hidden"
                                                                   className="" value=""/>
                                                        </div>
                                                        {/* <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                 value={props.subject ? {"label": props.subjectLibelle, "value": props.subject } : "Sélectionner l'objet" }
                                                                options={subjectOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner l'objet"
                                                                onChange={handleChange2}
                                                            />

                                                            <label htmlFor="subject"
                                                                   className={"active"}>Objet<span>(<span
                                                                className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                     className="error">{(props.errors !== undefined) ? props.errors.subject : ""}</div>
                                                            </small>
                                                        </div> */}

                                                        <div className="col l6 m12 s12 input-field">
                                                        <Select
                                                            value={
                                                            props.subject
                                                                ? {
                                                                    label: props.subjectLibelle,
                                                                    value: props.subject,
                                                                }
                                                                : "Sélectionner la catégorie de l'objet"
                                                            }
                                                            options={subjectOptions}
                                                            className="react-select-container mt-4"
                                                            classNamePrefix="react-select"
                                                            style={styles}
                                                            placeholder="Sélectionner la catégorie de l'objet"
                                                            onChange={handleChange2}
                                                        />

                                                        <label htmlFor="subject" className={"active"}>
                                                            Catégorie d'objet
                                                            <span>
                                                            (<span className="red-text darken-2 ">*</span>
                                                            )
                                                            </span>
                                                        </label>
                                                        <small className="errorTxt4">
                                                            <div id="cpassword-error" className="error">
                                                            {props.errors !== undefined
                                                                ? props.errors.subject
                                                                : ""}
                                                            </div>
                                                        </small>
                                                        </div>

                                                        <div className="col l12 m12 s12 input-field">
                                                        <Select
                                                            value={
                                                            props.underSubject
                                                                ? {
                                                                    label: props.underSubjectLibelle,
                                                                    value: props.underSubject,
                                                                }
                                                                : "Sélectionner le motif de dénonciation"
                                                            }
                                                            options={underSubjectOptions}
                                                            className="react-select-container mt-4"
                                                            classNamePrefix="react-select"
                                                            style={styles}
                                                            placeholder="Sélectionner le motif de dénonciation"
                                                            onChange={handleChange5}
                                                        />

                                                        <label htmlFor="subject" className={"active"}>
                                                            Motif de dénonciation
                                                            <span>
                                                            (<span className="red-text darken-2 ">*</span>
                                                            )
                                                            </span>
                                                        </label>
                                                        <small className="errorTxt4">
                                                            <div id="cpassword-error" className="error">
                                                            {props.errors !== undefined
                                                                ? props.errors.underSubject
                                                                : ""}
                                                            </div>
                                                        </small>
                                                        </div>

                                                        <div className="col l6 m12 s12 input-field">

                                                            <Select
                                                                 value={props.product ? {"label": props.productLibelle, "value": props.product } : "Sélectionner le produit" }
                                                                options={productOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner le produit"
                                                                onChange={handleChange1}
                                                            />
                                                            <label htmlFor="product" className={"active"}>Produit ou
                                                                service concerné<span>(<span
                                                                    className="red-text darken-2 ">*</span>)</span></label>
                                                                <small className="errorTxt4">
                                                                    <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.product : ""}</div>
                                                                </small>

                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                value={props.unit ? {"label": props.unitLibelle, "value": props.unit } : "Sélectionner le point de service" }
                                                                options={unitOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner le point de service"
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor="unit" className={"active"}>Unité opérationnelle ou Point de service
                                                                indexé(<span
                                                                    className="red-text darken-2 ">*</span>)</label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.unit : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l12 m12 s12 input-field">
                                                        {formAudio}
                                                            <textarea id="content" name="content" placeholder="" rows={"2"}
                                                                className="materialize-textarea"
                                                                value={props.content}
                                                                onChange={(e) => props.contentChanged(e.target.value)}>

                                                            </textarea>
                                                            <label htmlFor="content" className={"active"}>Contenu<span>(<span
                                                                className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                     className="error">{(props.errors !== undefined) ? props.errors.content : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l12 m12 s12 mb-3">
                               <RecordingsList audio={audio} /> 
                              
                            </div>
                            <div className="row">{audioList}</div>
                                                        {jfichiers}
                                                        <div className="row">
                                                            {attachmentList}
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="col s12 display-flex justify-content-end mt-3">
                                                    {formButtons}
                                                </div>
                                            </div>
                                        </form>

                                    </div>
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


const mapStateToProps = (state) => {
    return {
        isLoading: state.claim_record.isLoading,
        id: state.claim_record.id,
        code: state.claim_record.code,
        recorded_at: state.claim_record.recorded_at,
        recorded_at_dp: state.claim_record.recorded_at_dp,
        subject: state.claim_record.subject,
        subjectLibelle: state.claim_record.subjectLibelle,
        underSubject: state.claim_record.underSubject,
        underSubjectLibelle: state.claim_record.underSubjectLibelle,
        collect: state.claim_record.collect,
        collectLibelle: state.claim_record.collectLibelle,
        product: state.claim_record.product,
        productLibelle: state.claim_record.productLibelle,
        unit: state.claim_record.unit,
        unitLibelle: state.claim_record.unitLibelle,
        content: state.claim_record.content,
        errors: state.claim_record.claim_record_errors,
        items: state.claim_record.items,
        selectedFiles: state.claim_record.selectedFiles,
        selectedItem: state.claim_record.selectedItem,
        selectedItemFiles: state.claim_record.selectedItemFiles,
        selectedItemAudio: state.claim_record.selectedItemAudio,
        etat: state.claim_record.etat,
        etat2: state.claim_record.etat2,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        loading: (err) => {
            dispatch(loading(err))
        },
        claimRecordErrors: (err) => {
            dispatch(claimRecordErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        codeChanged: (code) => {
            dispatch(codeChanged(code))
        },
        recordedAtChanged: (recordedAt) => {
            dispatch(recordedAtChanged(recordedAt))
        },
        recordedAtDPChanged: (recordedAt) => {
            dispatch(recordedAtDPChanged(recordedAt))
        },
        collectChanged: (collect) => {
            dispatch(collectChanged(collect))
        },
        collectLibelleChanged: (collectLibelle) => {
            dispatch(collectLibelleChanged(collectLibelle))
        },
        subjectChanged: (subject) => {
            dispatch(subjectChanged(subject))
        },
        subjectLibelleChanged: (subjectLibelle) => {
            dispatch(subjectLibelleChanged(subjectLibelle))
        },
        underSubjectChanged: (underSubject) => {
            dispatch(underSubjectChanged(underSubject));
        },
        underSubjectLibelleChanged: (underSubjectLibelle) => {
            dispatch(underSubjectLibelleChanged(underSubjectLibelle));
        },
        productChanged: (product) => {
            dispatch(productChanged(product))
        },
        productLibelleChanged: (productLibelle) => {
            dispatch(productLibelleChanged(productLibelle))
        },
        unitLibelleChanged: (unitLibelle) => {
            dispatch(unitLibelleChanged(unitLibelle))
        },
        unitChanged: (unit) => {
            dispatch(unitChanged(unit))
        },
        contentChanged: (content) => {
            dispatch(contentChanged(content))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
        selectedFilesChanged: (selectedFiles) => {
            dispatch(selectedFilesChanged(selectedFiles))
        },
        selectedFilesReset: (selectedFiles) => {
            dispatch(selectedFilesReset(selectedFiles))
        },
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem))
        },
        selectedItemFilesChanged: (selectedItemFiles) => {
            dispatch(selectedItemFilesChanged(selectedItemFiles))
        },
        selectedItemAudioChanged: (selectedItemAudio) => {
            dispatch(selectedItemAudioChanged(selectedItemAudio));
          },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        etat2Changed: (etat2) => {
            dispatch(etat2Changed(etat2))
        },
       
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EnregistrerDenonciation);
