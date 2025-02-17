import React, { useEffect, useState } from "react";
import { cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";

import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';
import { modalify } from "../../Utils/modal";
import { ajout, apiKeyTokenDelete, apiKeyTokenGenerator, apiKeyTokenReGenerator, apiKeyTokens, genererToken } from "../../apis/Configurations/BotApi";
import {
    apiKeyChanged, apiSecretChanged, gprbotErrors, etatChanged, etat1Changed, qrcodeChanged
} from "../../redux/actions/Configurations/BotActions";
import { LoadingButton } from "@mui/lab";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SaveIcon from '@mui/icons-material/Save';

import { notify } from "../../Utils/alert";
import axios from "axios";
import { licenseInfo } from "../../apis/LoginApi";
import { QRCode } from 'react-qrcode-logo';
import logo from '../../assets/images/GPR_192.png';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Chip } from "@mui/material";

const ApiKey = (props) => {
    let appBot;
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const [apiKeyList, setApiKeyList] = useState([])

    const handleDisabledModal = (e, spId, isDeleted = false) => {
        e.stopPropagation();
        var message = "Voulez-vous vraiment regénérer ce api key ?"
      
        if (isDeleted) {
            message = "Voulez-vous vraiment supprimer ce api key ?";
         
        }

        modalify("Confirmation", message,"confirm", (e) => {
            if(isDeleted){

                deleteTokenApi(spId)
            }else{
                regenerateTokenApi(spId)
            }
        })
    }


    useEffect(() => {


        //UI Fixes

        window.$('.dropdown-trigger').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false, // Does not change width of dropdown to that of the activator
            click: true, // Activate on hover
            gutter: 0, // Spacing from edge
            coverTrigger: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        }
        );

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
        //cleanup

    }, []);

    let columns = [
        {
            key: "name",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
        },
        {
            key: "description",
            text: "Description",
            className: "description",
            align: "left",
            sortable: true
        },
        {
            key: "cle",
            text: "API KEY",
            className: "api_key",
            align: "left",
            sortable: false
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            cell: (user) => {

                return <div style={{ display: 'flex', }}>
                    <Chip label="Régénérer" onClick={(e) => handleDisabledModal(e, user.id)} />
                    <Chip label="Supprimer" color="error" onClick={(e) => handleDisabledModal(e, user.id,true)} style={{ marginLeft: "5px" }} />
                </div>



            }
        },

    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
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
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        // console.log('data', data)
    }

    const [actif, setActif] = useState();

    const licenseControl = async () => {
        try {
            let resultat = await licenseInfo();
            // console.log("resultat", resultat);
            setActif(resultat.actif)

        } catch (error) {
            // console.error("Une erreur s'est produite :", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await licenseControl();
        };

        fetchData();
        getApiKeys()
    }, []);





    const [keyField, setKeyField] = useState({
        libelle: "",
        description: "",
        secret: null,
        key: null
    });
    const createTokenApi = (e) => {
        e.preventDefault();
        apiKeyTokenGenerator(keyField).then(({ data }) => {
            notify("L'API KEY a ete généré", "success")
            setKeyField({ ...keyField, secret: data.content.api_secret, key: data.content.api_key })
        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })

    }
    const regenerateTokenApi = (id) => {
        apiKeyTokenReGenerator(id).then(({ data }) => {
            notify(`la clé a été regénéré,le API SECRET est ${data.content.api_secret}  `, "success")
            setKeyField({ ...keyField, secret: data.content.api_secret, key: data.content.api_key })
            getApiKeys()

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }
    const deleteTokenApi = (id) => {
        apiKeyTokenDelete(id).then(({ data }) => {
            notify(`la clé a été supprimée  `, "success");
            getApiKeys()

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }
    const getApiKeys = () => {
        apiKeyTokens().then(({ data }) => {
            // console.log('data', data.content)
            setApiKeyList(data.content);

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }
    return (
        <>

            <div className="card-panel">
                <div className="row">
                    <div className="col s12"><h6 className="card-title">API KEY </h6>
                        <p>Il s'agit de générer une clé d'authentification pour l'enregistrement</p></div>
                </div>
                <form id="accountForm" >
                    <div className="row">


                        <div className="col s12 m12">
                            <div className="row">

                                <div className="col s6 input-field">
                                    <input id="Nom" placeholder="" name="nom" type="text"
                                        className="validate" value={keyField.libelle}
                                        onChange={(e) => setKeyField({ ...keyField, libelle: e.target.value })} maxLength="36"
                                        data-error=".errorTxt1" />
                                    <label htmlFor="apikey" className={"active"}>
                                        Libelle
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_KEY fourni par SICMA ET ASSOCIES pour utiliser GPR BOT">
                                            <HelpIcon />
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.gprbotErrors.apiKey}</div>
                                    </small>
                                </div>

                                <div className="col s6 input-field">
                                    <input id="apisecret" placeholder="" name="apisecret" type={showPassword ? "text" : "password"}
                                        className="validate" value={keyField.secret}
                                        maxLength="36"
                                        data-error=".errorTxt1" readOnly disabled />
                                    <label htmlFor="apisecret" className={"active"}>API SECRET &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_SECRET fourni par SICMA ET ASSOCIES  pour utiliser GPR BOT">
                                            <HelpIcon />
                                        </a></label>

                                    <span
                                        onClick={toggleShowPassword}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </span>
                                </div>
                                <div className="col s6 input-field">
                                    <input id="Description" placeholder="" name="description" type="text"
                                        className="validate" value={keyField.description}
                                        onChange={(e) => setKeyField({ ...keyField, description: e.target.value })} maxLength="36"
                                        data-error=".errorTxt1" />
                                    <label htmlFor="apikey" className={"active"}>
                                        Description
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_KEY fourni par SICMA ET ASSOCIES pour utiliser GPR BOT">
                                            <HelpIcon />
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.gprbotErrors.apiKey}</div>
                                    </small>
                                </div>
                                <div className="col s6 input-field">
                                    <input id="apikey" placeholder="" name="apikey" type="text"
                                        className="validate" value={keyField.key} maxLength="36"
                                        data-error=".errorTxt1" readOnly disabled />
                                    <label htmlFor="apikey" className={"active"}>API KEY &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_KEY fourni par SICMA ET ASSOCIES pour utiliser GPR BOT">
                                            <HelpIcon />
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.gprbotErrors.apiKey}</div>
                                    </small>
                                </div>


                                <div className="col s12 display-flex justify-content-start mt-3">



                                    <LoadingButton
                                        className="btn waves-effect waves-light mr-1 btn-small"
                                        onClick={(e) => createTokenApi(e)}
                                        loading={props.etat}
                                        loadingPosition="end"
                                        endIcon={<SaveIcon />}
                                        variant="contained"
                                        sx={{ textTransform: "initial" }}
                                    >
                                        <span>Générer</span>
                                    </LoadingButton>
                                </div>
                            </div>


                        </div>



                    </div>
                </form>

            </div>

            <div className="card-panel">
                <div className="row">
                    <div className="col l6 m6 s12">
                        <h6 className="card-title">Liste des API KEY&nbsp;</h6>
                    </div>

                </div>
                <div className="row">
                    <div className="col s12">
                        <ReactDatatable
                            className={"responsive-table table-xlsx app-categories"}
                            config={config}
                            records={apiKeyList}
                            columns={columns}
                            onRowClicked={rowClickedHandler}
                        />
                    </div>
                </div>

            </div>

        </>
    )
}

const mapStateToProps = (state) => {
    return {
        apiKey: state.gprbot.apiKey,
        apiSecret: state.gprbot.apiSecret,
        gprbotErrors: state.gprbot.gprbotErrors,
        etat: state.gprbot.etat,
        etat1: state.gprbot.etat1,
        qrcode: state.gprbot.qrcode
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        gprbotErrors: (err) => {
            dispatch(gprbotErrors(err))
        },
        apiKeyChanged: (apikey) => {
            dispatch(apiKeyChanged(apikey))
        },
        apiSecretChanged: (apiSecret) => {
            dispatch(apiSecretChanged(apiSecret))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        etat1Changed: (etat1) => {
            dispatch(etat1Changed(etat1))
        },
        qrcodeChanged: (qrcode) => {
            dispatch(qrcodeChanged(qrcode))
        },

    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiKey)