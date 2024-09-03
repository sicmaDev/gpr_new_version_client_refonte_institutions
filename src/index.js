import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/materialize.css';
import './assets/css/style.css';
import './assets/css/custom.css';
import reportWebVitals from "./reportWebVitals";
import swDev from './swDev'
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
import en from './lang/en.json';
import fr from './lang/fr.json';
import es from './lang/es.json';


// ReactDOM.render(
//   <React.StrictMode >
//     <App />
//     {/* <Login /> */}
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// i18n.use(initReactI18next).init({

  
//   resources:{
//     en,
//     fr,
//     es

//   },
//   lng:"fr",
//   fallbackLng:"fr",
//   interpolation:{
//     escapeValue:false,
//   },
// })
const root = ReactDOM.createRoot(document.getElementById("root"));
document.getElementById("root").style.overflowY = "hidden";
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
swDev();