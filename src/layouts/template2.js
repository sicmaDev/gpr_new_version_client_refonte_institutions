import React, { useEffect } from 'react'
import { Suspense } from "react";
import { HashRouter } from "react-router-dom";
import Haut from './Haut';
import Footer from './Footer';
import { connect } from 'react-redux';
import { locked, setLastActivity, setLocked, setUnlocked, setUser, unlocked } from '../redux/actions/LockscreenActions';
import Lockscreen from '../pages/Lockscreen';
import { LOCKSCREEN_TIMEOUT } from '../Utils/globals';
// import { IdleTimerProvider } from 'react-idle-timer';
// import { useReactInactivity } from 'react-inactivity';

function Template2(props) {

    // const [isLocked, setIsLocked] = useState(() => {

    //     return localStorage.getItem("isLocked") == true
    //   })
    //   const [lastDate, setLastDate] = useState(Date.now())



    // useEffect(() => {
    //     const resetTimeout = () => {
    //         props.setLastActivity(Date.now())
    //     }
    //     window.addEventListener("mousemove", resetTimeout)

    //     const interval = setInterval(() => {
    //         if (Date.now() - props.lastActivity > LOCKSCREEN_TIMEOUT) {
    //             if (localStorage.getItem("token")) {
    //                 props.setUser()
    //                 props.setLocked()
    //                 localStorage.clear()
    //                 localStorage.setItem("isLocked", true)
    //             }

    //         }
    //     }, 10000)
    //     return () => {
    //         window.removeEventListener("mousemove", resetTimeout)
    //         clearInterval(interval)
    //     }
    // }, [props, props.lastActivity])
    // const {isIdeal} = useReactInactivity({minute:0.5})
    return (

            <Suspense fallback="loading">
                    <HashRouter>
                    {props.isLocked ? (<Lockscreen />) :
                    ( <Haut />)}
                    </HashRouter>
                </Suspense>
    
    );

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
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Template2);

