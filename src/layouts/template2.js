import React from 'react'
import { Suspense } from "react";
import { HashRouter } from "react-router-dom";
import Haut from './Haut';
import Footer from './Footer';
// import { IdleTimerProvider } from 'react-idle-timer';
// import { useReactInactivity } from 'react-inactivity';

export default function Template2() { 
    // const {isIdeal} = useReactInactivity({minute:0.5})
    return (
        
        <Suspense fallback="loading">
            <HashRouter>
               <Haut/>
            </HashRouter>
        </Suspense>
    );
    
}
 
