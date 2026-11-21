import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
//import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/materialize.css';
import './assets/css/style.css';
import './assets/css/custom.css';
// Tailwind chargé EN DERNIER pour passer au-dessus de Materialize
import './index.css';
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

// Copie de l'application sur l'appareil (public/sw-gpr.js) : sans internet, la page de connexion s'ouvre
// quand même et le mode hors ligne est utilisable (il faut avoir ouvert l'application une fois en ligne).
// L'ancien public/sw.js, bugué (il interceptait aussi l'API et cassait la connexion), est retiré s'il est
// encore enregistré dans un navigateur, avec ses anciennes copies. Le service worker des notifications
// (firebase-messaging-sw.js) est laissé en place.
const SW_GPR = "sw-gpr.js";
const estGarde = (url) => url.endsWith("/" + SW_GPR) || url.includes("firebase-messaging-sw");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      const script = (registration.active || registration.waiting || registration.installing)?.scriptURL || "";
      if (!estGarde(script)) {
        registration.unregister();
      }
    });
  });
  // Seulement sur l'application construite (npm run build) : en développement, la copie gênerait le rechargement.
  if (process.env.NODE_ENV === "production") {
    const enregistrer = () =>
      navigator.serviceWorker.register("./" + SW_GPR).catch((e) => console.warn("Copie hors ligne indisponible :", e));
    if (document.readyState === "complete") {
      enregistrer();
    } else {
      window.addEventListener("load", enregistrer);
    }
  }
}
if ("caches" in window) {
  caches.keys().then((names) => names.filter((n) => !n.startsWith("gpr-app-")).forEach((n) => caches.delete(n)));
}

// Purge ponctuelle des entrées de test écrites par une version antérieure du
// code (Phase 1 du chantier offline) dans les navigateurs déjà utilisés pour
// tester — sans `payload`, elles faisaient planter l'affichage des listes.
// Sans effet si la base est déjà propre (ce sera le cas pour tout le monde
// après ce premier passage).
import("./offline/draftRecordsStore").then(({ purgeInvalidDraftRecords }) => {
  purgeInvalidDraftRecords();
});

// Reprise après interruption (fermeture du navigateur en cours de synchro,
// cf. audit section 7) : toute entrée sync_queue restée à SYNCING au
// chargement de l'app est forcément une synchro qui n'a jamais pu se
// terminer — on la remet en PENDING pour qu'elle soit reprise au prochain
// passage du Sync Manager (Phase 5).
import("./offline/syncQueue").then(({ recoverStuckSyncingEntries }) => {
  recoverStuckSyncingEntries();
});

// La synchronisation ne se déclenche plus sur un simple événement "online"
// du navigateur ni au chargement de l'app (décision explicite) : elle se
// déclenche uniquement quand l'utilisateur SE CONNECTE en mode Online
// (LoginApi.js le redirige alors vers la page Synchronisation, qui lance
// elle-même runSync()), ou manuellement via le bouton de cette page.

