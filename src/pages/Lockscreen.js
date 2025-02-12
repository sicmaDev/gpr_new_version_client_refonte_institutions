import React, { useEffect, useState } from 'react'

import logo from '../assets/images/logo_gpr.jpg';
import loginPhoto from "../assets/images/lockscreen.svg"
import FemalAvatar from "../assets/images/avatar/2.svg"
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { connect } from 'react-redux';
import { locked, setLastActivity, setLocked, setUnlocked, setUser, unlocked } from '../redux/actions/LockscreenActions';
import { LogoutRounded } from '@mui/icons-material';
import { LoginApi } from '../apis/LoginApi';
import {authenticate, isAuth} from "../redux/actions/LayoutActions";
import {etatChanged} from "../redux/actions/LoginActions";

const Lockscreen = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState(null)

    const handleSubmit = (e) => {

        e.preventDefault()
        let credentials = {}
        credentials["email"] = userInfo?.email ?? ""
        credentials["password"] = password
        props.etatChanged(true)
        LoginApi(credentials, props,true)
    }
    const logout = () => {
        props.setUnlocked()
        props.isAuth(false)
    }

    const parseUserInfo = () => {
        var result = JSON.parse(props.user)

        if (typeof result == "string") {
            result = JSON.parse(result)
        }

        setUserInfo(result)

    }
    useEffect(() => {
        parseUserInfo()
    }, [""])

    // parseUserInfo()

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    return (
        <div className="row flex-container" >

            <div className="col s6 hide-on-med-and-down" style={{ backgroundColor: '#005081', height: "100%" }}>
                <div className="center-align " style={{ height: "100%" }}>
                    <div className="row">
                        <h1 className="center-align ">
                            <img className="recent-file"
                                src={logo}

                                alt="Logo GPR" />
                        </h1>


                    </div>
                    <img className="recent-file"
                        src={loginPhoto}
                        height="60%" width="60%"
                        style={{ position: "relative", top: "2%" }}
                        alt="Login" />

                </div>
            </div>

            <div className="col l6 m12 s12">
                <div className="container">

                 


                    <div id="login-page" className="row plr-15">
                        <div className="row padding-5">
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <ListItemButton sx={{ flex: '1 auto' }}>
                                    <ListItemAvatar>
                                        <Avatar alt="Avatar" sx={{ width: 80, height: 80 }} src={FemalAvatar} />
                                    </ListItemAvatar>
                                    <ListItemText primary={userInfo?.firstAndLastName} secondary={userInfo?.email} />
                                </ListItemButton>
                                <Avatar alt="Avatar" onClick={logout} sx={{ width: 40, height: 40 }} variant="rounded" >
                                    <LogoutRounded />
                                </Avatar>
                            </div>


                            <form className="col l12 m12 s12 mt-5">


                                <div className="row">
                                    <div className="input-field col m12 s12 bf">
                                        <input id="pass" type={showPassword ? "text" : "password"} placeholder="" className="validate" onChange={(e) => setPassword(e.target.value)} />
                                        <label htmlFor="pass" className="active">Mot de passe</label>

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

                                </div>

                                <div className="row">

                                    <div className="col m12 s12 flex-item justify-content-center">
                                        <LoadingButton
                                            className="waves-effect waves-light btn-small mb-1"
                                            style={{ height: "50px", backgroundColor: "#005081", width: "100%", marginTop: "3%" }}
                                            color="secondary"
                                            onClick={handleSubmit}
                                            loading={isLoading}
                                            loadingPosition="end"
                                            endIcon={<LoginIcon />}
                                            variant="contained"
                                        >
                                            <span>Dévérouiller</span>
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
    )
}
const mapStateToProps = (state) => {
    return {
        isLocked: state.lockscreen.isLocked,
        user: state.lockscreen.user,
        lastActivity: state.lockscreen.lastActivity,


    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLastActivity: () => {
            dispatch(setLastActivity(Date.now()));
        },
        unlocked: () => {
            dispatch(unlocked());
        },
        locked: () => {
            dispatch(locked());
        },
        setUser: () => {
            dispatch(setUser(localStorage.getItem("app-user")));
        },

        setLocked: (err) => {
            dispatch(setLocked(localStorage.getItem("app-user")));
        },
        setUnlocked: (id) => {
            dispatch(setUnlocked());
        },
        authenticate: () => dispatch(authenticate()),
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        isAuth: (etat) => {
            dispatch(isAuth(etat))
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Lockscreen);