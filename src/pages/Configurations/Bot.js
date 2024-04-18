import React, {useEffect, useState} from "react";
import {cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import HelpIcon from '@mui/icons-material/Help';
import {modalify} from "../../Utils/modal";
import { ajout } from "../../apis/Configurations/BotApi";
import {
    apiKeyChanged, apiSecretChanged, gprbotErrors, etatChanged
} from "../../redux/actions/Configurations/BotActions";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';

import { notify } from "../../Utils/alert";
import axios from "axios";
import { licenseInfo } from "../../apis/LoginApi";
import { QRCode } from 'react-qrcode-logo';
import logo from '../../assets/images/GPR_192.png';


const Bot = (props) => {

    useEffect(() => {
        try {
            let appBot =  loadItemFromLocalStorage("app-bot") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-bot")) : undefined;
           
            if (appBot !== undefined || appBot !== "") {
                props.apiKeyChanged(appBot.apiKey)
                props.apiSecretChanged(appBot.apiSecret);
              
            } else {
            }
        } catch (e) {
        }
       
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

    const [actif, setActif] = useState();
  
    const licenseControl = async () => {
      try {
        let resultat = await licenseInfo();
        console.log("resultat", resultat);
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
       
        let item = {}
        item["apiKey"] = props.apiKey;
        item["apiSecret"] = props.apiSecret;

        let itemb = {}
        itemb["apikey"] = props.apiKey;
        itemb["apisecret"] = props.apiSecret;
        props.etatChanged(true)
      
        if (handleValidation()) {
            //send request to verify
            // console.log("botload2",itemb);
            const API_URL = "https://gpradmin.sicmagroup.com/api/verifiedKey"
            const config = {
                method: 'post',
                url: API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + loadItemFromSessionStorage('token')
                },
                data: itemb
            };
            axios(config)
                .then(function (response) {
                //    console.log("botload",response);
                    let resultat = response.data;

                    if(resultat.status == "error"){
                        notify(resultat.data, "error");
                        props.etatChanged(false)
                      //  console.log(resultat);
                    } else {
                        ajout(item, props).then(() => {
                            // handleCancel(e)
                        })
                       // console.log(response);
                    }
            
                    
                    
                })
                ;
           
        } 

        props.gprbotErrors(errors)
       
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
                    

                        <div className="col s6 m6">
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
                                <div className="col s12 display-flex justify-content-start mt-3">
                                    { (actif !== undefined && actif)  ? (
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
                        </div>

                        <div className="col s6 m6">
                            <div className="row">

                                <div className="col s12 display-flex justify-content-center">
                                    <div style={{ position: 'relative', width: '250px', height: '250px' }}>
                                        {/* Fond blanc semi-transparent */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                            zIndex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {/* Cercle bleu */}
                                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'blue', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                {/* Flèche */}
                                                <div style={{ width: '20px', height: '20px', borderBottom: '3px solid white', borderRight: '3px solid white', transform: 'rotate(45deg)' }}></div>
                                                {/* Texte "Actualiser" */}
                                                <span style={{ color: 'white', fontSize: '12px', marginTop: '5px' }}>Actualiser</span>
                                            </div>
                                        </div>
                                        {/* QR code */}
                                        <QRCode
                                            value="https://github.com/gcoro/react-qrcode-logo"
                                            size="238"
                                            bgColor="#FFFFFF"
                                            fgColor="#ff5733"
                                            logoImage={logo}
                                            logoWidth="50"
                                            logoHeight=""
                                            logoOpacity={0.9}
                                            style={{ position: 'relative', zIndex: 0 }}
                                        />
                                    </div>
                                </div>
                               
                            </div>
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