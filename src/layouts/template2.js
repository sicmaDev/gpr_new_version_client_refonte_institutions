import React from 'react'
import { Suspense } from "react";
import { HashRouter } from "react-router-dom";
import Haut from './Haut';
import Footer from './Footer';
// import { IdleTimerProvider } from 'react-idle-timer';

export default function Template2() { 
    // const onIdle = ()=>{
    //     console.log("je teste")
    // }
    return (
        
        <Suspense fallback="loading">
            {/* <IdleTimerProvider timeout={1000*10} onIdle={onIdle} > */}
            <HashRouter>
                
               <Haut/>
               {/* <Footer /> */}
            </HashRouter>
            {/* </IdleTimerProvider> */}
        </Suspense>
    );
    
}
 
