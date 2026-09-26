import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage, loadArrayFromLocalStorage } from "../../Utils/utils";
import { saveDraftRecord, getDraftRecord, listDraftRecordsByStatus, listUnsyncedDraftRecords, generateOfflineCode, offlineTimestamp } from "../../offline/draftRecordsStore";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

export const ADD_TEMP_SUGGESTION_API = HOST + "api/v1/suggestion/save_temp"
export const ADD_SUGGESTION_API = HOST + "api/v1/suggestion/add"
const TREAT_SUGGESTION_API = HOST + "api/v1/suggestion/treatSuggestion"
const LIST_ALL_SUGGESTION_API = HOST + "api/v1/suggestion/list"
const LIST_SUGGESTION_API_BY_STATE = HOST + "api/v1/suggestion/list/state"
const FILES_SUGGESTION_API = HOST + "api/v1/suggestion/getFilesBy/%s"
const FILES_DOWNLOAD_API = HOST + "api/v1/media/download/%s"
const AUDIOS_CLAIM_API = HOST + "api/v1/suggestion/getAudiosBy/%s"
const DELETE_SUGGESTION_API = HOST + "api/v1/suggestion/delete/{id}"
const DELETE_SUGGEST_API = HOST + "api/v1/suggestion/delete/soft"
const RESTORE_SUGGEST_API = HOST + "api/v1/suggestion/restore/%s"

// Rafraîchit uniquement le cache "app-sugsTS" — cf. ReclamationsApi.js::refreshOfflineSnapshot.
export const refreshOfflineSnapshot = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: LIST_ALL_SUGGESTION_API,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + loadItemFromSessionStorage('token')
            },
        });
        saveItemToLocalStorage(response.data.content, 'app-sugsTS');
    } catch (error) {
        // Rafraîchissement en arrière-plan : échec silencieux.
    }
};

