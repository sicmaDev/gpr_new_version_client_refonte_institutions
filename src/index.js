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

// public/sw.js n'est normalement jamais enregistré par le code actuel
// (swDev() ci-dessus est un no-op, son corps est commenté) — mais un
// navigateur peut avoir gardé l'enregistrement d'une ancienne version de
// l'app où il l'était. Ce service worker bugué (une promesse non résolue
// dans son handler fetch) intercepte alors TOUTES les requêtes, y compris
// vers l'API backend (localhost:8080), cassant le login avec des erreurs
// CORS/500 qui n'ont rien à voir avec le serveur. On le désenregistre
// proactivement pour ne pas laisser ce piège actif indéfiniment.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}
if ("caches" in window) {
  caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
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

