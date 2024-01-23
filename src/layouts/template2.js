import React from 'react'
import { Suspense } from "react";
import { HashRouter } from "react-router-dom";
import Haut from './Haut';
import Footer from './Footer';

export default function Template2() { 
    return (
        
        <Suspense fallback="loading">
            <HashRouter>
               <Haut/>
               <Footer />
            </HashRouter>
           
        </Suspense>
    );
    
}
 
