import React, { useEffect, useState } from "react";
import { isAuth } from "../redux/actions/LayoutActions";

// import {claimColorChanged, denunColorChanged} from "../redux/actions/alert/headerActions"

import { loadItemFromSessionStorage, sleep } from "../Utils/utils";
import Alert, { notify } from "../Utils/alert";
import Template2 from "./template2";
import { connect } from "react-redux";
import { saveAuthDataToLocal, userAuthDetail } from "../apis/CheckToken";
import Login from "../pages/Auth/Login";
import Auth from "../pages/Auth/Auth";
import Modal from "../Utils/modal";

const Layout = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (loadItemFromSessionStorage("logged") === 1 && isSuccess) {
      if (!props.isAuthenticated) {
        props.authenticate();
      }
    }
  }, [props]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    getUserData();
  }, ["token"]);

  const getUserData = async () => {
    await sleep(3000);
    if (token) {
      setIsLoading(true);

      userAuthDetail(token)
        .then(({ data }) => {
          saveAuthDataToLocal(data.content);
          setIsSuccess(true);

          props.isAuth(true);
        })
        .catch((err) => {
          setIsSuccess(false);

          props.isAuth(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      localStorage.clear();
      sessionStorage.clear();
      setIsSuccess(false);
      setIsLoading(false);
      props.isAuth(false);
    }
  };

  useEffect(() => {
    if (showMessage) {
      notify(message, isSuccess ? "success" : "error");
    }
  }, [isSuccess, message, showMessage]);

  return (
    <>
      <Alert />
      <Modal />
      {isLoading ? (
        <>
          <div
            style={{
              width: "100vw",
              height: "100vh",
              backgroundColor: "#005081",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span className="loaderAlby"></span>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>
              En cours de chargement ...{" "}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 300, color: "gray" }}>
              Patientez s'il vous plait{" "}
            </div>
          </div>
        </>
      ) : props.isAuthenticated ? (
        <Template2 />
      ) : (
        // <Login />
        <Auth />
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.layout.isAuthenticated,
    isLoading: state.layout.isLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    isAuth: (data) => dispatch(isAuth(data)),
    // updateClaimColor:(item)=>{
    //   dispatch(claimColorChanged(item))
    // },
    // updateDenunColor:(item)=>{
    //     dispatch(denunColorChanged(item))
    // }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
