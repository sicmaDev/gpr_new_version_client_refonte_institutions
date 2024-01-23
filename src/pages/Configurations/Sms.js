import React, {useEffect, useState} from "react";
import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { v4 as uuidv4 } from 'uuid';

import {cleanPhoneNumber, isValidPhone, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import {modalify} from "../../Utils/modal";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/LanguesApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import { isLicenseControl } from "../../Utils/license";
import {
    urlChange,smsErrors, libelleIdChanged, libelleMessageChanged, valuePwdChanged, libellePwdChanged, libelleReceiverChanged, libelleSenderChanged, valueIdChanged, valueSenderChanged, etatChanged
} from "../../redux/actions/Configurations/SmsActions";



const Sms = (props) => {

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
        window.$('ul.pagination').parent().parent().css({marginTop:"1%", boxShadow:"none"})
        window.$('ul.pagination').parent().css({boxShadow:"none"})
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

    let licenseControl = isLicenseControl()

    let errors = {};

    const handleValidation = () => {
        let isValid = true;
       // console.log((props.url).indexOf("https"));


        // if (((props.url).indexOf("https://")=== 0)) {
        //     isValid = false;
        //     errors["url"] = "Entrez une url valide";
        // }
        if ((props.url === "" || props.url === undefined || props.url === null)) {
            isValid = false;
            errors["url"] = "Champ incorrect";
           // console.log("url");
        }
        if(props.libelleId === "" || props.libelleId === undefined || props.libelleId === null){
            isValid = false;
            errors["libelle_id"] = "Champ incorrect";
           // console.log("libelle_id");
        }
        if(props.valueId === "" || props.valueId === undefined || props.valueId === null){
            isValid = false;
            errors["value_id"] = "Champ incorrect";
           // console.log("value_id");
        }
        if(props.libellePwd === "" || props.libellePwd === undefined || props.libellePwd === null){
            isValid = false;
            errors["libelle_pwd"] = "Champ incorrect";
           // console.log("libelle_pwd");
        }
        if(props.valuePwd === "" || props.valuePwd === undefined || props.valuePwd === null){
            isValid = false;
            errors["value_pwd"] = "Champ incorrect";
            //console.log("value_pwd");
        }
        if(props.libelleSender === "" || props.libelleSender === undefined || props.libelleSender === null){
            isValid = false;
            errors["libelle_sender"] = "Champ incorrect";
            //console.log("libelle_sender");
        }
        if(props.valueSender === "" || props.valueSender === undefined || props.valueSender === null){
            isValid = false;
            errors["value_sender"] = "Champ incorrect";
            //console.log("value_sender");
        }
        if(props.libelleReceiver === "" || props.libelleReceiver === undefined || props.libelleReceiver === null){
            isValid = false;
            errors["libelle_receiver"] = "Champ incorrect";
           // console.log("libelle_receiver");
        }
        if(props.libelleMessage === "" || props.libelleMessage === undefined || props.libelleMessage === null){
            isValid = false;
            errors["libelle_message"] = "Champ incorrect";
           // console.log("libelle_message");
        }
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        let setting = {}
        setting["name"] = 'App Sms';
        setting["slug"] = 'app-sms';
        let val = {}
        val["url"] = props.url;
        val["libelle_id"] = props.libelleId;
        val["value_id"] = props.valueId;
        val["libelle_pwd"] = props.libellePwd;
        val["value_pwd"] = props.valuePwd;
        val["libelle_sender"] = props.libelleSender;
        val["value_sender"] = props.valueSender;
        val["libelle_receiver"] = props.libelleReceiver;
        val["libelle_message"] = props.libelleMessage;

       
        setting["value"] = JSON.stringify(val);
        let data = {}
        data['setting'] = setting

        // if (handleValidation()) {
        //     updateSettingApi('app-sms', data, props /*addToast*/)
        // } 
        // else {
           
        //     notify("Echec de l'enregistrement", "error");
        // }

        props.smsErrors(errors)
        //console.log(errors.contenu);
    }

    return (
        <>
            <div className="card-panel">
                <div className="row">
                    <div className="col s12"><h6 className="card-title">Configuration SMS</h6>
                        <p>Il s'agit de configurer GPR pour utiliser l'API de votre fournisseur de SMS Banking</p></div>
                </div>
                <form id="accountForm" onSubmit={handleSubmit}>
                    <div className="row">
                    

                        <div className="col s12 m6">
                            <div className="row">
                            <div className="col s12"><p className="">Information Générale</p></div>

                                <div className="col s12 input-field">
                                    <input id="url" placeholder="" name="url" type="url"
                                        className="validate" value={props.url}
                                        onChange={(e) => props.urlChange(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="url" className={"active"}>API URL {"(url)"}</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.smsErrors.url}</div>
                                    </small>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12"><p className="">Informations d'identification de votre compte SMS Banking</p></div>

                                    <div className="col s6 input-field">
                                        <input id="libelle_id" placeholder="" name="libelle_id" type="text"
                                            className="validate" value={props.libelleId}
                                            onChange={(e) => props.libelleIdChanged(e.target.value)}
                                            data-error=".errorTxt1" />
                                        <label htmlFor="libelle_id" className={"active"}>Libelle paramètre id &nbsp;
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="Il s'agit du nom du paramètre représentant l'identifiant de votre compte de SMS Banking.">
                                                <HelpIcon/>
                                            </a></label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.smsErrors.libelle_id}</div>
                                        </small>
                                    </div>
                                    <div className="col s6 input-field">
                                        <input id="value_id" placeholder="" name="value_id" type="text"
                                            className="validate" value={props.valueId}
                                            onChange={(e) => props.valueIdChanged(e.target.value)}
                                            data-error=".errorTxt1" />
                                        <label htmlFor="value_id" className={"active"}>Valeur id &nbsp;
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="Il s'agit de la valeur de votre identifiant de votre compte de SMS Banking.">
                                                <HelpIcon/>
                                            </a></label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.smsErrors.value_id}</div>
                                        </small>
                                    </div>
                                </div>
                            <div className="row">
                                <div className="col s6 input-field">
                                    <input id="libelle_pwd" placeholder="" name="libelle_pwd" type="text"
                                        className="validate" value={props.libellePwd}
                                        onChange={(e) => props.libellePwdChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="libelle_pwd" className={"active"}>Libelle paramètre mot de passe &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                           data-tooltip="Il s'agit du nom du paramètre représentant le mot de passe de votre compte de SMS Banking.">
                                             <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.smsErrors.libelle_pwd}</div>
                                    </small>
                                </div>
                                <div className="col s6 input-field">
                                    <input id="value_pwd" placeholder="" name="value_pwd" type="password"
                                        className="validate" value={props.valuePwd}
                                        onChange={(e) => props.valuePwdChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="value_pwd" className={"active"}>Valeur mot de passe &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                           data-tooltip="Il s'agit de la valeur du mot de passe de votre compte de SMS Banking.">
                                             <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.smsErrors.value_pwd}</div>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col s12 m6">
                            <div className="row">
                                <div className="col s12"><p className="">Informations sur l'emetteur SMS Banking</p></div>

                                <div className="col s6 input-field">
                                    <input id="libelle_sender" placeholder="" name="libelle_sender" type="text"
                                        className="validate" value={props.libelleSender}
                                        onChange={(e) => props.libelleSenderChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="libelle_sender" className={"active"}>Libelle paramètre emetteur &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                           data-tooltip="Il s'agit du nom du paramètre représentant le sender de votre compte de SMS Banking.">
                                             <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.smsErrors.libelle_sender}</div>
                                    </small>
                                </div>
                                <div className="col s6 input-field">
                                    <input id="value_sender" placeholder="" name="value_sender" type="text"
                                        className="validate" value={props.valueSender}
                                        onChange={(e) => props.valueSenderChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="value_sender" className={"active"}>Valeur emetteur &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                           data-tooltip="Il s'agit de la valeur du sender de vos messages configurer auprès de votre fournisseur de SMS Banking.">
                                             <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.smsErrors.value_sender}</div>
                                    </small>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s6">
                                    <div className="col s12"><p className="">Informations sur le récepteur </p></div>
                                    <div className="col s12 input-field">
                                        <input id="libelle_receiver" placeholder="" name="libelle_receiver" type="text"
                                            className="validate" value={props.libelleReceiver}
                                            onChange={(e) => props.libelleReceiverChanged(e.target.value)}
                                            data-error=".errorTxt1" />
                                        <label htmlFor="libelle_receiver" className={"active"}>Libelle paramètre destinataire &nbsp;
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="Il s'agit du nom du paramètre représentant le destinataire du message.">
                                                 <HelpIcon/>
                                            </a></label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.smsErrors.libelle_receiver}</div>
                                        </small>
                                    </div>
                                </div>
                                <div className="col s6">
                                    <div className="col s12"><p className="card-title">Informations sur le message </p></div>
                                    <div className="col s12 input-field">
                                        <input id="libelle_message" placeholder="" name="libelle_message" type="text"
                                            className="validate" value={props.libelleMessage}
                                            onChange={(e) => props.libelleMessageChanged(e.target.value)}
                                            data-error=".errorTxt1" />
                                        <label htmlFor="libelle_message" className={"active"}>Libelle paramètre message &nbsp;
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="Il s'agit du nom du paramètre représentant le message à envoyer au client.">
                                                <HelpIcon/>
                                            </a></label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.smsErrors.libelle_message}</div>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                       

                        <div className="col s12 display-flex justify-content-end mt-3">
                            {!licenseControl ? (
                                <LoadingButton
                                    className="btn waves-effect waves-light mr-1 btn-small"
                                    onClick={(e) => handleSubmit(e)}
                                    loading={props.etat}
                                    loadingPosition="end"
                                    endIcon={<SaveIcon />}
                                    variant="contained"
                                    sx={{ textTransform:"initial" }}
                                >
                                    <span>Enregistrer</span>
                                </LoadingButton>
                            ) :
                                (<div className="card-alert card red lighten-5">
                                    <div className="card-content red-text">
                                        <ul>
                                            Veuillez activer une licence.
                                        </ul>
                                    </div>
                                </div>)}
                        </div>
                    </div>
                </form>

            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        loading: state.sms.loading,
        url: state.sms.url,
        libelleId: state.sms.libelleId,
        valueId: state.sms.valueId,
        libellePwd: state.sms.libellePwd,
        valuePwd: state.sms.valuePwd,
        libelleSender: state.sms.libelleSender,
        valueSender: state.sms.valueSender,
        libelleReceiver: state.sms.libelleReceiver,
        libelleMessage: state.sms.libelleMessage,
        etat: state.sms.etat
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        smsErrors: (err) => {
            dispatch(smsErrors(err))
        },
        urlChange: (url) => {
            dispatch(urlChange(url))
        },
        libelleIdChanged: (libelleId) => {
            dispatch(libelleIdChanged(libelleId))
        },
        valueIdChanged: (valueId) => {
            dispatch(valueIdChanged(valueId))
        },
        libellePwdChanged: (libellePwd) => {
            dispatch(libellePwdChanged(libellePwd))
        },
        valuePwdChanged: (valuePwd) => {
            dispatch(valuePwdChanged(valuePwd))
        },
        libelleSenderChanged: (libelleSender) => {
            dispatch(libelleSenderChanged(libelleSender))
        },
        valueSenderChanged: (valueSender) => {
            dispatch(valueSenderChanged(valueSender))
        },
        libelleReceiverChanged: (libelleReceiver) => {
            dispatch(libelleReceiverChanged(libelleReceiver))
        },
        libelleMessageChanged: (libelleMessage) => {
            dispatch(libelleMessageChanged(libelleMessage))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },

    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Sms)