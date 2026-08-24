

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

    data.user ? saveItemToSessionStorage(data.user, 'app-user') : saveItemToSessionStorage([], 'app-user');

    const _modules = data.settings.modules || [];

    // Logo toujours depuis l'institution (source de vérité unique)
    const _institutionLogo = data.settings.institution?.logo || null;

    // Couleurs depuis appearance ; logo depuis institution
    if (_modules.includes('appearance') && data.settings.appearance?.sidebarColor) {
        window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
            detail: { sidebarColor: data.settings.appearance.sidebarColor, topbarColor: data.settings.appearance.topbarColor, logo: _institutionLogo }
        }));
    }

    data.settings.institution ? saveItemToSessionStorage(data.settings.institution, 'app-institution') : saveItemToSessionStorage([], 'app-institution');
    data.settings.mail ? saveItemToSessionStorage(data.settings.mail, 'app-mail') : saveItemToSessionStorage([], 'app-mail');
    data.settings.sms ? saveItemToSessionStorage(data.settings.sms, 'app-sms') : saveItemToSessionStorage([], 'app-sms');
    data.settings.bot ? saveItemToSessionStorage(data.settings.bot, 'app-bot') : saveItemToSessionStorage([], 'app-bot');
    data.settings.languages ? saveItemToSessionStorage(data.settings.languages, 'app-langues') : saveItemToSessionStorage([], 'app-langues');
    data.settings.externalRecourses ? saveItemToSessionStorage(data.settings.externalRecourses, 'app-recours') : saveItemToSessionStorage([], 'app-recours');
    data.settings.servicePoints ? saveItemToSessionStorage(data.settings.servicePoints, 'app-ps') : saveItemToSessionStorage([], 'app-ps');
    data.settings.collectionChannels ? saveItemToSessionStorage(data.settings.collectionChannels, 'app-supports') : saveItemToSessionStorage([], 'app-supports');
    data.settings.objets ? saveItemToSessionStorage(data.settings.objets, 'app-objets') : saveItemToSessionStorage([], 'app-objets');
    data.settings.categorie_objet ? saveItemToSessionStorage(data.settings.categorie_objet, 'app-categories') : saveItemToSessionStorage([], 'app-categories');
    data.settings.postes ? saveItemToSessionStorage(data.settings.postes, 'app-postes') : saveItemToSessionStorage([], 'app-postes');
    data.settings.users ? saveItemToSessionStorage(data.settings.users, 'app-users') : saveItemToSessionStorage([], 'app-users');
    data.settings.products ? saveItemToSessionStorage(data.settings.products, 'app-produits') : saveItemToSessionStorage([], 'app-produits');
    data.settings.help ? saveItemToSessionStorage(data.settings.help, 'help') : saveItemToSessionStorage([], 'help');
    saveItemToSessionStorage(_modules, 'app-modules');
    if (data.settings.appearance) {
        saveItemToSessionStorage(data.settings.appearance, 'app-appearance');
    }

    //enregistrement dans le local storage
    saveItemToLocalStorage(1, 'logged')
    saveItemToLocalStorage(1, 'app-mode')

    data.user ? saveItemToLocalStorage(data.user, 'app-user') : saveItemToLocalStorage([], 'app-user');
    data.settings.institution ? saveItemToLocalStorage(data.settings.institution, 'app-institution') : saveItemToLocalStorage([], 'app-institution');
    data.settings.mail ? saveItemToLocalStorage(data.settings.mail, 'app-mail') : saveItemToLocalStorage([], 'app-mail');
    data.settings.sms ? saveItemToLocalStorage(data.settings.sms, 'app-sms') : saveItemToLocalStorage([], 'app-sms');
    data.settings.bot ? saveItemToLocalStorage(data.settings.bot, 'app-bot') : saveItemToLocalStorage([], 'app-bot');
    data.settings.languages ? saveItemToLocalStorage(data.settings.languages, 'app-langues') : saveItemToLocalStorage([], 'app-langues');
    data.settings.externalRecourses ? saveItemToLocalStorage(data.settings.externalRecourses, 'app-recours') : saveItemToLocalStorage([], 'app-recours');
    data.settings.servicePoints ? saveItemToLocalStorage(data.settings.servicePoints, 'app-ps') : saveItemToLocalStorage([], 'app-ps');
    data.settings.collectionChannels ? saveItemToLocalStorage(data.settings.collectionChannels, 'app-supports') : saveItemToLocalStorage([], 'app-supports');
    data.settings.objets ? saveItemToLocalStorage(data.settings.objets, 'app-objets') : saveItemToLocalStorage([], 'app-objets');
    data.settings.categorie_objet ? saveItemToLocalStorage(data.settings.categorie_objet, 'app-categories') : saveItemToLocalStorage([], 'app-categories');
    data.settings.postes ? saveItemToLocalStorage(data.settings.postes, 'app-postes') : saveItemToLocalStorage([], 'app-postes');
    data.settings.users ? saveItemToLocalStorage(data.settings.users, 'app-users') : saveItemToLocalStorage([], 'app-users');
    data.settings.products ? saveItemToLocalStorage(data.settings.products, 'app-produits') : saveItemToLocalStorage([], 'app-produits');
    data.settings.help ? saveItemToLocalStorage(data.settings.help, 'help') : saveItemToLocalStorage([], 'help');
    saveItemToLocalStorage(_modules, 'app-modules');
    if (data.settings.appearance) {
        saveItemToLocalStorage(data.settings.appearance, 'app-appearance');
    }

}