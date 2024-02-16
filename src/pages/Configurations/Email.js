import React, {useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';

import {cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import {modalify} from "../../Utils/modal";
import { ajout } from "../../apis/Configurations/MailApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import {
    portChanged, hostChanged, passwordChanged, userChanged, loadingChanged, etatChanged
} from "../../redux/actions/Configurations/EmailActions";
import { licenseInfo } from "../../apis/LoginApi";


const Email = (props) => {

    useEffect(() => {

        try {
            let appMail =  loadItemFromLocalStorage("app-mail") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-mail")) : undefined;
           
            if (appMail !== undefined || appMail !== "") {
                props.userChanged(appMail.user)
                props.hostChanged(appMail.host)
                props.portChanged(appMail.port)
                props.passwordChanged(appMail.logo)

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
       
        if ((props.user === "" || props.user === undefined || props.user === null)) {
            isValid = false;
            errors["user"] = "Champ incorrect";
        }
        if ((props.host === "" || props.host === undefined || props.host === null)) {
            isValid = false;
            errors["host"] = "Champ incorrect";
        }
        if ((props.port === "" || props.port === undefined || props.port === null)) {
            isValid = false;
            errors["port"] = "Champ incorrect";
        }
        if ((props.password === "" || props.password === undefined || props.password === null)) {
            isValid = false;
            errors["password"] = "Champ incorrect";
        }

        return isValid
    }



    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation) {
            let item = {}
            item["host"] = props.host;
            item["port"] = props.port;
            item["user"] = props.user;
            item["pwd"] = props.password;
           
            props.etatChanged(true)
            ajout(item, props).then(() => {
                // handleCancel(e)
            })

        }

    }

    return (
        <>
            <div className="card-panel">
                <div className="row mb-2">
                    <div className="col s12"><h6 className="card-title">Serveur mail</h6>
                        <p>Il s'agit d'enregistrer les accès à votre serveur mail pour pouvoir envoyez des mails</p></div>
                </div>
                <form id="accountForm" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col s12 m6">

                            <div className="row">
                                <div className="col s12 input-field">
                                    <input id="host" placeholder="" name="host" type="text"
                                        className="validate" value={props.host}
                                        onChange={(e) => props.hostChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="host" className={"active"}>Serveur {"(Host)"}</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error"></div>
                                    </small></div>
                                <div className="col s12 input-field">
                                    <input id="user" placeholder="" name="user" type="text"
                                        className="validate" value={props.user}
                                        onChange={(e) => props.userChanged(e.target.value)}
                                        data-error=".errorTxt1" />
                                    <label htmlFor="user" className={"active"}>Utilisateur mail(User)</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error"></div>
                                    </small>
                                </div>



                            </div>
                        </div>
                        <div className="col s12 m6">
                            <div className="row">
                                <div className="col s12 input-field">
                                    <textarea id="port" placeholder="" name="port" type="text"
                                        className="validate materialize-textarea" value={props.port}
                                        onChange={(e) => props.portChanged(e.target.value)}
                                        data-error=".errorTxt2" />
                                    <label htmlFor="port" className={"active"}>Port</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error"></div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">
                                    <input id="password" name="password" placeholder="" type="password"
                                        onChange={(e) => props.passwordChanged(e.target.value)}
                                        className=""
                                        value={props.password} />
                                    <label htmlFor="password" className={"active"}>Mot de passe {"(Password)"}</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error"></div>
                                    </small>

                                </div>

                            </div>
                        </div>

                        <div className="col s12 display-flex justify-content-end mt-3">
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
                </form>

            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        loading: state.mail.loading,
        port: state.mail.port,
        password: state.mail.password,
        user: state.mail.user,
        host: state.mail.host,
        etat: state.mail.etat,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        portChanged: (port) => {
            dispatch(portChanged(port))
        },
        hostChanged: (host) => {
            dispatch(hostChanged(host))
        },
        userChanged: (user) => {
            dispatch(userChanged(user))
        },
        passwordChanged: (password) => {
            dispatch(passwordChanged(password))
        },
        loadingChanged: (loading) => {
            dispatch(loadingChanged(loading))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Email)