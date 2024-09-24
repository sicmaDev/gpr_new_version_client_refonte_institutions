import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { KTApp } from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import { HOST, REPORT_HOST } from "../../Utils/globals";

const REPORT_GLOBAL_API = HOST + "api/v1/report/global"
const REPORT_GLOBAL_API_FILTRES = HOST + "api/v1/report/filtered"
const REPORT_NEW_VERSION_API = REPORT_HOST + "api/v1/exportReport"


export const reportApi = async (props,setData) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'get',
        url: REPORT_GLOBAL_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    axios(config)
        .then(function (response) {
            // console.log("responsealertREPORT",response.data)
            if (response.data.status && response.data.status === false) {
                notify("Votre licence n'est pas active.", "error");
                setData(null)
            } else {
                props.globalTrendChanged(response.data.global)
                props.claimReportChanged(response.data.claimReport)
                props.denunReportChanged(response.data.denunReport)
                props.sugReportChanged(response.data.suggestionReport)
                props.statChanged(response.data.statistic)

                KTApp.unblockPage();
                setData(response.data)
                notify("Bravo - Rapport généré", "success");

            }
            return response.data;

            // console.log('report ans',response.data)
        })
        .catch(function (error) {
            KTApp.unblockPage();
            // console.log('report error', error);
            setData(null)
            notify("Une erreur s'est produtie", "error");
            console.log("erreurREPORT",error)
        });
}

export const reportApiFiltres = async (props, body,setData) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'post',
        url: REPORT_GLOBAL_API_FILTRES,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: body
    };
    await axios(config)
        .then(function (response) {
            // console.log("responsealertREPORTfiltres",response.data)
            if (response.data.status && response.data.status === false) {
                notify("Votre licence n'est pas active.", "error");
                setData(null)
            } else {
                props.globalTrendChanged(response.data.global)
                props.claimReportChanged(response.data.claimReport)
                props.denunReportChanged(response.data.denunReport)
                props.sugReportChanged(response.data.suggestionReport)
                props.statChanged(response.data.statistic)
                setData(response.data)

                // setData(prevData => {
                //     if (!prevData) {
                //         return { newData: response.data }; // Si prevData est null ou undefined
                //     }
                //     return {
                //         ...prevData,
                //         newData: response.data
                //     };
                // });
                
                  


                KTApp.unblockPage();
                notify("Bravo - Rapport filtré généré", "success");
            }


        })
        .catch(function (error) {
            KTApp.unblockPage();
            setData(null)

            // console.log("erreurREPORTfiltres",error)
        });
}
export const reportNewVersionExport = async (filename, body) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'POST',
        url: REPORT_NEW_VERSION_API,
        responseType: "blob",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: body
    };
    axios.post(REPORT_NEW_VERSION_API,body,{responseType:"blob"})
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
            link.remove();
            KTApp.unblockPage();



        })
        .catch(function (error) {
            KTApp.unblockPage();
            notify("Erreur,une erreure s'est produite","error")

            // console.log("erreurREPORTfiltres",error)
        });
}

