

import { notify } from "../Utils/alert"
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage, today } from "../Utils/utils";
import { HOST } from "../Utils/globals";
import axios from "axios";
const CHECKTOKEN_API = HOST + "api/v1/auth/check/token"
export const userAuthDetail = (token) => {
    const config = {
        method: 'get',
        url: CHECKTOKEN_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loadItemFromSessionStorage("token")}`

        }
    };
    return axios(config);
}

export const saveAuthDataToLocal = (data) => {
    saveItemToSessionStorage(1, 'logged')
    saveItemToSessionStorage(1, 'app-mode')

    data.user ? saveItemToSessionStorage(JSON.stringify(data.user), 'app-user') : saveItemToSessionStorage([], 'app-user');

    const _modules = data.settings.modules || [];

    // Couleurs institution si module appearance actif
    if (_modules.includes('appearance') && data.settings.appearance?.sidebarColor) {
        window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
            detail: { sidebarColor: data.settings.appearance.sidebarColor, topbarColor: data.settings.appearance.topbarColor }
        }));
    }

    data.settings.institution ? saveItemToSessionStorage(JSON.stringify(data.settings.institution), 'app-institution') : saveItemToSessionStorage([], 'app-institution');
    data.settings.mail ? saveItemToSessionStorage(JSON.stringify(data.settings.mail), 'app-mail') : saveItemToSessionStorage([], 'app-mail');
    data.settings.sms ? saveItemToSessionStorage(JSON.stringify(data.settings.sms), 'app-sms') : saveItemToSessionStorage([], 'app-sms');
    data.settings.bot ? saveItemToSessionStorage(JSON.stringify(data.settings.bot), 'app-bot') : saveItemToSessionStorage([], 'app-bot');
    data.settings.languages ? saveItemToSessionStorage(JSON.stringify(data.settings.languages), 'app-langues') : saveItemToSessionStorage([], 'app-langues');
    data.settings.externalRecourses ? saveItemToSessionStorage(JSON.stringify(data.settings.externalRecourses), 'app-recours') : saveItemToSessionStorage([], 'app-recours');
    data.settings.servicePoints ? saveItemToSessionStorage(JSON.stringify(data.settings.servicePoints), 'app-ps') : saveItemToSessionStorage([], 'app-ps');
    data.settings.collectionChannels ? saveItemToSessionStorage(JSON.stringify(data.settings.collectionChannels), 'app-supports') : saveItemToSessionStorage([], 'app-supports');
    data.settings.objets ? saveItemToSessionStorage(JSON.stringify(data.settings.objets), 'app-objets') : saveItemToSessionStorage([], 'app-objets');
    data.settings.categorie_objet ? saveItemToSessionStorage(JSON.stringify(data.settings.categorie_objet), 'app-categories') : saveItemToSessionStorage([], 'app-categories');
    data.settings.postes ? saveItemToSessionStorage(JSON.stringify(data.settings.postes), 'app-postes') : saveItemToSessionStorage([], 'app-postes');
    data.settings.users ? saveItemToSessionStorage(JSON.stringify(data.settings.users), 'app-users') : saveItemToSessionStorage([], 'app-users');
    data.settings.products ? saveItemToSessionStorage(JSON.stringify(data.settings.products), 'app-produits') : saveItemToSessionStorage([], 'app-produits');
    data.settings.help ? saveItemToSessionStorage(JSON.stringify(data.settings.help), 'help') : saveItemToSessionStorage([], 'help');
    saveItemToSessionStorage(JSON.stringify(_modules), 'app-modules');
    if (_modules.includes('appearance') && data.settings.appearance) {
        saveItemToSessionStorage(JSON.stringify(data.settings.appearance), 'app-appearance');
    } else {
        sessionStorage.removeItem('app-appearance');
    }

    //enregistrement dans le local storage
    saveItemToLocalStorage(1, 'logged')
    saveItemToLocalStorage(1, 'app-mode')

    data.user ? saveItemToLocalStorage(JSON.stringify(data.user), 'app-user') : saveItemToLocalStorage([], 'app-user');
    data.settings.institution ? saveItemToLocalStorage(JSON.stringify(data.settings.institution), 'app-institution') : saveItemToLocalStorage([], 'app-institution');
    data.settings.mail ? saveItemToLocalStorage(JSON.stringify(data.settings.mail), 'app-mail') : saveItemToLocalStorage([], 'app-mail');
    data.settings.sms ? saveItemToLocalStorage(JSON.stringify(data.settings.sms), 'app-sms') : saveItemToLocalStorage([], 'app-sms');
    data.settings.bot ? saveItemToLocalStorage(JSON.stringify(data.settings.bot), 'app-bot') : saveItemToLocalStorage([], 'app-bot');
    data.settings.languages ? saveItemToLocalStorage(JSON.stringify(data.settings.languages), 'app-langues') : saveItemToLocalStorage([], 'app-langues');
    data.settings.externalRecourses ? saveItemToLocalStorage(JSON.stringify(data.settings.externalRecourses), 'app-recours') : saveItemToLocalStorage([], 'app-recours');
    data.settings.servicePoints ? saveItemToLocalStorage(JSON.stringify(data.settings.servicePoints), 'app-ps') : saveItemToLocalStorage([], 'app-ps');
    data.settings.collectionChannels ? saveItemToLocalStorage(JSON.stringify(data.settings.collectionChannels), 'app-supports') : saveItemToLocalStorage([], 'app-supports');
    data.settings.objets ? saveItemToLocalStorage(JSON.stringify(data.settings.objets), 'app-objets') : saveItemToLocalStorage([], 'app-objets');
    data.settings.categorie_objet ? saveItemToLocalStorage(JSON.stringify(data.settings.categorie_objet), 'app-categories') : saveItemToLocalStorage([], 'app-categories');
    data.settings.postes ? saveItemToLocalStorage(JSON.stringify(data.settings.postes), 'app-postes') : saveItemToLocalStorage([], 'app-postes');
    data.settings.users ? saveItemToLocalStorage(JSON.stringify(data.settings.users), 'app-users') : saveItemToLocalStorage([], 'app-users');
    data.settings.products ? saveItemToLocalStorage(JSON.stringify(data.settings.products), 'app-produits') : saveItemToLocalStorage([], 'app-produits');
    data.settings.help ? saveItemToLocalStorage(JSON.stringify(data.settings.help), 'help') : saveItemToLocalStorage([], 'help');
    saveItemToLocalStorage(JSON.stringify(_modules), 'app-modules');
    if (_modules.includes('appearance') && data.settings.appearance) {
        saveItemToLocalStorage(JSON.stringify(data.settings.appearance), 'app-appearance');
    } else {
        localStorage.removeItem('app-appearance');
    }

}