import axios from "axios";
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";
import {v4 as uuidv4} from "uuid";

//console.log("HOST DENUNCIATION: " + HOST)
const ADD_TEMP_DENUNCIATION_API = HOST + "api/v1/denunciation/save_temp"
const ADD_DENUNCIATION_API = HOST + "api/v1/denunciation/add"
const AFFECT_DENUNCIATION_API = HOST + "api/v1/denunciation/affectTreatment"
const TREAT_DENUNCIATION_API = HOST + "api/v1/denunciation/treatDenun"
const APPROVE_DENUNCIATION_SOLUTION_API = HOST + "api/v1/denunciation/approuvedSolution"
const UNAPPROVE_DENUNCIATION_SOLUTION_API = HOST + "api/v1/denunciation/unapprouvedSolution"
const LIST_ALL_DENUNCIATION_API = HOST + "api/v1/denunciation/list"
const LIST_DENUNCIATION_API_TO_TREAT = HOST + "api/v1/denunciation/listTreat"
const LIST_DENUNCIATION_API_BY_STATE = HOST + "api/v1/denunciation/list/state"
const LIST_DENUNCIATION_API_TO_ASSURE_SATISFACTION = HOST + "api/v1/denunciation/listAssuranceSatisfaction"
const FILES_DENUNCIATION_API = HOST + "api/v1/denunciation/getFilesBy/%s"
const FILES_DOWNLOAD_API = HOST + "api/v1/media/download/%s"
const TRANSMISSION_DENUNCIATION_API = HOST + "api/v1/denunciation/transmit_to"



export const listeTousStatuts = async (props) => {

    const config = {
        method: 'get',
        url: LIST_ALL_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
           
            // console.log("response.data.content",response.data.content)
            props.itemsChanged(response.data.content)
            return response.data.content
        })
        .catch(function (error) {
            return error;
        });
}

export const listeByStatut = async (props,state) => {
    const config = {
        method: 'get',
        url: LIST_DENUNCIATION_API_BY_STATE.replace("state",state),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
           
            // console.log("response",response.data.content)
            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            return error;
        });
}

export const listeTreat = async (props) => {
    const config = {
        method: 'get',
        url: LIST_DENUNCIATION_API_TO_TREAT,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
           
            // console.log("responsetreat",response.data.content)
            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            return error;
        });
}

export const listeAssurance = async (props) => {
    const config = {
        method: 'get',
        url: LIST_DENUNCIATION_API_TO_ASSURE_SATISFACTION,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
           
            // console.log("responseassure",response.data.content)
            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            return error;
        });
}

