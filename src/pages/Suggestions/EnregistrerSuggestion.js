import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
import "react-datepicker/dist/react-datepicker.css";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuid } from "uuid";

import { cleanPhoneNumber, cleanPhoneNumber2, groupBy, guessExtension, handleDatePicker, isEmpty, isSettingComplete, isValidDate, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import http from "../../apis/http-common";
import { KTApp } from "../../Utils/blockui";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { notify } from "../../Utils/alert";
import axios from "axios";
import { addressChanged, codeChanged, collectChanged, collectLibelleChanged, contentChanged, createdAtChanged, createdByChanged, dossierimfChanged, etat2Changed, etatChanged, firstnameChanged, genderChanged, handledAtChanged, handledByChanged, idChanged, itemsChanged, languageChanged, languageLibelleChanged, lastnameChanged, loading, phoneChanged, productChanged, productLibelleChanged, recordedAtChanged, recordedAtDPChanged, resolvedAtChanged, resolvedByChanged, selectedFilesChanged, selectedFilesReset, selectedItemChanged, selectedItemFilesChanged, showSelectPrintItemChanged, solutionChanged, statusChanged, suggestionRecordErrors, unitChanged, unitLibelleChanged, selectedItemAudioChanged } from "../../redux/actions/Suggestions/EnregistrementSuggestionActions";
import { addSuggestionApi, addSuggestionApiOffline, addTempSuggestionApi, addTempSuggestionApiOffline, downloadFillesApi, getFillesApi, getSuggeAudioApi, listeByStatut, listeByStatutOffline, } from "../../apis/Suggestions/SuggestionsApi";
import PhoneInput from "react-phone-number-input";
import { licenseInfo } from "../../apis/LoginApi";
import { INSTITUTION_PAYS_CODE } from "../../Utils/globals";
import useRecorder from "../../hooks/useRecorder";
import RecorderControls from "../../components/recorder-controls";
import { Mic } from "@mui/icons-material";
import { downloadAudioApi, getClaimAudioApi } from "../../apis/Reclamations/ReclamationsApi";
import RecordingsList from "../../components/recordings-list";

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
    menu: provided => ({ ...provided, zIndex: 9999 })
};
const EnregistrerSuggestion = (props) => {
    const [open, setOpen] = React.useState(false)
    const [files, setFiles] = React.useState([]);
    const [open2, setOpen2] = React.useState(false);
    const [showAudioBox, setAudioBox] = useState(false);
    const { recorderState, ...handlers } = useRecorder();
    let { audio } = recorderState;

    let settingComplete = isSettingComplete()
    let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (mode === 1) {
            props.itemsChanged([])
            listeByStatut(props, "TEMP_SAVED").then((r) => { });
        } else {
            props.itemsChanged([])
            listeByStatutOffline(props, "TEMP_SAVED").then((r) => { });
        }

        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({ marginTop: "1%", boxShadow: "none" })
        window.$('ul.pagination').parent().css({ boxShadow: "none" })
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')
        window.$('.tooltipped').tooltip();
        // window.intlTelInput(clientPhone, {
        //     initialCountry: 'gb',
        //     utilsScript: "src/assets/js/phoneUtils.js?1638200991544"
        // });
        // initDatePicker(props, 'recorded_at')
    }, []);

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


    const handleChange = (e) => {
        props.unitChanged(e.value)
        props.unitLibelleChanged(e.label)
    }
    const handleChange1 = (e) => {
        props.productChanged(e.value)
        props.productLibelleChanged(e.label)
    }
    const handleChange3 = (e) => {
        props.collectChanged(e.value)
        props.collectLibelleChanged(e.label)
    }
    const handleChange4 = (e) => {
        props.languageChanged(e.value)
        props.languageLibelleChanged(e.label)
    }

    //Handling the form
    let languages
    let collects
    let products
    let units
    try {
        languages = JSON.parse(loadItemFromLocalStorage('app-langues'));
        collects = JSON.parse(loadItemFromLocalStorage('app-supports'));
        products = JSON.parse(loadItemFromLocalStorage('app-produits'));
        units = JSON.parse(loadItemFromLocalStorage('app-ps'));
    } catch (e) {
        languages = []
        collects = []
        products = []
        units = []
    }

    let formButtons;
    let genderOptions
    let languageOptions
    let collectOptions
    let productOptions

    // //variable to show box of sms
    const [showSmsBox, setShowSmsBox] = useState(false);
    const smsDefault = "Votre suggestion a bien été pris en compte. Merci de contribuer à l'amélioration de nos services.";
    const [smsToSend, setSmsToSend] = useState(smsDefault)

    genderOptions = [
        { value: 'HOMME', label: 'Homme' },
        { value: 'FEMME', label: 'Femme' },
    ]
    if (languages !== undefined) {
        languageOptions = languages.map(language => {
            return { "label": language.libelle, "value": language.id }
        })
    } else {
        languageOptions = []
    }
    if (collects !== undefined) {
        collectOptions = collects.map(collect => {
            return { "label": collect.libelle, "value": collect.id }
        })
    } else {
        collectOptions = []
    }
    if (products !== undefined) {
        productOptions = products.map(product => {
            return { "label": product.libelle, "value": product.id }
        })
    } else {
        productOptions = []
    }

    let unitOptions
    let agencyOptions
    let directionOptions
    let guichetOptions
    units = units.filter((un) => !un.deleted)
    let unitsGroupByType = (units !== undefined) ? groupBy(units, "type") : undefined;
    //
    if (unitsGroupByType !== undefined && unitsGroupByType["AGENCE"] !== undefined) {
        agencyOptions = unitsGroupByType["AGENCE"].map(agency => {
            return { "label": agency.libelle, "value": agency.id }
        })
    } else {
        agencyOptions = ""
    }

    if (unitsGroupByType !== undefined && unitsGroupByType["DIRECTION"] !== undefined) {
        directionOptions = unitsGroupByType["DIRECTION"].map(direction => {
            return { "label": direction.libelle, "value": direction.id }
        })
    } else {
        directionOptions = ""
    }
    if (unitsGroupByType !== undefined && unitsGroupByType["GUICHET"] !== undefined) {
        guichetOptions = unitsGroupByType["GUICHET"].map(guichet => {
            return { "label": guichet.libelle, "value": guichet.id }
        })
    } else {
        guichetOptions = ""
    }

    unitOptions = []
    if (directionOptions !== "") { unitOptions.push({ "label": "Direction", "options": directionOptions }) }
    if (agencyOptions !== "") { unitOptions.push({ "label": "Agence", "options": agencyOptions }) }
    if (guichetOptions !== "") { unitOptions.push({ "label": "Guichet", "options": guichetOptions }) }

    let jfichiers;
    if (mode === 1) {
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
                            value={props.selectedFiles} />
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

    const [showAudioPlayer, setAudioPlayer] = useState("");
    const [currentAudio, setCurrentAudio] = useState("");


    let errors = {};
    const clearComponentState = () => {
        props.idChanged("")
        props.lastnameChanged("")
        props.addressChanged("")
        props.phoneChanged("")
        props.genderChanged("")
        props.languageChanged("")
        props.languageLibelleChanged("")
        props.dossierimfChanged("")
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
        props.suggestionsRecordErrors("")
        props.selectedFilesReset([])
        props.selectedItemChanged({})
        props.selectedItemFilesChanged([])
        props.selectedItemAudioChanged([]);
        audio = [];
    }

    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()

    }


    const handleClose2 = () => {
        setOpen2(false);
    };

    const handleValidation = () => {
        let isValid = true;

        // if ((props.lastname === "" || props.lastname === undefined || props.lastname === null)) {
        //     isValid = false;
        //     errors["lastname"] = "Champ incorrect";
        // }

        // if ((props.address === "" || props.address === undefined || props.address === null)) {
        //     isValid = false;
        //     errors["address"] = "Champ incorrect";
        // }
        // if ((props.phone === "" || props.phone === undefined || props.phone === null || !isValidPhone(props.phone))) {
        //     isValid = false;
        //     errors["phone"] = "Champ incorrect";
        // }
        // if ((props.gender === "" || props.gender === undefined || props.gender === null)) {
        //     isValid = false;
        //     errors["gender"] = "Champ incorrect";
        // }
        if ((props.language === "" || props.language === undefined || props.language === null)) {
            isValid = false;
            errors["language"] = "Champ incorrect";
        }
        if ((props.recorded_at === "" || props.recorded_at === undefined || props.recorded_at === null || !isValidDate(props.recorded_at))) {
            isValid = false;
            errors["recorded_at"] = "Champ incorrect";
        }
        if ((props.collect === "" || props.collect === undefined || props.collect === null)) {
            isValid = false;
            errors["collect"] = "Champ incorrect";
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
        // if ((props.product === "" || props.product === undefined || props.product === null)) {
        //     isValid = false;
        //     errors["product"] = "Champ incorrect";
        // }
        // if ((props.unit === "" || props.unit === undefined || props.unit === null)) {
        //     isValid = false;
        //     errors["unit"] = "Champ incorrect";
        // }
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setShowSmsBox(false);
        setOpen(false);
        if (handleValidation()) {
            const formData = new FormData();

            let claim = {}
            claim["clientFirstAndLastName"] = props.lastname
            claim["gender"] = props.gender;
            claim["address"] = props.address;
            claim["phone"] = cleanPhoneNumber(props.phone);
            claim["collectionChannelId"] = props.collect;
            claim["servicePointId"] = props.unit;
            claim["productId"] = props.product;
            claim["languageId"] = props.language;
            claim["folderCode"] = props.dossierimf;
            claim["receiptDateTime"] = props.recorded_at;
            claim["collectorId"] = user.id;
            claim["content"] = props.content;
            claim["code"] = props.code;
            // claim["files"] = props.selectedFiles;
            // claim["files"] = files;

            formData.append("suggestion", JSON.stringify(claim));
            for (let index = 0; index < files.length; index++) {
                formData.append("files", files[index]);
            }

            if (audio != null) {
                const audioFile = new File([audio], "sugggestion_record_" + uuid() + ".ogg", {
                    type: "audio/ogg; codecs=opus",
                });
                formData.append("audios", audioFile);
            }

            // console.log("claimenregistrer",formData);
            //HERE
            // console.log("etattttttttttttt",props.etat2)
            props.etat2Changed(true)
            if (mode === 1) {
                addSuggestionApi(formData, props).then(() => {
                    handleCancel(e)
                })

            } else {
                addSuggestionApiOffline(claim, props).then(() => {
                    handleCancel(e)
                })
            }

        } else {
        }
        props.suggestionsRecordErrors(errors)
    }
    const handleSave = (e) => {
        e.preventDefault()
        const formData = new FormData();
        let claim = {}
        claim["clientFirstAndLastName"] = props.lastname
        claim["gender"] = props.gender;
        claim["address"] = props.address;
        claim["phone"] = cleanPhoneNumber(props.phone);
        claim["collectionChannelId"] = props.collect;
        claim["servicePointId"] = props.unit;
        claim["productId"] = props.product;
        claim["languageId"] = props.language;
        claim["folderCode"] = props.dossierimf;
        claim["receiptDateTime"] = props.recorded_at;
        claim["collectorId"] = user.id;
        claim["content"] = props.content;
        claim["code"] = props.code;
        claim["id"] = props.id;

        formData.append("suggestion", JSON.stringify(claim));
        for (let index = 0; index < files.length; index++) {
            formData.append("files", files[index]);
        }
        if (audio != null) {
            const audioFile = new File([audio], "sugggestion_record_" + uuid() + ".ogg", {
                type: "audio/ogg; codecs=opus",
            });
            formData.append("audios", audioFile);
        }


        // console.log(formData);
        //HERE
        props.etatChanged(true)
        if (mode === 1) {
            addTempSuggestionApi(formData, props).then(() => {
                handleCancel(e)
            })

        } else {
            addTempSuggestionApiOffline(claim, props).then(() => {
                handleCancel(e)
            })
        }



        props.suggestionsRecordErrors(errors)
    }


    if (!settingComplete.length) {
        if (isEmpty(props.selectedItem)) {

            formButtons =

                (actif !== undefined && actif) ?
                    <>
                        <LoadingButton
                            className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                            onClick={handleSave}
                            loading={props.etat}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{ textTransform: "initial" }}
                        >
                            <span>Sauvegarder</span>
                        </LoadingButton>

                        <LoadingButton
                            onClick={(e) => {
                                e.preventDefault();
                                if (handleValidation()) {
                                    if (mode === 1) {
                                        setShowSmsBox(true);
                                        setOpen(true);
                                    } else {
                                        handleSubmit(e)
                                    }

                                }

                                props.suggestionsRecordErrors(errors);
                            }}
                            className="waves-effect waves-effect-b waves-light btn-small"
                            loading={props.etat2}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                        >
                            <span>Enregistrer</span>
                        </LoadingButton>

                    </>
                    :
                    <div className="card-alert card red lighten-5">
                        <div className="card-content red-text">
                            <ul>
                                Veuillez activer une licence.
                            </ul>
                        </div>
                    </div>

        } else {
            formButtons =
                (actif !== undefined && actif) ?
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
                            sx={{ textTransform: "initial" }}
                        >
                            <span>Sauvegarder</span>
                        </LoadingButton>

                        <LoadingButton
                            onClick={(e) => {
                                e.preventDefault();
                                if (handleValidation()) {
                                    setShowSmsBox(true);
                                    setOpen(true)
                                }
                                props.suggestionsRecordErrors(errors);
                            }}
                            className="waves-effect waves-effect-b waves-light btn-small"
                            loading={props.etat2}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                        >
                            <span>Enregistrer</span>
                        </LoadingButton>

                    </>
                    :
                    <div className="card-alert card red lighten-5">
                        <div className="card-content red-text">
                            <ul>
                                Veuillez activer une licence.
                            </ul>
                        </div>
                    </div>

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
            key: "clientFirstAndLastName",
            text: "Client",
            className: "client",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let nom = claim.clientFirstAndLastName !== "" ? claim.clientFirstAndLastName : <i>Anonyme</i>;
                return nom;
            },
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
                    hour: "numeric",
                    minute: "numeric"
                }).format(new Date(claim.createdAt));
                return (createdAt);
            }
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des suggestions incomplètes",
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }

    const rowClickedHandler = (event, data, rowIndex) => {
        clearComponentState();

        if (mode === 1) {
            props.idChanged(data.id ? data.id : "")
            props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
            props.addressChanged(data.address ? data.address : "");
            props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
            props.genderChanged(data.gender ? data.gender : "");
            props.languageChanged(data.langue ? data.langue.id : "");
            props.languageLibelleChanged(data.langue ? data.langue.libelle : "");
            props.dossierimfChanged(data.folderCode ? data.folderCode : "");
            props.codeChanged(data.code ? data.code : "");
            props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
            props.collectChanged(data.canal ? data.canal.id : "");
            props.collectLibelleChanged(data.canal ? data.canal.libelle : "");
            props.productChanged(data.produit ? data.produit.id : "");
            props.productLibelleChanged(data.produit ? data.produit.libelle : "");
            props.unitChanged(data.serviceIndexe ? data.serviceIndexe.id : "");
            props.unitLibelleChanged(data.serviceIndexe ? data.serviceIndexe.libelle : "");
            props.contentChanged(data.content ? data.content : "");
            props.selectedItemChanged(data ? data : "");
            //fetch attachments for selected claim
            getFillesApi(data.id, props);
            getSuggeAudioApi(data.id, props)
        } else {
            if (data.id) {
                props.idChanged(data.id ? data.id : "")
                props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
                props.addressChanged(data.address ? data.address : "");
                props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
                props.genderChanged(data.gender ? data.gender : "");
                props.languageChanged(data.langue ? data.langue.id : "");
                props.languageLibelleChanged(data.langue ? data.langue.libelle : "");
                props.dossierimfChanged(data.folderCode ? data.folderCode : "");
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.collectChanged(data.canal ? data.canal.id : "");
                props.collectLibelleChanged(data.canal ? data.canal.libelle : "");
                props.productChanged(data.produit ? data.produit.id : "");
                props.productLibelleChanged(data.produit ? data.produit.libelle : "");
                props.unitChanged(data.serviceIndexe ? data.serviceIndexe.id : "");
                props.unitLibelleChanged(data.serviceIndexe ? data.serviceIndexe.libelle : "");
                props.contentChanged(data.content ? data.content : "");
                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                getFillesApi(data.id, props);
                getSuggeAudioApi(data.id, props)

            } else {
                props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
                props.addressChanged(data.address ? data.address : "");
                props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
                props.genderChanged(data.gender ? data.gender : "");
                props.dossierimfChanged(data.folderCode ? data.folderCode : "");
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.contentChanged(data.content ? data.content : "");

                let description = data.languageId ? (JSON.parse(loadItemFromSessionStorage('app-langues'))).filter((e) => { return e.id === data.languageId }) : ""
                let description1 = data.collectionChannelId ? (JSON.parse(loadItemFromSessionStorage('app-supports'))).filter((e) => { return e.id === data.collectionChannelId }) : ""
                let description3 = data.productId ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => { return e.id === data.productId }) : ""
                let description4 = data.servicePointId ? (JSON.parse(loadItemFromSessionStorage('app-ps'))).filter((e) => { return e.id === data.servicePointId }) : ""

                props.languageChanged(data.languageId ? description[0].id : "");
                props.languageLibelleChanged(data.languageId ? description[0].libelle : "");
                props.collectChanged(data.collectionChannelId ? description1[0].id : "");
                props.collectLibelleChanged(data.collectionChannelId ? description1[0].libelle : "");
                props.productChanged(data.productId ? description3[0].id : "");
                props.productLibelleChanged(data.productId ? description3[0].libelle : "");
                props.unitChanged(data.servicePointId ? description4[0].id : "");
                props.unitLibelleChanged(data.servicePointId ? description4[0].libelle : "");

                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                // getFillesApi(data.id, props);
                getSuggeAudioApi(data.id, props)

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

    let attachmentList
    // console.log("props.selectedItemFiles", props.selectedItemFiles);
    if (/**/props.selectedItemFiles.length > 0) {

        let attachmentListChild = props.selectedItemFiles.map(attachment => {
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
                                            alt="" />
                                    </div>
                                </div>
                                <div className="col xl11 l11 s11 m11">
                                    <div className="app-file-recent-details">
                                        <div
                                            className="app-file-name font-weight-700 truncate">{attachment.name}
                                        </div>
                                        <div
                                            className="app-file-size">{Math.round(((attachment.size / 1024) + Number.EPSILON) * 100) / 100} Ko
                                        </div>
                                        <div
                                            className="app-file-last-access"><a style={{ cursor: "pointer" }} onClick={(e) => {
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
                                        <div className="app-file-last-access" id={"audio-" + attachment.id}>
                                            <a
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    downloadAudioApi(attachment.id, attachment.name).then(
                                                        (data) => {
                                                            // console.log(data);

                                                            let blobAudio = new Blob([data], { type: "audio/ogg; codecs=opus" });
                                                            let aud = new Audio(window.URL.createObjectURL(blobAudio));
                                                            setCurrentAudio(window.URL.createObjectURL(blobAudio))
                                                            setAudioPlayer("audio-" + attachment.id)
                                                        }
                                                    )
                                                }}
                                            >{showAudioPlayer === "audio-" + attachment.id && ("")} {showAudioPlayer !== "audio-" + attachment.id && ("Afficher")}</a>

                                            {showAudioPlayer === "audio-" + attachment.id && (<audio controls autoPlay onEnded={(e) => { setAudioPlayer("") }}>
                                                <source src={currentAudio} type="audio/ogg" />
                                                Votre navigateur ne prend pas en charge l'élément audio.
                                            </audio>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
        console.log('props.selectedItemAudio', props.selectedItemAudio)
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
            hour: "numeric",
            minute: "numeric"
        }).format(new Date(element.createdAt));
        element.createdAtFormated = createdAt;
    });

    //   default sms notification

    const sendSms = async (e) => {
        e.preventDefault()
        let token = "SZhs_fSrSqDn8eITgs77ym17ttv1G8ig";
        let sender = "GPR"
        let receiver = cleanPhoneNumber(props.phone);
        let dlr_url = "";
        let message = encodeURI(smsToSend);
        let url = "http://www.wassasms.com/wassasms/api/web/v3/sends?access-token=" + token + "&sender=" + sender + "&receiver=" + receiver + "&text=" + message + "&dlr_url=" + dlr_url;
        // let url = values.url +"?"+ values.libelle_id+"="+values.value_id+"&"+values.libelle_pwd+"="+values.value_pwd+"&"+values.libelle_sender+"="+values.value_sender+"&"+values.libelle_receiver+"="+props.phone+"&" +values.libelle_message+"="+smsToSend;
        const config = {
            method: 'GET',
            url: url,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },

        };
        await axios(config)
            .then(function (response) {
                // console.log("smsurl",url)
                // console.log("sms",response);
                handleSubmit(e);
                notify("SMS envoyé", "success")
            })
            .catch(function (error) {
                handleSubmit(e);
                // console.log("smscatch",error);
                notify("Erreur - Sms non envoyé, mais suggestion enregistrée", "warning")
                return error;
            });


    };

    return (
        //  'Enregistrer suggestion'
        <div id="main">
            {showSmsBox && (
                <div>

                    <Dialog open={open} onClose={handleClose}>

                        <DialogContent>
                            <DialogContentText>
                                Envoyez un sms de notification au client
                            </DialogContentText>

                            <div className="row">
                                <div className="col l12 s12 pb-5">
                                    <div className="row">
                                        <div className="col l12 s12 l12">
                                            <span>
                                                Envoie à: <b> {props.lastname}</b>
                                            </span>
                                            <br />
                                            <span>
                                                au : {cleanPhoneNumber(props.phone)}
                                            </span>
                                        </div>
                                    </div>
                                    <br />
                                    <label htmlFor="comment3"> Message:</label>
                                    <textarea
                                        id="comment3"
                                        name="comment1"
                                        style={{ height: "20px !important" }}
                                        placeholder=""
                                        value={smsToSend}
                                        className="materialize-textarea"
                                        onChange={(e) => {
                                            setSmsToSend(e.target.value);
                                        }}
                                    ></textarea>
                                    <br />
                                </div>
                            </div>

                            <div className="row">
                                {/* <div className="col s12 justify-content-end mt-3"> */}
                                <>
                                    <div className="col l6 m12 s12 mt-4">
                                        <form onSubmit={handleSubmit}>
                                            <button type="submit" className="btn waves-effect waves-light mr-1 btn-small red-text red lighten-4 ml-1 mr-3" style={{ width: "100%" }}>
                                                Enregistrer Uniquement
                                            </button>
                                        </form>
                                    </div>

                                    <div className="col l6 m12 s12 mt-4">
                                        <a
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowSmsBox(false);
                                                sendSms(e);

                                            }}
                                            className="waves-effect waves-effect-b waves-light btn-small"
                                            style={{ width: "100%" }}
                                        >
                                            Enregistrer et Notifier
                                        </a>
                                    </div>

                                </>

                                {/* </div> */}
                            </div>

                        </DialogContent>

                    </Dialog>
                </div>


            )}
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
                            Enregistreur vocal suggestion
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
                                <div className="col l5  m12 s12 pb-5">

                                    <div className="card-panel pb-5">
                                        <div className="row">
                                            <div className="col s12"><h5 className="card-title">Suggestions à
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
                                                    <h5 className="card-title">Enregistrer une suggestion</h5>
                                                    <span>(<span className="red-text darken-2 ">*</span>) Champs requis</span>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col l12 s12 m12">
                                                    <div className="row">
                                                        <div className="col l12 m12 s12"><h6 className="card-title">Informations du Client</h6></div>
                                                        <input type="hidden"
                                                            value={JSON.stringify(props.selectedItem)} />
                                                        <div className="col l12 m12 s12 input-field">
                                                            <input id="lastname" name="lastname" type="text"
                                                                className="validate"
                                                                placeholder=""
                                                                value={props.lastname}
                                                                data-error=".errorTxt2"
                                                                onChange={(e) => props.lastnameChanged(e.target.value)} />
                                                            <label htmlFor="lastname"
                                                                className={"active"}>Nom et Prénoms<span></span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.lastname : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <input id="address" name="address" type="text"
                                                                className="validate"
                                                                placeholder=""
                                                                value={props.address}
                                                                data-error=".errorTxt2"
                                                                onChange={(e) => props.addressChanged(e.target.value)} />
                                                            <label htmlFor="address" className={"active"}>Adresse
                                                                Physique<span></span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.address : ""}</div>
                                                            </small>
                                                        </div>

                                                        <div className="col l6 m12 s12 input-field">
                                                            <PhoneInput
                                                                international
                                                                countryCallingCodeEditable={false}
                                                                defaultCountry={INSTITUTION_PAYS_CODE}
                                                                value={props.phone}
                                                                onChange={(e) =>
                                                                    props.phoneChanged(e)
                                                                }
                                                            />
                                                            {/* <input type="tel" placeholder="" value={props.phone} onChange={(e) => props.phoneChanged(e.target.value)} /> */}

                                                            <label htmlFor="phone" className={"active"}>Téléphone<span></span>&nbsp;
                                                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: 22890909090 ou +22890909090">
                                                                    <HelpIcon />
                                                                </a></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.phone : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div style={{ clear: "both" }}></div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                value={(props.gender) ? {
                                                                    label: props.gender,
                                                                    value: props.gender
                                                                } : { label: "Sélectionner le genre", value: "" }}
                                                                options={genderOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner le genre"
                                                                onChange={(e) => props.genderChanged(e.value)}
                                                            />
                                                            <label htmlFor="gender"
                                                                className={"active"}>Genre<span></span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.gender : ""}</div>
                                                            </small>
                                                        </div>

                                                        <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                value={props.language ? { "label": props.languageLibelle, "value": props.language } : "Sélectionner la langue"}
                                                                options={languageOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner la langue"
                                                                onChange={handleChange4}
                                                            />
                                                            <label htmlFor="gender" className={"active"}>Langue
                                                                parlée<span>(<span
                                                                    className="red-text darken-2 ">*</span>)</span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.language : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <input id="dossierimf" name="dossierimf" type="text"
                                                                className="validate"
                                                                placeholder=""
                                                                value={props.dossierimf}
                                                                data-error=".errorTxt2"
                                                                onChange={(e) => props.dossierimfChanged(e.target.value)} />
                                                            <label htmlFor="dossierimf"
                                                                className={"active"}>Dossier IMF<span><span
                                                                    className="red-text darken-2 "></span></span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.dossierimf : ""}</div>
                                                            </small>
                                                        </div>

                                                    </div>
                                                </div>
                                                <br />
                                                <div className="col s12 m12">
                                                    <div className="row">
                                                        <div className="col l12 m12 s12"><h6 className="card-title">Détails de la suggestion</h6></div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <input id="code" name="code" type="text" placeholder=""
                                                                className="validate"
                                                                value={props.code}
                                                                disabled />
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
                                                                onChange={(date) => handleDatePicker(date, props)}
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                locale="fr" />
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
                                                                value={props.collect ? { "label": props.collectLibelle, "value": props.collect } : "Sélectionner la modalité de dépôt"}
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
                                                                className="" value="" />
                                                        </div>

                                                        <div className="col l6 m12 s12 input-field">

                                                            <Select
                                                                value={props.product ? { "label": props.productLibelle, "value": props.product } : "Sélectionner le produit"}
                                                                options={productOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner le produit"
                                                                onChange={handleChange1}
                                                            />
                                                            <label htmlFor="product" className={"active"}>Produit ou
                                                                service concerné<span></span></label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.product : ""}</div>
                                                            </small>

                                                        </div>
                                                        <div className="col l6 m12 s12 input-field">
                                                            <Select
                                                                value={props.unit ? { "label": props.unitLibelle, "value": props.unit } : "Sélectionner le point de service"}
                                                                options={unitOptions}
                                                                className='react-select-container mt-4'
                                                                classNamePrefix="react-select"
                                                                style={styles}
                                                                placeholder="Sélectionner le point de service"
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor="unit" className={"active"}>Unité opérationnelle ou Point de service
                                                                indexé</label>
                                                            <small className="errorTxt4">
                                                                <div id="cpassword-error"
                                                                    className="error">{(props.errors !== undefined) ? props.errors.unit : ""}</div>
                                                            </small>
                                                        </div>
                                                        <div className="col l12 m12 s12 input-field">
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
                                                            {formAudio}
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
        isLoading: state.suggestion_record.isLoading,
        id: state.suggestion_record.id,
        firstname: state.suggestion_record.firstname,
        lastname: state.suggestion_record.lastname,
        address: state.suggestion_record.address,
        phone: state.suggestion_record.phone,
        gender: state.suggestion_record.gender,
        language: state.suggestion_record.language,
        languageLibelle: state.suggestion_record.languageLibelle,
        dossierimf: state.suggestion_record.dossierimf,
        code: state.suggestion_record.code,
        recorded_at: state.suggestion_record.recorded_at,
        recorded_at_dp: state.suggestion_record.recorded_at_dp,
        collect: state.suggestion_record.collect,
        collectLibelle: state.suggestion_record.collectLibelle,
        product: state.suggestion_record.product,
        productLibelle: state.suggestion_record.productLibelle,
        unit: state.suggestion_record.unit,
        unitLibelle: state.suggestion_record.unitLibelle,
        content: state.suggestion_record.content,
        status: state.suggestion_record.status,
        solution: state.suggestion_record.solution,
        comment: state.suggestion_record.comment,
        created_by: state.suggestion_record.created_by,
        created_at: state.suggestion_record.created_at,
        handled_at: state.suggestion_record.handled_at,
        handled_by: state.suggestion_record.handled_by,
        approved_at: state.suggestion_record.approved_at,
        approved_by: state.suggestion_record.approved_by,
        resolved_at: state.suggestion_record.resolved_at,
        resolved_by: state.suggestion_record.resolved_by,
        errors: state.suggestion_record.suggestions_record_errors,
        items: state.suggestion_record.items,
        selectedItem: state.suggestion_record.selectedItem,
        selectedFiles: state.suggestion_record.selectedFiles,
        selectedItemFiles: state.suggestion_record.selectedItemFiles,
        selectedItemAudio: state.suggestion_record.selectedItemAudio,
        showSelectPrintItem: state.suggestion_record.showSelectPrintItem,
        etat: state.suggestion_record.etat,
        etat2: state.suggestion_record.etat2,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loading: (err) => {
            dispatch(loading(err));
        },
        suggestionsRecordErrors: (err) => {
            dispatch(suggestionRecordErrors(err));
        },
        idChanged: (id) => {
            dispatch(idChanged(id));
        },
        firstnameChanged: (firstname) => {
            dispatch(firstnameChanged(firstname));
        },
        lastnameChanged: (lastname) => {
            dispatch(lastnameChanged(lastname));
        },
        addressChanged: (address) => {
            dispatch(addressChanged(address));
        },
        phoneChanged: (phone) => {
            dispatch(phoneChanged(phone));
        },
        genderChanged: (gender) => {
            dispatch(genderChanged(gender));
        },
        languageChanged: (language) => {
            dispatch(languageChanged(language));
        },
        languageLibelleChanged: (languageLibelle) => {
            dispatch(languageLibelleChanged(languageLibelle))
        },
        dossierimfChanged: (dossierimf) => {
            dispatch(dossierimfChanged(dossierimf));
        },
        codeChanged: (code) => {
            dispatch(codeChanged(code));
        },
        recordedAtChanged: (recordedAt) => {
            dispatch(recordedAtChanged(recordedAt));
        },
        collectChanged: (collect) => {
            dispatch(collectChanged(collect));
        },
        collectLibelleChanged: (collectLibelle) => {
            dispatch(collectLibelleChanged(collectLibelle))
        },
        productChanged: (product) => {
            dispatch(productChanged(product));
        },
        productLibelleChanged: (productLibelle) => {
            dispatch(productLibelleChanged(productLibelle))
        },
        unitChanged: (unit) => {
            dispatch(unitChanged(unit));
        },
        unitLibelleChanged: (unitLibelle) => {
            dispatch(unitLibelleChanged(unitLibelle))
        },
        contentChanged: (content) => {
            dispatch(contentChanged(content));
        },
        statusChanged: (status) => {
            dispatch(statusChanged(status));
        },
        solutionChanged: (solution) => {
            dispatch(solutionChanged(solution));
        },
        createdAtChanged: (createdAt) => {
            dispatch(createdAtChanged(createdAt));
        },
        createdByChanged: (createdBy) => {
            dispatch(createdByChanged(createdBy));
        },
        handledAtChanged: (handledAt) => {
            dispatch(handledAtChanged(handledAt));
        },
        handledByChanged: (handledBy) => {
            dispatch(handledByChanged(handledBy));
        },
        resolvedAtChanged: (resolvedAt) => {
            dispatch(resolvedAtChanged(resolvedAt));
        },
        resolvedByChanged: (resolvedBy) => {
            dispatch(resolvedByChanged(resolvedBy));
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items));
        },
        recordedAtDPChanged: (recordedAt) => {
            dispatch(recordedAtDPChanged(recordedAt))
        },
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem));
        },
        selectedFilesReset: (selectedFiles) => {
            dispatch(selectedFilesReset(selectedFiles));
        },
        selectedItemFilesChanged: (selectedItemFiles) => {
            dispatch(selectedItemFilesChanged(selectedItemFiles));
        },
        selectedItemAudioChanged: (selectedItemAudio) => {
            dispatch(selectedItemAudioChanged(selectedItemAudio));
        },
        showSelectPrintItemChanged: (show) => {
            dispatch(showSelectPrintItemChanged(show));
        },

        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
        etat2Changed: (etat2) => {
            dispatch(etat2Changed(etat2));
        },
        selectedFilesChanged: (selectedFiles) => {
            dispatch(selectedFilesChanged(selectedFiles))
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EnregistrerSuggestion);