export const listeTousStatuts = async (props) => {

    const config = {
        method: 'get',
        url: LIST_ALL_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(async function (response) {
            // console.log("response.data.content",response.data.content)
            // Fusionne avec les suggestions capturées localement (online ou
            // offline) pas encore synchronisées.
            const localUnsynced = await listUnsyncedDraftRecords("suggestion", "TEMP_SAVED")
            const merged = [...response.data.content, ...localUnsynced]
            props.itemsChanged(merged)
            // Instantané pour affichage en mode Offline (cf. listeTousStatutsOffline).
            saveItemToLocalStorage(response.data.content, 'app-sugsTS')
            return merged
        })
        .catch(function (error) {
            // console.log('errreuapisuggesition',error)
            return error;
        });
}

export const listeByStatut = async (props, state) => {
    const config = {
        method: 'get',
        url: LIST_SUGGESTION_API_BY_STATE.replace("state", state),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    return axios(config)
        .then(function (response) {
            props.itemsChanged(response.data.content)
            return response.data.content;
        })
        .catch(function (error) {
            return [];
        });
}

export const addTempSuggestionApi = async (data, props) => {
    // console.log("data",data)

    const config = {
        method: 'post',
        url: ADD_TEMP_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/octet-stream',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etatChanged(false)
            if (response.data.status) {
                notify("Bravo - Suggestion sauvegardée", "success");
                listeByStatut(props, "TEMP_SAVED")
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }


        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const addSuggestionApi = async (data, props) => {
    const config = {
        method: 'post',
        url: ADD_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    // await axios(config)
    // .then(function (response) {
    //     console.log("response<<<<", response)

    //     props.etat2Changed(false)
    //     if (response.data.status) {
    //         notify("Bravo - Suggestion ajoutée", "success");
    //         listeByStatut(props, "TEMP_SAVED")
    //     } else {
    //         notify("Erreur - Veuillez réessayer!", "error");
    //     }

    //     // listeTousStatuts(props)
    // })
    // .catch(function (error) {
    //     props.etat2Changed(false)
    //     notify("Erreur - Veuillez réessayer!", "error");
    //     // console.log("erreur", error)
    // });
    let savedSuggestion = null;
    try {
        const response = await axios(config);

        props.etat2Changed(false);

        if (response.data.status) {
            savedSuggestion = response.data.content ?? null;
            notify("Bravo - Suggestion ajoutée", "success");
            listeByStatut(props, "TEMP_SAVED");
        } else {
            notify("Erreur - Veuillez réessayer!", "error");
        }
    } catch (error) {
        props.etat2Changed(false);
        notify("Erreur - Veuillez réessayer!", "error");
    }
    return savedSuggestion;
}

export const treatSuggestionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TREAT_SUGGESTION_API,
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
            props.etat2Changed(false)
            if (response.data.status) {
                notify("Bravo - Suggestion traitée", "success");
                listeByStatut(props, "SAVED")
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }


        })
        .catch(function (error) {
            props.etatChanged(false)
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const getFillesApi = async (data, props) => {

    const config = {
        method: 'get',
        url: FILES_SUGGESTION_API.replace("%s", data),
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
            // console.log("erreurgetfichier",error)
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
            // console.log("response data content",response.data)
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
export const listeByStatutOffline = async (props, state) => {
    const sugsTemp = await listDraftRecordsByStatus("suggestion", state)
    props.itemsChanged(sugsTemp)
    return sugsTemp
}

export const listeTousStatutsOffline = async (props) => {
    const serverSnapshot = loadArrayFromLocalStorage("app-sugsTS")
    // Uniquement les brouillons pas encore synchronisés (cf. Reclamations).
    const localItems = await listUnsyncedDraftRecords("suggestion", "TEMP_SAVED")
    const sugsGlobal = [...serverSnapshot, ...localItems]
    props.itemsChanged(sugsGlobal)
    return sugsGlobal;
}

export const addTempSuggestionApiOffline = async (data, props) => {
    data["status"] = "TEMP_SAVED"
    data["createdAt"] = offlineTimestamp()

    if (data["code"] === "") {
        data["code"] = generateOfflineCode("sug")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("suggestion", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etatChanged(false)

    notify("Bravo - Suggestion sauvegardée", "success")

}

export const getSuggeAudioApi = async (data, props) => {

    const config = {
        method: 'get',
        url: AUDIOS_CLAIM_API.replace("%s", data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // notify("Bravo - Mesure de satisfaction effectuée", "success");
            // console.log("response data content",response.data)
            props.selectedItemAudioChanged(response.data)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const addSuggestionApiOffline = async (data, props) => {
    data["status"] = "SAVED"
    data["createdAt"] = offlineTimestamp()

    // Le codeClient (SUG-XXXX) n'est plus généré côté client hors-ligne : il
    // est attribué par le serveur au moment de la synchronisation, comme
    // pour une création en ligne classique.
    if (data["code"] === "") {
        data["code"] = generateOfflineCode("sug")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("suggestion", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etat2Changed(false)

    notify("Bravo - Suggestion enregistrée. Le code client sera attribué à la synchronisation.", "success")
}


export const deleteSuggestionApi = async (id, props) => {

    const config = {
        method: 'delete',
        url: DELETE_SUGGESTION_API.replace("{id}", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    };
    await axios(config)
        .then(function (response) {
            // notify("Bravo - Réclamation supprimé", "success");
            // console.log("reponsesessionadd",response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd",error)
        }
        );
}

export const deleteSuggestApi = async (data) => {
    // console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: DELETE_SUGGEST_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Suggestion supprimée", "success");
            // console.log("reponsesessionadd", response.data.content)
        })
        .catch(function (error) {
            const msg =
                error?.response?.data?.content?.message ||
                error?.response?.data?.content ||
                "Erreur - Veuillez réessayer !";

            notify(msg, "error");
            // console.log("erreursessionadd", error)
        }
        );
}

export const restoreSuggestApi = async (data) => {
    // console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: RESTORE_SUGGEST_API.replace("%s", data.claimId),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Suggestion restaurée", "success");
            // console.log("reponsesessionadd", response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd", error)
        }
        );
}
