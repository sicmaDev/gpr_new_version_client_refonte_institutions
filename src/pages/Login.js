import React, {useEffect} from "react";
import {authenticate} from "../redux/actions/LayoutActions";
import { connect } from "react-redux";
import {emailChanged, etatChanged, loginErrors, passChanged} from "../redux/actions/LoginActions";
import {LoginApi, LoginApiOffline} from "../apis/LoginApi";
import {clearLocalstorage, loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage} from "../Utils/utils";
import logo from '../assets/images/logo_gpr.jpg';
import loginPhoto from "../assets/images/login_photo.png"
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import { notify } from "../Utils/alert";

const Login = (props) =>{
   
    const clearComponentState = () => {
        props.emailChanged("")
        props.passChanged("")
    }

    const [online, setOnline] = React.useState(true);

    const handleOnline = () => {
        setOnline(true)
        notify("Mode online activé ","success")
    }

    const handleControl = () => {
        let user = loadItemFromLocalStorage("app-user") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-user")) : undefined;

        if (user=== undefined) {
            notify("Vous devez vous connectez au moins une fois pour pouvoir accéder à l'option offline","error")
        } else {
            notify("Mode offline activé ","success")
            setOnline(false)
        }
    }

    useEffect(() => {
        // vérifier si le serveur est démarré
        // pingApi().then()
        // console.error(props.email)
        // console.error(props.pass)
        return clearComponentState();
    }, []);
    let errors = {};
    const handleValidation = () =>{

        let isValid = true;

        if((props.email==="" || props.email===undefined) || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)){
            isValid = false;
            errors["email"] = "Champ incorrect";
        }
        if((props.pass==="" || props.pass===undefined)){
            isValid = false;
            errors["pass"] = "Champ incorrect";
        }
        return isValid
    }
    const handleSubmit = (e) => {
      
        e.preventDefault()
        let credentials = {}
        credentials["email"] = props.email
        credentials["password"] = props.pass

        if(handleValidation()){
            props.etatChanged(true)
            console.log("online",online)
            if (online) {
                LoginApi(credentials, props)
            } else {
                LoginApiOffline(credentials, props)
            }
            
        }
        else{
        }
        props.loginErrors(errors)
    }
   
    return(
        <>
            <div className="row flex-container" >
               
                <div className="col s6 hide-on-med-and-down" style={{backgroundColor: '#005081',height:"100%"}}>
                    <div className="center-align " style={{height:"100%"}}>
                        <img className="recent-file"
                            src={loginPhoto}
                            height="60%" width="60%"
                            style={{position:"relative",top:"20%"}}
                            alt="Login"/>
                    </div>
                </div>
                   
                <div className="col l6 m12 s12">
                    <div className="container">
                        <div className="row">
                            <h1 className="center-align ">
                                <img className="recent-file"
                                    src={logo}
                                   
                                    alt="Logo Assilassimé"/>
                            </h1>

                        </div>

                        <div id="login-page" className="row plr-15">
                            <div className="row padding-5">
                                <div className="row mb-5"  style={{ display:"flex" }}>
                                 
                                    <div className="col l6 m6 s6 flex-item justify-content-center">
                                        <button
                                            className="waves-effect waves-light btn-small activo"
                                            style={{ width:"100%" }}
                                            onClick={handleOnline}
                                        >Online</button>
                                    </div>

                                    <div className="col l6 m6 s6 flex-item justify-content-center">
                                        <button
                                            className="waves-effect waves-light btn-small inactivo"
                                            style={{ width:"100%" }}
                                            onClick={handleControl}
                                        >Offline</button>
                                    </div>
                                   
                                </div>
                                <form className="col l12 m12 s12 mt-5" onSubmit={handleSubmit}>
                                    
                                    <div className="row">
                                    
                                        <div className="input-field col m12 s12 bf">
                                            
                                            <input id="email" type="email" className="validate" placeholder="" onChange={(e) => props.emailChanged(e.target.value)}/>
                                            <label htmlFor="email" className="active">Adresse électronique</label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">
                                                    {props.errors.email}
                                                </div>
                                            </small>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col m12 s12 bf">
                                            <input id="pass" type="password" placeholder="" className="validate" onChange={(e) => props.passChanged(e.target.value)}/>
                                            <label htmlFor="pass" className="active">Mot de passe</label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">
                                                    {props.errors.pass}
                                                </div>
                                            </small>
                                        </div>

                                    </div>
                                    
                                    <div className="row">
                                        
                                        <div className="col m12 s12 flex-item justify-content-center">
                                            <LoadingButton
                                                className="waves-effect waves-light btn-small mb-1"
                                                style={{ height: "50px",backgroundColor:"#005081",width:"100%",marginTop:"3%" }}
                                                color="secondary"
                                                onClick={handleSubmit}
                                                loading={props.etat}
                                                loadingPosition="end"
                                                endIcon={<LoginIcon />}
                                                variant="contained"
                                                >
                                                <span>S'authentifier</span>
                                            </LoadingButton>
                                        </div>
                                        
                                        
                                        
                                    </div>
                                </form>
                            </div>
                          
                        </div>
                    </div>
                    <div className="content-overlay"></div>
                </div>
                
            </div>

        </>
    )
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.login.isLoading,
        email: state.login.email,
        pass: state.login.pass,
        etat: state.login.etat,
        errors: state.login.login_errors,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        authenticate: () => dispatch(authenticate()),
        loginErrors: (err) => {dispatch(loginErrors(err))},
        emailChanged: (email) => {
            dispatch(emailChanged(email))
        },
        passChanged: (pass) => {
            dispatch(passChanged(pass))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login)

