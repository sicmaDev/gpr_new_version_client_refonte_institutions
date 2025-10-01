import React, { Suspense, useEffect, useState } from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

// import LandingPage from "../Landign";
import Login from "./Login";
import SignCompteUser from "./SignUser";
const Auth = () => {
  return (
    <>
      <Suspense fallback="loading">
        <HashRouter>
          <Switch>
            <Route path="/login" component={Login} /> 
            <Route path="/SignUser" component={SignCompteUser} />
            <Route path="/" component={Login} />
          </Switch>
        </HashRouter>
      </Suspense>
    </>
  );
};

export default Auth;
