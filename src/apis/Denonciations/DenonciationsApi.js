import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage, loadArrayFromLocalStorage } from "../../Utils/utils";
import { saveDraftRecord, getDraftRecord, listDraftRecordsByStatus, listUnsyncedDraftRecords, generateOfflineCode, offlineTimestamp } from "../../offline/draftRecordsStore";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

//console.log("HOST DENUNCIATION: " + HOST)
export const ADD_TEMP_DENUNCIATION_API = HOST + "api/v1/denunciation/save_temp"
export const ADD_DENUNCIATION_API = HOST + "api/v1/denunciation/add"
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
const AUDIOS_DOWNLOAD_API = HOST + "api/v1/claimaudio/download/%s"
const AUDIOS_DENUNCIATION_API = HOST + "api/v1/claim/getAudiosBy/%s"
const CONVERT_DENUNCIATION_API = HOST + "api/v1/denunciation/convert"
const DELETE_DENUNCIATION_API = HOST + "api/v1/denunciation/delete/{id}"
const DELETE_DENUN_API = HOST + "api/v1/denunciation/delete/soft"
const RESTORE_DENUN_API = HOST + "api/v1/denunciation/restore/%s"



// Rafraîchit uniquement le cache "app-densTS" — cf. ReclamationsApi.js::refreshOfflineSnapshot.
export const refreshOfflineSnapshot = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: LIST_ALL_DENUNCIATION_API,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + loadItemFromSessionStorage('token')
            },
        });
        saveItemToLocalStorage(response.data.content, 'app-densTS');
    } catch (error) {
        // Rafraîchissement en arrière-plan : échec silencieux.
    }
};

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
        .then(async function (response) {

            // console.log("response.data.content",response.data.content)
            // Fusionne avec les dénonciations capturées localement (online ou
            // offline) pas encore synchronisées.
            const localUnsynced = await listUnsyncedDraftRecords("denunciation", "TEMP_SAVED")
            const merged = [...response.data.content, ...localUnsynced]
            props.itemsChanged(merged)
            // Instantané pour affichage en mode Offline (cf. listeTousStatutsOffline).
            saveItemToLocalStorage(response.data.content, 'app-densTS')
            return merged
        })
        .catch(function (error) {
            return error;
        });
}
export const getDenunAudioApi = async (data, props) => {

    const config = {
        method: 'get',
        url: AUDIOS_DENUNCIATION_API.replace("%s", data),
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

export const listeByStatut = async (props, state) => {
    const config = {
        method: 'get',
        url: LIST_DENUNCIATION_API_BY_STATE.replace("state", state),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // console.log("response____",response.data.content)
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
    return axios(config)
        .then(function (response) {
            props.itemsChanged(response.data.content)
            return response.data.content;
        })
        .catch(function (error) {
            return [];
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
            props.etatChanged(false)
            if (response.data.status) {
                notify("Bravo - Dénonciation sauvegardée", "success");
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
            if (response.data.status) {
                notify("Bravo - Dénonciation ajoutée", "success");
                listeByStatut(props, "TEMP_SAVED")
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}
export const downloadAudioApi = async (data, filename) => {

    const config = {
        method: 'get',
        url: AUDIOS_DOWNLOAD_API.replace("%s", data),
        responseType: 'blob',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token'),

        },

    };
    try {
        const response = await axios(config);
        // console.log("response audio ", response.data);
        return response.data;
    } catch (error) {
        notify("Erreur - Veuillez réessayer! ", "error");
        // console.log("erreur",error)
    }
    // await axios(config)
    //     .then(function (response) {

    //         notify("Bravo - Téléchargement du fichier effectué", "success");
    //         console.log("response data content",response.data)
    //         // Créez un objet URL à partir de la réponse
    //         const url = window.URL.createObjectURL(new Blob([response.data]));

    //         // Créez un lien invisible et déclenchez le téléchargement
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', filename); // Remplacez 'nom_du_fichier.ext' par le nom du fichier
    //         document.body.appendChild(link);
    //         link.click();

    //         // Libérez l'URL de l'objet lorsque le téléchargement est terminé
    //         window.URL.revokeObjectURL(url);
    //     })
    //     .catch(function (error) {
    //         notify("Erreur - Veuillez réessayer!", "error");
    //         console.log("erreur",error)
    //     });
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
            if (response.data.status) {
                notify("Bravo - Dénonciation affectée", "success");
                listeTreat(props)
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
            if (response.data.status) {
                notify("Bravo - Dénonciation traitée", "success");
                if (data.type) {
                    if (data.type === "assurance") {
                        listeAssurance(props);
                    } else if (data.type === "classee") {
                        listeByStatut(props, "CLASSED");
                    }

                } else {
                    listeTreat(props)
                }
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
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
            if (response.data.status) {
                notify("Bravo - Solution approuvée", "success");
                listeTreat(props)
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

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
            if (response.data.status) {
                notify("Bravo - Solution désapprouvée", "success");
                listeTreat(props)
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
            if (response.data.status) {
                notify("Bravo - Dénonciation transmise avec succès", "success");
                listeTreat(props)
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

        })
        .catch(function (error) {
            props.etat3Changed(false)
            if (error.response.data.content !== "") {
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
export const listeByStatutOffline = async (props, state) => {
    const densTemp = await listDraftRecordsByStatus("denunciation", state)
    props.itemsChanged(densTemp)
    return densTemp
}

export const listeTousStatutsOffline = async (props) => {
    const serverSnapshot = loadArrayFromLocalStorage("app-densTS")
    // Uniquement les brouillons pas encore synchronisés (cf. Reclamations).
    const localItems = await listUnsyncedDraftRecords("denunciation", "TEMP_SAVED")
    const densGlobal = [...serverSnapshot, ...localItems]
    props.itemsChanged(densGlobal)
    return densGlobal;
}

export const addTempDenunciationApiOffline = async (data, props) => {
    data["status"] = "TEMP_SAVED"
    data["createdAt"] = offlineTimestamp()

    if (data["code"] === "") {
        data["code"] = generateOfflineCode("den")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("denunciation", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etatChanged(false)

    notify("Bravo - Dénonciation sauvegardée", "success")

}

export const addDenunciationApiOffline = async (data, props) => {
    data["status"] = "SAVED"
    data["createdAt"] = offlineTimestamp()

    // Le codeClient (DEN-XXXX) n'est plus généré côté client hors-ligne : il
    // est attribué par le serveur au moment de la synchronisation, comme
    // pour une création en ligne classique.
    if (data["code"] === "") {
        data["code"] = generateOfflineCode("den")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("denunciation", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etat2Changed(false)

    notify("Bravo - Dénonciation enregistrée. Le code client sera attribué à la synchronisation.", "success")
}


export const downloadFillesApi2 = async (data, filename) => {
    const config = {
        method: 'get',
        url: FILES_DOWNLOAD_API.replace("%s", data),
        responseType: 'blob',
        headers: {
            'Accept': 'application/octet-stream',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token'),
        },
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        notify("Erreur - Veuillez réessayer!", "error");
        return null;
    }
}

export const deleteDenunciationApi = async (id, props) => {
    // console.log("dataId", id)
    const config = {
        method: 'delete',
        url: DELETE_DENUNCIATION_API.replace("{id}", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    };
    await axios(config)
        .then(function (response) {
            // notify("Bravo - Dénonciation supprimé", "success");
            // console.log("reponsesessionadd",response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd",error)
        }
    );
}

export const convertDenunciationApi = async (data, props) => {
    // console.log("datadata", data)
    const config = {
        method: 'post',
        url: CONVERT_DENUNCIATION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    return axios(config)
        .then(function (response) {
            notify("Bravo - Dénonciation convertie avec succès", "success");
            return response.data;
        })
        .catch(function (error) {
            // L'erreur backend (FK constraint) est loggée mais on laisse la redirection se faire
            return null;
        });
}

export const deleteDenunApi = async (data) => {
    console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: DELETE_DENUN_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Dénonciation supprimé", "success");
            console.log("reponsesessionadd",response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            console.log("erreursessionadd",error)
        }
    );
}

export const restoreDenunApi = async (data) => {
    console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: RESTORE_DENUN_API.replace("%s", data.claimId),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Dénonciation restaurée", "success");
            console.log("reponsesessionadd",response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            console.log("erreursessionadd",error)
        }
    );
}