export const addTempDenunciationApi = async (data, props) => {
    // console.log("data",data)

    const config = {
        method: 'post',
        url: ADD_TEMP_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/octet-stream',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {

            notify("Bravo - Dénonciation sauvegardée", "success");
            listeByStatut(props,"TEMP_SAVED")
            props.etatChanged(false)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const addDenunciationApi = async (data, props) => {
    const config = {
        method: 'post',
        url: ADD_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat2Changed(false)
            notify("Bravo - Dénonciation ajoutée", "success");
            listeByStatut(props,"TEMP_SAVED")
        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const affectDenunciationApi = async (data, props) => {

    const config = {
        method: 'put',
        url: AFFECT_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etatChanged(false)
            notify("Bravo - Dénonciation affectée", "success");
           listeTreat(props)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const treatDenunciationApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TREAT_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat2Changed(false)
            notify("Bravo - Dénonciation traitée", "success");
            if (data.type) {
                if (data.type==="assurance") {
                    listeAssurance(props);
                } else if(data.type==="classee") {
                    listeByStatut(props,"CLASSED");
                }
                
            } else {
                listeTreat(props)
            }
            
        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const approveDenunciationSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: APPROVE_DENUNCIATION_SOLUTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat2Changed(false)
            notify("Bravo - Solution approuvée", "success");
            listeTreat(props)
        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const unapproveDenunciationSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: UNAPPROVE_DENUNCIATION_SOLUTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etatChanged(false)
            notify("Bravo - Solution désapprouvée", "success");
            listeTreat(props)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}


export const transmissionDenunciationApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TRANSMISSION_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat3Changed(false)
            notify("Bravo - Dénonciation transmise au pilote", "success");
            listeTreat(props)
        })
        .catch(function (error) {
            props.etat3Changed(false)
            if (error.response.data.content !=="") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
            // console.log("erreur",error)
        });
}

export const getFillesApi = async (data, props) => {

    const config = {
        method: 'get',
        url: FILES_DENUNCIATION_API.replace("%s", data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // notify("Bravo - Mesure de satisfaction effectuée", "success");
            // console.log("response data content",response.data.content)
            props.selectedItemFilesChanged(response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const downloadFillesApi = async (data, filename) => {

    const config = {
        method: 'get',
        url: FILES_DOWNLOAD_API.replace("%s", data),
        responseType: 'blob',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token'),
            
        },
    
    };
    await axios(config)
        .then(function (response) {

            notify("Bravo - Téléchargement du fichier effectué", "success");
            // console.log("response data content",response.data.content)
            // Créez un objet URL à partir de la réponse
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Créez un lien invisible et déclenchez le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Remplacez 'nom_du_fichier.ext' par le nom du fichier
            document.body.appendChild(link);
            link.click();

            // Libérez l'URL de l'objet lorsque le téléchargement est terminé
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

//offline
export const listeByStatutOffline = async (props,state) => {
    let dens = loadItemFromLocalStorage("dens-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("dens-TS"))): [];
    let densTemp = dens.filter((e) => {return e.status == state})

    // console.log(densTemp)
    props.itemsChanged(densTemp)
    
    return densTemp
      
}

export const listeTousStatutsOffline = async (props) => {
    let dens = loadItemFromLocalStorage("dens-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("dens-TS"))): [];
    let densGlobal = dens.filter((e) => {return e.status !== "TEMP_SAVED"})

    props.itemsChanged(densGlobal)
    
    return densGlobal;
   
}

export const addTempDenunciationApiOffline = async (data, props) => {
    let dens = loadItemFromLocalStorage("dens-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("dens-TS"))): [];

    //date
    let datetmp = new Date();
    let jour = (datetmp.getDate()) < 10 ? "0"+(datetmp.getDate()) : datetmp.getDate()
    let mois = (datetmp.getMonth() + 1) < 10 ? "0"+(datetmp.getMonth() + 1) : datetmp.getMonth() + 1
    let heures = (datetmp.getHours() ) < 10 ? "0"+(datetmp.getHours()) : datetmp.getHours()
    let minutes = (datetmp.getMinutes() ) < 10 ? "0"+(datetmp.getMinutes()) : datetmp.getMinutes()
    let secondes = (datetmp.getSeconds() ) < 10 ? "0"+(datetmp.getSeconds()) :datetmp.getSeconds()
    let created_at = datetmp.getFullYear()+ "-" + mois + "-" + jour + "T" + heures + ":" + minutes + ":" + secondes
    // console.log("datee",created_at)

    //données
    data["status"]="TEMP_SAVED"
    data["createdAt"]= created_at

    if (data["code"] === "") {
        //code
        let code = "den" + uuidv4().substring(0, 5)+'-'+(JSON.parse(loadItemFromSessionStorage('app-user'))).servicePointDto.uuid +'-'+(JSON.parse(loadItemFromSessionStorage('app-user')).code)
        // console.log("codeeee",code)
        data["code"]= code

        dens.push(data);
        saveItemToLocalStorage(JSON.stringify(dens),"dens-TS")
    } else {
        let densTemp = dens.filter((e) => {return e.code !== data["code"] })
        let densF = dens.filter((e) => {return e.code === data["code"] })
        data["id"] = densF[0].id

        // console.log("densTemp1",densTemp)
        // densTemp[0]=data
        // console.log("data",data)
        // console.log("densTemp3",dens)
        densTemp.push(data);
        saveItemToLocalStorage(JSON.stringify(densTemp),"dens-TS")
    }
    



    // dens.push(data);
    // saveItemToLocalStorage(JSON.stringify(dens),"dens-TS")
    listeByStatutOffline(props,"TEMP_SAVED")
    props.etatChanged(false)

    notify("Bravo - Dénonciation sauvegardée", "success")
  
}

export const addDenunciationApiOffline = async (data, props) => {
    let dens = loadItemFromLocalStorage("dens-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("dens-TS"))): [];

    //date
    let datetmp = new Date();
    let jour = (datetmp.getDate()) < 10 ? "0"+(datetmp.getDate()) : datetmp.getDate()
    let mois = (datetmp.getMonth() + 1) < 10 ? "0"+(datetmp.getMonth() + 1) : datetmp.getMonth() + 1
    let heures = (datetmp.getHours() ) < 10 ? "0"+(datetmp.getHours()) : datetmp.getHours()
    let minutes = (datetmp.getMinutes() ) < 10 ? "0"+(datetmp.getMinutes()) : datetmp.getMinutes()
    let secondes = (datetmp.getSeconds() ) < 10 ? "0"+(datetmp.getSeconds()) :datetmp.getSeconds()
    let created_at = datetmp.getFullYear()+ "-" + mois + "-" + jour + "T" + heures + ":" + minutes + ":" + secondes
    // console.log("datee",created_at)

    //code
    let code = "den" + uuidv4().substring(0, 5)+'-'+(JSON.parse(loadItemFromSessionStorage('app-user'))).servicePointDto.uuid +'-'+(JSON.parse(loadItemFromSessionStorage('app-user')).code)
    // console.log("codeeee",code)
    

    //données
    data["status"]="SAVED"
    data["createdAt"]= created_at
   

    if (data["code"] === "") {
        data["code"]= code
        // console.log("dataasave",data)
        dens.push(data);
        saveItemToLocalStorage(JSON.stringify(dens),"dens-TS")
    }else{
        let densTemp = dens.filter((e) => {return e.code !== data["code"] })
        let densF = dens.filter((e) => {return e.code === data["code"] })
        data["id"] = densF[0].id
        densTemp.push(data);
        saveItemToLocalStorage(JSON.stringify(densTemp),"dens-TS")
       
    }

   
    listeByStatutOffline(props,"TEMP_SAVED")
    props.etat2Changed(false)

    notify("Bravo - Dénonciation enregistrée", "success")
}
