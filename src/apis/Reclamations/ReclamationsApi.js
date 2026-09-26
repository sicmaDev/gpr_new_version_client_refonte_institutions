import axios from "axios";
import React, { useState } from "react";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage, loadArrayFromLocalStorage } from "../../Utils/utils";
import { saveDraftRecord, getDraftRecord, listDraftRecordsByStatus, listUnsyncedDraftRecords, generateOfflineCode, offlineTimestamp } from "../../offline/draftRecordsStore";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

//console.log("HOST CLAIM: " + HOST)
export const ADD_TEMP_CLAIM_API = HOST + "api/v1/claim/save_temp"
export const ADD_CLAIM_API = HOST + "api/v1/claim/add"
const EXTRA_CLAIM_API = HOST + "api/v1/claim/add/extra"
const AFFECT_CLAIM_API = HOST + "api/v1/claim/affectTreatment"
const TREAT_CLAIM_API = HOST + "api/v1/claim/treatClaim"
const APPROVE_CLAIM_SOLUTION_API = HOST + "api/v1/claim/approuvedSolution"
const UNAPPROVE_CLAIM_SOLUTION_API = HOST + "api/v1/claim/unapprouvedSolution"
const MESURE_CLAIM_SOLUTION_API = HOST + "api/v1/claim/measureSatisfaction"
const ADD_RECOURS_API = HOST + "api/v1/claim/litigate"
const LIST_ALL_CLAIM_API = HOST + "api/v1/claim/list"
const LIST_CLAIM_API_TO_TREAT = HOST + "api/v1/claim/listTreat"
const LIST_CLAIM_DETAILS_API_TO_TREAT = HOST + "api/v1/claim/params/details"
const LIST_CLAIM_HISTORIQUE_API = HOST + "api/v1/historique-affectation/list/%s"
const LIST_CLAIM_API_BY_STATE = HOST + "api/v1/claim/list/state"
const LIST_CLAIM_API_TO_ASSURE_SATISFACTION = HOST + "api/v1/claim/listAssuranceSatisfaction"
const CLASSIFY_CLAIM_API = HOST + "api/v1/claim/classedClaim"
const PARTIAL_SATISFIED_CLAIM_API = HOST + "api/v1/claim/PARTIAL_SATISFIED"
const TRANSMISSION_CLAIM_API = HOST + "api/v1/claim/transmit_to"
const FILES_CLAIM_API = HOST + "api/v1/claim/getFilesBy/%s"
const FILES_DOWNLOAD_API = HOST + "api/v1/media/download/%s"
const AUDIOS_CLAIM_API = HOST + "api/v1/claim/getAudiosBy/%s"
const AUDIOS_DOWNLOAD_API = HOST + "api/v1/claimaudio/download/%s"
const DELETE_MEDIA_API = HOST + "api/v1/media/%s"
const DELETE_AUDIO_API = HOST + "api/v1/claimaudio/%s"
const DELETE_EXTRA_API = HOST + "api/v1/extra/%s"
const START_SESSION_API = HOST + "api/v1/chat/init"
const CONVERT_CLAIM_API = HOST + "api/v1/claim/convert"
const DELETE_CLAIM_API = HOST + "api/v1/claim/delete/soft"
const LIST_DELETE_CLAIM_API = HOST + "api/v1/claim/list/deleted"
const RESTORE_CLAIM_API = HOST + "api/v1/claim/restore/%s"
const DELETE_ONLY_CLAIM_API = HOST + "api/v1/claim/delete/{id}"
const CHECK_PHONE_API = HOST + "api/v1/claim/checkPhone/%s"
const CHECK_PHONE_CROSS_AGENCY_API = HOST + "api/v1/claim/checkPhoneCrossAgency/%s"
const CLAIM_EVENTS_API = HOST + "api/v1/claim-events/"
const CLAIM_DRAFT_API = HOST + "api/v1/claim/%s/draft"
const TRANSMISSION_HISTORY_API = HOST + "api/v1/claim/%s/transmissions"

export const saveDraftApi = (claimId, data) => {
    return axios.put(CLAIM_DRAFT_API.replace('%s', claimId), data, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    });
}

export const getClaimEvents = (claimId) => {
    return axios.get(CLAIM_EVENTS_API + claimId, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    });
}

