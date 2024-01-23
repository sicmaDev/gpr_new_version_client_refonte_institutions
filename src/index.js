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

// ReactDOM.render(
//   <React.StrictMode >
//     <App />
//     {/* <Login /> */}
//   </React.StrictMode>,
//   document.getElementById('root')
// );
const root = ReactDOM.createRoot(document.getElementById("root"));
document.getElementById("root").style.overflowY = "hidden";
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
swDev();