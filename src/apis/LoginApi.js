import axios from "axios";
import { notify } from "../Utils/alert"
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage, today } from "../Utils/utils";
import { HOST } from "../Utils/globals";
import { now } from "jquery";

//console.log("HOST LOGIN: " + HOST)
const LOGIN_API = HOST + "api/v1/auth/authenticate"
const RECEIVE_DATA_API = HOST + "api/v1/sync/allList"
const SYNCHRON_DATA_API = HOST + "api/v1/sync/claim"
const READ_LICENSE_INFO = HOST + "api/v1/auth/infoLicense";
const FORGET_PASSWORD_API = HOST + "api/v1/auth/forget/password";

export const forgetPassword = (email) => {
    const config = {
        method: 'post',
        url: FORGET_PASSWORD_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        data: { email }
    };
    return axios(config);
}

export const LoginApi = (credentials, props, isLocked = false) => {
    const config = {
        method: 'post',
        url: LOGIN_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        data: credentials
    };
    axios(config)
        .then(function (response) {

            if (response.data.response.status) {

                props.authenticate()
                if (isLocked) {
                    localStorage.removeItem("isLocked")
                    props.setUnlocked()
                    props.isAuth(true)


                } else {
                    notify("Bravo - Vous êtes authentifié", "success");
                }
                //  console.log("loginresponse",response.data.response.content.settings)
                //enregistrement dans la session storage
                saveItemToSessionStorage(response.data.response.content.token, 'token')
                saveItemToSessionStorage(1, 'logged')
                saveItemToSessionStorage(1, 'app-mode')

                response.data.response.content.user ? saveItemToSessionStorage(response.data.response.content.user, 'app-user') : saveItemToSessionStorage([], 'app-user');

                // Notify ThemeColorsContext to apply colors saved in DB
                const _s = response.data.response.content.settings;
                const _u = response.data.response.content.user;
                const _modules = _s.modules || [];

                // Couleurs + logo institution si module appearance actif
                if (_modules.includes('appearance') && _s.appearance?.sidebarColor) {
                    window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
                        detail: { sidebarColor: _s.appearance.sidebarColor, topbarColor: _s.appearance.topbarColor, logo: _s.appearance.logo || null }
                    }));
                }

                // sessionStorage
                _s.institution ? saveItemToSessionStorage(_s.institution, 'app-institution') : saveItemToSessionStorage([], 'app-institution');
                _s.mail ? saveItemToSessionStorage(_s.mail, 'app-mail') : saveItemToSessionStorage([], 'app-mail');
                _s.sms ? saveItemToSessionStorage(_s.sms, 'app-sms') : saveItemToSessionStorage([], 'app-sms');
                _s.bot ? saveItemToSessionStorage(_s.bot, 'app-bot') : saveItemToSessionStorage([], 'app-bot');
                _s.languages ? saveItemToSessionStorage(_s.languages, 'app-langues') : saveItemToSessionStorage([], 'app-langues');
                _s.externalRecourses ? saveItemToSessionStorage(_s.externalRecourses, 'app-recours') : saveItemToSessionStorage([], 'app-recours');
                _s.servicePoints ? saveItemToSessionStorage(_s.servicePoints, 'app-ps') : saveItemToSessionStorage([], 'app-ps');
                _s.collectionChannels ? saveItemToSessionStorage(_s.collectionChannels, 'app-supports') : saveItemToSessionStorage([], 'app-supports');
                _s.objets ? saveItemToSessionStorage(_s.objets, 'app-objets') : saveItemToSessionStorage([], 'app-objets');
                _s.categorie_objet ? saveItemToSessionStorage(_s.categorie_objet, 'app-categories') : saveItemToSessionStorage([], 'app-categories');
                _s.postes ? saveItemToSessionStorage(_s.postes, 'app-postes') : saveItemToSessionStorage([], 'app-postes');
                _s.users ? saveItemToSessionStorage(_s.users, 'app-users') : saveItemToSessionStorage([], 'app-users');
                _s.products ? saveItemToSessionStorage(_s.products, 'app-produits') : saveItemToSessionStorage([], 'app-produits');
                _s.help ? saveItemToSessionStorage(_s.help, 'help') : saveItemToSessionStorage([], 'help');
                saveItemToSessionStorage(_modules, 'app-modules');
                if (_s.appearance) {
                    saveItemToSessionStorage(_s.appearance, 'app-appearance');
                }

                //enregistrement dans le local storage
                saveItemToLocalStorage(response.data.response.content.token, 'token')
                saveItemToLocalStorage(1, 'logged')
                saveItemToLocalStorage(1, 'app-mode')

                _u ? saveItemToLocalStorage(_u, 'app-user') : saveItemToLocalStorage([], 'app-user');
                _s.institution ? saveItemToLocalStorage(_s.institution, 'app-institution') : saveItemToLocalStorage([], 'app-institution');
                _s.mail ? saveItemToLocalStorage(_s.mail, 'app-mail') : saveItemToLocalStorage([], 'app-mail');
                _s.sms ? saveItemToLocalStorage(_s.sms, 'app-sms') : saveItemToLocalStorage([], 'app-sms');
                _s.bot ? saveItemToLocalStorage(_s.bot, 'app-bot') : saveItemToLocalStorage([], 'app-bot');
                _s.languages ? saveItemToLocalStorage(_s.languages, 'app-langues') : saveItemToLocalStorage([], 'app-langues');
                _s.externalRecourses ? saveItemToLocalStorage(_s.externalRecourses, 'app-recours') : saveItemToLocalStorage([], 'app-recours');
                _s.servicePoints ? saveItemToLocalStorage(_s.servicePoints, 'app-ps') : saveItemToLocalStorage([], 'app-ps');
                _s.collectionChannels ? saveItemToLocalStorage(_s.collectionChannels, 'app-supports') : saveItemToLocalStorage([], 'app-supports');
                _s.objets ? saveItemToLocalStorage(_s.objets, 'app-objets') : saveItemToLocalStorage([], 'app-objets');
                _s.categorie_objet ? saveItemToLocalStorage(_s.categorie_objet, 'app-categories') : saveItemToLocalStorage([], 'app-categories');
                _s.postes ? saveItemToLocalStorage(_s.postes, 'app-postes') : saveItemToLocalStorage([], 'app-postes');
                _s.users ? saveItemToLocalStorage(_s.users, 'app-users') : saveItemToLocalStorage([], 'app-users');
                _s.products ? saveItemToLocalStorage(_s.products, 'app-produits') : saveItemToLocalStorage([], 'app-produits');
                _s.help ? saveItemToLocalStorage(_s.help, 'help') : saveItemToLocalStorage([], 'help');
                saveItemToLocalStorage(_modules, 'app-modules');
                if (_s.appearance) {
                    saveItemToLocalStorage(_s.appearance, 'app-appearance');
                }

            } else {
                const msg = response.data?.response?.content?.message;
                notify(msg || "Erreur - La connexion a échouée", "error");
            }

            // console.log(JSON.parse(response.data.data));
            props.etatChanged(false)
            if (response.data.response.status) {
                synchronData();
            }
            // receiveData()

        })
        .catch(function (error) {
            console.log("LOGIN ERROR RESPONSE:", error?.response?.data);
            props.etatChanged(false)
            saveItemToSessionStorage(0, 'logged')
            //    console.log("loginerror",error)
            if (error?.response) {
                const status = error.response.status;
                const raw = error.response.data?.response?.content?.message
                    || error.response.data?.message;
                const isGeneric = !raw || raw === "Access Denied" || raw === "Forbidden" || raw === "Unauthorized";
                const message = isGeneric
                    ? (status === 403 || status === 401
                        ? "Mot de passe ou adresse e-mail incorrect(e)"
                        : "Erreur - La connexion a échouée")
                    : raw;
                notify(message, "error");
            } else {
                notify("Impossible de joindre le serveur. Vérifiez votre connexion.", "error");
            }

        });
}