// Rafraîchit uniquement le cache "app-recsTS" utilisé par listeTousStatutsOffline
// (pas de props/redux nécessaire) — appelé après chaque synchronisation
// réussie (cf. syncManager.js) pour que le mode Offline suivant montre tout
// de suite les données à jour (codeClient attribués, etc.) sans attendre que
// l'utilisateur visite la page Liste en ligne.
export const refreshOfflineSnapshot = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: LIST_ALL_CLAIM_API,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + loadItemFromSessionStorage('token')
            },
        });
        saveItemToLocalStorage(response.data.content, 'app-recsTS');
    } catch (error) {
        // Rafraîchissement en arrière-plan : un échec ne doit pas remonter
        // à l'utilisateur, l'ancien instantané reste utilisable.
    }
};

export const listeTousStatuts = async (props) => {

    const config = {
        method: 'get',
        url: LIST_ALL_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(async function (response) {

            // console.log("response.data.content",response.data.content)
            // Fusionne avec les réclamations capturées localement (online ou
            // offline) pas encore synchronisées, pour qu'elles soient visibles
            // immédiatement sans attendre la prochaine synchro.
            const localUnsynced = await listUnsyncedDraftRecords("claim", "TEMP_SAVED")
            const merged = [...response.data.content, ...localUnsynced]
            props.itemsChanged(merged)
            saveItemToLocalStorage(response.data.content, 'app-recsTS')
            return merged
        })
        .catch(function (error) {
            // console.log("errorstatutliste",error)
            return error;

        });
}

export const listeByStatut = async (props, state) => {
    const config = {
        method: 'get',
        url: LIST_CLAIM_API_BY_STATE.replace("state", state),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("mesureliste",response.data.content)
            // console.log("response_______________________",response.data.content)
            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            // console.log("responseerror",error)
            return error;
        });
}

export const listeTreat = async (props) => {
    const config = {
        method: 'get',
        url: LIST_CLAIM_API_TO_TREAT,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("responsetreat", response.data.content)

            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            // console.log("responsetreaterror",error)
            return error;
        }
        );
}

export const detailsTreat = async (props, code) => {
    const config = {
        method: 'get',
        url: LIST_CLAIM_DETAILS_API_TO_TREAT,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("detailstreatresponse", response.data)
            return response.data.conte;
        })
        .catch(function (error) {
            // console.log("detailerror",error)
            return error;

        });
}

