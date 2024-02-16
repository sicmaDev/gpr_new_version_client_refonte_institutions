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

export const LoginApi = (credentials, props) => {
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
                notify("Bravo - Vous êtes authentifié", "success");
                props.authenticate()
                 console.log("loginresponse",response.data.response.content.settings)
                //enregistrement dans la session storage
                saveItemToSessionStorage(response.data.response.content.token, 'token')
                saveItemToSessionStorage(1, 'logged')
                saveItemToSessionStorage(1, 'app-mode')
                
                response.data.response.content.user ? saveItemToSessionStorage(JSON.stringify(response.data.response.content.user), 'app-user'): saveItemToSessionStorage([], 'app-user');
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

                response.data.response.content.user ? saveItemToLocalStorage(JSON.stringify(response.data.response.content.user), 'app-user'): saveItemToLocalStorage([], 'app-user');
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
                notify("Erreur - La connexion a échouée", "error");
                
            }
           
            // console.log(JSON.parse(response.data.data));
            props.etatChanged(false)
            synchronData();
            // receiveData()
           
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Les identifiants sont incorrects", "error");
            saveItemToSessionStorage(0, 'logged')
        //    console.log("loginerror",error)
            
        });
}


// export const licenseInfo = async () => {
//     let contenu;

//     const response = await axios.post(READ_LICENSE_INFO, {
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             // 'Authorization': loadItemFromSessionStorage('tok')
//         }
//     });
//     const config = {
//         method: 'post',
//         url: READ_LICENSE_INFO,
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             // 'Authorization': loadItemFromSessionStorage('tok')
//         }
//     };
//         axios(config)
//             .then(function (response) {

//                 if (response.data.status === false) {
//                     // notify(response.data.content.message, "error");
//                 } else {
                    
//                     console.log("licence info demande",response.data);
//                     return "azerty"
//                 }
//                 console.log("licence info demande",response.data);
//                 contenu = "blalabla";
//             })
//             .catch(function (error) {
//                 console.log("licence info error",error)
//             });  
   
//     return contenu;

// }

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
        } else {
            // console.log("licence info demande", response.data);
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
    
    // let date1 = new Intl.DateTimeFormat("fr-FR", {year: "numeric", day: "2-digit", month: "2-digit", hour:"2-digit", minute:"2-digit"}).format(new Date(Date.now()))

    // let tmpsR = JSON.parse((loadItemFromLocalStorage("recs-TS"))).filter((e)=>{ return e.id===""})
    // let dateR = tmpsR.length !==0 ? new Intl.DateTimeFormat("fr-FR", {year: "numeric", day: "2-digit", month: "2-digit", hour:"2-digit", minute:"2-digit"}).format(new Date(tmpsR[0].createdAt)):""
    // let etatR = tmpsR.length !==0 ? ((date1 > dateR) ? true :false) : false;
   
    
    // let tmpsD = JSON.parse((loadItemFromLocalStorage("dens-TS"))).filter((e)=>{ return e.id===""})
    // let dateD = tmpsD.length !==0 ? new Intl.DateTimeFormat("fr-FR", {year: "numeric", day: "2-digit", month: "2-digit", hour:"2-digit", minute:"2-digit"}).format(new Date(tmpsD[0].createdAt)):""
    // let etatD = tmpsD.length !==0 ? ((date1 > dateD) ? true :false) : false;

    // let tmpsS = JSON.parse((loadItemFromLocalStorage("sugs-TS"))).filter((e)=>{ return e.id===""})
    // let dateS = tmpsS.length !==0 ? new Intl.DateTimeFormat("fr-FR", {year: "numeric", day: "2-digit", month: "2-digit", hour:"2-digit", minute:"2-digit"}).format(new Date(tmpsS[0].createdAt)):""
    // let etatS = tmpsS.length !==0 ? ((date1 > dateS) ? true :false) : false;

    // var day1 = new Date('08/25/2020');
    // var day2 = new Date('08/25/2021');

    // var difference = Math.abs(new Date(day2)-new Date(day1));
    // let days = difference / (1000 * 3600 * 24)

 
    // console.log("today1",days)
    // console.log("etats",etatR + "den : "+etatD+"sug : "+etatS)
    // console.log("today2",date1 < date2)


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
            (loadItemFromLocalStorage("app-user")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-user"), 'app-user'): saveItemToSessionStorage([], 'app-user');
            (loadItemFromLocalStorage("app-institution")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-institution"), 'app-institution'): saveItemToSessionStorage([], 'app-institution');
            (loadItemFromLocalStorage("app-mail")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-mail"), 'app-mail'): saveItemToSessionStorage([], 'app-mail');
            (loadItemFromLocalStorage("app-sms")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-sms"), 'app-sms'): saveItemToSessionStorage([], 'app-sms');
            (loadItemFromLocalStorage("app-bot")) !== undefined ? saveItemToSessionStorage(loadItemFromLocalStorage("app-bot"), 'app-bot'): saveItemToSessionStorage([], 'app-bot');
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
    let data={};
    data["claims"]=loadItemFromLocalStorage("recs-TS") !==undefined ? JSON.parse(loadItemFromLocalStorage("recs-TS")) : []
    data["denuns"]=loadItemFromLocalStorage("dens-TS") !==undefined ? JSON.parse(loadItemFromLocalStorage("dens-TS")) : []
    data["suggestions"]=loadItemFromLocalStorage("sugs-TS") !==undefined ? JSON.parse(loadItemFromLocalStorage("sugs-TS")) : []
    // console.log("datasyncitems",data)
    const config = {
        method: 'POST',
        url: SYNCHRON_DATA_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data:data
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


