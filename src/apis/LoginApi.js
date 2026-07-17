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

                response.data.response.content.user ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.user), 'app-user') : saveItemToSessionStorage([], 'app-user');

                // Notify ThemeColorsContext to apply colors saved in DB
                const _u = response.data.response.content.user;
                if (_u?.sidebarColor) {
                    window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
                        detail: { sidebarColor: _u.sidebarColor, topbarColor: _u.topbarColor }
                    }));
                }
                response.data.response.content.settings.institution ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.institution), 'app-institution') : saveItemToSessionStorage([], 'app-institution');
                response.data.response.content.settings.mail ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.mail), 'app-mail') : saveItemToSessionStorage([], 'app-mail');
                response.data.response.content.settings.sms ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.sms), 'app-sms') : saveItemToSessionStorage([], 'app-sms');
                response.data.response.content.settings.bot ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.bot), 'app-bot') : saveItemToSessionStorage([], 'app-bot');
                response.data.response.content.settings.languages ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.languages), 'app-langues') : saveItemToSessionStorage([], 'app-langues');
                response.data.response.content.settings.externalRecourses ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.externalRecourses), 'app-recours') : saveItemToSessionStorage([], 'app-recours');
                response.data.response.content.settings.servicePoints ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.servicePoints), 'app-ps') : saveItemToSessionStorage([], 'app-ps');
                response.data.response.content.settings.collectionChannels ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.collectionChannels), 'app-supports') : saveItemToSessionStorage([], 'app-supports');
                response.data.response.content.settings.objets ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.objets), 'app-objets') : saveItemToSessionStorage([], 'app-objets');
                response.data.response.content.settings.categorie_objet ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.categorie_objet), 'app-categories') : saveItemToSessionStorage([], 'app-categories');
                response.data.response.content.settings.postes ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.postes), 'app-postes') : saveItemToSessionStorage([], 'app-postes');
                response.data.response.content.settings.users ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.users), 'app-users') : saveItemToSessionStorage([], 'app-users');
                response.data.response.content.settings.products ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.products), 'app-produits') : saveItemToSessionStorage([], 'app-produits');
                response.data.response.content.settings.help ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.settings.help), 'help') : saveItemToSessionStorage([], 'help');



                //enregistrement dans le local storage
                saveItemToLocalStorage(response.data.response.content.token, 'token')
                saveItemToLocalStorage(1, 'logged')
                saveItemToLocalStorage(1, 'app-mode')

                response.data.response.content.user ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.user), 'app-user') : saveItemToLocalStorage([], 'app-user');
                response.data.response.content.settings.institution ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.institution), 'app-institution') : saveItemToLocalStorage([], 'app-institution');
                response.data.response.content.settings.mail ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.mail), 'app-mail') : saveItemToLocalStorage([], 'app-mail');
                response.data.response.content.settings.sms ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.sms), 'app-sms') : saveItemToLocalStorage([], 'app-sms');
                response.data.response.content.settings.bot ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.bot), 'app-bot') : saveItemToLocalStorage([], 'app-bot');
                response.data.response.content.settings.languages ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.languages), 'app-langues') : saveItemToLocalStorage([], 'app-langues');
                response.data.response.content.settings.externalRecourses ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.externalRecourses), 'app-recours') : saveItemToLocalStorage([], 'app-recours');
                response.data.response.content.settings.servicePoints ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.servicePoints), 'app-ps') : saveItemToLocalStorage([], 'app-ps');
                response.data.response.content.settings.collectionChannels ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.collectionChannels), 'app-supports') : saveItemToLocalStorage([], 'app-supports');
                response.data.response.content.settings.objets ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.objets), 'app-objets') : saveItemToLocalStorage([], 'app-objets');
                response.data.response.content.settings.categorie_objet ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.categorie_objet), 'app-categories') : saveItemToLocalStorage([], 'app-categories');
                response.data.response.content.settings.postes ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.postes), 'app-postes') : saveItemToLocalStorage([], 'app-postes');
                response.data.response.content.settings.users ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.users), 'app-users') : saveItemToLocalStorage([], 'app-users');
                response.data.response.content.settings.products ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.products), 'app-produits') : saveItemToLocalStorage([], 'app-produits');
                response.data.response.content.settings.help ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.settings.help), 'help') : saveItemToLocalStorage([], 'help');

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
    let user = loadItemFromLocalStorage("app-user") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-user")) : undefined;
    props.etatChanged(false)

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
                response.data.content.claimDto ? saveItemToLocalStorage(JSON.stringify(response.data.content.claimDto), 'recs-TS') : saveItemToLocalStorage([], 'recs-TS');
                response.data.content.denunDto ? saveItemToLocalStorage(JSON.stringify(response.data.content.denunDto), 'dens-TS') : saveItemToLocalStorage([], 'dens-TS');
                response.data.content.suggestionDto ? saveItemToLocalStorage(JSON.stringify(response.data.content.suggestionDto), 'sugs-TS') : saveItemToLocalStorage([], 'sugs-TS');
            }

        })
        .catch(function (error) {
            //    console.log("receivdataerror",error)

        });
}

export const synchronData = () => {
    let data = {};
    data["claims"] = loadItemFromLocalStorage("recs-TS") !== undefined ? JSON.parse(loadItemFromLocalStorage("recs-TS")) : []
    data["denuns"] = loadItemFromLocalStorage("dens-TS") !== undefined ? JSON.parse(loadItemFromLocalStorage("dens-TS")) : []
    data["suggestions"] = loadItemFromLocalStorage("sugs-TS") !== undefined ? JSON.parse(loadItemFromLocalStorage("sugs-TS")) : []
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