export const getClaimHistorique = async (props, claimId) => {
    const config = {
        method: 'get',
        url: LIST_CLAIM_HISTORIQUE_API.replace("%s", claimId),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    props.isLoadingChanged(true)
    props.itemsChanged([])
    axios(config)
        .then(({ data }) => {

            props.isSuccessChanged(true)
            props.messageChanged('Liste des historiques success')
            props.itemsChanged(data.content)
        })
        .catch((error) => {
            props.isSuccessChanged(false)
            props.messageChanged(`Erreur: ${error}`)

        }).finally(() => {
            props.isLoadingChanged(false)

        });
}

export const listeAssurance = async (props) => {
    const config = {
        method: 'get',
        url: LIST_CLAIM_API_TO_ASSURE_SATISFACTION,
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



export const PARTIAL_SATISFIED = async (props) => {
    const config = {
        method: 'get',
        url: PARTIAL_SATISFIED_CLAIM_API,
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


export const addTempClaimApi = async (data, props) => {
    // console.log("data____",data)

    const config = {
        method: 'post',
        url: ADD_TEMP_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/octet-stream',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            // console.log("reponseaan", response)
            props.etatChanged(false)
            if (response.data.status) {

                notify("Bravo - Réclamation sauvegardée", "success");
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

export const addClaimApi = async (data, props) => {
    const config = {
        method: 'post',
        url: ADD_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    let savedClaim = null;
    await axios(config)
        .then(function (response) {
            props.etat2Changed(false)
            if (response.data.status) {
                savedClaim = response.data.content ?? null;
                notify("Bravo - Réclamation ajoutée", "success");
                listeByStatut(props, "TEMP_SAVED")
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });
    return savedClaim;
}

export const addExtraClaimApi = async (data, props) => {
    const config = {
        method: 'post',
        url: EXTRA_CLAIM_API,
        data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };

    return axios(config)
}

export const affectClaimApi = async (data, props) => {

    const config = {
        method: 'put',
        url: AFFECT_CLAIM_API,
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
                notify("Bravo - Réclamation affectée", "success");
                listeTreat(props)
            } else {
                notify("Erreur - Veuillez réessayer", "error");
            }
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });
}

export const treatClaimApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TREAT_CLAIM_API,
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
                notify("Bravo - Réclamation traitée", "success");
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
            // console.log("erreurtraitement",error)
        });
}

export const approveClaimSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: APPROVE_CLAIM_SOLUTION_API,
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

export const unapproveClaimSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: UNAPPROVE_CLAIM_SOLUTION_API,
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
                notify("Bravo - Solution désapprouvée", "success");
                listeByStatut(props, "TREAT")
                // listeTreat(props)
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreurcatch unappove",error)
        });
}

export const mesurerClaimSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: MESURE_CLAIM_SOLUTION_API,
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
                notify("Bravo - Mesure de satisfaction effectuée", "success");
                listeByStatut(props, "TREAT")
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

export const addRecoursClaimSolutionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: ADD_RECOURS_API,
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
                notify("Bravo - Recours externes ajouté(s)", "success");
                listeAssurance(props);
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

export const classifyClaimApi = async (data, props) => {

    const config = {
        method: 'put',
        url: CLASSIFY_CLAIM_API,
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
                notify("Bravo - Réclamation classée", "success");
                listeAssurance(props);
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }

        })
        .catch(function (error) {
            props.etat3Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const transmissionClaimApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TRANSMISSION_CLAIM_API,
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
                notify("Bravo - Réclamation transmise avec succès", "success");
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

export const getTransmissionHistoryApi = async (claimId) => {
    const config = {
        method: 'get',
        url: TRANSMISSION_HISTORY_API.replace("%s", claimId),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    try {
        const response = await axios(config);
        return response.data?.content ?? [];
    } catch (error) {
        return [];
    }
}

export const startSession = async (data, props) => {
    // console.log("reponsesessionadd2",props)
    const config = {
        method: 'post',
        url: START_SESSION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat4Changed(false)
            notify("Bravo - Session démarrée", "success");
            // console.log("reponsesessionadd",response.data.content)
            props.sessionChanged(response.data.content)
            listeTreat(props)
        })
        .catch(function (error) {
            props.etat4Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd",error)
        });
}

export const getFillesApi = async (data, props) => {

    const config = {
        method: 'get',
        url: FILES_CLAIM_API.replace("%s", data),
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
            // notify("Succès - Chargement des fichiers réussi !!?!", "success");
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error);
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

export const getClaimAudioApi = async (data, props) => {

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
            props.selectedItemAudioChanged(response.data)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const deleteFileApi = async (id) => {
    const config = {
        method: 'delete',
        url: DELETE_MEDIA_API.replace("%s", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    return axios(config)
        .then(function (response) {
            notify("Bravo - Fichier supprimé", "success");
            return true;
        })
        .catch(function (error) {
            const msg = error.response?.data?.content?.message;
            notify(msg || "Erreur - Veuillez réessayer!", "error");
            return false;
        });
}

export const deleteAudioApi = async (id) => {
    const config = {
        method: 'delete',
        url: DELETE_AUDIO_API.replace("%s", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    return axios(config)
        .then(function (response) {
            notify("Bravo - Audio supprimé", "success");
            return true;
        })
        .catch(function (error) {
            const msg = error.response?.data?.content?.message;
            notify(msg || "Erreur - Veuillez réessayer!", "error");
            return false;
        });
}

export const deleteExtraContentApi = async (id) => {
    const config = {
        method: 'delete',
        url: DELETE_EXTRA_API.replace("%s", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    return axios(config)
        .then(function (response) {
            notify("Bravo - Contenu supprimé", "success");
            return true;
        })
        .catch(function (error) {
            const msg = error.response?.data?.content?.message;
            notify(msg || "Erreur - Veuillez réessayer!", "error");
            return false;
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
        notify("Erreur - Veuillez réessayer le téléchargement!", "error");
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


//offline
export const listeByStatutOffline = async (props, state) => {
    const recsTemp = await listDraftRecordsByStatus("claim", state)
    props.itemsChanged(recsTemp)
    return recsTemp
}

export const listeTousStatutsOffline = async (props) => {
    // Dernier instantané serveur connu (rafraîchi à chaque listeTousStatuts en
    // ligne) + brouillons locaux, pour que le mode Offline montre autant que
    // possible la même chose que le mode Online, sans appel réseau.
    const serverSnapshot = loadArrayFromLocalStorage("app-recsTS")
    // Uniquement les brouillons PAS ENCORE synchronisés : une fois envoyée,
    // la version locale (sans codeClient, ancienne) ne doit plus s'afficher
    // à sa place — c'est l'instantané serveur, rafraîchi à la prochaine
    // connexion en ligne, qui prend le relais avec les données à jour.
    const localItems = await listUnsyncedDraftRecords("claim", "TEMP_SAVED")
    const recsGlobal = [...serverSnapshot, ...localItems]
    props.itemsChanged(recsGlobal)
    return recsGlobal;
}

export const addTempClaimApiOffline = async (data, props) => {
    data["status"] = "TEMP_SAVED"
    data["createdAt"] = offlineTimestamp()

    if (data["code"] === "") {
        data["code"] = generateOfflineCode("rec")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("claim", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etatChanged(false)

    notify("Bravo - Réclamation sauvegardée", "success")

}

export const addClaimApiOffline = async (data, props) => {
    data["status"] = "SAVED"
    data["createdAt"] = offlineTimestamp()

    // Le codeClient (REC-XXXX) n'est plus généré côté client hors-ligne : il
    // est attribué par le serveur au moment de la synchronisation, comme
    // pour une création en ligne classique.
    if (data["code"] === "") {
        data["code"] = generateOfflineCode("rec")
    } else {
        const existing = await getDraftRecord(data["code"])
        if (existing) data["id"] = existing.payload.id
    }
    await saveDraftRecord("claim", data)

    listeByStatutOffline(props, "TEMP_SAVED")
    props.etat2Changed(false)

    notify("Bravo - Réclamation enregistrée. Le code client sera attribué à la synchronisation.", "success")
}


export const convertClaimApi = async (data, props) => {
    const config = {
        method: 'post',
        url: CONVERT_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    return axios(config)
        .then(function (response) {
            notify("Bravo - Réclamation convertie avec succès", "success");
            return response.data;
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            return null;
        });
}


export const deleteClaimApi = async (data) => {
    // console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: DELETE_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Réclamation supprimée", "success");
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


export const deleteOnlyClaimApi = async (id, props) => {
    const config = {
        method: 'delete',
        url: DELETE_ONLY_CLAIM_API.replace("{id}", id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    };
    await axios(config)
        .then(function (response) {

            // console.log("reponsesessionadd",response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd",error)
        }
        );
}

export const restoreClaimApi = async (data) => {
    // console.log("dataId", data.claimId)
    const config = {
        method: 'post',
        url: RESTORE_CLAIM_API.replace("%s", data.claimId),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            notify("Bravo - Réclamation restaurée", "success");
            // console.log("reponsesessionadd", response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreursessionadd", error)
        }
        );
}

export const listeRSDDelete = async (props) => {

    const config = {
        method: 'get',
        url: LIST_DELETE_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // console.log("response.data.content", response.data.content)
            props.itemsChanged(response.data.content)
            // saveItemToLocalStorage(response.data.content, 'app-recsTS')
            return response.data.content
        })
        .catch(function (error) {
            // console.log("errorstatutliste",error)
            return error;

        });
}


export const checkPhoneCrossAgencyApi = async (phoneValue, props) => {
    const config = {
        method: "get",
        url: CHECK_PHONE_CROSS_AGENCY_API.replace("%s", phoneValue),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    };
    await axios(config)
        .then(function (response) {
            const content = response.data.content;
            if (content.exists) {
                props.setCrossAgencyClaims(content.claims);
            } else {
                props.setCrossAgencyClaims([]);
            }
        })
        .catch(function (error) {
            console.error("[checkPhoneCrossAgencyApi] Échec de la vérification inter-agences :", error);
            props.setCrossAgencyClaims([]);
        });
}

export const checkPhoneApi = async (phoneValue, props) => {
    const config = {
        method: "get",
        url: CHECK_PHONE_API.replace("%s", phoneValue),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    };
    await axios(config)
        .then(function (response) {
            const content = response.data.content;
            if (content.exists) {
                props.setExistingClaims(content.claims);
                props.setModalVisible(true);
                const count = content.claims.length;
                if (count === 1) {
                    notify("Ce numéro est déjà associé à une réclamation en cours.", "warning");
                } else {
                    notify(`Ce numéro est déjà associé à ${count} réclamations en cours.`, "warning");
                }

            } else {
                props.setExistingClaims(null);
                props.setModalVisible(false);
            }
        })
        .catch(function (error) {
            console.error("[checkPhoneApi] Échec de la vérification de doublon :", error);
            props.setExistingClaims(null);
            props.setModalVisible(false);
            notify("Impossible de vérifier les doublons pour ce numéro — backend injoignable.", "error");
        });
}

