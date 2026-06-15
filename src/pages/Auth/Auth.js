import React, { Suspense, useEffect, useState } from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

// import LandingPage from "../Landign";
import Login from "./Login";
import SignCompteUser from "./SignUser";
import ForgotPassword from "./ForgotPassword";
const Auth = () => {
  return (
    <>
      <Suspense fallback="loading">
        <HashRouter>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/SignUser" component={SignCompteUser} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/" component={Login} />
          </Switch>
        </HashRouter>
      </Suspense>
    </>
  );
};

export default Auth;
