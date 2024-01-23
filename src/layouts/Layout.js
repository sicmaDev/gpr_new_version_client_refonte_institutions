import React, {useEffect} from "react";
import {authenticate} from "../redux/actions/LayoutActions";


// import {claimColorChanged, denunColorChanged} from "../redux/actions/alert/headerActions"

import {saveItemToLocalStorage, loadItemFromLocalStorage, loadItemFromSessionStorage} from "../Utils/utils"
import Alert from "../Utils/alert";
import Modal from "../Utils/modal";
import Template2 from "./template2";
import Login from "../pages/Login";
import { connect } from "react-redux";

// import { alertClaimColorCheckApi, alertDenunColorCheckApi } from "../apis/alertApi";


const Layout = (props) => {
    

    useEffect(() => {

        if(loadItemFromSessionStorage('logged')===1){
            if(!props.isAuthenticated){
                props.authenticate()
            }
        
        }

    }, [props]);
    const scene = props.isAuthenticated ? <Template2 /> :<Login/>
    return (
        <>
            <Alert />
            <Modal />
            {scene}
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.layout.isAuthenticated,
        isLoading: state.layout.isLoading,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        authenticate: () => dispatch(authenticate()),
        // updateClaimColor:(item)=>{
        //   dispatch(claimColorChanged(item))
        // },
        // updateDenunColor:(item)=>{
        //     dispatch(denunColorChanged(item))
        // }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Layout)