import axios from "axios";
import { KTApp } from "../../Utils/blockui";

import { HOST } from "../../Utils/globals";
import { notify } from "../../Utils/alert";

const EXPORT_REPORT_API = HOST + "api/v1/config/setting/export"

export const exportConfigs = async (type,filename) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    
    axios.get(`${EXPORT_REPORT_API}/${type}`)
        .then(function ({data}) {
            notify("Bravo - Téléchargement du fichier effectué", "success");
            // console.log("response data content",response.data)
            // Créez un objet URL à partir de la réponse
            const url = window.URL.createObjectURL(new Blob([JSON.stringify(data.content)],{type:"text/plain"}));

            // Créez un lien invisible et déclenchez le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Remplacez 'nom_du_fichier.ext' par le nom du fichier
            document.body.appendChild(link);
            link.click();

            // Libérez l'URL de l'objet lorsque le téléchargement est terminé
            window.URL.revokeObjectURL(url);
            link.remove();



        })
        .catch(function (error) {
            console.log('error', error)
            notify("Erreur,une erreure s'est produite", "error")

            // console.log("erreurREPORTfiltres",error)
        }).finally(()=>{
            KTApp.unblockPage();

        });
}