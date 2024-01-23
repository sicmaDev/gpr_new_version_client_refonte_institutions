import React, {useEffect} from "react";
import {
    changePasswordErrors, currentPasswordChanged,
    etatChanged,
    newPasswordAgainChanged,
    newPasswordChanged
} from "../../redux/actions/Compte/ChangePasswordActions";
// import {authenticate} from "../../redux/actions/layoutActions";
import {notify} from "../../Utils/alert";
import { isValidMdp, loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import { idChanged } from "../../redux/actions/Compte/CompteDetailsActions";
import { connect } from "react-redux";
import HelpIcon from '@mui/icons-material/Help';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import { modalify } from "../../Utils/modal";
import { ChangerMdpApi } from "../../apis/Compte/CompteApi";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';


const ChangePassword = (props) => {

    useEffect(() => {
        const sessionUser = JSON.parse(loadItemFromLocalStorage('app-user'))
        props.idChanged(sessionUser.id)

        window.$('.tooltipped').tooltip();
    }, []);

    let mode =loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleModal = (e) => {
        e.preventDefault();
        modalify(
          "Confirmation",
          "Confirmez vous le changement du mot de passe ? Vous devrez vous reconnectez après cela !",
          "confirm",
          handleSubmit
        );
    };

    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if((props.current_pass==="" || props.current_pass===undefined)){
            isValid = false;
            errors["current_pass"] = "Champ incorrect";
        }
        if((props.new_pass==="" || props.new_pass===undefined)){
            isValid = false;
            errors["new_pass"] = "Champ incorrect";
        }
        if((props.new_pass_again==="" || props.new_pass_again===undefined)){
            isValid = false;
            errors["new_pass_again"] = "Champ incorrect";
        }
        if((props.new_pass !== props.new_pass_again)){
            isValid = false;
            errors["new_pass"] = "Les mots de passes ne correspondent pas";
            errors["new_pass_again"] = "Les mots de passes ne correspondent pas";
        }
        if(!isValidMdp(props.new_pass)){
            isValid = false;
            errors["new_pass"] = "Le mot de passe est faible";
        }
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        let data = {}
        data["id"] = props.id;
        data["oldPassword"] = props.current_pass;
        data["newPassword"] = props.new_pass;
        //   console.log("datattta",data)
        if(handleValidation()){
            props.etatChanged(true)
            ChangerMdpApi(data, props,e)
        }
        else{
           
            // console.log("Form has errors.")
        }
        // console.log("errrors",errors)
        props.changePasswordErrors(errors)
    }

    
    let btnOff;

    if (mode === 1) {
        btnOff = 
            <>
                <div className="col s12 display-flex justify-content-end form-action">
                    <LoadingButton
                        className="waves-effect waves-effect-b waves-light btn-small"
                        onClick={handleModal}
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                    >
                        <span>Changer</span>
                    </LoadingButton>
                </div>
            </>
    } else {
        btnOff = 
            <>
                <div className="col s12 display-flex justify-content-end mt-3">
                    <div className="card-alert card red lighten-5" >
                        <div className="card-content red-text" style={{ textAlign:"center" }}>
                        <ul>
                            Vous ne pouvez pas changer votre mot de passe en mode offline !
                        </ul>
                        </div>
                    </div>
                </div>
            </>
            
    }
    return (
        <>
            <div className="card-panel">
                <form className="paaswordvalidate">
                    <div className="row">
                        <div className="col s12">
                            <div className="input-field">
                                <input id="oldpswd" name="oldpswd" type="password"
                                       data-error=".errorTxt4" defaultValue=""
                                       onChange={(e) => props.currentPasswordChanged(e.target.value)}/>
                                <label htmlFor="oldpswd">Mot de passe actuel</label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.current_pass}</div>
                                </small>
                            </div>
                        </div>
                        <div className="col s12">
                            <div className="input-field">
                                <input id="newpswd" name="newpswd" type="password"
                                       data-error=".errorTxt5" defaultValue=""
                                       onChange={(e) => props.newPasswordChanged(e.target.value)}/>
                                <label htmlFor="newpswd">Nouveau mot de passe
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Le mot de passe doit contenir au moins un chiffre et un symbol">
                                            <HelpIcon/>
                                    </a>
                                </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.new_pass}</div>
                                </small>
                            </div>
                        </div>
                        <div className="col s12">
                            <div className="input-field">
                                <input id="repswd" type="password" name="repswd"
                                       data-error=".errorTxt6" defaultValue=""
                                       onChange={(e) => props.newPasswordAgainChanged(e.target.value)}/>
                                      
                                <label htmlFor="repswd">Nouveau mot de passe encore</label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.new_pass_again}</div>
                                </small>
                            </div>
                        </div>
                            
                        {btnOff}
                    </div>
                </form>
            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        isLoading: state.change_password.isLoading,
        id: state.change_password.id,
        current_pass: state.change_password.current_pass,
        new_pass: state.change_password.new_pass,
        new_pass_again: state.change_password.new_pass_again,
        etat: state.change_password.etat,
        errors: state.change_password.change_password_errors,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePasswordErrors: (err) => {
            dispatch(changePasswordErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        currentPasswordChanged: (pass) => {
            dispatch(currentPasswordChanged(pass))
        },
        newPasswordChanged: (pass) => {
            dispatch(newPasswordChanged(pass))
        },
        newPasswordAgainChanged: (pass) => {
            dispatch(newPasswordAgainChanged(pass))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        // authenticate: () => dispatch(authenticate())
    }
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ChangePassword)