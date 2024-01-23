import React, {useEffect, useState} from "react";
import {cleanPhoneNumber, isValidPhone, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import HelpIcon from '@mui/icons-material/Help';
import {modalify} from "../../Utils/modal";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/LanguesApi";
import {
    apiKeyChanged, apiSecretChanged, gprbotErrors, etatChanged
} from "../../redux/actions/Configurations/BotActions";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import { isLicenseControl } from "../../Utils/license";
import { notify } from "../../Utils/alert";
import axios from "axios";


const Bot = (props) => {

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

        if ((props.apiKey === "" || props.apiKey === undefined || props.apiKey === null )) {
            isValid = false;
            errors["apiKey"] = "Champ incorrect";
           // console.log(props.apiKey);
        }
        if(props.apiSecret === "" || props.apiSecret === undefined || props.apiSecret === null ){
            isValid = false;
            errors["apiSecret"] = "Champ incorrect";
           // console.log(props.apiSecret);
        }
       
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        let setting = {}
        setting["name"] = 'App Bot';
        setting["slug"] = 'app-bot';
        let val = {}
        val["apiKey"] = props.apiKey;
        val["apiSecret"] = props.apiSecret;
        
        setting["value"] = JSON.stringify(val);
        let data = {}
        data['setting'] = setting
        let apiData = {}
        apiData["apikey"] = props.apiKey;
        apiData["apisecret"] = props.apiSecret;
        if (handleValidation()) {
            //send request to verify
            const API_URL = "https://gpradmin.sicmagroup.com/api/verifiedKey"
            const config = {
                method: 'post',
                url: API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loadItemFromSessionStorage('tok')
                },
                data: apiData
            };
            axios(config)
                .then(function (response) {
                   // console.log(response);
                    let resultat = response.data;
                    //console.log(resultat);
                    // if(resultat.status == "error"){
                    //     notify(resultat.data, "error");
                    //   //  console.log(resultat);
                    // } else {
                    //     updateSettingApi('app-bot', data, props /*addToast*/)
                    //    // console.log(response);
                    // }
                    
                })
                ;
           
        } 
        else {
           
            notify("Echec de l'enregistrement", "error");
            //console.log("in false");
        }

        props.gprbotErrors(errors)
       // console.log(errors.contenu);
    }

    return (
        <>
            <div className="card-panel">
                <div className="row">
                    <div className="col s12"><h6 className="card-title">Configuration GPR BOT</h6>
                        <p>Il s'agit de configurer GPR BOT pour recevoir vos réclamations / suggestion depuis vos réseaux sociaux</p></div>
                </div>
                <form id="accountForm" onSubmit={handleSubmit}>
                    <div className="row">
                    

                        <div className="col s12 m6">
                            <div className="row">

                                <div className="col s12 input-field">
                                    <input id="apikey" placeholder="" name="apikey" type="text"
                                        className="validate" value={props.apiKey}
                                        onChange={(e) => props.apiKeyChanged(e.target.value)} maxLength="36"
                                        data-error=".errorTxt1" />
                                    <label htmlFor="apikey" className={"active"}>API KEY &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_KEY fourni par SICMA ET ASSOCIES pour utiliser GPR BOT">
                                            <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.gprbotErrors.apiKey}</div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">
                                    <input id="apisecret" placeholder="" name="apisecret" type="password"
                                        className="validate" value={props.apiSecret}
                                        onChange={(e) => props.apiSecretChanged(e.target.value)} maxLength="36"
                                        data-error=".errorTxt1" />
                                    <label htmlFor="apisecret" className={"active"}>API SECRET &nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                            data-tooltip="API_SECRET fourni par SICMA ET ASSOCIES  pour utiliser GPR BOT">
                                            <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.gprbotErrors.apiSecret}</div>
                                    </small>
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

            </div>       <div className="row"></div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        apiKey: state.gprbot.apiKey,
        apiSecret: state.gprbot.apiSecret,
        gprbotErrors: state.gprbot.gprbotErrors,
        etat: state.gprbot.etat
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
         
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Bot)