export const licenseInfo = async () => {
    try {
        const response = await axios.post(READ_LICENSE_INFO, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Authorization': loadItemFromSessionStorage('tok')
            }
        });

        if (response.data.status === false) {
            // notify(response.data.content.message, "error");
            return false;
        } else {
            // console.log("licence info demande", response.data);
            response.data.content.actif ? saveItemToLocalStorage(response.data.content.actif, 'lic') : saveItemToLocalStorage(false, 'lic');

            return response.data.content;

        }

    } catch (error) {
        // console.log("licence info error", error);
        // Gérer les erreurs ici si nécessaire
        throw error;
    }
}


export const LoginApiOffline = (credentials, props) => {
    // loadItemFromLocalStorage() parse déjà le JSON en interne — le repasser dans
    // JSON.parse() ici plantait systématiquement (JSON.parse d'un objet, pas d'une
    // chaîne), ce qui empêchait toute connexion en mode offline.
    let user = loadItemFromLocalStorage("app-user");
    props.etatChanged(false)

    if (!user) {
        notify("Erreur - Vous devez vous connecter au moins une fois en ligne avant de pouvoir utiliser le mode offline.", "error");
        return;
    }

    if (user.email === credentials.email) {
        // if (etatR === true || etatD === true || etatS === true) {
        //     notify("Erreur - Vous devez vous reconnectez en Online pour une mise à jour des données !", "error");
        // } else {

        saveItemToSessionStorage(1, 'logged')
        saveItemToLocalStorage(1, 'logged')
        saveItemToSessionStorage(0, 'app-mode')
        saveItemToLocalStorage(0, 'app-mode')
        props.authenticate()
        notify("Bravo - Vous êtes authentifié", "success");
        (loadItemFromLocalStorage("app-user")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-user"), 'app-user') : saveItemToSessionStorage([], 'app-user');
        (loadItemFromLocalStorage("app-institution")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-institution"), 'app-institution') : saveItemToSessionStorage([], 'app-institution');
        (loadItemFromLocalStorage("app-mail")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-mail"), 'app-mail') : saveItemToSessionStorage([], 'app-mail');
        (loadItemFromLocalStorage("app-sms")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-sms"), 'app-sms') : saveItemToSessionStorage([], 'app-sms');
        (loadItemFromLocalStorage("app-bot")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-bot"), 'app-bot') : saveItemToSessionStorage([], 'app-bot');
        (loadItemFromLocalStorage("app-langues")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-langues"), 'app-langues') : saveItemToSessionStorage([], 'app-langues');
        (loadItemFromLocalStorage("app-recours")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-recours"), 'app-recours') : saveItemToSessionStorage([], 'app-recours');
        (loadItemFromLocalStorage("app-ps")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-ps"), 'app-ps') : saveItemToSessionStorage([], 'app-ps');
        (loadItemFromLocalStorage("app-supports")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-supports"), 'app-supports') : saveItemToSessionStorage([], 'app-supports');
        (loadItemFromLocalStorage("app-objets")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-objets"), 'app-objets') : saveItemToSessionStorage([], 'app-objets');
        (loadItemFromLocalStorage("app-categories")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-categories"), 'app-categories') : saveItemToSessionStorage([], 'app-categories');
        (loadItemFromLocalStorage("app-postes")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-postes"), 'app-postes') : saveItemToSessionStorage([], 'app-postes');
        (loadItemFromLocalStorage("app-users")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-users"), 'app-users') : saveItemToSessionStorage([], 'app-users');
        (loadItemFromLocalStorage("app-produits")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-produits"), 'app-produits') : saveItemToSessionStorage([], 'app-produits');
        (loadItemFromLocalStorage("help")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("help"), 'help') : saveItemToSessionStorage([], 'help');
        saveItemToSessionStorage(loadItemFromLocalStorage("token"), 'token')
        // }
    } else {
        notify("Erreur - Les identifiants sont incorrects. Si vous voulez vous connectez à un autre compte, passez au mode online !", "error");
    }


}

export const receiveData = () => {
    const config = {
        method: 'GET',
        url: RECEIVE_DATA_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },

    };
    axios(config)
        .then(function (response) {
            // console.log("receivdataresponse",response)
            if (response.data.status) {
                response.data.content.claimDto ? saveItemToLocalStorage(response.data.content.claimDto, 'recs-TS') : saveItemToLocalStorage([], 'recs-TS');
                response.data.content.denunDto ? saveItemToLocalStorage(response.data.content.denunDto, 'dens-TS') : saveItemToLocalStorage([], 'dens-TS');
                response.data.content.suggestionDto ? saveItemToLocalStorage(response.data.content.suggestionDto, 'sugs-TS') : saveItemToLocalStorage([], 'sugs-TS');
            }

        })
        .catch(function (error) {
            //    console.log("receivdataerror",error)

        });
}

export const synchronData = () => {
    let data = {};
    data["claims"] = loadItemFromLocalStorage("recs-TS") !== undefined ? loadItemFromLocalStorage("recs-TS") : []
    data["denuns"] = loadItemFromLocalStorage("dens-TS") !== undefined ? loadItemFromLocalStorage("dens-TS") : []
    data["suggestions"] = loadItemFromLocalStorage("sugs-TS") !== undefined ? loadItemFromLocalStorage("sugs-TS") : []
    // console.log("datasyncitems",data)
    const config = {
        method: 'POST',
        url: SYNCHRON_DATA_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    axios(config)
        .then(function (response) {
            // console.log("SYNCHRON",response)
            receiveData();

        })
        .catch(function (error) {
            // console.log("SYNCHRONerror",error)

        });
}


